# Hookscope — Build Plan (Batch 6, #27)

## One-liner & positioning
Self-hosted webhook capture and debugging: create a bin URL, point any webhook at it, inspect every request in a live dashboard, replay or forward to your real endpoint. **$24 one-time** vs RequestBin/Pipedream (free tier gated behind a Pipedream account, paid from $29/mo) and Webhook.site (Pro €9/mo, ~$10). Tagline: "See every webhook. Replay any of them. Pay once."

## MVP feature list
- **Bins (capture endpoints)**: named endpoints, each with a unique slug; capture URL is `ANY /in/:slug` and all subpaths `/in/:slug/*`. Accepts every HTTP method, any content type, bodies up to a configurable cap (default 1MB, truncate beyond with a flag).
- **Request capture**: method, full path, query params, headers, raw body, parsed body (JSON pretty-printed, form-urlencoded decoded), source IP, content-type, size, timestamp. Responds configurable status/body per bin (default `200 {"ok":true}`), optional response delay for timeout testing.
- **Inspector UI**: live-updating request list per bin (poll `/api/bins/:id/requests?after=<id>` every 2s — no websockets needed), detail pane with tabs (Headers / Body raw / Body pretty JSON / Query), copy-as-curl button, JSON syntax highlighting, search/filter by method or body substring.
- **Replay**: send any captured request to an arbitrary target URL, preserving method/headers/body (strip hop-by-hop headers: host, content-length recomputed, connection). Show target's response (status, headers, body) inline. Replay history per request.
- **Forwarding rules**: per bin, optional target URL + toggle — every new capture is immediately forwarded, result (status/error) recorded on the request row. Retry off by default (keep MVP simple, note in README).
- **CLI-friendly**: `GET /api/bins/:id/requests` returns clean JSON; capture URL usable with plain curl; a documented one-liner to tail requests (`watch curl ...` example in README). Bin creation via API token optional — admin session cookie is fine, document curl login flow.
- **Retention config**: per-bin max requests (default 500, ring-buffer delete oldest) and global max-age days (default 7); hourly cleanup job.

## Architecture
BUILD-SPEC dual-mode web app: Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion, single process, **port 5321**. Capture routes (`/in/*`) mounted BEFORE auth middleware and before body-parsing limits that would reject odd payloads — use `express.raw({ type: '*/*', limit: CAP })` on that route only. Admin UI/API behind session/password auth. Dockerfile + docker-compose (SQLite volume), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, MAX_BODY_KB, RETENTION_DAYS). Electron desktop wrapper per spec (`npm run desktop`, same server, userData dir, auto-login). Replay/forward uses global `fetch` with a 15s AbortController timeout.

## Data model (SQLite)
- `bins`: id, slug (unique nanoid, editable), name, response_status (default 200), response_body, response_content_type, response_delay_ms, forward_url (nullable), forward_enabled (0/1), max_requests, created_at.
- `requests`: id, bin_id, method, path, query_json, headers_json, body (BLOB), body_truncated (0/1), content_type, size_bytes, source_ip, forwarded_status, forwarded_error, received_at.
- `replays`: id, request_id, target_url, response_status, response_headers_json, response_body_excerpt, error, created_at.
- `sessions`: id, token, created_at.

## API endpoints
- Public capture: `ALL /in/:slug`, `ALL /in/:slug/*`
- `POST /api/login`, `POST /api/logout`, `GET /api/health`
- `GET|POST /api/bins`, `GET|PUT|DELETE /api/bins/:id`, `DELETE /api/bins/:id/requests` (clear)
- `GET /api/bins/:id/requests?after=&limit=&method=&q=`, `GET /api/requests/:id` (full body), `GET /api/requests/:id/curl` (curl string)
- `POST /api/requests/:id/replay` `{ target_url }`, `GET /api/requests/:id/replays`

## UI screens
1. Login. 2. Bins list (name, slug, request count, copy capture URL, forward badge). 3. Bin inspector — split view: left request list (live), right detail tabs + replay panel (target URL input, send, response viewer) + copy-as-curl. 4. Bin settings modal (response config, forwarding rule, retention). 5. Global settings. Dark default; monospace for payloads.

## Smoke test spec (`test/smoke.js`, uptime-monitor style)
Spawn server on port **5393**, temp DB. Assertions:
1. Health ok; wrong password 401; `/api/bins` unauthenticated 401; login 200.
2. Create bin → 201 with slug. `POST /in/:slug/some/path?a=1` with header `X-Smoke: yes` and JSON body `{"hello":"world"}` → returns bin's configured status 200 and body `{"ok":true}`.
3. `GET /api/bins/:id/requests` → 1 row; assert method POST, path `/some/path`, query_json contains `a=1`, headers_json contains `x-smoke`, body parses to `{"hello":"world"}`. Verify directly in SQLite that the `requests` row exists with correct `size_bytes`.
4. Custom response: PUT bin `response_status=418, response_body='teapot'`; new capture → curl-level assert response status 418, body 'teapot'.
5. Replay: start local `http.createServer` target on 5394 capturing what it receives; `POST /api/requests/:id/replay {target_url}` → 200; assert target received method POST, header `x-smoke`, and identical JSON body; assert a `replays` row with `response_status=200`.
6. Forwarding: set `forward_url` to the local target, enable; send new capture; poll until the target has received it; assert request row `forwarded_status=200`.
7. Retention: set bin `max_requests=3`, send 5 captures, assert only 3 newest remain.
8. Non-JSON body (form-urlencoded) captured intact; unknown slug → 404. Cleanup: kill only spawned child procs; remove temp DB files.

## Launch kit requirements
Competitors: Webhook.site (Pro ~€9/mo, Enterprise €39/mo), Pipedream RequestBin (free requires account; paid $29+/mo), Beeceptor ($10–$99/mo), ngrok inspector (dev-only, $10+/mo for real use). Angle: "Webhook.site but it's YOUR server — no expiring URLs, no data leaving your infra." Reddit: r/webdev, r/selfhosted, r/node (show a 30-sec demo GIF). Show HN draft. SEO: requestbin alternative, webhook tester self hosted, inspect webhooks, replay webhook, webhook.site alternative, stripe webhook debugging.

## Risks / gotchas
- **better-sqlite3 ABI**: reuse `link-in-bio/scripts/setup-native.js` postinstall pattern (vendor Node + Electron bindings, `nativeBinding` at runtime).
- **Never broad-kill node processes** — tests kill only their spawned PIDs.
- Body handling: capture route must use raw buffer middleware scoped to `/in` only; don't let global `express.json()` consume/reject capture bodies. Store body as BLOB; pretty-print in UI, not at write time.
- Copy-as-curl must escape single quotes in bodies correctly.
- Forwarding loops (bin forwarding to itself) — detect target host==self+`/in/` and refuse.
- SSRF surface on replay/forward is acceptable for a self-hosted admin tool but block `file://` and non-http(s) schemes.
