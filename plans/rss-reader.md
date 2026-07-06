# Feedloft — Self-hosted RSS reader (Build Plan)

**One-liner:** A fast, keyboard-first RSS reader you host yourself — OPML in/out, folders, full-text extraction, search — **$24 once** vs Feedly Pro **$8/mo** ($96/yr). Roadmap item #38, Batch 8.

**Directory:** `C:\Users\ADMIN\Desktop\onetime-suite\rss-reader\` · **Port 5331** · Follow `BUILD-SPEC.md` exactly (MIT, launch-kit, dual-mode Electron wrapper, git init, no push).

## Positioning
"Pay once. Own it forever." vs Feedly Pro $8/mo. Angles: no algorithm, no AI upsells, no feed limits, your reading data stays yours, works great self-hosted or as a desktop app. Pays for itself in 3 months.

## MVP features
- **Feed management** — add by URL (auto-discover `<link rel="alternate">` from HTML pages), rename, move to folder, unsubscribe.
- **OPML import/export** — import preserves folder structure (`<outline>` nesting); export produces valid OPML 2.0.
- **Polling** — background interval (default 15 min, per-feed override) with **conditional GET**: store/send `ETag` + `Last-Modified`, honor 304; per-feed error tracking with backoff after repeated failures.
- **Folders** — one level; sidebar tree with per-folder and per-feed **unread counts**; "All" and "Starred" virtual views.
- **Reading pane** — 3-pane layout (folders/feeds → article list → article view); **keyboard-first**: `j/k` next/prev article, `n/p` move without opening, `o`/`Enter` open, `m` toggle read, `s` star, `v` open original in browser, `r` refresh, `gg`/`G`, `/` focus search, `?` shortcut overlay, `Shift+A` mark all read.
- **Star/save** — starred list persists even if item pruned from feed.
- **Full-text fetch** — for truncated feeds: per-feed toggle "always fetch full text" + per-article button; fetch original URL and extract readable content with `@mozilla/readability` + `jsdom` (or `linkedom`), sanitize with `dompurify`/`sanitize-html`, cache result on the item.
- **Search** — SQLite FTS5 over title+content (contentless or external-content table), searching all/current feed.

## Architecture
Per BUILD-SPEC: Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion, single process, port 5331. Whole app is behind admin session auth (single user). Poller: `setInterval` scheduler in the server process walking due feeds (staggered, max ~4 concurrent fetches); parse with `rss-parser` or `feedparser` — must handle RSS 2.0, RSS 1.0/RDF, and Atom. Item identity: `guid`/`atom:id`, else link, else hash(title+pubDate). `.env`: PORT, ADMIN_PASSWORD, POLL_MINUTES. Dockerfile + compose (db volume). Desktop mode per spec (poller runs inside the wrapped server — free "native" reader).

## Data model (SQLite)
- `folders(id, name, position)`
- `feeds(id, folder_id FK NULL, url UNIQUE, title, site_url, etag, last_modified, last_polled_at, poll_minutes NULL, fulltext_always INT, error_count, last_error, created_at)`
- `items(id, feed_id FK, guid, url, title, author, content_html, fulltext_html NULL, summary, published_at, read INT, starred INT, created_at, UNIQUE(feed_id, guid))`
- `items_fts` (FTS5: title, content — external content on `items`; note VlogPipe memory: FTS5 `contentless_delete` gotchas → prefer external-content table with triggers)
- `sessions(id, created_at)`
- Prune: keep last N (default 500) unstarred read items per feed.

## API endpoints
`POST /api/login` · `GET/POST/PUT/DELETE /api/folders[/:id]` · `POST /api/feeds` (`{url}` → discover+fetch+parse immediately, return feed+items) · `PUT/DELETE /api/feeds/:id` · `POST /api/feeds/:id/refresh` · `GET /api/items?feed=&folder=&unread=1&starred=1&before=<cursor>&limit=50` · `PUT /api/items/:id` (`{read, starred}`) · `POST /api/items/mark-read` (`{feedId|folderId|all, beforeId}`) · `POST /api/items/:id/fulltext` (fetch+extract, returns HTML) · `GET /api/search?q=` · `POST /api/opml/import` (multipart) · `GET /api/opml/export` · `GET /api/status` (poller stats, failing feeds).

## UI screens
1. **Login** 2. **Main 3-pane reader** — sidebar (folders/feeds + unread badges, add-feed input, OPML buttons in a settings popover), middle article list (unread bold, star icon, relative dates, infinite scroll), right article pane (sanitized HTML, "Fetch full text" button, open-original) 3. **Shortcut overlay** (`?`) 4. **Feed settings modal** (rename, folder, poll interval, full-text toggle, error log) 5. **Search results view**. Dark mode default, dense typography — this app lives or dies on list-render speed and keyboard flow.

## Smoke test (`test/smoke.js`, style: whisper-transcriber/test)
No Electron. Spin up a **local fixture HTTP server** in the test that serves: (a) an RSS 2.0 feed with 3 items, (b) an Atom feed, (c) a truncated-content feed whose item links to (d) a full HTML article page, and which returns **304 when `If-None-Match` matches** a served ETag. Boot the app in-process on an ephemeral port, temp db; then:
1. Login; `POST /api/feeds` for RSS fixture → 3 items stored, unread count = 3.
2. Add Atom fixture → items parse (title/date/link correct).
3. Trigger `refresh` again → fixture server asserts it received `If-None-Match`, returns 304 → item count unchanged, `last_polled_at` updated.
4. Mutate fixture feed (add item 4), change ETag → refresh → exactly 1 new item (guid dedupe holds).
5. `POST /api/items/:id/fulltext` on truncated item → extracted HTML contains article body text from fixture page, excludes its `<nav>` junk.
6. Mark read / star via API → counts update; `GET /api/search?q=` finds item by body word via FTS.
7. OPML: import a fixture OPML with 2 folders/3 feeds → structure created; export → parse XML, assert folders + `xmlUrl`s round-trip.
`npm test` runs it.

## Launch kit
Per BUILD-SPEC. PH tagline idea: "The RSS reader you buy once — keyboard-fast, self-hosted." Strategy: r/rss, r/selfhosted, HN Show HN (RSS crowd = HN crowd), keywords "feedly alternative self hosted", "miniflux alternative". Math: $24 vs $96/yr Feedly Pro.

## Risks / gotchas (feed edge cases — budget real time here)
- **Encodings:** feeds declare charset in XML prolog or HTTP header; use `iconv-lite` on the raw buffer, don't assume UTF-8.
- **Malformed XML** (unescaped `&`, BOM, leading whitespace) — tolerate; wrap parser, record `last_error` instead of crashing the poll loop. One bad feed must never stall the scheduler (per-feed try/catch + timeout ~15s + response size cap ~5MB).
- **Dates:** RFC822 vs ISO8601 vs garbage — fall back to fetch time; missing GUIDs → hashed identity must be stable or you'll duplicate items every poll.
- **Redirects** (301 → update stored URL), relative item links (resolve against feed/site URL), `content:encoded` vs `description` precedence.
- **Sanitize all rendered HTML** (strip scripts/iframes, proxy nothing); lazy-load images with `referrerpolicy="no-referrer"`.
- Readability extraction fails on JS-only pages — degrade gracefully to summary with a notice.
- Conditional GET: some servers send weak ETags or none — support Last-Modified alone; never send both stale.
