# Whop license integration — per-app checklist

Canonical module: `onetime-suite/_shared/whop-license/` (whop-license.js, license-gate.js).
Per-app experience_id map: `onetime-suite/license-experience-map.json` (slug -> exp_xxx).
Config generator: `node _shared/whop-license/gen-configs.js <slug>` (run from onetime-suite root;
writes whop-license.config.json into the app's src/ if it exists, else app root).

Verified reference integrations:
- **Desktop (Electron):** `pdf-toolkit` (commit d048118) — see src/main.js
- **Self-hosted + dual-mode:** `link-in-bio` (commit 6df57a6) — see server/index.js,
  scripts/whop-activate.js, electron/main.js

## Steps per app

1. `node _shared/whop-license/gen-configs.js <slug>` (from onetime-suite root).
2. **Desktop mode** (app has an Electron main — check package.json "main"):
   - Copy `whop-license.js` + `license-gate.js` into the SAME dir as the Electron main file.
   - Ensure `whop-license.config.json` is in that dir too (copy it there if gen-configs put it elsewhere).
   - In the Electron main: `const { gateLicense, registerLicenseIpc } = require('./license-gate');`
     and at the TOP of `app.whenReady()`:
     `if (!(await gateLicense())) return;` then `registerLicenseIpc();`
     (make the whenReady callback async if needed).
3. **Server mode** (app has server/index.js or similar boot file, i.e. self-hosted web app):
   - Copy `whop-license.js` + config to app root.
   - Add `scripts/whop-activate.js` (copy from link-in-bio, fix the app name + landing URL).
   - Add `"activate": "node scripts/whop-activate.js"` npm script.
   - At the top of the server boot file, BEFORE anything else (but respecting any
     multi-tenant/hosted mode, which must NOT be gated):
     block startup with instructions + exit(1) if `!lic.isActivated({ dataDir })`
     unless `process.env.SKIP_LICENSE_CHECK` is set. Use the app's real data dir.
4. **Dual-mode apps** (both): do both; Electron dir gets its own copy of the 3 files.
5. **Tests:** the app's existing smoke test must still pass. If the smoke test boots the
   server via its index.js, set `SKIP_LICENSE_CHECK=1` in the test's env (licensing must
   never break CI) — prefer editing the test's spawn env, not the test's assertions.
6. Do NOT commit or push — the orchestrator does that after review.

## Gotchas
- Electron userData dir = productName, not package name.
- electron-builder "files" must include the dir where the 3 files were vendored
  (usually already covered by src/** or electron/** globs — verify).
- Never gate `APP_MODE=multi` / hosted multi-tenant modes (that's our own infra).
- better-sqlite3 ABI errors when running smoke tests = pre-existing; fix with
  `npm rebuild better-sqlite3 && node scripts/setup-native.js` if the app has it.
