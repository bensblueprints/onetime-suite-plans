# Keymaster — License Key Server (Build Plan)

**One-liner:** Self-hosted licensing for people who sell software: ed25519-signed license keys, activation API with machine fingerprints + seat limits, offline validation snippets, versioned product downloads via signed expiring URLs, and activation webhooks. Pay $49 once vs giving Gumroad/LemonSqueezy 5–10% of every sale forever.

- **Product #35, Batch 7** · Price **$49** · Assigned port **5328** · Directory `C:\Users\ADMIN\Desktop\onetime-suite\license-server\`
- Follow `BUILD-SPEC.md`: VPS web app (Express + better-sqlite3 + React/Vite + Tailwind + Lucide + Framer Motion) + Electron desktop mode, Docker + volume, `.env.example` (PORT=5328, ADMIN_PASSWORD, BASE_URL), launch-kit, MIT, git init only.
- **Dogfooding note:** this will power the onetime-suite's own premium tiers — build the activation API and snippet libs as if we are customer #1; keep the key format and API stable and versioned (`/api/v1/...`).

## MVP features
1. **Products & versions** — CRUD products (name, slug, seat default); versions per product (semver string, release notes, artifact file upload OR external URL). Artifacts stored under `data/artifacts/`.
2. **License key generation** — key payload {license_id, product, plan/tier, seats, issued_at, expires_at (null = perpetual), customer_email} canonicalized (stable JSON) → signed with the server's **ed25519** private key (Node `crypto.generateKeyPairSync('ed25519')`, generated on first boot into data dir). Key string format: `KM1.<base64url(payload)>.<base64url(signature)>` — self-describing and offline-verifiable with the public key alone. Bulk generate (N keys), revoke (revocation is server-side state; offline validation can't see it — documented honestly).
3. **Activation API** — `POST /api/v1/activate` {license_key, fingerprint, hostname?, app_version?} → verifies signature + not revoked/expired → creates/updates activation; enforces **seat limit** (distinct fingerprints ≤ seats; re-activating same fingerprint is idempotent, returns 200). Returns a signed **activation receipt** (ed25519 over {license_id, fingerprint, activated_at, expires check-in window}) the client caches for offline runs. `POST /api/v1/deactivate` frees a seat. `POST /api/v1/validate` = lightweight check-in (is key still good? revoked? seat still held?).
4. **Offline validation snippet libs** — `snippets/` folder in repo with a zero-dependency **Node/browser JS example** (`verifyLicense(key, publicKeyBase64)` using WebCrypto/`crypto.verify`), showing: parse KM1 format, verify signature, check expiry, verify cached activation receipt, machine fingerprint helper (Node: hash of `os.hostname()` + first MAC + platform; document it's a heuristic). README documents the key format byte-for-byte so other languages can implement it. Public key exposed at `GET /api/v1/pubkey`.
5. **Download delivery** — customer-facing `GET /api/v1/download` {license_key, version?} → validates → 302 to **signed expiring URL** `GET /dl/:token` (HMAC token encoding artifact id + exp, default 15 min) streaming the artifact. Download events logged per license.
6. **Webhook on activation** — per-product webhook URL; POST JSON {event:'activation'|'deactivation'|'validation_failed', license, fingerprint, ts} with `X-Keymaster-Signature` (HMAC-SHA256 of body, per-product secret); retry ×3 backoff; delivery log.
7. **Admin dashboard** — issue/revoke/search licenses, see activations per license (fingerprint, hostname, last seen, deactivate button), product/version management with artifact upload, webhook config + delivery log, stats (activations over time, active seats).
8. **Customer portal (minimal)** — `GET /license/:key` lookup page: status, seats used, download latest button. No accounts.

Out of scope: payments/checkout integration (webhook-in from Stripe/Whop documented as recipe only), floating licenses, per-feature entitlements beyond a free-text `tier` field.

## Architecture
- Single Express process: `/api/v1/*` public licensing API (rate-limited, CORS enabled — desktop apps call it), admin SPA + `/api/admin/*` (session + ADMIN_PASSWORD), `/dl/:token` streamer. Default PORT=5328.
- Keys: ed25519 keypair PEM files in data dir (`keys/signing.pem`, `signing.pub`), created on first boot; **back up warning in README** (lose the private key = can't issue keys that verify against shipped public key).
- All crypto via built-in `node:crypto` — zero native crypto deps.
- Electron desktop mode per spec (useful as a local "license authoring" app; real deployments on VPS since client apps must reach it — README says so).

## Data model (SQLite)
- `products(id, slug UNIQUE, name, default_seats, webhook_url, webhook_secret, created_at)`
- `versions(id, product_id, semver, notes, artifact_path, artifact_url, size, created_at)`
- `licenses(id, product_id, key TEXT UNIQUE, tier, seats, customer_email, customer_name, issued_at, expires_at, revoked INTEGER, revoked_reason, order_ref)`
- `activations(id, license_id, fingerprint, hostname, app_version, first_seen, last_seen, deactivated_at)` UNIQUE(license_id, fingerprint)
- `download_events(id, license_id, version_id, ip, created_at)`
- `webhook_deliveries(id, product_id, event, payload_json, status_code, attempts, last_error, created_at)`
- `settings(key, value)`

## API endpoints
Public v1: `POST /api/v1/activate|deactivate|validate`; `GET /api/v1/pubkey`; `POST /api/v1/download` (or GET with query); `GET /dl/:token`; `GET /license/:key` (portal page); `GET /api/health`.
Admin: login; CRUD products/versions (multipart artifact upload); `POST /api/admin/licenses` (single or `count` for bulk) → returns key strings; `GET /api/admin/licenses?search=`; `POST /api/admin/licenses/:id/revoke`; `GET /api/admin/licenses/:id` (activations + downloads); `POST /api/admin/products/:id/webhook/test`; stats endpoint.

## UI screens
1. Login. 2. **Dashboard** — stat tiles (licenses, active seats, activations 30d chart). 3. **Products** — list → detail with versions table + upload dropzone, webhook config. 4. **Licenses** — searchable table (key masked, copy button, status pills), issue modal (product/tier/seats/expiry/email/bulk-N), detail drawer: activations list with per-row deactivate, download history, revoke. 5. **Webhook log**. 6. **Public license portal** page. Dark default, premium.

## Smoke test (`test/smoke.js`, uptime-monitor style)
Spawn server (`PORT=5390, DB_PATH=test/smoke.db, ADMIN_PASSWORD, DATA_DIR=test/data`). Start a local webhook-capture http server on 5389.
1. Health; auth gates (401 wrong/unauth, 200 right). Assert keypair files created in DATA_DIR.
2. Create product (seats default 2, webhook → capture server) + version with a **real generated artifact fixture** (write a 1KB zip/bin file, upload multipart).
3. Issue license → key matches `/^KM1\./`; fetch `/api/v1/pubkey`; **verify signature locally in the test** using `crypto.verify` — this also validates the documented offline-verification recipe (import logic from `snippets/verify-node.js` directly and call it).
4. Activate fingerprint FP1 → 200 + signed receipt (verify receipt signature too); activate FP1 again → 200 idempotent, still 1 seat used (assert `activations` count in SQLite). Activate FP2 → 200. Activate FP3 → **403 seat limit**. Deactivate FP2 → FP3 now activates.
5. Webhook capture received `activation` events with valid `X-Keymaster-Signature` (recompute HMAC in test and compare).
6. Download: `POST /api/v1/download` → signed URL; GET it → 200, bytes equal fixture; assert token expiry by requesting a hand-built expired token → 410/403; `download_events` row exists.
7. Revoke license → `validate` → `{valid:false, reason:'revoked'}`; `activate` new fingerprint → 403; offline snippet still verifies signature (documented limitation asserted: signature valid, server says revoked).
8. Tampered key (flip one payload char) → activate 400 invalid signature.
Cleanup db + data dir; exit codes per uptime-monitor.

## Launch kit requirements
Competitor math: **Gumroad 10% + $0.50/sale**, LemonSqueezy 5% + 50¢, Keygen.sh from $99/mo self-serve. Angle: "Selling $10k of software/yr? Gumroad's cut is $1,000+ every year — Keymaster is $49 once, on your VPS, keys signed with your own keypair." PH shots: license table, activation detail, key format diagram, snippet code, portal. Strategy: r/selfhosted, r/SideProject, r/gamedev (indie devs license desktop tools), HN Show HN. SEO: "keygen alternative", "self hosted license server", "ed25519 license keys".

## Risks / gotchas
- **better-sqlite3 dual ABI**: copy `link-in-bio/scripts/setup-native.js` postinstall pattern (vendor Node + Electron bindings, `nativeBinding` in `server/db.js`).
- Canonical JSON before signing (sorted keys, no whitespace) or signatures break across implementations — write one `canonicalize()` util used by both signer and snippet, and document it.
- Key strings get long with big payloads — keep payload minimal; email optional in payload (privacy: keys get pasted into support tickets). Consider payload = {l:id, p:productSlug, t:tier, s:seats, e:exp} short keys.
- Be honest in docs: offline validation cannot see revocations/seat counts — recommend periodic online `validate` check-in with grace period; the snippet demonstrates the pattern.
- Artifact streaming: use `res.sendFile`/stream with Content-Disposition; never expose `data/artifacts` statically; signed token is the only path.
- Rate-limit `activate`/`validate` per key+IP to blunt brute force; constant-time compare on HMAC tokens.
- Dogfood check: keep `/api/v1` shapes documented in `docs/API.md` so other suite apps can integrate without reading source.
- No PowerShell JSON writes (BOM).
