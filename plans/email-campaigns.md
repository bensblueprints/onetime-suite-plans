# Postbird — Email Campaigns (Build Plan)

**One-liner:** Self-hosted email marketing: lists + segments, drag-block builder that outputs email-safe HTML, campaigns through your own SMTP with throttling, open/click tracking, and built-in unsubscribe/double-opt-in compliance. Pay $59 once vs Mailchimp ($20+/mo at 1k contacts) or Sendy ($69 + AWS lock-in).

- **Product #34, Batch 7** · Price **$59** · Assigned port **5327** · Directory `C:\Users\ADMIN\Desktop\onetime-suite\email-campaigns\`
- Follow `BUILD-SPEC.md`: VPS web app (Express + better-sqlite3 + React/Vite + Tailwind + Lucide + Framer Motion) + Electron desktop mode, Docker + volume, `.env.example` (PORT=5327, ADMIN_PASSWORD, BASE_URL, SMTP_* fallback), launch-kit, MIT, git init only. `BASE_URL` matters here — tracking/unsub links must be absolute.

## MVP features
1. **Subscribers & lists** — CRUD lists; import CSV (email, name, custom fields as JSON) with dedupe + invalid-email rejection report; per-subscriber status: `pending` (awaiting opt-in confirm), `subscribed`, `unsubscribed`, `bounced`, `complained`. Manual add + public signup form endpoint per list.
2. **Double opt-in** — toggle per list (default ON): signup → `pending` + confirmation email with signed token; only `subscribed` receive campaigns. Store consent timestamp + IP.
3. **Segments** — saved filters per list: rules on fields (email domain, name contains, custom field equals, subscribed after date, opened/clicked any of last N campaigns). AND/OR of simple conditions compiled to SQL.
4. **Drag-block email builder** — block palette: heading, text (simple rich text: bold/italic/link), image (upload → served from BASE_URL), button, divider, spacer, 2-column, footer. Reorder via drag (Framer Motion Reorder or dnd-kit), per-block + global styles (colors, font, width 600px). **Compiles to email-safe HTML**: table-based layout, inline styles only, no flexbox/grid, VML-free MVP, bulletproof button (padded table cell), alt text, plain-text alternative auto-generated. Templates stored as block JSON; "send test email" button.
5. **Campaigns** — pick list ± segment, subject, from name/address, reply-to, builder template; schedule now/later. **Sending queue with throttling**: configurable msgs/minute (default 30) + per-batch pause, via BYO SMTP (nodemailer pooled transport). Progress bar, pause/cancel mid-send. Merge tags `{{name}}`, `{{email}}`, `{{unsubscribe_url}}`.
6. **Opens & clicks** — 1×1 transparent GIF pixel `GET /t/o/:token.gif`; all links rewritten to `GET /t/c/:token` → 302 redirect + click row. Per-campaign report: sent/delivered/opens/clicks (unique + total), click map per URL, recipient-level activity.
7. **Unsubscribe compliance (MANDATORY — CAN-SPAM/GDPR):** every rendered email MUST include: working one-click unsubscribe link (signed token, no login, immediate effect + confirmation page), the sender's physical mailing address in the footer (required field in settings — **block sending if empty**), and `List-Unsubscribe:` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers (RFC 8058; Gmail/Yahoo require these for bulk senders). Unsubscribes are global-per-list, immediate, and suppressed from all future sends. The builder's footer block is non-removable in campaign sends.
8. **Bounce webhook hooks** — inbound endpoint `POST /api/hooks/bounce` accepting generic JSON plus documented adapters (payload shapes for SES SNS, Postmark, Mailgun in README); hard bounce → status `bounced`, complaint → `complained`, both suppressed. Also parse SMTP-time 5xx rejections during send as bounces.

Out of scope: automations/drip sequences, A/B tests, template marketplace, DKIM signing (document that deliverability = user's SMTP provider's job; recommend SES/Postmark SMTP creds).

## Architecture
- Single Express process. Sending worker = in-process loop draining `outbox` table at throttle rate (survives restart: unsent rows resume). Nodemailer pooled connection, configurable pool size 1–5.
- Tracking endpoints are public + fast (no auth, no framework middleware weight); tokens are HMAC-signed ids (SECRET in env, auto-generated to data dir if absent).
- HTML compiler = pure function blockJSON → {html, text}; unit-testable; run through `juice`-style inlining is unnecessary if styles are authored inline from the start.
- Electron desktop mode per spec (note in README: tracking pixels/unsub links need the app reachable — desktop mode is for authoring + small sends; VPS mode recommended for real campaigns).

## Data model (SQLite)
- `lists(id, name, double_opt_in, from_name, from_email, created_at)`
- `subscribers(id, list_id, email, name, fields_json, status, consent_at, consent_ip, unsub_at, created_at)` UNIQUE(list_id, email)
- `segments(id, list_id, name, rules_json)`
- `templates(id, name, blocks_json, updated_at)`
- `campaigns(id, list_id, segment_id, template_id, subject, from_name, from_email, reply_to, status ('draft'|'scheduled'|'sending'|'paused'|'sent'|'canceled'), scheduled_at, started_at, finished_at, throttle_per_min)`
- `outbox(id, campaign_id, subscriber_id, status ('queued'|'sent'|'failed'|'bounced'), token, error, sent_at)`
- `events(id, campaign_id, subscriber_id, type ('open'|'click'|'unsub'|'bounce'|'complaint'), url, ua, ip, created_at)`
- `settings(key, value)` — SMTP, sender physical address, BASE_URL override.

## API endpoints
Public: `POST /api/public/lists/:id/subscribe`; `GET /confirm/:token`; `GET /unsub/:token` + `POST /unsub/:token` (one-click RFC 8058); `GET /t/o/:token.gif`; `GET /t/c/:token`; `POST /api/hooks/bounce`.
Admin (auth): login; CRUD lists/subscribers (+ `POST /api/lists/:id/import` CSV, `GET .../export.csv`); CRUD segments + `POST /api/segments/preview` (count + sample); CRUD templates + `POST /api/templates/:id/render` → {html,text} + `POST /api/templates/:id/test-send`; campaigns CRUD + `POST /api/campaigns/:id/send|pause|cancel`, `GET /api/campaigns/:id/report`; settings + SMTP test; `GET /api/health`.

## UI screens
1. Login. 2. **Dashboard** — recent campaigns w/ open/click stats. 3. **Lists** — table, import wizard (mapping, results), subscriber drawer with activity timeline. 4. **Segment editor** — rule rows + live count. 5. **Builder** — left palette, center 600px canvas (drag/reorder, inline edit), right style panel; desktop/mobile/HTML-source preview tabs; test-send modal. 6. **Campaign wizard** — audience → content → review (compliance checklist: physical address ✔, unsub link ✔) → send/schedule; live sending progress. 7. **Report** — funnel stats, link table, recipient activity. 8. **Settings** — SMTP, sender address (required), BASE_URL. Dark default.

## Smoke test (`test/smoke.js`, uptime-monitor style)
Spawn server (`PORT=5398, DB_PATH=test/smoke.db, ADMIN_PASSWORD, BASE_URL=http://127.0.0.1:5398`). Start in-test SMTP capture server (`smtp-server` npm) on 5399; configure via settings API.
1. Health + auth gates.
2. Create list (double opt-in ON) + set sender physical address. Public subscribe → row `pending`; confirmation mail captured; extract token link, GET it → `subscribed` + consent_at set.
3. CSV import 3 rows (1 invalid email) → {imported:2, rejected:1}.
4. Build template via API (heading/text/button/footer blocks) → render → assert HTML is table-based (contains `<table`, no `display:flex`), contains `{{unsubscribe_url}}` resolved later, and text alternative non-empty.
5. Attempt campaign send with physical address cleared → 400 (compliance block). Restore address.
6. Send campaign (throttle high for test) → wait until `status='sent'`; assert SMTP capture received N messages, each containing unsub link, physical address string, and headers `List-Unsubscribe` + `List-Unsubscribe-Post`.
7. Extract open pixel + click URLs from a captured message; GET pixel → open event row; GET click → 302 to original URL + click event; report API shows opens=1, clicks=1.
8. GET unsub link → subscriber `unsubscribed`; second campaign send → capture count excludes them and outbox has no row for them.
9. POST bounce hook (generic payload) → status `bounced`.
Cleanup + exit codes per uptime-monitor.

## Launch kit requirements
Competitor math: **Mailchimp** Standard ≈ $20/mo @ 500 contacts, scales past $100/mo @ 10k; **Sendy** $69 one-time but AWS-SES-only — Postbird is BYO-any-SMTP. Angle: "Own your list, own your sender, stop renting your audience back at $per-contact prices." Pays for itself in ~2 months vs Mailchimp @1k contacts. PH shots: builder, campaign report, compliance checklist, import, dark dashboard. Strategy: r/selfhosted, r/Emailmarketing (no self-promo days — follow rules), HN Show HN; SEO: "sendy alternative", "self hosted mailchimp alternative".

## Risks / gotchas
- **Compliance is a feature, not a footnote**: physical-address send-block, immutable footer, RFC 8058 headers, immediate unsubscribe — all in the smoke test. README gets a "CAN-SPAM / GDPR" section.
- **better-sqlite3 dual ABI**: copy `link-in-bio/scripts/setup-native.js` pattern.
- Email HTML: no modern CSS; test render string for banned properties in smoke test. Outlook quirks documented, not solved, in MVP.
- Throttling must be per-SMTP-provider-safe defaults; document SES/Postmark/Gmail limits. Never bundle credentials; Gmail SMTP caveat (500/day) in README.
- Tracking pixel/redirect endpoints must not leak timing into send loop; keep them dependency-free routes. Sign tokens (HMAC) so event rows can't be forged/enumerated.
- Large sends on SQLite: write events in WAL mode; batch outbox inserts in a transaction.
- No PowerShell JSON writes (BOM).
