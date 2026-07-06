# Snapfleet — Build Plan (Batch 6, #28)

## One-liner & positioning
Self-hosted screenshot API powered by Puppeteer: one endpoint turns any URL into a PNG/JPG/PDF with viewport, full-page, dark-mode and selector control. **$39 one-time** vs Urlbox from **$19/mo**, ScreenshotOne from $17/mo, ApiFlash from $7/mo. Tagline: "Unlimited screenshots. Your server. Pay once."

## MVP feature list
- **Screenshot endpoint** `GET /api/v1/screenshot` (also POST with JSON body) with params: `url` (required), `format` (png|jpg|pdf, default png), `width`/`height` (viewport, default 1280×800), `full_page` (bool), `delay` (ms after load, max 10000), `wait_until` (load|domcontentloaded|networkidle0, default networkidle2), `selector` (clip to first matching element), `dark_mode` (bool → `page.emulateMediaFeatures prefers-color-scheme: dark`), `quality` (jpg 1–100), `scale` (deviceScaleFactor 1–3), `fresh` (bool, bypass cache), `ttl` (seconds, per-request cache override). PDF format uses `page.pdf()` (A4 default, `full_page` ignored).
- **API keys**: named keys, `?key=` query param or `X-Api-Key` header; per-key rate limit (requests/min, default 60) and daily quota (default unlimited); usage counters; revoke/regenerate.
- **Cache with TTL**: cache key = SHA-256 of normalized params; store file on disk (`data/shots/<hash>.<ext>`) + DB row with expiry (default TTL 24h, configurable global + per request). Cache hits served with `X-Snapfleet-Cache: HIT`. Hourly sweep deletes expired files.
- **Browser pool**: single shared Puppeteer browser instance, lazily launched, N concurrent pages (default 2, env `MAX_CONCURRENT`), queue beyond that with 30s job timeout; auto-relaunch browser if it crashes.
- **Gallery**: admin UI grid of recent screenshots (thumbnail, URL, params, size, cache state, taken-at), click to view full, re-take, copy request URL, delete.
- **Rate limiting**: per-key token bucket in memory + 429 with `Retry-After`; global safety cap.
- **URL guard**: block non-http(s) schemes; optional `ALLOW_PRIVATE=false` env blocks localhost/RFC1918 targets (SSRF hygiene, default true since self-hosted users often shoot internal dashboards — document it).

## Architecture
BUILD-SPEC dual-mode web app: Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion, single process, **port 5322**. `puppeteer` (full, bundles Chromium — "binary download on first install" surfaced in README) — on the Electron desktop mode, still use the puppeteer-managed Chromium, NOT Electron's; keep server code unchanged per spec. Dockerfile must install Chromium deps (use `ghcr.io/puppeteer/puppeteer` base image or apt list) + docker-compose with volumes for DB and `data/shots`. `.env.example`: PORT, ADMIN_PASSWORD, DB_PATH, SHOTS_DIR, DEFAULT_TTL_SECONDS, MAX_CONCURRENT, ALLOW_PRIVATE, PUPPETEER_EXECUTABLE_PATH (optional system Chrome). Admin UI behind session auth; screenshot API authed by API key only.

## Data model (SQLite)
- `api_keys`: id, name, key (unique, `sf_` + 32 hex), rate_per_min, daily_quota, requests_total, requests_today, today_date, revoked (0/1), created_at.
- `shots`: id, cache_hash (unique), url, params_json, format, file_path, size_bytes, width, height, status ('ok'|'error'), error, api_key_id, took_ms, expires_at, created_at.
- `usage_log`: id, api_key_id, cache_hit (0/1), status_code, took_ms, created_at (for the usage chart; prune >30 days).
- `settings`: key, value. `sessions`: id, token, created_at.

## API endpoints
- `GET|POST /api/v1/screenshot` (API-key auth) → image/pdf bytes with correct content-type
- `POST /api/login`, `POST /api/logout`, `GET /api/health` (reports browser status)
- `GET|POST /api/keys`, `PUT|DELETE /api/keys/:id`, `POST /api/keys/:id/regenerate`
- `GET /api/shots?limit=&q=` (gallery), `GET /api/shots/:id/file`, `DELETE /api/shots/:id`, `POST /api/shots/:id/retake`
- `GET /api/stats` (requests today, cache hit rate, avg ms), `GET|PUT /api/settings`, `POST /api/cache/clear`

## UI screens
1. Login. 2. Dashboard (stats tiles, usage chart, browser status). 3. Playground — form for every param with live preview + generated request URL/curl to copy (this sells the product; make it slick). 4. Gallery grid. 5. API keys (create, usage, revoke). 6. Settings. 7. Docs page rendering endpoint reference. Dark default.

## Smoke test spec (`test/smoke.js`)
Spawn server on port **5395**, temp DB + temp shots dir, `MAX_CONCURRENT=1`. Start a local target `http.createServer` on 5396 serving an HTML page with a `#hero` div, `prefers-color-scheme` CSS (body background differs), and a title. Assertions:
1. Health ok; login/auth gates (wrong password 401, keys API unauthenticated 401).
2. Create API key → 201, key starts with `sf_`.
3. `GET /api/v1/screenshot?url=http://127.0.0.1:5396&key=...` → 200, content-type `image/png`, body length > 1000, first 8 bytes match PNG magic number (`89 50 4E 47 0D 0A 1A 0A`). Assert a `shots` row in SQLite with status 'ok' and the file exists on disk with matching size.
4. Same request again → header `X-Snapfleet-Cache: HIT`, `shots` row count unchanged. With `fresh=1` → MISS.
5. `format=jpg&quality=50` → JPEG magic bytes (`FF D8 FF`). `format=pdf` → body starts with `%PDF`.
6. `selector=%23hero` → 200 and PNG dimensions smaller than viewport shot (parse PNG IHDR width/height bytes to compare).
7. `dark_mode=1` vs default → both 200; assert differing cache hashes (two distinct `shots` rows).
8. No key → 401; revoked key → 401; set key `rate_per_min=2`, fire 3 rapid requests → third is 429.
9. `url=file:///etc/hosts` → 400. Missing url → 400.
Cleanup: kill only spawned children (server kills its own browser on SIGTERM — implement that), remove temp dirs. Note in output that Chromium download makes first `npm i` slow.

## Launch kit requirements
Competitors: Urlbox ($19/mo for 2k renders), ScreenshotOne ($17/mo), ApiFlash ($7/mo 1k), Browserless ($30/mo). Angle: "Every screenshot API charges per render. Your VPS renders for free." Math: Urlbox $228/yr vs $39 once. Reddit: r/selfhosted, r/webdev, r/SaaS (og-image/link-preview use case). SEO: screenshot api self hosted, urlbox alternative, puppeteer screenshot service, website to pdf api, url to png.

## Risks / gotchas
- **better-sqlite3 ABI**: reuse `link-in-bio/scripts/setup-native.js` pattern. **Never broad-kill node/chrome processes** — track and kill only the browser the server launched (`browser.process().pid`).
- Puppeteer on Docker needs `--no-sandbox` + deps; expose `PUPPETEER_ARGS` env. On Windows first-run download (~170MB) — surface progress in README.
- Zombie pages: always `page.close()` in `finally`; job timeout must kill the page, not the browser.
- Cache normalization: sort params, apply defaults BEFORE hashing or identical requests miss.
- Don't let `delay` exceed cap or queue starves at MAX_CONCURRENT=2.
