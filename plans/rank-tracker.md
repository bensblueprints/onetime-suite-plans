# Serpdeck — Build Plan (Batch 10, #48)

## One-liner & positioning
Self-hosted keyword rank tracker: bring your own SERP API key, track unlimited keywords across projects, get daily position history, competitor comparisons, and big-move alerts. **$39 one-time** vs AccuRanker from **$129/mo** (1,000 keywords) — pays for itself in 9 days. Also vs SERPWatcher/Mangools ($29+/mo) and Wincher ($59/mo Business). Tagline: "Rank tracking without the rank-tracking bill — you pay only your API's per-search pennies."

## Why BYO-key-first (state this in README too)
Scraping Google directly is a non-starter for a product we sell: Google aggressively blocks datacenter/VPS IPs with CAPTCHAs within dozens of queries, it violates Google's ToS (legal exposure for a paid product), results without proper geo/device parameters are wrong anyway, and every Google markup change would break customers' installs. SERP APIs (SerpAPI ~$75/5k searches, DataForSEO ~$0.0006–$0.002/SERP pay-as-you-go) solve proxies, CAPTCHAs, geo-targeting, and parsing for fractions of a cent — the one-time-purchase economics only work if the recurring cost is the *user's own metered API*, not our scraping arms race. Serpdeck is therefore driver-based BYO-key **only**; no direct-scrape mode ships.

## MVP feature list
- **Drivers**: pluggable interface `check(keyword, {domain?, country, language, device}) → {results:[{position, url, title, domain}], raw}`.
  1. **SerpAPI** driver, 2. **DataForSEO** driver (Google organic, POST task or live endpoint), 3. **Generic HTTP driver** — user supplies URL template + JSONPath-style mappings (`results_path`, `url_field`, `position_field`) so any SERP vendor works. Driver + key configured in Settings with a "test connection" button (runs one real search, shows parsed top-3).
- **Projects**: name + primary domain (+ subdomain match toggle), country, language, device (desktop/mobile), and **competitor domains** (track N extra domains per keyword — every check parses top 100 once, positions extracted for primary + all competitors from the same SERP; competitors cost zero extra API calls).
- **Keywords**: bulk add (textarea, one per line), tags, per-keyword current position, best position, Δ1d/Δ7d/Δ30d.
- **Scheduler**: daily checks at a configurable hour (in-process, node-cron or setInterval tick), staggered with a concurrency limit and per-driver rate limit; manual "check now" per keyword/project; API-credit spend estimate shown before bulk runs.
- **History & charts**: per-keyword position-over-time line chart (position axis inverted, 1 at top), overlaying competitor lines; project-level: average position, % in top 3/10, movers table (biggest up/down last check).
- **Alerts**: rules per project — "alert when any keyword moves ≥ N positions" or "enters/leaves top 10"; channels: webhook POST + SMTP email (nodemailer). Alert log.
- **CSV export**: keywords with current/best/deltas; per-keyword full history; project snapshot.
- Not-found handling: position 101 stored as `null` + "not in top 100" badge (never fake 100).

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion (Recharts or lightweight SVG for charts). **Port 5339** default. Single process; in-process scheduler with a persisted job queue table so a mid-run crash resumes instead of double-spending API credits. Session/password admin auth. API keys stored in SQLite settings (encrypted-at-rest with a key derived from ADMIN_PASSWORD is nice-to-have; minimum: never returned in full by API after save — masked `sk_…abc`). Dockerfile + docker-compose.yml (SQLite volume), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, SMTP_*). Electron wrapper (`npm run desktop`) per spec.

## Data model (SQLite)
- `projects`: id, name, domain, match_subdomains (0/1), country, language, device, schedule_hour, created_at.
- `competitors`: id, project_id, domain.
- `keywords`: id, project_id, phrase, tags_json, created_at, UNIQUE(project_id, phrase).
- `checks`: id, keyword_id, checked_at, position (nullable), url, serp_top_json (top 100 compact: domain+url+pos), driver, cost_estimate.
- `competitor_positions`: id, check_id, competitor_id, position (nullable), url.
- `alert_rules`: id, project_id, kind ('move'|'enter_top'|'leave_top'), threshold, channel ('webhook'|'email'), target.
- `alerts`: id, rule_id, keyword_id, message, payload_json, sent_at, ok.
- `job_queue`: id, keyword_id, status ('pending'|'running'|'done'|'error'), error, run_after, attempts.
- `settings`: key, value (driver name, api keys masked handling, concurrency). `sessions`: id, token.

## API endpoints
- `POST /api/login|logout`, `GET /api/health`
- `GET|POST|PUT|DELETE /api/projects`, `.../:id/competitors`
- `POST /api/projects/:id/keywords` (bulk), `GET /api/projects/:id/keywords?sort=`, `DELETE /api/keywords/:id`
- `POST /api/keywords/:id/check`, `POST /api/projects/:id/check` (enqueue all), `GET /api/jobs/status`
- `GET /api/keywords/:id/history`, `GET /api/projects/:id/overview` (aggregates + movers)
- `GET /api/projects/:id/export.csv`, `GET /api/keywords/:id/export.csv`
- `GET|PUT /api/settings/driver`, `POST /api/settings/driver/test`
- `GET|POST|DELETE /api/projects/:id/alert-rules`, `GET /api/alerts`

## UI screens
1. Login. 2. Projects list (cards: avg position, top-10 count, sparkline). 3. Project dashboard (movers, keyword table with delta chips, check-now, add-keywords modal, competitor manager). 4. Keyword detail (history chart with competitor overlay lines, SERP snapshot table from last check). 5. Settings (driver picker with per-driver fields, generic-driver mapping form, test button, SMTP, scheduler hour). 6. Alerts log. Dark mode default.

## Smoke test spec (`test/smoke.js`)
No real SERP API in CI — spin up a **local mock SERP server** (`http.createServer`) returning a fixed SerpAPI-shaped JSON (100 organic results; put `example.com` at position 4 and `rival.com` at position 9). Boot Serpdeck via `spawn` on port **5439**, temp DB. Assertions:
1. Health; auth gates; login.
2. Configure the **generic driver** pointed at the mock server via `PUT /api/settings/driver`; `POST /api/settings/driver/test` → 200 with parsed top-3 containing expected URLs (proves the mapping layer).
3. Create project (domain example.com, competitor rival.com); bulk-add 3 keywords → 3 rows.
4. `POST /api/projects/:id/check` → poll `/api/jobs/status` until done; open SQLite: each keyword has a `checks` row with position 4, and `competitor_positions` rows with position 9.
5. Change mock to return example.com at position 15; create alert rule (move ≥ 5, webhook → local receiver server); re-check → assert webhook receiver got JSON containing the keyword and delta, `alerts.ok=1`.
6. `GET /api/keywords/:id/history` → 2 points; export.csv → 200, `text/csv`, contains the phrase and both positions.
7. Mock returns keyword-absent SERP → position stored as NULL, UI-facing API reports `not_in_top_100`. Cleanup: kill spawned PIDs only (app + both mock servers), delete temp DB.

## Launch kit requirements
Real pricing: AccuRanker **$129/mo** (1k keywords), Wincher **$32–$59/mo**, Mangools **$29.90+/mo**, SE Ranking **$65+/mo**, Nightwatch **$32+/mo**. Cost math for the pitch: 100 keywords × 30 days via DataForSEO ≈ **$2–6/mo** in API fees vs $129/mo AccuRanker. Angle: "Rank trackers charge SaaS prices for a cron job and a chart — I moved the metered part to your own API key." Communities: r/SEO, r/bigseo, r/juststart, r/selfhosted (rules-aware: share the cost-math table, not a sales pitch). Show HN draft. SEO (10): accuranker alternative, self hosted rank tracker, serpapi rank tracker, dataforseo rank tracking, keyword position tracker one time purchase, wincher alternative, rank tracker byo api key, google position tracking self hosted, seo rank tracker no subscription, competitor rank tracking tool.

## Risks / gotchas
- **Never ship direct Google scraping** (see BYO rationale) — also don't "helpfully" add it later behind a flag; it's a support and ToS trap.
- Driver responses differ wildly (SerpAPI `organic_results[].position` vs DataForSEO `tasks[0].result[0].items[]` with `rank_absolute`) — normalize inside drivers, keep `raw` for debugging, and unit-test each mapper against saved real fixtures.
- Domain matching: compare registrable domain (use `tldts`), honor the subdomain toggle, match on result URL host not display URL.
- Credit protection: hard concurrency cap, dedupe queue (don't enqueue a keyword already pending), and show estimated call count before "check all".
- API keys must never appear in logs, exports, or GET responses (masked only).
- Scheduler + Electron: app may be closed at schedule hour — on boot, run any missed daily checks once (persist `last_scheduled_run` per project), never more than once per day.
- better-sqlite3 dual ABI: reuse `link-in-bio/scripts/setup-native.js`. Never broad-kill node in tests.
