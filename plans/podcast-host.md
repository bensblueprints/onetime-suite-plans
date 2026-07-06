# Castport — Self-hosted podcast hosting (Build Plan)

**One-liner:** Host your podcast yourself: upload episodes, get an Apple/Spotify-valid RSS feed, public episode pages, an embeddable player, and download stats — pay **$39 once** instead of Transistor's **$19/mo** ($228/yr). Roadmap item #36, Batch 8.

**Directory:** `C:\Users\ADMIN\Desktop\onetime-suite\podcast-host\` · **Port 5329** · Follow `BUILD-SPEC.md` exactly (MIT, launch-kit, dual-mode, git init, no push).

## Positioning
"Pay once. Own it forever. No subscription." vs Transistor $19/mo. Pays for itself in ~2 months. Emphasize: unlimited shows, unlimited episodes, unlimited downloads, your own domain, audio files never held hostage.

## MVP features
- **Multiple shows** — each with title, description, author, email, artwork, iTunes category/subcategory, language, explicit flag, site link, custom feed slug.
- **Episodes** — MP3 upload (also m4a), title, markdown show notes (rendered on public page + HTML in RSS `content:encoded`), episode/season number, type (full/trailer/bonus), publish date (future = scheduled, hidden until then), explicit flag, per-episode artwork optional, chapters (title + start time list; render on episode page and emit Podcasting-2.0 `podcast:chapters` JSON endpoint).
- **RSS feed** at `/feed/:showSlug.xml` — RSS 2.0 + `itunes:*` namespace, valid for Apple Podcasts and Spotify (see Risks).
- **Public pages** — show homepage (episode list, subscribe buttons: Apple/Spotify/RSS copy), episode page (player, notes, chapters), no auth required.
- **Embeddable player** — `/embed/:episodeId` iframe page + copyable `<iframe>` snippet; minimal player (play/pause, seek, speed, time).
- **Download stats** — count unique IPs per episode per day; dashboard chart (last 30 days per episode + per show totals). Hash IPs (sha256 + daily salt) so nothing personal is stored.

## Architecture
Per BUILD-SPEC web-app rules: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion, single process serves API + built frontend. Admin area behind session/password auth (`ADMIN_PASSWORD` from `.env`); public pages, feed, embed, and audio routes are open. Audio files stored on disk under `data/audio/`, artwork under `data/artwork/` (resize/validate with `sharp`). Serve audio via `/audio/:episodeId.mp3` with **HTTP Range support** (Apple requires byte-range requests) — log a download row per unique IP-hash/episode/day on first byte. Dockerfile + docker-compose (volume covers SQLite db **and** audio dir). Electron desktop mode per spec (`npm run desktop`, thin `electron/main.js`).

## Data model (SQLite)
- `shows(id, slug UNIQUE, title, description, author, owner_email, artwork_path, category, subcategory, language, explicit, link, created_at)`
- `episodes(id, show_id FK, slug, title, notes_md, audio_path, audio_bytes, audio_duration_sec, mime, episode_no, season_no, type, explicit, artwork_path, published_at, created_at)` — `published_at > now` = scheduled
- `chapters(id, episode_id FK, start_sec, title, url NULL)`
- `downloads(id, episode_id FK, day TEXT 'YYYY-MM-DD', ip_hash, ua_class TEXT NULL, UNIQUE(episode_id, day, ip_hash))`
- `sessions(id, created_at)`
Duration: probe uploaded audio with `music-metadata` (pure JS) — needed for `itunes:duration`.

## API endpoints
Admin (auth): `POST /api/login`, `GET/POST/PUT/DELETE /api/shows[/:id]`, `POST /api/shows/:id/artwork` (multipart), `GET/POST/PUT/DELETE /api/shows/:id/episodes[/:id]`, `POST /api/episodes/:id/audio` (multipart, streamed to disk), `PUT /api/episodes/:id/chapters` (replace list), `GET /api/stats/show/:id?days=30`, `GET /api/stats/episode/:id?days=30`.
Public: `GET /feed/:slug.xml`, `GET /p/:showSlug` and `/p/:showSlug/:episodeSlug` (server-rendered or SPA public routes with proper meta/OG tags), `GET /embed/:episodeId`, `GET /audio/:episodeId.mp3` (Range), `GET /chapters/:episodeId.json`.

## UI screens
1. **Login** 2. **Shows list** (cards + "New show") 3. **Show settings** (all iTunes fields, artwork upload with 1400–3000px square validation warning) 4. **Episodes list** (status chips: published/scheduled/draft) 5. **Episode editor** (audio dropzone w/ progress, markdown editor + preview, chapters table editor, publish date picker) 6. **Stats dashboard** (line chart per episode, totals) 7. Public show/episode/embed pages — clean light theme acceptable for public, admin dark-mode default.

## Smoke test (`test/smoke.js`, style: whisper-transcriber/test)
No Electron. Boot the Express app in-process on an ephemeral port against a temp SQLite db, then with real HTTP requests:
1. Login; create show with fixture artwork (generate a 1400×1400 PNG via `sharp`).
2. Generate a real 3-second MP3 fixture with `ffmpeg-static` (`anullsrc`, libmp3lame) — same pattern as whisper-transcriber smoke step 3.
3. Upload it as an episode with markdown notes + 2 chapters; assert stored file exists and duration probed (≈3s ±1).
4. Fetch `/feed/:slug.xml`; parse with `fast-xml-parser`; assert: `<rss version="2.0">`, itunes namespace declared, channel has `itunes:category`, `itunes:image`, episode `<enclosure url length type="audio/mpeg">` with correct byte length, `<guid>`, `itunes:duration`, pubDate in RFC-2822.
5. Request `/audio/:id.mp3` with `Range: bytes=0-99` → assert 206 + `Content-Range`; assert a downloads row exists; repeat same IP same day → still 1 unique; different `X-Forwarded-For` → 2.
6. Create a scheduled episode (published_at tomorrow) → assert absent from feed and public list.
7. Embed page returns 200 and contains `<audio`.
`npm test` runs it; assets/fixtures cached in `test/.cache`.

## Launch kit
Per BUILD-SPEC: `product-hunt.md` (tagline ≤60 chars, e.g. "Own your podcast feed — hosting you pay for once"), `ad-copy.md`, `strategy.md` targeting r/podcasting, r/selfhosted, r/audiodrama (rules-aware), Show HN draft, math: "$39 vs Transistor $228/yr — pays for itself in 2.1 months." README comparison table vs Transistor (unlimited downloads/shows vs their tiers).

## Risks / gotchas
- **Apple RSS validation is strict:** artwork must be JPG/PNG, 1400–3000px square, RGB; feed needs `itunes:explicit`, valid category from Apple's fixed list (embed the official category list as a constant + dropdown), `itunes:owner` email, absolute URLs everywhere (need a `BASE_URL` env — default `http://localhost:5329`, README warns to set it before submitting to Apple). Validate output against podba.se/cast-feed-validator rules mentally; smoke test asserts required tags.
- **Enclosure `length` must be exact bytes** and `type` correct; GUIDs must be permanent (use episode UUID, `isPermaLink="false"`).
- **Range requests are mandatory** for Apple/most players — don't use naive `res.sendFile` without verifying Express serves ranges for the custom route (implement explicit Range handling).
- Spotify requires `<itunes:email>`-style owner verification and artwork; markdown → HTML in `content:encoded` must be CDATA-wrapped.
- Large uploads: stream multipart to disk (busboy/multer diskStorage), raise body limits; don't buffer 200MB MP3s in memory.
- Stats behind reverse proxies: honor `X-Forwarded-For` first hop; document `trust proxy`.
- Scheduled publish needs no cron — feed/public queries just filter `published_at <= now`.
