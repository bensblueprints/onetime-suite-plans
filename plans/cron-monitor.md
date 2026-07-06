# Pingcron — Build Plan (Batch 6, #26)

## One-liner & positioning
Dead-man's-switch cron job monitoring you own forever. Jobs ping a unique URL when they run; Pingcron alerts you when a ping is *late or missing*. **$29 one-time** vs Cronitor at **$10/mo** (pays for itself in 3 months). Also compare Healthchecks.io hosted ($20/mo Business) and Dead Man's Snitch ($5+/mo). Tagline: "Your cron jobs, watched 24/7. Pay once."

## MVP feature list
- **Checks (monitored jobs)**: name, unique ping token, schedule type = `interval` (expected every N seconds/minutes/hours) OR `cron` (5-field cron expression + timezone), plus a **grace period** (seconds of allowed lateness).
- **Ping endpoint** `GET|POST /ping/:token` — no auth, records timestamp, optional body (first 10KB stored as last-ping log), query `?status=fail` or path `/ping/:token/fail` records an explicit failure, `/ping/:token/start` records run-start (enables duration tracking).
- **State machine**: `new → up → grace → down` (and `paused`). Evaluator loop runs every 15s: computes next-expected time from last ping + interval, or from cron expression (use `cron-parser` npm) + grace; transitions and fires alerts on `up→down`, `down→up`, and explicit fail pings.
- **Alerts**: webhook (POST JSON with check name/status/last ping) and SMTP email (nodemailer, config via env/settings page). Per-check alert channel toggle. Alert log table.
- **Dashboard**: all checks with live status pills, last ping ("3m ago"), expected next ping, uptime %, ping history sparkline.
- **Check detail**: ping event log (time, source IP, duration if start/end pair, status), recent alert history, config edit, "copy curl snippet" (`curl -fsS https://host/ping/TOKEN`).
- **Public status badge**: `GET /badge/:token.svg` — no auth, returns an SVG shield (green "up" / red "down" / grey "paused"), embeddable in READMEs. Optional `GET /status/:token.json`.
- Pause/resume checks; delete with confirmation.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process serves API + built frontend. **Port 5320** default. Session/password admin auth (`ADMIN_PASSWORD` env); ping and badge endpoints are unauthenticated by design. Dockerfile + docker-compose.yml (volume for SQLite), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, SMTP_HOST/PORT/USER/PASS/FROM, BASE_URL for links in alerts). Electron desktop wrapper (`npm run desktop`): `electron/main.js` boots the same server on a free port, data in userData, auto-login. In-process `setInterval` evaluator (no external cron needed) — must start on server boot and be tolerant of clock skew.

## Data model (SQLite)
- `checks`: id, name, token (unique, 22-char nanoid), schedule_type ('interval'|'cron'), interval_seconds, cron_expr, tz, grace_seconds, status ('new'|'up'|'grace'|'down'|'paused'), last_ping_at, last_started_at, next_expected_at, alert_webhook_url, alert_email, created_at.
- `pings`: id, check_id, kind ('success'|'fail'|'start'), received_at, source_ip, duration_ms (nullable), body_excerpt.
- `alerts`: id, check_id, type ('down'|'up'|'fail'), channel ('webhook'|'email'), payload_json, sent_at, ok (0/1), error.
- `settings`: key, value (SMTP overrides, default grace, retention days).
- `sessions`: id, token, created_at.

## API endpoints
- `POST /api/login`, `POST /api/logout`, `GET /api/health` (no auth)
- `GET|POST /api/checks`, `GET|PUT|DELETE /api/checks/:id`, `POST /api/checks/:id/pause`, `POST /api/checks/:id/resume`, `POST /api/checks/:id/test-alert`
- `GET /api/checks/:id/pings?limit=`, `GET /api/alerts`
- `GET|PUT /api/settings`
- Public: `GET|POST /ping/:token`, `/ping/:token/start`, `/ping/:token/fail`, `GET /badge/:token.svg`, `GET /status/:token.json`

## UI screens
1. Login. 2. Dashboard (check grid, status pills, add-check button). 3. Check create/edit modal (schedule type toggle: interval picker vs cron expression with live "next 3 runs" preview via cron-parser). 4. Check detail (ping log, curl snippet copy, badge markdown copy, alert history). 5. Settings (SMTP config + send-test, retention). Dark mode default.

## Smoke test spec (`test/smoke.js`, style of uptime-monitor)
Boot server via `spawn` on port **5390** with temp DB + `EVAL_INTERVAL_MS=500` env override for fast evaluation. Assertions:
1. `/api/health` ok; wrong password → 401; `/api/checks` unauthenticated → 401; login → 200.
2. Create interval check (interval 2s, grace 1s) → 201, response includes token.
3. `GET /ping/:token` → 200; poll `/api/checks` until status `up`; open SQLite directly and assert a `pings` row with kind 'success' and `received_at`.
4. Start a local `http.createServer` webhook receiver; set check's webhook URL to it. Stop pinging; wait ~4s; assert status transitions to `down`, an `alerts` row exists with `ok=1`, and the webhook receiver actually got a JSON POST containing the check name and `"status":"down"`.
5. Ping again → status `up`, recovery alert row exists.
6. `GET /ping/:token/fail` → immediate `down` + fail alert.
7. `GET /badge/:token.svg` → 200, `content-type` includes `svg`, body contains `<svg` and current status word.
8. Cron check: create with `cron_expr='* * * * *'`, assert `next_expected_at` is populated and in the future.
9. Bad token ping → 404. Cleanup: kill only the spawned `serverProc` (never broad-kill node), delete temp DB/wal/shm.

## Launch kit requirements
Competitors with real pricing: Cronitor ($10/mo solo, $50/mo team), Healthchecks.io hosted ($20/mo Business; note the OSS self-host angle honestly — our pitch is "polished, installer-ready, one process"), Dead Man's Snitch ($5–$49/mo), UptimeRobot heartbeat (paid tiers). Angle: "I got tired of paying monthly to know my backups ran." Reddit: r/selfhosted, r/devops, r/sysadmin (rules-aware: show, don't sell). HN Show HN draft. SEO: cron monitoring, healthchecks alternative, cronitor alternative, dead man's switch monitoring, heartbeat monitoring self hosted.

## Risks / gotchas
- **better-sqlite3 dual ABI** (Node vs Electron): copy the postinstall pattern from `C:\Users\ADMIN\Desktop\onetime-suite\link-in-bio\scripts\setup-native.js` — vendor both bindings, pick via `nativeBinding` at runtime.
- **Never broad-kill node processes** in tests or scripts — kill only the spawned child PID.
- Cron parsing: use `cron-parser` with explicit timezone; don't hand-roll. Interval checks anchor next-expected on *last ping*, not schedule start.
- Evaluator must not double-alert: only alert on state *transitions*, persist status in DB so restarts don't re-fire.
- Ping endpoint must be fast and forgiving (accept GET/POST/HEAD, any body), and rate-limit per token lightly to survive runaway loops.
- SMTP unconfigured is a valid state — email alerts should no-op with a logged warning, not crash.
