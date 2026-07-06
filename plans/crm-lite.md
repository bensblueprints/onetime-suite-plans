# Dealstack — Build Plan (Batch 9, #45)

## One-liner & positioning
A pipeline-first CRM you own forever — contacts, deals on a drag-drop board, activities that actually remind you. **$39 one-time** vs Pipedrive at **$14/user/mo** (pays for itself in 3 months). Also compare HubSpot Starter ($15/user/mo, upsell maze) and Close ($49/user/mo). Tagline: "Your pipeline. Your server. Paid once."

## MVP feature list
- **Contacts + companies**: contact (name, email, phone, title, company link, tags, custom notes), company (name, domain, size, tags). Merge-safe simple model; contact list with search + tag filter; detail pages with timeline.
- **Pipeline board**: configurable stages (default: Lead → Qualified → Proposal → Negotiation → Won/Lost); deals as cards with title, value, currency, **probability %** (default per stage, overridable per deal), contact/company, expected close date. **Drag deals across stages** (dnd via Framer Motion drag or `@dnd-kit` — use an installed lib, don't hand-roll) with optimistic update + server persist of stage/position. Won/Lost require a click-through (Lost asks for reason).
- **Activities + reminders**: tasks/calls/meetings with due datetime, linked to deal/contact; **"Due today" view** (overdue in red, today, upcoming) as the default home tab; complete/snooze (+1d/+1w); in-app badge count. Optional daily digest email (BYO SMTP) — nice-to-have, keep behind settings flag.
- **Notes timeline**: freeform notes on contacts/deals/companies, newest-first unified timeline on detail pages interleaving notes, activities, stage changes, emails.
- **Email logging — decision**: the spec's BCC-in address idea is **explicitly skipped** (requires a receiving mail server/inbound parse — out of scope for a self-contained one-time product). Instead: **manual email logging** (paste subject/body, direction in/out, date) and **.eml import** (drag .eml files exported from any mail client; parse with `mailparser` npm: subject, from/to, date, text body; auto-match contact by email address, else prompt). Document this tradeoff honestly in README.
- **Tags** on contacts/companies/deals (shared tag table, colored chips, filter everywhere).
- **CSV import/export with field mapping**: import wizard — upload CSV, preview first 5 rows, map columns → fields via dropdowns (contacts or companies or deals), dedupe by email (skip/update choice), report created/updated/skipped. Export contacts/deals as CSV respecting current filters.
- **Simple reports**: pipeline value by stage (bar, sum + weighted-by-probability toggle), win rate (won / (won+lost), by month line), average deal size, deals won this month. Recharts.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion (+ @dnd-kit, Recharts, mailparser, papaparse). Single process, **port 5336** default. Session/password admin auth (single-user CRM; multi-user is non-goal). Dockerfile + docker-compose (SQLite volume), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, SMTP_* optional). Electron wrapper (`npm run desktop`) per spec — a desktop CRM is a genuinely strong mode for this product; feature it in README.

## Data model (SQLite)
- `companies`: id, name, domain, size, notes, created_at.
- `contacts`: id, first_name, last_name, email (indexed), phone, title, company_id, created_at.
- `stages`: id, name, position, default_probability, is_won (0/1), is_lost (0/1).
- `deals`: id, title, value_cents, currency, probability, stage_id, position (within stage), contact_id, company_id, expected_close, lost_reason, stage_changed_at, created_at, closed_at.
- `activities`: id, type ('task'|'call'|'meeting'), title, due_at, done_at, deal_id, contact_id, created_at.
- `notes`: id, body, entity_type ('contact'|'company'|'deal'), entity_id, created_at.
- `emails`: id, subject, body_text, direction ('in'|'out'), sent_at, contact_id, deal_id, source ('manual'|'eml'), created_at.
- `tags`: id, name, color; `taggings`: tag_id, entity_type, entity_id.
- `stage_history`: id, deal_id, from_stage, to_stage, at (feeds reports + timeline). `sessions`, `settings`.

## API endpoints
- Auth + `GET /api/health`.
- CRUD: `/api/contacts`, `/api/companies`, `/api/deals`, `/api/activities`, `/api/notes`, `/api/emails`, `/api/stages`, `/api/tags` (standard GET list w/ filters, POST, GET/PUT/DELETE :id).
- Board: `GET /api/board` (stages with ordered deal cards), `POST /api/deals/:id/move` {stage_id, position} — writes stage_history, resequences positions.
- Activities: `GET /api/activities/today` (overdue/today/upcoming buckets), `POST /api/activities/:id/complete`, `/snooze`.
- Timeline: `GET /api/timeline/:entityType/:id` (merged notes/activities/emails/stage changes, paginated).
- Import/export: `POST /api/import/csv/preview` (multipart → headers + sample rows), `POST /api/import/csv` (mapping json + file → report), `POST /api/import/eml` (multipart, multi-file), `GET /api/export/:entity.csv`.
- Reports: `GET /api/reports/pipeline`, `GET /api/reports/winrate?months=12`, `GET /api/reports/summary`.

## UI screens
1. Login. 2. **Today** (default): due activities buckets, quick-complete. 3. Board: horizontal stage columns, draggable cards (value + probability badge, avatar initials), column headers show count + sum, won/lost drop targets. 4. Contacts list + contact detail (info card, timeline, log email button, activities). 5. Companies list/detail. 6. Deal detail (edit fields, timeline, activities). 7. Import wizard (3 steps: upload → map → results). 8. Reports (pipeline bar, win-rate line, stat tiles). 9. Settings (stages editor with drag-reorder + probabilities, tags, SMTP). Dark mode default.

## Smoke test spec (`test/smoke.js`)
Boot via `spawn` on port **5436**, temp DB. Assertions:
1. Auth gates; login ok; default stages seeded (6, ordered).
2. Create company + contact (linked) + deal ($5,000, stage Lead, probability from stage default) → board endpoint shows card in Lead with correct sum.
3. Move deal Lead→Proposal via `/move` → stage_history row exists, board reflects it, `stage_changed_at` updated; move to Won → `closed_at` set.
4. Activities: create task due yesterday + task due today + task next week → `/today` buckets = overdue:1, today:1, upcoming:1; complete one → gone from buckets; snooze +1d moves bucket.
5. **.eml import**: write a fixture .eml in-test (proper headers: From matching the contact's email, Subject "Proposal v2", Date, plain body); POST it → email row created, auto-linked to the contact by address; timeline endpoint for that contact includes it interleaved with the note created earlier (assert order by date).
6. CSV import: generate CSV with 3 contacts (one duplicate email of existing contact, one with comma-in-name quoted); preview returns headers; import with mapping {`Full Name`→name split, `E-mail`→email} and dedupe=update → report {created:2, updated:1}; verify quoted name intact.
7. CSV export contacts → parse, row count matches, roundtrip fields.
8. Reports: seed 2 won + 1 lost deals dated this month → winrate = 66.7±0.1%; pipeline endpoint sums match; weighted sum = Σ value×probability.
9. Tag a deal, filter deals by tag → subset correct. Delete contact → its emails/notes cascade or orphan-handled (assert no 500 on timeline).
Cleanup: kill only spawned child PID; delete temp DB/wal/shm.

## Launch kit requirements
Competitors: Pipedrive $14/user/mo (anchor), HubSpot Starter $15/user/mo (+ their infamous upgrade wall), Close $49, Folk $20. Angle: "I run a tiny agency; my CRM needs are a board and reminders, not $168/yr/seat." Reddit: r/smallbusiness, r/sales, r/Entrepreneur, r/selfhosted (rules-aware, show the board GIF). HN Show HN. SEO: pipedrive alternative one time, self hosted crm simple, kanban crm, crm without subscription, small business crm own data. Note the .eml-import honesty as a differentiator ("no magic BCC address — here's why, and here's what works offline").

## Risks / gotchas
- **better-sqlite3 dual ABI** (Node vs Electron): copy `link-in-bio\scripts\setup-native.js` postinstall pattern. Never broad-kill node in tests.
- Drag-and-drop persistence: use fractional/gapped `position` values (e.g. midpoint insert, renumber a column when gaps exhaust) so a move is one UPDATE, not a column rewrite; make `/move` idempotent and clamp bad positions.
- `mailparser` is async/stream-based; .eml files can be huge with attachments — cap size (5 MB), take text body only, ignore attachments in MVP.
- CSV: use `papaparse` server-side too (it runs in Node) — never split on commas; handle BOM in user files; export must quote-escape.
- Money as INTEGER cents everywhere; weighted pipeline math in SQL.
- Cascading deletes: define FK behavior explicitly (deals keep company_id NULL on company delete; timeline queries LEFT JOIN so orphans don't 500).
- Keep multi-user OUT — auth is one admin; saying no keeps the build small. BCC-in stays skipped; do not let a future agent "helpfully" add an SMTP listener.
