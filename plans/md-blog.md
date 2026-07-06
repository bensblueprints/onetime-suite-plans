# Inkpress — Markdown blog engine (Build Plan)

**One-liner:** A self-hosted markdown blog with themes, scheduling, SEO, and RSS — **$29 once** vs Ghost's **$9/mo** ($108/yr). Roadmap item #37, Batch 8.

**Directory:** `C:\Users\ADMIN\Desktop\onetime-suite\md-blog\` · **Port 5330** · Follow `BUILD-SPEC.md` exactly (MIT, launch-kit, dual-mode Electron wrapper, git init, no push).

## Positioning
"Pay once. Own it forever." vs Ghost($9/mo Starter, 500 members cap). Angle: your writing in plain markdown you own, blazing-fast zero-JS pages, no vendor lock-in, runs on a $5 VPS. Pays for itself in ~3.2 months.

## MVP features
- **Markdown posts** — editor with live side-by-side preview, title, slug (auto from title, editable), tags, excerpt field (newsletter-ready: plain-text, auto-generated from first paragraph if blank, shown in RSS `description` and meta description), cover image.
- **Drafts / scheduled publish** — status: draft / scheduled (future date) / published.
- **3 themes** — server-side templates: "Paper" (light, serif, classic), "Carbon" (dark, mono accents, dev-blog), "Editorial" (magazine, large cover images). Selected in Settings; applies site-wide instantly.
- **Tags** — tag pages `/tag/:slug`, tag list in nav.
- **RSS** — `/rss.xml`, latest 20 published posts, full HTML in `content:encoded`, excerpt in `description`.
- **SEO** — per-post meta title/description override, OG + Twitter card tags (og:image = cover), canonical URLs, `/sitemap.xml` (posts+tags+pages), `robots.txt`.
- **Image uploads** — drag/paste into editor uploads to `/uploads/…`, inserts markdown; resize >2000px wide via `sharp`.
- **Code highlighting** — build-time (server-side) via `shiki` or `highlight.js` on render — no client JS needed.
- **Zero-JS public pages option** — settings toggle (default ON): public pages ship no JavaScript at all; pure HTML/CSS. When off, allows tiny enhancements (copy-code button).
- **Site settings** — title, description, author, base URL, theme, nav links, footer text, zero-JS toggle.

## Architecture
Per BUILD-SPEC: Express + better-sqlite3 + React (Vite) admin + Tailwind/Lucide/Framer Motion, single process, port 5330. **Public pages are server-rendered** (EJS or plain template-literal renderer — recommend a tiny custom renderer with the 3 themes as template modules sharing partials) — this is what makes zero-JS and instant SEO trivial; React is admin-only under `/admin`. Markdown pipeline: `marked` (or `markdown-it`) + `shiki` highlight + sanitize. Cache rendered HTML per post in a column, invalidate on save. Scheduled posts need no cron: public queries filter `status='published' OR (status='scheduled' AND publish_at<=now)` and flip status lazily. `.env`: PORT, ADMIN_PASSWORD, BASE_URL. Dockerfile + compose (volume: db + uploads). Desktop mode per spec.

## Data model (SQLite)
- `posts(id, slug UNIQUE, title, body_md, body_html_cache, excerpt, cover_path, status TEXT draft|scheduled|published, publish_at, meta_title, meta_description, created_at, updated_at)`
- `tags(id, slug UNIQUE, name)` · `post_tags(post_id, tag_id)`
- `settings(key PRIMARY KEY, value)` — site_title, description, theme, base_url, zero_js, nav_json, footer
- `uploads(id, path, width, height, bytes, created_at)`
- `sessions(id, created_at)`

## API endpoints
Admin (auth): `POST /api/login` · `GET/POST/PUT/DELETE /api/posts[/:id]` (list supports `?status=&q=`) · `POST /api/uploads` (multipart) · `GET/PUT /api/settings` · `GET /api/tags` · `POST /api/preview` (md in → rendered HTML out, for the live preview so admin and public rendering match exactly).
Public (no auth, server-rendered): `GET /` (paginated index) · `GET /:postSlug` · `GET /tag/:slug` · `GET /rss.xml` · `GET /sitemap.xml` · `GET /robots.txt` · `GET /uploads/*`.

## UI screens
1. **Login** 2. **Posts list** (status filter chips, search, "New post") 3. **Editor** — split markdown/preview panes, toolbar (bold/link/image/code), tag input, right sidebar: status+publish date, excerpt, cover upload, SEO fields 4. **Settings** — site fields, theme picker with 3 live thumbnails, zero-JS toggle, nav editor 5. **Media** (uploaded images grid, copy-URL). Public: index, post, tag pages in active theme.

## Smoke test (`test/smoke.js`)
Boot Express in-process on ephemeral port, temp db/uploads dir; real HTTP:
1. Login; create post with markdown containing an H2, a fenced ```js code block, and an image ref; publish.
2. Fetch `/:slug` → assert 200, contains rendered `<h2>`, highlighted code (`class="shiki"` or `hljs` span present), OG tags (`og:title`, `og:image` when cover set), canonical link, and — with zero-JS on — **no `<script` tag in the HTML**.
3. Upload a generated PNG fixture (make a 3000px-wide PNG via `sharp`) → assert stored file exists and was resized ≤2000px.
4. Create a scheduled post (publish_at +1h) → absent from `/`, `/rss.xml`, `/sitemap.xml`; a draft likewise; flip publish_at to past → present in all three.
5. Parse `/rss.xml` with `fast-xml-parser`: valid RSS 2.0, item has title/link/guid/pubDate/description (= excerpt) and `content:encoded`.
6. `/sitemap.xml` parses, contains post + tag URLs with BASE_URL prefix; `/tag/:slug` lists the post.
7. Switch theme via settings API → `/` HTML changes (assert theme marker class differs).
`npm test` runs it.

## Launch kit
Per BUILD-SPEC. Product Hunt tagline idea: "Your blog, in markdown, on your server — $29 forever." Strategy: r/selfhosted, r/blogging, Hacker News Show HN (zero-JS angle plays well there), keywords: "ghost alternative self hosted", "markdown blog engine", etc. Math: $29 vs Ghost $108/yr.

## Risks / gotchas
- **Rendering parity:** admin preview must use the exact server pipeline (`/api/preview`) — don't ship a client-side marked copy that drifts.
- **Slug collisions & renames:** editing a slug breaks inbound links — keep old slug 301 redirect table or warn in UI (redirect table preferred, cheap).
- **BASE_URL matters** for RSS/sitemap/OG absolute URLs; default to `http://localhost:5330` and warn in README + Settings UI banner if unset in production.
- **Sanitize rendered HTML** (single-author tool, but pasted markdown may embed raw HTML — allow it by default like Ghost, note it in README).
- `shiki` is async + heavyweight at startup; load languages lazily or fall back to `highlight.js` if bundle pain — either is fine, keep it server-side.
- Zero-JS toggle must also strip the copy-code helper; verify no Vite client injection leaks into public routes (public pages must NOT be served from the React build).
- Pagination + empty states (no posts yet) must not 500; themes share partials so fixes apply to all three.
