# UrlVid — Build Plan (website-to-video)

## One-liner & positioning
Self-hosted **URL → video** engine. Paste any website URL and UrlVid's local **Hyperframes**
capture engine drives a headless Chromium through the page — smooth auto-scroll walkthrough,
Ken-Burns pan/zoom over a full-page capture, or a fixed hero shot that records live CSS/JS
animation — then encodes it to MP4 / WebM / GIF at the size you need (landscape, square, or
9:16 vertical for Reels/TikTok/Shorts). **$39 one-time** vs Placid Video / Veed / Nutshell
website-recorders from **$19–39/mo**. Tagline: **"Any website → a video. Your machine. Pay once."**

Everything runs 100% locally: your own Chromium + ffmpeg. No render credits, no watermark,
no uploading the sites you capture to someone else's cloud.

## MVP feature list
- **Render endpoint** `POST /api/v1/render` (also `GET` for simple cases) with params:
  - `url` (required)
  - `mode` — `scroll` (auto-scroll top→bottom), `pan` (Ken-Burns over a full-page shot),
    `hero` (hold the viewport and record live animation). Default `scroll`.
  - `preset` — `landscape` 1920×1080, `square` 1080×1080, `vertical` 1080×1920, or explicit
    `width`/`height`. Default `landscape`.
  - `fps` (default 30, 1–60), `duration` seconds (default 8, 1–60), `format` (`mp4`|`webm`|`gif`, default `mp4`).
  - `scroll_speed` (px/s override for scroll mode), `hold_start`/`hold_end` (ms to linger at the
    top/bottom of a scroll), `quality` (crf-like 1–100), `dark_mode` (bool → `prefers-color-scheme: dark`),
    `full_page_first` (pan mode), `wait_until` (load|domcontentloaded|networkidle0|networkidle2),
    `delay` (ms after load, ≤10000), `hide_selectors` (CSS selectors to remove — cookie banners etc.).
  - Returns the encoded video bytes (correct content-type) OR `{job_id}` when `async=1`.
- **Async job queue**: renders are heavy, so `async=1` returns `202 {job_id}`; poll
  `GET /api/v1/jobs/:id` for `status` (queued|running|done|error), `progress` (0–1), and the
  output URL. Synchronous mode still supported for short clips. Single shared browser, N concurrent
  jobs (`MAX_CONCURRENT`, default 1), FIFO queue, per-job timeout.
- **API keys**: named keys, `?key=` or `X-Api-Key`; per-key rate limit (renders/min) + daily quota;
  usage counters; revoke/regenerate. Keys prefixed `uv_`.
- **Library/Gallery**: admin grid of recent renders — thumbnail (poster frame), URL, mode/preset,
  size, duration, status; play inline, re-render, download, copy request curl, delete.
- **Hyperframes engine** (`server/hyperframes.js`): Puppeteer(-core) drives Chromium, captures an
  ordered PNG frame sequence to a temp dir, pipes it through ffmpeg (`image2` → chosen codec).
  A poster frame (`poster.png`) is saved per render for the gallery thumbnail.
- **Playground**: the money screen — form for every param with a live preview poster + generated
  `curl`, one-click render, inline `<video>` result. Preset buttons for social sizes.
- **URL guard**: block non-http(s) schemes; optional `ALLOW_PRIVATE=false` blocks localhost/RFC1918
  (SSRF hygiene; default true since self-hosters capture internal dashboards — documented).

## Architecture
BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3, single process, **port 5375**.
Frontend is a premium plain HTML/CSS/JS renderer (dark default) served statically by Express —
video tooling is simple enough that a hand-built UI stays lighter than a Vite/React bundle and
avoids a build step in Docker. Electron wrapper (`electron/main.js`) starts the same server on a
free local port with data dir → `userData`, auto-logs-in as admin.

**Chromium** via `puppeteer-core` (NO bundled download at `npm i`, so installs stay clean/offline).
Executable resolved at runtime: `CHROMIUM_PATH` / `PUPPETEER_EXECUTABLE_PATH` env → common system
paths (`/usr/bin/chromium`, Chrome on Win/mac) → Playwright cache. README surfaces this as the one
first-run requirement.

**ffmpeg** resolved at runtime: `FFMPEG_PATH` env → optional `ffmpeg-static` module if present →
system `ffmpeg` on PATH. NOT a hard npm dependency (keeps `npm i` clean; a minimal/OS ffmpeg is
common). MP4 needs libx264, GIF needs the gif encoder + palettegen — both present in any standard
ffmpeg build; WebM (VP8/VP9) works even with a minimal build. README documents install per-OS.

Dockerfile: node:20-slim + `apt-get install chromium ffmpeg` (sets `CHROMIUM_PATH`,
`FFMPEG_PATH`); `--no-sandbox` for containers via `PUPPETEER_ARGS`. docker-compose mounts volumes
for the SQLite db and `data/renders`. `.env.example`: PORT, ADMIN_PASSWORD, DB_PATH, RENDERS_DIR,
MAX_CONCURRENT, JOB_TIMEOUT_MS, ALLOW_PRIVATE, CHROMIUM_PATH, FFMPEG_PATH, PUPPETEER_ARGS.

## Data model (SQLite)
- `api_keys`: id, name, key (unique, `uv_`+32hex), rate_per_min, daily_quota, renders_total,
  renders_today, today_date, revoked, created_at.
- `renders`: id, url, mode, preset, width, height, fps, duration_s, format, params_json,
  file_path, poster_path, size_bytes, frames, status ('queued'|'running'|'done'|'error'),
  error, progress, api_key_id, took_ms, created_at.
- `usage_log`: id, api_key_id, status_code, took_ms, created_at (prune >30 days).
- `settings`: key, value. `sessions`: id, token, created_at.

## API endpoints
- `POST|GET /api/v1/render` (API-key auth) → video bytes, or `202 {job_id}` when `async=1`.
- `GET /api/v1/jobs/:id` (API-key auth) → job status/progress/output URL.
- `POST /api/login`, `POST /api/logout`, `GET /api/health` (reports chromium + ffmpeg status/codecs).
- `GET|POST /api/keys`, `PUT|DELETE /api/keys/:id`, `POST /api/keys/:id/regenerate`.
- `GET /api/renders?limit=&q=`, `GET /api/renders/:id/file`, `GET /api/renders/:id/poster`,
  `DELETE /api/renders/:id`, `POST /api/renders/:id/rerender`.
- `GET /api/stats`, `GET|PUT /api/settings`, `POST /api/renders/clear`.

## UI screens
1. Login. 2. Dashboard (stat tiles: renders today, avg render ms, chromium/ffmpeg status,
   supported formats). 3. Playground (every param + live poster preview + curl + inline video).
4. Library grid. 5. API keys. 6. Settings. 7. Docs page rendering the endpoint reference. Dark default.

## Smoke test spec (`test/smoke.js`)
Spawn server on port **5385**, temp DB + temp renders dir, `MAX_CONCURRENT=1`,
`FFMPEG_PATH`=bundled ffmpeg, `CHROMIUM_PATH`=bundled chromium. Start a local target
`http.createServer` on **5386** serving a tall HTML page (≥3000px) with a `#hero` header,
distinct section colors, a title, and `prefers-color-scheme` CSS. Assertions:
1. Health ok and reports chromium+ffmpeg found; login/auth gates (wrong password 401; keys API 401).
2. Create API key → 201, key starts with `uv_`.
3. Sync `POST /api/v1/render` `{url, mode:scroll, format:webm, duration:2, fps:10, preset:landscape}`
   → 200, content-type `video/webm`, body starts with EBML magic `1A 45 DF A3`, length > 2000.
   Assert a `renders` row status 'done', file on disk with matching size, a poster PNG saved
   (PNG magic), and `frames` ≈ fps*duration.
4. Async `render` with `async=1` → 202 `{job_id}`; poll `/api/v1/jobs/:id` until `done`
   (timeout 60s) → output file valid WebM.
5. `mode:hero` and `mode:pan` each → 200 valid WebM (frame pipeline exercised for all three modes).
6. `preset:vertical` → output frames encode at 1080×1920 (assert stored width/height; even dims).
7. `hide_selectors` removes an element (render still succeeds; smoke asserts 200 — visual removal
   is best-effort, logged not asserted).
8. Auth/guard: no key → 401; revoked key → 401; `rate_per_min=1` then 2 rapid renders → second 429;
   `url=file:///etc/hosts` → 400; missing url → 400.
9. Format negotiation: request `format:mp4` when the resolved ffmpeg lacks libx264 → 422 with a
   clear "encoder unavailable, install full ffmpeg" message (NOT a 500). With a capable ffmpeg this
   path returns MP4 — asserted only when `libx264` is detected, else logged as skipped.
Cleanup: server kills its own browser on SIGTERM; remove temp dirs. Note that the bundled
Playwright ffmpeg only ships VP8/WebM, so the smoke test verifies the WebM path end-to-end and
treats MP4/GIF as codec-detected/skipped in this environment.

## Launch kit requirements
Competitors: Placid (video templates, $39/mo), Veed website recorder ($24/mo), Nutshell/Screenshotone
video add-ons, Browserless recordings ($30/mo+). Angle: "Every 'website to video' tool rents you
render credits and stamps a watermark. UrlVid runs on your machine — unlimited renders, no
watermark, pay once." Math: $29/mo tool = $348/yr vs $39 once (pays for itself in ~6 weeks).
Reddit: r/selfhosted, r/SideProject, r/socialmedia, r/marketing (turn a landing page into an ad clip).
SEO: website to video, url to video, turn a website into a video, self hosted website recorder,
scrolling website video generator, landing page to video ad.

## Risks / gotchas
- **better-sqlite3 ABI**: prebuilt for Node 20/22; on mismatch document `npm rebuild better-sqlite3`.
- **ffmpeg codec spread is environment-dependent**: never assume mp4/gif. Probe `-encoders` once at
  boot, cache the capability set, and return a clean 422 (not a 500) when a format's encoder is
  missing. WebM/VP8 is the always-available floor.
- **Never broad-kill node/chrome**: track and kill only the browser the server launched
  (`browser.process().pid`); always `page.close()` in `finally`; job timeout kills the page, not the browser.
- **Frame memory**: stream frames to disk as `frame-%05d.png`, never hold the whole sequence in RAM;
  cap `fps*duration` (hard max frames) so a 60fps×60s request can't OOM.
- **Deterministic scroll**: interpolate `scrollTop` per frame (don't rely on wall-clock) so scroll
  mode is reproducible; `hero` mode intentionally samples wall-clock to catch animation.
- **Even dimensions**: yuv420p / most encoders need even width/height — force `trunc(x/2)*2`.
- **SSRF**: default `ALLOW_PRIVATE=true` (self-host convenience) but make the block one env flip; block
  `file:`/`data:`/`chrome:` schemes always.
- **Container Chromium**: needs `--no-sandbox --disable-dev-shm-usage`; surface via `PUPPETEER_ARGS`.
