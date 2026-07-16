# Multi-tenant integration — per-app checklist

Canonical module: `onetime-suite/_shared/multi-tenant/`
(index.js, auth.js, db-router.js, gate.js, signup-gate.js — all CJS, zero npm deps;
the system store uses the app's own better-sqlite3).

What it does: keeps the app's code **single-tenant** and swaps the DB layer —
every registered user (email+password) gets their OWN SQLite file at
`data/users/<userId>.db`, created on first open by running the app's existing
db-init against the new path. Auth lives in `data/system.db` (users + sessions).
Multi-tenant mode is opt-in via `APP_MODE=multi`; without it the app boots the
classic single-admin self-hosted mode, byte-for-byte identical behavior.

Verified reference integrations:
- **ESM app, simple:** `link-shortener` — see server/index.js, test/multi-smoke.js
- **CJS app with background scheduler:** `cron-monitor` — see server/index.js,
  server/app.js, server/evaluator.js, test/multi-smoke.js

## Steps per app

1. **Vendor the module**: copy the whole directory (minus test.js/INTEGRATION.md)
   to `<app>/server/multi-tenant/`:
   `index.js auth.js db-router.js gate.js signup-gate.js package.json`.
   KEEP `package.json` — its `"type":"commonjs"` is what lets `"type":"module"`
   apps load these .js files via `createRequire` (no .cjs renaming needed).

2. **Load it** in the server boot file, branching on `APP_MODE`:
   - CJS app: `const { createMultiTenant } = require('./multi-tenant/index.js');`
   - ESM app: `const { createMultiTenant } = createRequire(import.meta.url)('./multi-tenant/index.js');
   ```js
   const MULTI = process.env.APP_MODE === 'multi';
   let mt = null, db;
   if (MULTI) {
     mt = createMultiTenant({
       dataDir: DATA_DIR,          // where data/system.db + data/users/ will live
       openUserDb: openDb,         // the app's EXISTING db-init (opens file + CREATE TABLE IF NOT EXISTS)
       appName: 'My App',
       publicPaths: ['/ping/', '/badge/', /^\/[a-z0-9-]+$/],  // whatever must stay public
     });
     db = mt.db;                   // drop-in ALS proxy — all existing db.prepare() call sites keep working
   } else {
     db = openDb(DB_PATH);         // classic single-tenant
   }
   ```

3. **Skip the Whop license gate in multi mode** — hosted multi-tenant is our own
   infra and must NEVER be license-gated (same rule as whop-license INTEGRATION.md):
   `if (!process.env.SKIP_LICENSE_CHECK && process.env.APP_MODE !== 'multi') { ...existing gate... }`

4. **Mount the middleware** — ORDER MATTERS:
   ```js
   if (MULTI) { app.use(mt.authRouter); app.use(mt.gate); }
   app.use(express.json());        // app's existing body parsers
   if (MULTI) app.use(mt.dbMiddleware);
   // ...app routes...
   ```
   - `authRouter` + `gate` go at the very top (auth parses its own bodies).
   - `dbMiddleware` MUST come **after** every body parser (`express.json`,
     `express.text`, …). Body parsers call `next()` from a stream callback,
     which loses the AsyncLocalStorage context the `mt.db` proxy rides on.
     Symptom of getting this wrong: "db.prepare used outside a user context".
   - Public raw-body routes (webhook/ping style) that read the stream
     themselves must not use the `mt.db` proxy — see step 6.

5. **Route-level fixes** (grep the boot file for these patterns):
   - Statements prepared at startup (`const stmt = db.prepare(...)` at module/
     factory scope) explode with the proxy — make them lazy:
     `const findById = (id) => db.prepare('...').get(id);`
   - Replace the old admin `requireAuth` in multi mode:
     `const requireAuth = MULTI ? mt.requireUser : legacyRequireAuth;`
     (`mt.requireUser` also sets `req.user`.)
   - Legacy `/api/logout` shim: `if (MULTI) return mt.logout(req, res);`
   - Legacy `/api/me` shim: `res.json({ authed: !!mt.getUser(req) })`.
   - If the app reserves URL slugs (link-shortener style), add `auth` to the
     reserved list — `/auth/*` now belongs to the module.

6. **Public routes addressed by token/slug** (ping URLs, short links, badges —
   no session to route by): find the owning DB by scanning all user DBs, then
   use THAT handle (never the proxy) for the whole request:
   ```js
   const found = mt.forEachUserDb(({ db: udb }) => {
     const row = udb.prepare('SELECT * FROM things WHERE token = ?').get(token);
     return row ? { row, udb } : undefined;   // first non-undefined return wins
   }) || null;
   ```
   Remember to allowlist these paths in `publicPaths`.

7. **Background jobs / schedulers**: convert the tick to loop over every user DB —
   change the job's signature from `(db)` to `(forEachDb)` and wire:
   - single mode: `startJob((fn) => fn(db), interval)`
   - multi mode:  `startJob((fn) => mt.forEachUserDb(({ db }) => { fn(db); }), interval)`
   Each user DB gets the identical per-DB logic; wrap per-DB work in try/catch
   so one corrupt tenant can't stall the loop. (See cron-monitor/server/evaluator.js.)

8. **Env for hosted deploys**: `APP_MODE=multi`, `SESSION_SECRET=<32+ random bytes>`,
   `COOKIE_SECURE=1` (behind the onetimesuite.com TLS proxy). Without
   SESSION_SECRET a generated secret is persisted to `data/.session-secret`
   (fine for dev, set it explicitly in prod).

9. **Tests**:
   - The app's existing smoke test must still pass UNCHANGED (it runs
     single-tenant — proves zero regression).
   - Add `test/multi-smoke.js` (copy from a pilot, adapt routes): boots with
     `APP_MODE=multi SKIP_LICENSE_CHECK=1`, registers two users, verifies
     isolation (A's rows invisible to B), per-user db files on disk, gate
     redirect, and — if the app has a scheduler — that a tick processes BOTH
     users' DBs. Wire it into `npm test` after the classic smoke.
   - Module self-test: `node _shared/multi-tenant/test.js` (25 asserts).

10. Do NOT push — commit locally; the orchestrator handles pushes.

## Gotchas
- **dbMiddleware after body parsers** (step 4) — the #1 integration mistake.
- `mt.db` proxy outside a request/`runWith` context throws by design; background
  code must use `forEachUserDb` / `runWith(userId, fn)` / `dbFor(userId)`.
- Handles are LRU-cached (default cap 200 open); an evicted user's DB is
  transparently reopened on next touch. Don't stash a user's handle long-term —
  re-fetch via `dbFor`.
- Per-user files mean per-user uniqueness: UNIQUE constraints (slugs, tokens…)
  no longer dedupe ACROSS users. Cross-user public lookups take the first match
  in sorted-userId order; if global uniqueness matters, enforce it at create
  time with a `forEachUserDb` scan.
- The React frontends still POST the old `/api/login` password form — in multi
  mode the gate 302s anonymous page loads to the module's own `/auth/login`
  page before the SPA even loads, so apps work, but the SPA's built-in login
  screen/logout button should eventually be pointed at `/auth/*` (follow-up).
- `verifyPurchase` in signup-gate.js is an open stub (returns true) with a TODO
  pointing at the whop-license OAuth flow — swap that ONE function to enforce
  purchases at registration.
- Sessions are shared per data dir, not per process — horizontal scale of one
  app's container is fine as long as they share `data/` (SQLite = one writer;
  keep it single-container for now).
