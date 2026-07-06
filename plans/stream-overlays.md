# Overlayr — Build Plan (Batch 10, #46)

## One-liner & positioning
Self-hosted stream overlays for OBS you own forever. Build countdown timers, goal bars, rotating messages, "starting soon" scenes, and dashboard-triggered alerts — each overlay is just a URL you drop into an OBS Browser Source, updated live over WebSocket. **$24 one-time** vs StreamElements/Streamlabs premium tiers (~$5.99–$12.99/mo) and OWN3D Pro ($12.99/mo). Tagline: "Your overlays, your server, no watermarks, no subscription."

## MVP feature list
- **Overlay types** (each an instance with its own config + URL):
  1. **Countdown timer** — target datetime OR duration mode ("counting down from 10:00", pause/resume/reset from dashboard), end message, optional end-sound (uploaded file), format options (HH:MM:SS, minutes-only).
  2. **Goal bar** — label ("Sub Goal"), current/target values, animated fill, increment buttons on dashboard, milestone flash animation when target hit; current value also settable via webhook.
  3. **Rotating messages (ticker)** — list of messages, interval seconds, transition (fade/slide), optional scrolling marquee mode.
  4. **Starting soon scene** — full-screen scene: headline, sub-text, embedded countdown, animated background (theme gradient/particles), optional uploaded background image and looping audio.
  5. **Alert box** — chat-style alert (name + message + optional image/sound) fired via dashboard button (with preset messages) OR `POST /hook/:token` webhook (so Zapier/streamer.bot/anything can trigger it). Queueing: alerts play sequentially with min-display duration.
- **Editor with live preview**: config form on the left, real iframe of the actual overlay URL on the right (transparent-checkerboard backdrop so users see what OBS sees). Changes push instantly over WS — no refresh.
- **Themes**: 5+ built-in (neon, minimal, retro, brutalist, glass), plus per-overlay overrides: font (bundled Google-font woff2 files, offline), colors, scale. Theme = CSS-variable set applied to overlay pages.
- **Dashboard "live control" panel**: one screen with big touch-friendly buttons for the stream session — fire alerts, bump goals, pause timers.
- Duplicate overlay, per-overlay regenerate-token (invalidates old URL).

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process serves API, admin frontend, and overlay pages. **Port 5337** default. `ws` package on the same HTTP server (`/ws?token=...`). Overlay pages (`/o/:token`) are unauthenticated (secret token IS the auth — OBS can't do logins) and must render on a **transparent background** (`body{background:transparent}`) since OBS composites them. Admin behind session/password (`ADMIN_PASSWORD`). Server holds runtime state for timers (authoritative start-at/paused-at so a reconnecting OBS source resyncs correctly — never trust client clocks; send server-computed remaining ms on connect). Dockerfile + docker-compose.yml (SQLite volume), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, BASE_URL). Electron wrapper (`npm run desktop`) boots the same server — nice for streamers: run the app locally, point OBS at `localhost` URLs.

## Data model (SQLite)
- `overlays`: id, type ('countdown'|'goal'|'ticker'|'starting_soon'|'alertbox'), name, token (unique 22-char nanoid), config_json, theme_json, created_at, updated_at.
- `runtime_state`: overlay_id (PK), state_json (timer started_at/paused_remaining_ms, goal current value, alert queue), updated_at — persisted so restarts don't lose a live countdown.
- `alert_events`: id, overlay_id, source ('dashboard'|'webhook'), payload_json, fired_at.
- `assets`: id, filename, mime, path (uploads dir), size, created_at.
- `sessions`: id, token, created_at.

## API endpoints
- `POST /api/login`, `POST /api/logout`, `GET /api/health`
- `GET|POST /api/overlays`, `GET|PUT|DELETE /api/overlays/:id`, `POST /api/overlays/:id/duplicate`, `POST /api/overlays/:id/regenerate-token`
- Control: `POST /api/overlays/:id/control` — body `{action:'start'|'pause'|'reset'|'set_goal'|'increment'|'fire_alert', ...}`; broadcasts over WS.
- `POST /api/assets` (multer upload), `GET /uploads/:file`
- Public: `GET /o/:token` (overlay page), `WS /ws?token=`, `POST /hook/:token` (webhook: `{name, message, amount}` → alert or goal bump per overlay type; light rate limit).

## UI screens
1. Login. 2. Overlay list (cards with type icon, mini live preview thumbnail, copy-URL button). 3. Editor (type-specific form + live iframe preview + theme picker + "copy OBS URL" with width/height hint per type). 4. Live Control panel (all overlays' action buttons in one grid). 5. Settings (base URL for generated links, asset manager). Dark mode default.

## Smoke test spec (`test/smoke.js`)
Boot server via `spawn` on port **5437**, temp DB. Assertions:
1. Health ok; `/api/overlays` unauthenticated → 401; login → 200.
2. Create countdown overlay → 201 with token; `GET /o/:token` → 200 HTML containing overlay mount div; bad token → 404.
3. Connect a `ws` client to `/ws?token=...` → receives initial state message with server-computed remaining ms.
4. While WS client is connected, `PUT /api/overlays/:id` changing the label → assert WS client receives a `config` update containing the new label within 2s (this is the core promise: WS-pushed updates).
5. Create alertbox; keep WS connected; `POST /hook/:token {name:'Ben',message:'hi'}` → 200, WS receives `alert` event with payload, and an `alert_events` row exists (open SQLite directly).
6. Goal overlay: `POST /api/overlays/:id/control {action:'increment', by:5}` → WS receives new value; restart-persistence: read `runtime_state` row and assert value stored.
7. Regenerate token → old `/o/:oldtoken` 404s, new one 200s.
Cleanup: close WS, kill only spawned child PID, delete temp DB/wal/shm.

## Launch kit requirements
Real competitor pricing: StreamElements is free-core but pushes SE.Pay/premium themes; Streamlabs Ultra **$19/mo (or $149/yr)**; OWN3D Pro **$12.99/mo**. Math: $24 pays for itself vs Streamlabs Ultra in ~5 weeks. Angle: "I got tired of renting my own overlays — and of cloud overlay services lagging mid-stream." Communities: r/Twitch, r/streaming, r/obs (rules-aware: show a 30s clip, no link spam), OBS forums resources section. HN Show HN: "self-hosted OBS overlays over WebSocket". SEO (10): obs browser source overlay, streamelements alternative, self hosted stream overlays, obs countdown timer overlay, stream goal bar widget, streamlabs alternative free, starting soon screen obs, obs alert box custom, stream overlay maker, twitch overlay without subscription.

## Risks / gotchas
- **OBS Browser Source is Chromium ~103-era on some installs** — avoid bleeding-edge CSS (no `:has()` reliance), test transparency, and never use `alert()`/popups.
- Timers must be **server-authoritative**: send `ends_at`/`remaining_ms` from server; client only renders. OBS sources get reloaded constantly — reconnect logic with exponential backoff is mandatory, and state on reconnect must be correct.
- WS heartbeat (ping/pong every 30s) or OBS's embedded browser silently drops the socket; fall back to 10s polling if WS fails.
- Audio autoplay: OBS allows it, normal browsers don't — gate preview sound behind a click in the editor, note it in UI.
- better-sqlite3 dual ABI (Node vs Electron): copy `link-in-bio/scripts/setup-native.js` pattern.
- Webhook endpoint is unauthenticated-by-token — rate-limit (e.g. 10/min/token) and cap payload size so a leaked URL can't wreck a stream.
- Never broad-kill node in tests; kill the spawned child only.
