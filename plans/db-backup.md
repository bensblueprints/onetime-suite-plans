# Vaultkeeper — Build Plan (Batch 6, #30)

## One-liner & positioning
Scheduled, encrypted database backups you control: dump Postgres/MySQL/SQLite/Mongo on a schedule, compress + encrypt, ship to local disk / S3-compatible / FTP, prune by retention policy, and get alerted the moment a backup fails. **$39 one-time** vs SimpleBackups from **$29/mo**, Ottomatik ($9+/mo), SnapShooter ($10+/mo). Tagline: "Your databases, backed up nightly, encrypted, forever — for the price of one month elsewhere."

## MVP feature list
- **Sources**: connection profiles per engine — Postgres (`pg_dump`), MySQL/MariaDB (`mysqldump`), SQLite (file copy via `sqlite3 .backup` or safe file copy w/ WAL checkpoint), MongoDB (`mongodump --archive`). Engine CLI tools are prerequisites; a **tool check** panel probes PATH (or per-source custom binary path) and shows found/missing with install hints. "Test connection" button runs a cheap probe (e.g. `pg_dump --schema-only` to /dev/null or version handshake).
- **Jobs**: source + schedule (cron expression via `cron-parser`, presets: hourly/daily/weekly) + compression (gzip via `zlib`, default on) + encryption (optional: **age** if `age` binary present, else built-in **AES-256-GCM** with passphrase → scrypt key; format documented) + one destination + retention policy.
- **Destinations**: local directory; S3-compatible (endpoint/region/bucket/prefix/keys — works with AWS, Backblaze B2, Cloudflare R2, MinIO; use `@aws-sdk/client-s3` with multipart upload); FTP/FTPS (`basic-ftp`).
- **Retention**: keep last N, and/or keep daily for X days / weekly for Y weeks (GFS-lite). Pruning runs after each successful backup, on the destination.
- **Runs**: streamed pipeline dump → gzip → encrypt → destination (no full file buffering where possible; temp file staging allowed for FTP), recording size, duration, sha256, artifact name `{job}_{engine}_{YYYY-MM-DD_HHmmss}.dump.gz[.age|.enc]`.
- **Alerts on failure** (and optional on success): webhook POST + SMTP email, per-job toggle; includes stderr tail from the dump tool.
- **Restore helper**: for any stored run, generate the exact restore command chain (download → decrypt → gunzip → `psql`/`mysql`/`mongorestore`/file copy) as copyable text, plus a "download artifact" button that fetches from the destination and optionally decrypts server-side.
- **Dashboard**: jobs with last-run status, next-run time, size trend sparkline, destination health.
- "Run now" per job; concurrent-run lock per job.

## Architecture
BUILD-SPEC dual-mode web app: Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion, single process, **port 5323**. In-process scheduler loop (30s tick, compare `next_run_at`). Dumps executed with `child_process.spawn` (never `exec` with interpolated strings — args array only; passwords via env `PGPASSWORD`/`MYSQL_PWD` or config file, never argv). Secrets (connection passwords, S3 keys, encryption passphrases) encrypted at rest in SQLite with AES-256-GCM keyed from `SECRET_KEY` env (generated into `.env` on first run if absent). Dockerfile installs `postgresql-client`, `default-mysql-client`, `mongodb-database-tools`, `sqlite3`, `age` (document image size); docker-compose volumes for DB + local backup dir. `.env.example`: PORT, ADMIN_PASSWORD, DB_PATH, SECRET_KEY, SMTP_*, BACKUP_TMP_DIR. Electron desktop wrapper per spec (thin `electron/main.js`, same server, userData).

## Data model (SQLite)
- `sources`: id, name, engine ('postgres'|'mysql'|'sqlite'|'mongo'), host, port, database, username, password_enc, sqlite_path, extra_flags, custom_bin_path, created_at.
- `destinations`: id, name, type ('local'|'s3'|'ftp'), config_enc (JSON: path | endpoint/region/bucket/prefix/access/secret | host/port/user/pass/secure/basePath), created_at.
- `jobs`: id, name, source_id, destination_id, cron_expr, tz, compress (0/1), encrypt_mode ('none'|'age'|'aes'), age_recipient, passphrase_enc, keep_last, keep_daily_days, keep_weekly_weeks, alert_webhook_url, alert_email, alert_on_success (0/1), enabled (0/1), next_run_at, created_at.
- `runs`: id, job_id, status ('running'|'ok'|'failed'), started_at, finished_at, artifact_name, size_bytes, sha256, duration_ms, error, stderr_tail, pruned (0/1).
- `settings`, `sessions` as usual.

## API endpoints
- `POST /api/login`, `POST /api/logout`, `GET /api/health`, `GET /api/tools` (CLI availability probe)
- `GET|POST /api/sources`, `PUT|DELETE /api/sources/:id`, `POST /api/sources/:id/test`
- `GET|POST /api/destinations`, `PUT|DELETE /api/destinations/:id`, `POST /api/destinations/:id/test`
- `GET|POST /api/jobs`, `GET|PUT|DELETE /api/jobs/:id`, `POST /api/jobs/:id/run`, `POST /api/jobs/:id/toggle`
- `GET /api/jobs/:id/runs`, `GET /api/runs/:id`, `GET /api/runs/:id/restore-commands`, `GET /api/runs/:id/download?decrypt=1`, `POST /api/jobs/:id/test-alert`

## UI screens
1. Login. 2. Dashboard (job cards: status, last/next run, size sparkline; tool-check banner if CLIs missing). 3. Sources list + create/edit (engine picker changes fields; test button). 4. Destinations list + create/edit + test. 5. Job wizard (source → schedule w/ next-3-runs preview → compress/encrypt → destination → retention → alerts). 6. Job detail (run history table, run-now, restore helper modal with copyable command chain). 7. Settings (SMTP, tmp dir). Dark default.

## Smoke test spec (`test/smoke.js`, uptime-monitor style)
Spawn server on port **5397**, temp DB, `SECRET_KEY` set, `SCHED_TICK_MS=500`. Use **SQLite engine** as the always-available fixture (no external daemons): the test generates `fixture.db` via better-sqlite3 with a table of 50 rows. Assertions:
1. Health ok; auth gates (wrong password 401, `/api/jobs` unauth 401, login 200). `/api/tools` returns JSON listing at least `sqlite` availability.
2. Create local destination (temp dir) → 201; `POST /api/destinations/:id/test` → ok.
3. Create sqlite source pointing at fixture → 201; source test → ok. Assert in SQLite that `password_enc`-style fields are NOT plaintext (create a pg source with password `hunter2`, read `sources` row directly, assert `hunter2` not in stored value).
4. Create job (compress on, encrypt_mode 'aes', passphrase 'smoke-pass', keep_last 2, cron `0 3 * * *`) → 201 with populated `next_run_at`.
5. `POST /api/jobs/:id/run` → poll runs until status 'ok'. Assert: artifact file exists in temp destination dir, `size_bytes` > 0 and matches file size, filename matches pattern, `runs` row has sha256 of file (recompute and compare).
6. Integrity round-trip: in the test, decrypt the artifact with the documented AES format (salt|iv|tag|ciphertext, scrypt('smoke-pass')), gunzip, open with better-sqlite3, assert 50 rows — proves a restorable backup.
7. Retention: run the job 3 times, assert only 2 artifacts remain on disk and oldest run marked `pruned=1`.
8. Failure alert: start local webhook receiver; create source pointing at nonexistent sqlite path, job with webhook alert; run → status 'failed', `error` non-empty, webhook received JSON containing job name and `"status":"failed"`.
9. `GET /api/runs/:id/restore-commands` → 200, text contains `gunzip` and the artifact name.
Cleanup: kill only spawned children; remove temp dirs/DB.

## Launch kit requirements
Competitors: SimpleBackups ($29–$99/mo), SnapShooter ($10+/mo), Ottomatik ($9+/mo), databacker/cron+bash (the real competitor — angle: "your cron script doesn't alert you when it silently breaks"). Math: SimpleBackups $348/yr vs $39 once. Reddit: r/selfhosted, r/PostgreSQL, r/sysadmin, r/devops. Show HN draft: "I lost a database once. Now I sell the fix for $39, once." SEO: postgres backup tool, simplebackups alternative, mysql scheduled backup s3, self hosted database backup, encrypted db backups.

## Risks / gotchas
- **better-sqlite3 dual ABI**: reuse `C:\Users\ADMIN\Desktop\onetime-suite\link-in-bio\scripts\setup-native.js` pattern. **Never broad-kill node processes**; kill only tracked child PIDs (dump processes tracked per run for cancel).
- Never pass passwords on argv (visible in process list) — env vars / `--defaults-extra-file` for mysql.
- `pg_dump` version skew vs server: surface stderr clearly; document matching client versions.
- SQLite live-copy: use the `sqlite3 .backup` command or better-sqlite3 `backup()` API — never raw `fs.copyFile` on a hot WAL db.
- Streaming: gzip+cipher via `pipeline()`; verify sha256 computed on the FINAL artifact bytes (post-encrypt), since that's what restore validates.
- Windows dev box may lack all four CLIs — tool-check UI must degrade gracefully; smoke test depends only on SQLite.
- AES format must be versioned (`VK1` magic prefix) so restore helper stays compatible.
