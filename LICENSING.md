# OneTimeSuite Licensing — status & how it works

*Last updated: 2026-07-16. Implementation details and the device-registry service
live in the private repo `onetimesuite-license-registry`.*

## What's done ✅

- **All 101 apps** (55 originals + 45 batch apps + Bloom Recorder, plus Link-Leaf)
  now validate licenses **natively against Whop** — no license keys, no custom
  license server. Your Whop purchase *is* the license.
- Every app is wired to its own Whop product via a unique `experience_id`
  (1:1 mapping, generated from the product CSV).
- Central device registry live at `license.onetimesuite.com` (3 devices per
  license for desktop apps, self-serve device deactivation — no support tickets).
- Every app's smoke test suite passes with the license gate in place.
- OAuth app "OneTimeSuite" with loopback redirect for desktop sign-in.

## How it works for customers

**Desktop apps:** on first launch the app opens a "Sign in with Whop" page in the
browser. Sign in with the account that bought the app → the app confirms the
purchase with Whop → done. The app then starts instantly every time (a background
re-check runs at most daily, and the app works up to 10 days fully offline).
Licenses cover **3 devices**; a device can be freed from inside any copy of the
app ("deactivate this device") without contacting support.

**Self-hosted apps:** run `npm run activate` once at install — it opens the same
Whop sign-in, confirms the purchase, and writes a local activation file. After
that the app **never contacts Whop (or us) again**. Own-it-forever means exactly
that: no phone-home, no kill switch. (`SKIP_LICENSE_CHECK=1` exists for CI.)

**Dual-mode apps** (desktop + self-hostable): desktop mode uses the desktop flow,
server mode uses one-time activation. Hosted multi-tenant editions are never gated.

## How to build the apps

**Desktop (Windows installer):**
```
cd <app-dir>
npm install
npm run dist        # electron-builder → NSIS installer in dist/ or release/
```
Each app's `whop-license.config.json` (already committed, next to its Electron
main) bakes in that app's `experience_id` — no env vars needed at build time.
macOS: repos carry a `mac-dmg.yml` GitHub Actions workflow (unsigned DMG).

**Self-hosted (Docker/VPS):**
```
cd <app-dir>
docker build -t <app> .        # or: npm install && npm start
npm run activate               # one-time, on first setup
```
Headless server? Run `npm run activate` on any machine with a browser and copy
`data/.whop-activated.json` to the server's data directory.

**Dev/test loop:** every app still runs its full smoke suite (`npm test`) — tests
bypass the gate via `SKIP_LICENSE_CHECK=1` in their spawn env, assertions unchanged.

## Key decisions

- **No secrets ship in apps.** Access checks use the *customer's own* OAuth token
  (PKCE, no client secret, no company API key) — nothing to extract or abuse.
- **Fail toward the customer.** Registry unreachable → activation proceeds.
  Network down → 10-day grace. Self-hosted → checked once, then never again.
- **One integration, 101 apps.** A single vendored module + per-app config file;
  ESM apps get `.cjs` variants. Reference integrations: `pdf-toolkit` (desktop),
  `link-in-bio` (dual).
