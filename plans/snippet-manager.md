# Snipvault — Build Plan (Batch 9, #42)

## One-liner & positioning
Your own snippet vault with highlighting, search, and share links — owned forever. **$19 one-time** vs premium gist/snippet tools: GitHub Gists are free but unorganized; compare Cacher ($6/mo), Pieces (paid tiers), massCode (OSS, desktop-only — our edge: web+desktop, share links, raw/embed endpoints). Tagline: "Every snippet you've ever written, searchable in one place. Pay once."

## MVP feature list
- **Snippets**: title, description, one or more files (name + content + language), language auto-detected from file extension or picked from list. **Syntax highlighting for 100+ languages** via `highlight.js` (ships ~190 languages) — used both in the React UI and server-side-rendered on public pages.
- **Collections & tags**: snippets belong to zero/one collection (folders in sidebar) and any number of tags (chips, filterable).
- **Fuzzy search**: instant client-side fuzzy match over title/description/filenames/tags (Fuse.js) for the list; server-side SQLite FTS5 (with `content` + `title` indexed) for full-content search — search box hits both, merged, FTS results labeled "content match".
- **Visibility & share links**: `private` (default, admin only), `secret` (anyone with the 12-char nanoid link), `public` (listed on a public index page). Share page shows highlighted code, copy button, raw links.
- **Raw endpoint**: `GET /raw/:slug` (single-file) and `GET /raw/:slug/:filename` — `text/plain`, no auth for secret/public. Curl-pipeable: `curl -s host/raw/abc | bash`-style use case in README.
- **Embed script**: `<script src="https://host/embed/:slug.js"></script>` document.write-style embed (like Gist's) injecting highlighted HTML + scoped CSS; also `GET /embed/:slug` iframe-able page.
- **Import from GitHub Gists** (BYO token): paste a PAT (stored in settings, `gist` scope), list user's gists, select-all/some, import as snippets (multi-file preserved, description → title, language from filename). Idempotent by gist id (re-import updates).
- **CLI-friendly API**: static API token (`API_TOKEN` env or generated in settings) accepted via `Authorization: Bearer` on all `/api/*` — README documents `curl -H "Authorization: Bearer $TOK" -d @snippet.json host/api/snippets` and a fetch-by-search one-liner.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process. **Port 5333** default. Session/password admin auth + bearer API token. Dockerfile + docker-compose.yml (SQLite volume), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, API_TOKEN, BASE_URL). Electron wrapper (`npm run desktop`), server on free port, userData dir, auto-login. Use `highlight.js` on the server for raw/embed/share SSR and in React for the editor preview; editor itself is a plain `<textarea>` overlaid on highlighted `<pre>` (the classic transparent-textarea trick) or CodeMirror 6 if trivial — do NOT hand-roll a highlighter.

## Data model (SQLite)
- `snippets`: id, slug (unique nanoid 12), title, description, visibility ('private'|'secret'|'public'), collection_id (nullable), gist_id (nullable, unique), created_at, updated_at.
- `snippet_files`: id, snippet_id, filename, language, content, position.
- `collections`: id, name, position. `tags`: id, name (unique). `snippet_tags`: snippet_id, tag_id.
- `snippets_fts`: FTS5 virtual table (title, description, content) kept in sync via triggers or explicit upsert on write — **prefer explicit sync in the write path** over contentless tables (see VlogPipe FTS5 gotchas).
- `settings`: key, value (github_token, api_token). `sessions`.

## API endpoints
- Auth: `POST /api/login`, `POST /api/logout`, `GET /api/health`.
- `GET /api/snippets?q=&tag=&collection=&visibility=` (FTS when q), `POST /api/snippets`, `GET|PUT|DELETE /api/snippets/:id`.
- `GET|POST /api/collections`, `PUT|DELETE /api/collections/:id`; `GET /api/tags`.
- `GET|PUT /api/settings`; `POST /api/import/gists/list` (fetch gist index via token), `POST /api/import/gists` (ids[] → import, returns per-id result).
- Public (no auth, secret/public only): `GET /s/:slug` (share page SPA/SSR), `GET /raw/:slug`, `GET /raw/:slug/:filename`, `GET /embed/:slug.js`, `GET /embed/:slug`, `GET /explore` (public index).

## UI screens
1. Login. 2. Main three-pane: sidebar (collections, tags, visibility filters) / snippet list with fuzzy search box (highlight matched chars) / editor-viewer with per-file tabs, language picker, copy button, visibility toggle + link copy. 3. Import modal (token field, gist checklist, progress). 4. Settings (API token reveal/regenerate, GitHub token). 5. Public share page (clean, logo-light, highlighted code, raw/embed copy buttons). Dark mode default.

## Smoke test spec (`test/smoke.js`)
Boot via `spawn` on port **5433**, temp DB, `API_TOKEN=testtok`. Assertions:
1. Health; unauthenticated `/api/snippets` → 401; bearer `testtok` → 200; login → 200.
2. Create snippet (two files: `hello.py`, `util.js`) → 201; GET returns both files, languages `python`/`javascript` auto-detected.
3. FTS: create snippet whose *content* (not title) contains `zebra_quartz_777`; `GET /api/snippets?q=zebra_quartz` returns it.
4. Visibility: private snippet's `/raw/:slug` → 404; flip to `secret` via PUT; `/raw/:slug/hello.py` → 200 `text/plain` with exact content.
5. Share page `GET /s/:slug` → 200 HTML containing `hljs` markup (assert a `class="hljs` substring); `GET /embed/:slug.js` → 200, `content-type` javascript, body contains `document.write`.
6. Gist import: start a local `http.createServer` stub mimicking `api.github.com/gists` (env `GITHUB_API_BASE` override) returning one fixture gist; run import; assert snippet created with gist_id and re-import doesn't duplicate (count stays 1).
7. Tags/collections: assign, filter query returns correct subset. Delete snippet → raw 404, FTS no longer matches.
Cleanup: kill only spawned child; delete temp DB/wal/shm.

## Launch kit requirements
Competitors: Cacher $6/mo, Pieces, GitHub Gists (free but no tags/search/collections — honest framing), massCode (free OSS — our pitch: share links, raw/embed, web deploy, importer, polish). Angle: "My snippets were scattered across gists, Slack, and Notes.app." Reddit: r/selfhosted, r/webdev, r/programming (careful, show-don't-sell). HN Show HN. SEO: gist alternative self hosted, snippet manager self hosted, code snippet organizer, cacher alternative, share code snippet link, snippet manager with API.

## Risks / gotchas
- **better-sqlite3 dual ABI**: copy `link-in-bio\scripts\setup-native.js` pattern.
- **FTS5**: avoid contentless tables with delete quirks (see clip-pipeline/vlogpipe `contentless_delete` gotcha) — use a regular FTS table synced explicitly in create/update/delete handlers inside the same transaction.
- highlight.js: import the full build server-side (fine in Node); in the browser bundle, register languages lazily or accept the ~1 MB full bundle — don't ship 190 langs eagerly into the critical chunk (use dynamic import).
- Embed `.js` must set proper `content-type: application/javascript` and escape `</script>` in content (`<\/script>`) or embeds break.
- Gist API: paginate (`per_page=100`, follow `Link` headers), handle 401 (bad token) with a friendly message; make base URL env-overridable for the smoke test stub.
- Raw endpoint must never serve `private` snippets — test explicitly; slugs are the only guard for `secret`, so use ≥12-char nanoid.
- Never broad-kill node in tests.
