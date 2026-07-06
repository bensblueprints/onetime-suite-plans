# Chatterbox — Build Plan (Batch 10, #49)

## One-liner & positioning
Self-hosted embeddable comments you own forever: one `<script>` tag adds threaded comments with votes, moderation, reply-email notifications, and Disqus import to any site — no ads, no tracking, your data in one SQLite file. **$24 one-time** vs Hyvor Talk at **$8+/mo** (pays for itself in 3 months) and Disqus (free tier = ads + tracking; ad-free from $12/mo). Tagline: "Comments without renting your community."

## MVP feature list
- **Embed**: `<script src="https://host/embed.js" data-chatterbox></script>` + `<div id="chatterbox"></div>`. Widget renders inside **shadow DOM** (style isolation both ways). Page identity = canonical URL by default, overridable via `data-page-id` (README strongly recommends setting it — URLs with query strings otherwise fragment threads). Auto-creates the page record on first load.
- **Comments**: name + optional email (stored, never displayed) + body (plain text with newlines + autolinked URLs; no HTML injection — render as text nodes). **Threading** to depth 4 with collapse. Relative timestamps. Commenter identity persisted in localStorage token so authors can edit/delete their own comment for 15 minutes.
- **Votes**: up/down per comment, one vote per browser token per comment (constraint server-side), score displayed; sort by best (Wilson score) / newest / oldest.
- **Moderation**: admin dashboard with queue tabs (Pending / Approved / Spam / Deleted); per-site **approve-first toggle** (off = auto-publish, on = comments show "awaiting moderation" to their author only); approve/reject/spam/delete actions incl. bulk; block by email/IP hash.
- **Spam defenses**: hidden **honeypot field** (bots filling it → silent spam bucket), minimum-time-to-submit check (< 3s = suspect), per-IP **rate limit** (e.g. 5 comments/10 min), link-count threshold (> 3 links → pending regardless of toggle).
- **Email notify on reply** (BYO SMTP via nodemailer): commenters who gave an email + ticked "notify me" get an email when someone replies, with a one-click unsubscribe link (signed token). Admin gets optional new-comment digests.
- **Disqus import**: upload Disqus XML export → parse threads/posts/authors, map Disqus `thread link` → page URL, preserve parent relationships and timestamps; dry-run preview (counts) before commit; idempotent re-import (skip by disqus post id).
- **Theme**: widget auto-detects `prefers-color-scheme` (dark/light) with `data-theme="dark|light|auto"` override; accent color configurable per site.
- **RSS**: `GET /rss.xml` — latest N approved comments site-wide (title = page, author, excerpt) for moderation-by-feed-reader.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) for the **admin dashboard**; the **embed widget is a separate small vanilla-JS bundle** (Vite lib mode, no React — must stay < ~30KB gzipped, sites won't tolerate more). **Port 5340** default. CORS: widget API routes send `Access-Control-Allow-Origin` per configured allowed-origins list (Settings; `*` allowed but discouraged). Admin behind session/password. Dockerfile + docker-compose.yml (SQLite volume), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, BASE_URL, SMTP_HOST/PORT/USER/PASS/FROM). Electron wrapper (`npm run desktop`) per spec (useful for moderating locally; embeds obviously need the VPS mode — README says so).

## Data model (SQLite)
- `pages`: id, page_key (canonical URL or data-page-id, unique), title, url, created_at, comments_locked (0/1).
- `comments`: id, page_id, parent_id (nullable), author_name, author_email (nullable), author_token_hash, body, status ('pending'|'approved'|'spam'|'deleted'), ip_hash, notify (0/1), disqus_id (nullable, unique), created_at, edited_at.
- `votes`: id, comment_id, voter_token_hash, value (+1/-1), UNIQUE(comment_id, voter_token_hash).
- `blocks`: id, kind ('email'|'ip_hash'), value, created_at.
- `notification_log`: id, comment_id, to_email, kind ('reply'|'digest'), sent_at, ok, error.
- `settings`: key, value (approve_first, allowed_origins, accent, rate limits, SMTP overrides). `sessions`: id, token.

## API endpoints
Public/widget (CORS-enabled, no auth):
- `GET /embed.js` (the widget bundle), `GET /api/widget/comments?page_key=&sort=` (approved + requester's own pending), `POST /api/widget/comments` `{page_key,parent_id,name,email,body,notify,hp,elapsed_ms}` , `PUT|DELETE /api/widget/comments/:id` (own-token, 15-min window), `POST /api/widget/comments/:id/vote` `{value}`, `GET /unsubscribe/:signedToken`, `GET /rss.xml`.
Admin (session auth):
- `POST /api/login|logout`, `GET /api/health`
- `GET /api/comments?status=&page=` (queue), `POST /api/comments/:id/approve|spam|delete`, `POST /api/comments/bulk`
- `GET /api/pages`, `POST /api/pages/:id/lock`
- `GET|POST|DELETE /api/blocks`; `GET|PUT /api/settings`, `POST /api/settings/test-email`
- `POST /api/import/disqus` (multipart XML, `?dry_run=1`), `GET /api/import/status`

## UI screens
1. Login. 2. Moderation queue (tabs, comment cards with page context, approve/spam/delete, bulk bar). 3. Pages list (comment counts, lock toggle). 4. Settings (approve-first, origins, accent, rate limits, SMTP + test send). 5. Import (upload → dry-run summary → commit → progress). 6. **Embed instructions page** (copy-paste snippet, live demo of the widget itself — dogfood it). Widget UI: composer, thread tree, vote arrows, sort dropdown, "awaiting moderation" badge. Dark mode default everywhere.

## Smoke test spec (`test/smoke.js`)
Boot server via `spawn` on port **5440**, temp DB. Assertions:
1. Health; admin auth gates; login. `GET /embed.js` → 200 JS with correct content-type.
2. `POST /api/widget/comments` (page_key `https://example.com/post-1`, empty honeypot, elapsed 5000) → 201; with approve-first OFF it's `approved`; `GET /api/widget/comments?page_key=...` returns it.
3. Reply with `parent_id` → returned tree nests it (assert child under parent in response shape).
4. **Honeypot**: submit with `hp` filled → 201-shaped response (don't tip off bots) but SQLite row has status `spam` and it's absent from widget GET.
5. **Rate limit**: 6 rapid posts from same IP → 6th gets 429.
6. Votes: vote +1 → score 1; same voter token votes again → still 1 vote row (UNIQUE upsert), score unchanged or toggled per spec.
7. **Reply notification**: set SMTP host to a local mock SMTP server (`smtp-server` npm dev-dep) on a spare port; comment A with email+notify, reply B → assert mock received a message to A's address containing B's excerpt; `notification_log.ok=1`.
8. Approve-first ON via settings: new comment → `pending`, absent from widget GET (other browser token), present for its author's token.
9. **Disqus import**: write a fixture XML (2 threads, 3 posts, one nested) in-test; dry-run → counts {pages:2, comments:3}; commit → rows exist with parent linkage; re-import → 0 new (idempotent).
10. `GET /rss.xml` → 200, `application/rss+xml`, contains latest comment excerpt. Cleanup: kill spawned PIDs only, delete temp DB.

## Launch kit requirements
Real pricing: Hyvor Talk **$8/mo** (Starter, annual) to $24+/mo; Disqus free-with-ads, **Plus $12/mo**, Pro $95/mo; Commento hosted $10/mo; FastComments $14.99/mo. Math: $24 once = 3 months of Hyvor. Angle: "Disqus put ads on my blog and sold my readers' data; I wanted comments that are mine." Communities: r/selfhosted (import-from-Disqus demo lands well), r/blogging, r/webdev, Indie Hackers, Hugo/Jekyll/Astro forums (static-site users are the perfect ICP — no backend of their own). Show HN draft. SEO (10): disqus alternative self hosted, hyvor talk alternative, embeddable comment widget, comments for static site, blog comment system one time purchase, disqus import tool, self hosted comments sqlite, commento alternative, privacy friendly comments, add comments to website script.

## Risks / gotchas
- **XSS is the whole ballgame**: bodies render as text nodes only (never innerHTML); autolinking builds anchor elements programmatically with `rel="nofollow noopener ugc"`; test with `<script>` payloads in smoke test if time allows.
- Shadow DOM + `prefers-color-scheme` works, but inherited `color-scheme` quirks exist — set explicit background/foreground on the shadow root host.
- CORS with credentials is a trap: use header token (widget localStorage) not cookies for commenter identity, so `Access-Control-Allow-Origin` can stay a plain list.
- Page identity: normalize URLs (strip utm_*, trailing slash, hash) before keying, or threads fragment; document `data-page-id` as the robust path.
- Disqus XML can be huge — stream-parse (sax/`fast-xml-parser` in chunk mode) rather than loading whole file; imports run in a job with progress endpoint.
- Store IP **hashes** (salted), not raw IPs — privacy positioning demands it.
- SMTP unconfigured = valid state: notifications no-op with logged warning.
- better-sqlite3 dual ABI: reuse `link-in-bio/scripts/setup-native.js`. Never broad-kill node in tests.
