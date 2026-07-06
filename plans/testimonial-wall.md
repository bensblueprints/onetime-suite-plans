# Bravowall — Testimonial Collection + Wall of Love (Build Plan)

**One-liner:** Collect testimonials with a hosted form (text, stars, photo, video link), moderate them, and embed a masonry "wall of love" anywhere — plus export single testimonials as share-ready image cards. Pay $29 once vs Senja at $19/mo — pays for itself in ~6 weeks.

- **Product #32, Batch 7** · Price **$29** · Assigned port **5325** · Directory `C:\Users\ADMIN\Desktop\onetime-suite\testimonial-wall\`
- Follow `BUILD-SPEC.md`: VPS web app (Express + better-sqlite3 + React/Vite + Tailwind + Lucide + Framer Motion) + Electron desktop mode, Docker files, `.env.example` (PORT=5325, ADMIN_PASSWORD), launch-kit, MIT, git init only.

## MVP features
1. **Collection forms** — admin creates one or more "spaces" (per product). Each space gets a hosted collection page `/collect/:slug`: name, title/company, avatar photo upload, star rating (1–5), text testimonial, and a **video-link field** (paste YouTube/Loom/Vimeo URL — we do NOT host video in MVP; render as embed/thumbnail). Custom headline/questions text, consent checkbox ("You can publish this").
2. **Moderation queue** — new submissions land as `pending`; admin approves/rejects/features. Edit typos before approving (keep original in a column).
3. **Wall of Love embed** — `<script src=".../wall.js" data-space="slug">` renders approved testimonials in a **masonry layout inside shadow DOM** (host CSS can't bleed in, ours can't leak out). Options: theme light/dark, accent color, max items, show ratings. Also a hosted wall page `/wall/:slug` for linking.
4. **Single-testimonial image cards** — export any approved testimonial as a PNG (1080×1080 and 1600×900 templates) rendered server-side with **sharp** (compose SVG template → sharp → PNG): quote text auto-sized, stars, name/title, avatar circle, brand color. Download from admin.
5. **CSV import** — upload CSV (name, title, rating, text, date, avatar_url, video_url) to migrate from Senja/Testimonial.to exports; rows land as approved (toggle). Show import preview + per-row errors.
6. **Widgets extras (cheap wins):** copy-paste HTML snippet per testimonial, "collected N testimonials" counter API.

Out of scope: video recording/hosting, social-media auto-import (scraping X/LinkedIn = ToS trouble — note in README as non-goal), rich analytics.

## Architecture
- Single Express process: `/api/*`, React admin SPA, public collect page + wall page (small separate public bundle or SSR template), `wall.js` embed loader. Default `PORT=5325`.
- Uploads: avatar images stored on disk under `data/uploads/` (multer), served at `/uploads/*`; resize to 256px with sharp on upload. Docker volume covers `data/`.
- Image-card rendering: build an SVG string (escape user text!), text-wrap by measuring approximate char widths or use `@resvg` — prefer **sharp composite over SVG** since sharp is already a dep; embed avatar as base64 in the SVG.
- Video links: parse URL → provider + id (YouTube/Vimeo/Loom regex); store normalized; wall renders lite-embed (thumbnail + play → iframe on click).
- Admin auth: session cookie + ADMIN_PASSWORD (uptime-monitor pattern). Public endpoints rate-limited (10 submissions/hour/IP) + honeypot field.
- Electron wrapper per BUILD-SPEC (same server, userData dir, auto-login).

## Data model (SQLite)
- `spaces(id, slug UNIQUE, name, headline, questions, accent, theme, collect_video INTEGER, created_at)`
- `testimonials(id, space_id, author_name, author_title, author_avatar_path, rating, text, text_original, video_url, video_provider, video_id, status TEXT('pending'|'approved'|'rejected'), featured INTEGER, source TEXT('form'|'import'|'manual'), consent INTEGER, ip, created_at, approved_at)`
- `settings(key, value)` — default theme, brand color, site base URL (for embed snippet generation).

## API endpoints
Public: `GET /collect/:slug` (page); `POST /api/public/:slug/submit` (multipart: fields + avatar) → 201; `GET /api/public/:slug/wall.json` (approved, paginated, CORS on); `GET /wall.js`; `GET /wall/:slug`.
Admin (auth): `POST /api/login`; CRUD `/api/spaces`; `GET /api/spaces/:id/testimonials?status=`; `PATCH /api/testimonials/:id` (status/featured/edit text); `DELETE /api/testimonials/:id`; `POST /api/testimonials/manual`; `POST /api/spaces/:id/import` (CSV multipart) → {imported, errors[]}; `GET /api/testimonials/:id/card.png?template=square|wide`; `GET /api/health`.

## UI screens
1. **Login** 2. **Spaces dashboard** — cards with counts (pending badge). 3. **Moderation** — pending list with approve/reject/feature buttons, inline edit, avatar + stars preview, video thumb. 4. **Wall preview + embed** — live masonry preview, theme controls, copy-snippet box. 5. **Import** — CSV dropzone, mapping preview, results. 6. **Card studio** — pick testimonial, pick template, live preview, Download PNG. 7. **Public collect page** — clean single-column form, star picker with hover animation, upload dropzone, success state. Dark default, premium.

## Smoke test (`test/smoke.js`, uptime-monitor style)
Spawn server (`PORT=5395, DB_PATH=test/smoke.db, ADMIN_PASSWORD=...`). Steps:
1. Health; login gate (401 wrong / 401 unauth admin API / 200 right).
2. Create space via API.
3. Submit testimonial via public endpoint as multipart with a **real generated PNG avatar fixture** (create with sharp in the test: 64×64 red square). Assert 201, row `status='pending'` in SQLite (readonly open), avatar file exists on disk and was resized.
4. `wall.json` excludes pending (length 0). Approve via PATCH → wall.json includes it with author/rating/text.
5. Submit with `video_url=https://youtu.be/dQw4w9WgXcQ` → assert `video_provider='youtube'`, `video_id='dQw4w9WgXcQ'` in DB.
6. CSV import: write a 3-row fixture CSV (1 row intentionally missing name) → assert `{imported:2, errors:1}` and rows in DB with `source='import'`.
7. Card export: `GET /api/testimonials/:id/card.png` → 200, `content-type: image/png`, magic bytes `89 50 4E 47`, and decode with sharp asserting width===1080.
8. Honeypot-filled submit → no new row; 11th rapid submit → 429.
Cleanup db + uploads, exit code semantics as uptime-monitor.

## Launch kit requirements
Competitor math: **Senja $19/mo** (Starter; Pro $39/mo), also Testimonial.to $25–$60/mo. Angle: "Social proof shouldn't be a subscription — you collect testimonials once and display them forever; why rent them at $228/yr?" Pays for itself in ~1.5 months. PH gallery shots: collect form, moderation queue, wall embed on a fake landing page, card studio PNG, dark dashboard. Subreddits: r/SaaS, r/indiehackers, r/Entrepreneur; HN Show HN draft. SEO keywords incl. "senja alternative", "testimonial wall self hosted".

## Risks / gotchas
- **better-sqlite3 dual ABI:** copy `link-in-bio/scripts/setup-native.js` postinstall (vendor Node + Electron bindings, `nativeBinding` pick in `server/db.js`).
- **sharp** is also a native dep — it ships prebuilds for both Node and Electron ABIs (N-API), so it usually just works; verify `npm run desktop` boots and card export works under Electron. Keep sharp on server side only.
- Escape/encode user text in the SVG card template (XML injection) and clamp text length; wrap long quotes with an auto-font-size step-down.
- Shadow DOM embed: inject styles via constructable stylesheet/`<style>` inside the shadow root; masonry via CSS columns (simplest, no JS layout lib).
- CSV import: parse with a real parser (`csv-parse`), handle BOM + quoted commas; never trust avatar_url fetches — download with timeout + size cap or store URL only (MVP: store URL only).
- No PowerShell JSON writes (BOM).
