# Signboard — Build Plan (Batch 10, #47)

## One-liner & positioning
Self-hosted digital signage you own forever: build playlists of images, videos, web pages, and templated announcement slides; pair any screen (any device with a browser) via a 6-char code; schedule content by daypart; watch screen health from one dashboard. **$49 one-time** vs Yodeck at **$8/screen/mo** (one lobby TV = $96/yr; 5 screens = $480/yr — Signboard pays for itself in under 2 months on a single screen). Tagline: "Every screen you own, one price, forever."

## MVP feature list
- **Content items**: image upload, video upload (mp4/webm, stored locally), web page URL (rendered in sandboxed iframe with per-item "some sites block embedding" warning), and **announcement slides** — templated (title/body/accent color/emoji or uploaded logo, 5+ layout templates rendered as HTML) so non-designers can make a "Closed Friday" slide in 20 seconds. Each item has a default duration (videos default to their length).
- **Playlists**: ordered items with per-entry duration override, drag-to-reorder, transition (cut/fade), loop forever. Preview playlist in-browser.
- **Screens & pairing**: player page at `/player` shows a **6-char pairing code**; admin types the code in the dashboard, names the screen, assigns playlist → player picks up its identity via a device token stored in localStorage and starts playing fullscreen. No per-screen accounts, no player app to install — any smart TV browser, Pi in kiosk Chromium, or old tablet works.
- **Scheduling (dayparting)**: per screen, time-based rules — default playlist plus rules like "Mon–Fri 07:00–11:00 → Breakfast Menu". Rules have priority order; evaluated in the screen's configured timezone.
- **Screen health dashboard**: grid of screens with live status (online = WS connected or heartbeat < 90s), last-seen timestamp, currently-playing item, player version, screen resolution reported by player. Offline screens highlighted red.
- **Live updates**: playlist/schedule edits push to affected players over WebSocket; players also poll every 60s as fallback.
- **Offline caching**: player registers a **service worker** that pre-caches the current playlist's media (Cache Storage API) and the player shell — network drops mid-loop must not blank the screen; on reconnect, player resyncs and reports the gap.
- Emergency takeover: "push this slide to ALL screens now" button (and clear).

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process serves admin, API, player page, and media files. **Port 5338** default. `ws` on the same HTTP server: players connect with device token; admin dashboard connects on an authed channel for live health. Player page is framework-light (plain preloaded-double-buffer DOM swapping — decode next image/video before showing to avoid flashes). Admin behind session/password. Uploads to a data dir (Docker volume). Dockerfile + docker-compose.yml, `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, UPLOAD_DIR, BASE_URL). Electron wrapper (`npm run desktop`) per spec — also handy as a kiosk player on a Windows box. NOTE: service workers require HTTPS **or localhost** — README must state players on a LAN need the reverse-proxy-TLS setup (or run on localhost/Electron); player must degrade gracefully to no-cache mode on plain http.

## Data model (SQLite)
- `items`: id, type ('image'|'video'|'url'|'slide'), name, src_path or url, slide_json (template id + fields), duration_seconds, width/height (probed), created_at.
- `playlists`: id, name, transition, updated_at. `playlist_items`: id, playlist_id, item_id, position, duration_override.
- `screens`: id, name, device_token (unique), pairing_code (nullable once claimed), timezone, default_playlist_id, last_seen_at, last_state_json (current item, resolution, version), created_at.
- `schedule_rules`: id, screen_id, playlist_id, days_mask (bitfield Mon–Sun), start_hhmm, end_hhmm, priority.
- `takeover`: single-row table (item_id nullable, active 0/1, started_at).
- `sessions`: id, token, created_at.

## API endpoints
- `POST /api/login`, `POST /api/logout`, `GET /api/health`
- `GET|POST /api/items` (multer for media), `DELETE /api/items/:id`; `GET|POST|PUT|DELETE /api/playlists`, `PUT /api/playlists/:id/items` (reorder)
- `GET /api/screens`, `POST /api/screens/claim` `{code,name}`, `PUT|DELETE /api/screens/:id`, `GET|POST|DELETE /api/screens/:id/rules`
- `POST /api/takeover`, `DELETE /api/takeover`
- Player (device-token auth): `POST /player/register` → `{pairing_code, device_token}`; `GET /player/manifest` → resolved playlist for *now* (schedule evaluated server-side) + media URLs + content hash; `POST /player/heartbeat` `{state}`; `WS /ws/player?token=` (server pushes `{type:'reload_manifest'}` on changes); `GET /media/:file`.

## UI screens
1. Login. 2. Screens dashboard (health grid, pair-screen flow). 3. Content library (upload zone, slide-template editor with live preview). 4. Playlist editor (drag-reorder, durations, preview button). 5. Screen detail (schedule rule builder with visual week/time grid, assigned playlist, live "now showing"). 6. Player page (`/player` — pairing screen then fullscreen playback; hidden cursor; corner debug overlay on `?debug=1`). Dark mode default.

## Smoke test spec (`test/smoke.js`)
Boot server via `spawn` on port **5438**, temp DB + temp upload dir. Assertions:
1. Health; auth gates on `/api/screens` (401 → login → 200).
2. Upload a generated PNG fixture (write one with `sharp` or a hardcoded base64 1x1) → item created; create slide item; create playlist with both.
3. `POST /player/register` → pairing_code + device_token; `POST /api/screens/claim` with code → screen created; `GET /player/manifest` with token → resolved playlist JSON containing both items and correct durations.
4. **Core WS promise**: connect `ws` client as the player; then `PUT /api/playlists/:id/items` reordering items → assert player socket receives `reload_manifest` within 2s, and re-fetched manifest hash differs.
5. Schedule: add rule for the current time window pointing to a second playlist → manifest now returns playlist B; rule outside current time → playlist A (freeze time via env `FAKE_NOW` override honored by the schedule evaluator).
6. Heartbeat: `POST /player/heartbeat` → `screens.last_seen_at` updated (read SQLite directly); dashboard `GET /api/screens` shows online.
7. Takeover: activate → manifest returns takeover item first; clear → normal.
8. Bad device token → 401. Cleanup: kill spawned PID only, delete temp DB/uploads.

## Launch kit requirements
Real pricing: Yodeck **$8/screen/mo** (annual; free single-screen tier exists — angle honestly around multi-screen + data ownership), ScreenCloud **$20+/screen/mo**, OptiSigns **$10/screen/mo**, Xibo cloud from ~$12/display. Math: 3 screens on Yodeck = $288/yr vs $49 once. Angle: "I put menu screens in a café and refused to pay per-TV rent." Communities: r/selfhosted, r/digitalsignage, r/smallbusiness, r/sysadmin (show the pairing-code demo GIF). Show HN draft: "Show HN: Self-hosted digital signage — any browser is a player." SEO (10): yodeck alternative, self hosted digital signage, digital signage raspberry pi browser, screencloud alternative, menu board software one time purchase, digital signage no subscription, optisigns alternative, signage playlist scheduler, lobby tv display software, open source digital signage.

## Risks / gotchas
- **Autoplaying video with sound** is blocked in browsers — player videos must be `muted` by default (signage is usually mute anyway); document it.
- Smart-TV browsers are ancient: keep the player ES2017-safe, no fancy CSS; test double-buffer swap for image flicker.
- Service worker: HTTPS-or-localhost requirement (see Architecture); also cap cache size and evict media not in the current manifest, or a video-heavy playlist fills a Pi's SD card.
- Web-page items can refuse to iframe (X-Frame-Options) — detect via player error report and flag in dashboard rather than showing a blank slot.
- Schedule evaluation must happen **server-side** in the screen's timezone (store IANA tz per screen) — client clocks on kiosk hardware drift badly.
- better-sqlite3 dual ABI: reuse `link-in-bio/scripts/setup-native.js` pattern. Never broad-kill node in tests.
- Large video uploads: stream with multer disk storage, no body-size buffering in memory; set generous but explicit limit (e.g. 500MB).
