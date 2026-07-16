# Desktop App Build & License Guide — OneTimeSuite

**The canonical, verified-working procedure for building a OneTimeSuite desktop app
(Electron) with working Whop licensing. Last verified end-to-end 2026-07-16 with Captionly.**

## 1. Whop OAuth — the setup that actually works

Every desktop app authenticates the buyer with **"Sign in with Whop"** (OAuth 2.1 + PKCE
over a loopback redirect). The hard-won requirements:

- **Use OAuth app `app_1alGIvT167sGCl`** (client id in every app's `whop-license.config.json`).
  Do NOT use `app_B2TMUEvC9aRUNZ` — it was API-created, is unfindable in the dashboard, and
  is a confidential client.
- **The app MUST be a PUBLIC OAuth client** (`oauth_client_type: "public"`). A confidential
  client demands a `client_secret` at token exchange, which must never ship in a desktop
  binary. Public + PKCE needs **no secret anywhere**. If you ever see
  `{"error":"invalid_client","error_description":"client_secret is required"}` → the app got
  flipped back to confidential; set it public again in the Whop dashboard.
- **The loopback redirect must be registered** on the app:
  `http://127.0.0.1:8734/callback`. If `whop-license.config.json` uses a different `port`,
  register that port's callback too. Symptom of a missing redirect: the authorize URL returns
  HTTP 400 instead of 302.

**Diagnostic probes** (no login needed — the error text tells you the state):
```bash
# token endpoint (public client, no secret) — healthy = "invalid_grant" for a dummy code:
curl -s -X POST https://api.whop.com/oauth/token -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode grant_type=authorization_code --data-urlencode client_id=app_1alGIvT167sGCl \
  --data-urlencode code=dummy --data-urlencode redirect_uri=http://127.0.0.1:8734/callback \
  --data-urlencode code_verifier=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
# "invalid_grant"          -> GOOD (public client, redirect ok)
# "client_secret is required" -> app is confidential; make it public
# "invalid_client ... does not match" -> wrong client_id/secret

# authorize endpoint — healthy = 302 (redirect registered), 400 = redirect NOT registered:
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://api.whop.com/oauth/authorize?client_id=app_1alGIvT167sGCl&redirect_uri=http://127.0.0.1:8734/callback&response_type=code&scope=openid+profile&state=x&nonce=y"
```

## 2. The license module (never re-derive this)

Canonical: `onetime-suite/_shared/whop-license/whop-license.js` (+ `license-gate.js`,
`gen-configs.js`, `INTEGRATION.md`, `test.js`). Vendored per app; ESM apps use `.cjs` via
`createRequire`. Key invariants:

- **Token exchange = direct public PKCE, no `client_secret`** (send `client_secret` only if
  `cfg.clientSecret` is set, which it is NOT for our public app). `scope: 'openid profile'`,
  and **a `nonce` is REQUIRED with the openid scope** (Whop rejects the authorize otherwise).
- **Owner allowlist**: `OWNER_USER_IDS = ['user_WrL08cYYDgWY1']` (ben@freewebsitedesign.today)
  short-circuits `checkAccess()` to always-licensed, device-cap bypassed. Extend this array to
  grant other accounts blanket access.
- **3-device cap** is built in (self-serve deactivate). Central registry:
  `license.onetimesuite.com` (device register/deactivate uses the buyer's own token).
- `SKIP_LICENSE_CHECK=1` env bypasses the gate entirely — for CI and local runs only, never
  ship it.

**Any change to the canonical module must be copied to every vendored copy** before rebuilding:
```bash
cd onetime-suite && CANON=_shared/whop-license/whop-license.js
for f in $(find . -maxdepth 2 -name whop-license.js -not -path "./_shared/*") \
         $(find . -maxdepth 2 -name whop-license.cjs -not -path "./_shared/*"); do cp "$CANON" "$f"; done
```
To repoint every app's OAuth client id at once: `node swap-client-id.js app_1alGIvT167sGCl`.

## 3. Building the installers

**Windows (.exe, NSIS)** — on this Windows machine:
```bash
cd onetime-suite/<app-dir>
npm ci
SKIP_LICENSE_CHECK=1 npm run dist      # electron-builder → dist/ or release/*.exe + .blockmap + latest.yml
```
Gotcha: `better-sqlite3` has a Node-vs-Electron ABI split — the vendored dual-binding pattern
(`link-in-bio/scripts/setup-native.js`) handles it; plain `npm ci` is fine for web Node but
Electron packaging rebuilds the native binding.

**macOS (.dmg, arm64)** — on the Mac mini (`ssh -i ~/.ssh/id_ed25519 benji@100.88.187.70`,
Tailscale; Node + full Xcode installed):
```bash
# from the Windows box — use cygpath so git-bash tar doesn't read C: as a host:
TGZ="$(cygpath -u "$CLAUDE_JOB_DIR")/tmp/app.tgz"
cd onetime-suite && tar --exclude=node_modules --exclude=dist --exclude=release --exclude=.git -czf "$TGZ" <app-dir>
scp -i ~/.ssh/id_ed25519 "$TGZ" benji@100.88.187.70:/tmp/ots-src.tgz
ssh -i ~/.ssh/id_ed25519 benji@100.88.187.70 "set -e; rm -rf ~/ots-builds/<app-dir>; mkdir -p ~/ots-builds; \
  cd ~/ots-builds; tar xzf /tmp/ots-src.tgz; cd <app-dir>; npm ci; \
  SKIP_LICENSE_CHECK=1 npx electron-builder --mac --arm64"
scp -i ~/.ssh/id_ed25519 "benji@100.88.187.70:~/ots-builds/<app-dir>/dist/*-arm64.dmg*" <app-dir>/dist/
```
The fleet driver `mac-dmg-driver.js` automates this for all desktop apps (self-resuming,
`--max-minutes N`). Both installers are **unsigned** — release notes must include the Windows
SmartScreen "More info → Run anyway" and macOS Gatekeeper "right-click → Open" steps.

## 4. Publishing & launch

Create GitHub Release `v1.0.0` on the **public `<app>-mvp` repo** with `.exe` + `.blockmap`
+ `latest.yml` (electron-updater feed) + `.dmg` + install instructions. Source stays on the
PRIVATE clean-name repo. Then flip the site (`AVAILABLE_SLUGS` in `onetimesuite-com/build.js`),
verify checkout, post socials. See LAUNCH-RUNBOOK.md.

## 5. Golden rule

**A desktop installer is only valid if built AFTER the latest change to the OAuth config or
license module.** The client-id switch + public-client + owner-allowlist landed 2026-07-16 —
any installer built before that is STALE and will fail sign-in. When in doubt, rebuild.
