# Droplink — Build Plan (Batch 9, #41)

## One-liner & positioning
Self-hosted big-file transfer you own forever. Upload huge files, get a share link with expiry/password/download-limit, recipient gets a clean download page. **$29 one-time** vs WeTransfer Pro at **$12/mo** (pays for itself in 3 months). Also compare Smash ($5/mo) and Dropbox Transfer (bundled $11.99/mo). Tagline: "Send big files from your own server. Pay once."

## MVP feature list
- **Chunked, resumable uploads**: client slices file into 5 MB chunks, uploads sequentially with per-chunk retry (3 attempts, exponential backoff). Upload session created first (`POST /api/uploads`), chunks referenced by index; a page refresh can resume by asking the server which chunk indexes it already has. No practical size limit (test with ≥50 MB fixture); server streams chunks straight to disk — never buffers whole file in RAM.
- **Transfers**: one transfer = one or more files + settings: expiry (1/3/7/30 days or custom datetime, default 7), optional password (bcrypt-hashed), optional max downloads (e.g. 5), optional message to recipient.
- **Share link** `/{d,t}/:slug` (10-char nanoid): download page shows file list, sizes, sender message, expiry countdown; password gate if set; **inline preview for images and PDFs** (images via `<img>`, PDFs via browser-native `<iframe>` on the raw stream — no pdf.js needed here), "Download all as ZIP" (streamed via `archiver`) plus per-file download.
- **Email the link** (BYO SMTP via nodemailer): compose recipient(s) + message on the transfer page; graceful no-op with warning banner if SMTP unconfigured. Log sends.
- **Auto-cleanup job**: in-process interval (every 5 min) deletes expired transfers and transfers that hit their download limit — DB rows AND files on disk; also sweeps orphaned upload sessions older than 24h.
- **Storage quota config**: `STORAGE_QUOTA_GB` env (default 10). Dashboard shows used/free bar; uploads that would exceed quota are rejected at session-create time with a clear error.
- **Admin dashboard**: transfer list (files, size, downloads/limit, expiry, link copy button), download event log (timestamp, IP), delete now.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process. **Port 5332** default. Admin auth via session/`ADMIN_PASSWORD`; upload requires admin session (this is a personal WeTransfer, not a public dropbox); download pages are public (guarded by slug + optional password). Files stored under `DATA_DIR/files/<transferId>/<fileId>` (chunks appended/assembled to final file; store chunks as `<fileId>.part` and rename on completion). Dockerfile + docker-compose.yml with volume for SQLite **and** the files dir. `.env.example`: PORT, ADMIN_PASSWORD, DB_PATH, DATA_DIR, STORAGE_QUOTA_GB, BASE_URL, SMTP_HOST/PORT/USER/PASS/FROM. Electron wrapper (`npm run desktop`): same server on free port, data in userData, auto-login.

## Data model (SQLite)
- `transfers`: id, slug (unique), message, password_hash (nullable), expires_at, max_downloads (nullable), download_count, total_bytes, status ('uploading'|'ready'|'expired'|'deleted'), created_at.
- `files`: id, transfer_id, name, size_bytes, mime, disk_path, upload_complete (0/1).
- `upload_sessions`: id, file_id, chunk_size, total_chunks, received_chunks_json (or a `chunks` table: session_id, idx), created_at.
- `downloads`: id, transfer_id, file_id (nullable = zip-all), ip, ua, downloaded_at.
- `email_log`: id, transfer_id, to_addr, ok, error, sent_at. `sessions`, `settings`.

## API endpoints
- Auth: `POST /api/login`, `POST /api/logout`, `GET /api/health`.
- `POST /api/transfers` (settings) → id+slug; `GET /api/transfers`; `GET|PUT|DELETE /api/transfers/:id`; `POST /api/transfers/:id/finalize` (marks ready); `POST /api/transfers/:id/email`.
- `POST /api/transfers/:id/files` (name/size/mime) → upload session; `GET /api/uploads/:sessionId/status` → received chunk indexes (resume); `PUT /api/uploads/:sessionId/chunk/:idx` (raw body, express.raw with high limit on this route only).
- `GET /api/storage` (quota usage).
- Public: `GET /t/:slug` (SPA route) + `GET /api/public/t/:slug` (metadata; 401-style `password_required` flag), `POST /api/public/t/:slug/unlock` (password → short-lived download token), `GET /dl/:slug/:fileId?token=`, `GET /dl/:slug/zip?token=`, `GET /preview/:slug/:fileId?token=` (inline Content-Disposition).

## UI screens
1. Login. 2. Dashboard: drag-drop zone (hover state), per-file progress bars with pause/resume, settings panel (expiry/password/limit/message), quota bar. 3. Transfer detail: link copy, email form, download log. 4. Public download page: file cards, previews, big download button, expiry countdown, password gate. Dark mode default, premium spacing.

## Smoke test spec (`test/smoke.js`)
Boot server via `spawn` on port **5432** with temp DB/DATA_DIR, `STORAGE_QUOTA_GB=1`, `CLEANUP_INTERVAL_MS=1000`. Generate fixtures in-test: a 12 MB random buffer file and a small PNG (write real PNG bytes). Assertions:
1. Health ok; unauthenticated `/api/transfers` → 401; login works.
2. Create transfer (expiry 2s ahead for a later step use separate transfer; main one 1 day, password "secret", max_downloads 2) → slug returned.
3. Upload the 12 MB file in 5 MB chunks — **deliberately skip chunk 1, upload 0 and 2, query status, assert missing index [1] reported, then upload 1** (proves resume), finalize; assert assembled file on disk byte-length === 12 MB and sha256 matches the fixture buffer.
4. Public metadata without unlock → password_required; wrong password → 401; correct → token; `GET /dl/...` streams bytes equal to fixture hash.
5. Download twice (hit max_downloads=2), third → 410/expired.
6. Second transfer with 1s expiry: wait ~3s, assert cleanup removed DB row status→expired AND file gone from disk.
7. Quota: attempt session for a 2 GB declared file → 413/quota error.
8. Zip-all endpoint returns 200 with `application/zip` and non-trivial length.
Cleanup: kill only spawned child PID; delete temp dirs.

## Launch kit requirements
Competitors with real pricing: WeTransfer Pro $12/mo (competitor table anchor), Smash, Dropbox Transfer, Send Anywhere. Angle: "I send client videos weekly and got tired of renting a progress bar." Reddit: r/selfhosted, r/DataHoarder, r/videography (rules-aware show-don't-sell). HN Show HN draft. SEO: wetransfer alternative self hosted, send large files own server, resumable file sharing, file transfer with expiry link, self hosted file drop.

## Risks / gotchas
- **better-sqlite3 dual ABI** (Node vs Electron): copy `link-in-bio\scripts\setup-native.js` postinstall pattern.
- Chunk route must use `express.raw({ limit: '6mb' })` scoped to that route; keep global JSON limit small. Stream ZIPs — never `readFileSync` large files.
- Windows file deletes can fail while a read stream is open — cleanup job should try/catch per file and retry next tick, not crash.
- Assemble via append-in-order or `fs.write` at `idx * chunkSize` offsets (preallocated file) — the offset approach makes out-of-order chunks trivial; verify final size before marking complete.
- Download-limit race: increment `download_count` in the same synchronous better-sqlite3 transaction that authorizes the stream.
- Never broad-kill node in tests. SMTP unconfigured must no-op with a warning, not crash.
