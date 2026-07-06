# Hawkwatch — Price & Stock Monitor (Build Plan)

**One-liner:** Watch any product page for price or stock changes — CSS selector or automatic JSON-LD price detection via Playwright — with scheduled checks, SMTP/webhook alerts, history charts, and screenshots on change. Pay $34 once vs Distill.io at $12/mo — pays for itself in 3 months.

- **Product #33, Batch 7** · Price **$34** · Assigned port **5326** · Directory `C:\Users\ADMIN\Desktop\onetime-suite\price-monitor\`
- Follow `BUILD-SPEC.md`: VPS web app (Express + better-sqlite3 + React/Vite + Tailwind + Lucide + Framer Motion) + Electron desktop mode, Docker (use the official `mcr.microsoft.com/playwright` base image so Chromium works in the container), `.env.example` (PORT=5326, ADMIN_PASSWORD), launch-kit, MIT, git init only.

## MVP features
1. **Watchers** — add a URL; extraction modes: (a) **auto**: parse JSON-LD `Product`/`Offer` (`offers.price`, `priceCurrency`, `availability`) from page HTML, fallback to `og:price:amount` meta and common price microdata; (b) **CSS selector**: user supplies a selector, we extract text and parse a price number (locale-aware: strip currency symbols, handle `1.299,00` vs `1,299.00`); (c) **stock keyword**: selector/regex presence → in-stock boolean (also derived from JSON-LD availability).
2. **Fetch engine** — Playwright Chromium (headless) so JS-rendered shops work; per-watcher option "simple HTTP fetch" for static pages (faster, gentler). Configurable user agent; default identifies itself honestly (`HawkwatchBot/1.0`).
3. **Scheduling** — per-watcher interval (min 15 min default, floor 5 min), lightweight in-process scheduler (setInterval tick every 30s picks due watchers, one at a time — serialize browser use), jitter ±10% so checks don't align.
4. **Change detection + alerts** — on price change (any, or threshold: drops below X / % change) or stock flip, fire alerts: **SMTP email** (BYO SMTP via nodemailer, settings UI + test send) and **webhook** (POST JSON {watcher, old, new, url, screenshot_url}; optional Discord/Slack-compatible simple payload toggle). Alert log with delivery status.
5. **History charts** — every check stores price/stock; watcher detail shows a price line chart (recharts or hand-rolled SVG) + stock band, min/max/current stats.
6. **Screenshots on change** — capture full-page (or element) screenshot at every *change* event (not every check), store under `data/shots/`, show before/after in the alert detail and email.
7. **Manual "check now"**, pause/resume watcher, and a robots.txt awareness note: on watcher create, fetch robots.txt and show a non-blocking warning if the path is disallowed (we inform, user decides — document in README).

Out of scope: proxy rotation, captcha solving, price comparison across retailers, browser extension.

## Architecture
- Single Express process; scheduler runs in-process (like uptime-monitor). One shared Playwright browser instance, lazily launched, pages opened per check with 30s timeout, closed after. Concurrency 1–2 to keep RAM sane on a $5 VPS.
- Parsing pipeline: page → `content()` HTML → JSON-LD script tags parsed (handle arrays + `@graph`) → selector fallback → price normalizer util (pure function, unit-testable).
- Electron desktop mode per spec — Playwright downloads Chromium on first run; surface a first-run "downloading browser" state in UI (BUILD-SPEC allows binary downloads if surfaced).
- Auth: session + ADMIN_PASSWORD; everything admin-only (no public pages).

## Data model (SQLite)
- `watchers(id, name, url, mode ('auto'|'selector'|'http'), selector, stock_selector, currency, interval_minutes, threshold_type ('any'|'below'|'pct'), threshold_value, fetch_engine ('playwright'|'http'), paused, robots_warning, created_at, last_checked_at, last_price, last_in_stock, fail_count)`
- `checks(id, watcher_id, price, in_stock, http_status, duration_ms, error, created_at)`
- `changes(id, watcher_id, kind ('price'|'stock'), old_value, new_value, screenshot_path, created_at)`
- `alerts(id, change_id, channel ('email'|'webhook'), target, status, error, created_at)`
- `settings(key, value)` — SMTP config, webhook defaults, global user agent.

## API endpoints
Admin (auth): `POST /api/login`; CRUD `/api/watchers`; `POST /api/watchers/:id/check` (force, returns parsed result — used by smoke test); `POST /api/watchers/test-extract` {url, mode, selector} → dry-run parse for the add-watcher wizard; `GET /api/watchers/:id/detail` (history series, changes, stats); `GET /api/changes/:id/screenshot`; `GET/PUT /api/settings/smtp|webhook` + test endpoints; `GET /api/health` (public).

## UI screens
1. **Login** 2. **Dashboard** — watcher cards: favicon, current price w/ trend arrow, stock pill, sparkline, last check, pause toggle. 3. **Add watcher wizard** — URL → "Detect" runs test-extract, shows found JSON-LD price or lets user paste selector with live preview result; alert rules step. 4. **Watcher detail** — price chart, change timeline with before/after screenshots (Framer Motion lightbox), check log, force-check button. 5. **Settings** — SMTP + webhook + user agent. Dark default.

## Smoke test (`test/smoke.js`, uptime-monitor style)
Spawn server (`PORT=5396, DB_PATH=test/smoke.db, ADMIN_PASSWORD`). Start a **local fixture shop** http server (like uptime-monitor's target) on 5397 serving a product page whose price comes from a mutable variable, in two flavors: `/jsonld` (price in a JSON-LD Product script) and `/plain` (price in `<span id="price">$49.99</span>`).
1. Health + auth gates (401/401/200).
2. Create watcher A (mode auto, `/jsonld`, engine http) → force check → assert 200, parsed `price===49.99`, check row in SQLite with price + duration.
3. Create watcher B (mode selector `#price`, `/plain`, engine **playwright**) → force check → price parsed (this proves Chromium works; allow generous waitFor since first launch downloads nothing in CI—browser installed at npm postinstall via `npx playwright install chromium`).
4. Mutate fixture price to 39.99 → force check A → assert `changes` row (kind price, old 49.99, new 39.99), screenshot file exists on disk and >1KB, and `alerts` webhook row status ok — point watcher webhook at a local capture server in the test and assert received JSON body fields.
5. Flip fixture to out-of-stock (JSON-LD availability OutOfStock) → force check → stock change row.
6. Detail API: history length ≥3, min/max correct. Threshold: set `below 35` → mutate to 36 → no new alert; mutate to 30 → alert.
Cleanup db/shots; exit codes as uptime-monitor. `npm test` runs it.

## Launch kit requirements
Competitor math: **Distill.io $12/mo** (Starter; $28/mo Pro), also Visualping (from $10/mo, capped checks) and camelcamelcamel (Amazon-only). Angle: "Unlimited watchers, your server, no per-check quotas — Distill's plans meter your checks; Hawkwatch is $34 once." Pays for itself in <3 months. PH shots: dashboard sparklines, add-wizard auto-detect, price chart, before/after screenshots, alert email. Subreddits: r/selfhosted (strong fit), r/Flipping, r/homelab — rules-aware. SEO: "distill alternative", "self hosted price tracker".

## Risks / gotchas
- **Respect robots.txt / site ToS — mandatory in plan & README:** default polite behavior (identifying UA, interval floor, jitter, 1 concurrent check, no retry storms — exponential backoff on failures via `fail_count`). Surface robots.txt disallow warnings; README section "Be a good citizen" stating some sites (esp. Amazon) prohibit scraping in ToS and users are responsible. Never market it as an Amazon-ToS-bypass.
- **better-sqlite3 dual ABI:** copy `link-in-bio/scripts/setup-native.js` pattern (vendor both bindings, `nativeBinding` in db.js).
- Playwright in Docker: use `mcr.microsoft.com/playwright:v<matching>-jammy` base or `npx playwright install --with-deps chromium` in Dockerfile; pin playwright version = image version.
- Memory: always `page.close()`/context close in finally; relaunch browser if it crashes (health check on `browser.isConnected()`).
- Price parsing edge cases: currency symbols, thousands separators, "From $X", sale vs list price (pick first offer / lowest); keep normalizer pure + unit-covered inside smoke test.
- Don't screenshot every check (disk bloat) — changes only; cap stored screenshots per watcher (prune oldest beyond 50).
- No PowerShell JSON writes (BOM).
