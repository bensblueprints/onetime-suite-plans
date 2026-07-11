# Logbin — Build Plan (Batch 12, #60)

## One-liner & positioning
Self-hosted log aggregator: ship logs from any server (simple HTTP/syslog endpoint or tiny agent), search/filter/tail in a web UI. **$34 one-time** vs Papertrail from **$7/mo** (scales to $100s fast) or Logtail/BetterStack tiers.

## MVP features
- Ingest: `POST /ingest` (JSON lines or plaintext) + optional tiny shell/Node shipper script (tail -f → HTTP POST, provided in repo) + basic syslog UDP listener.
- Live tail view (SSE/WebSocket) with source/level filters, full-text search, regex highlighting.
- Saved searches/views; per-source retention (auto-purge old rows past N days to keep SQLite small).
- Alert rules: "if message matches /ERROR|FATAL/ more than N times in M minutes → email/webhook".
- Source management: API keys per source, rename/color-code sources.

## Architecture
Web app, port **5347**. Node+Express+better-sqlite3 (WAL mode, indexed on source+timestamp+level)+React/Vite/Tailwind, SSE for live tail. Desktop wrapper optional for local dev log tailing.

## Data model
`sources`(id, name, api_key, color), `log_lines`(id, source_id, level, message, raw_json, received_at) — indexed, pruned by retention job. `alert_rules`(id, source_id, pattern, threshold, window_s, channel).

## Launch kit notes
Angle: "Papertrail's free tier is 50MB/day — one bad night of errors and you're paying. This is flat, once, forever, on your own box." SEO: papertrail alternative self hosted, self hosted log aggregator, open source log viewer, syslog server web ui.
