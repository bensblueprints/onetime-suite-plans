# Queuecraft — Waitlist + Referral Tool (Build Plan)

**One-liner:** Self-hosted viral waitlist: signup widget + hosted page, referral links that move you up the queue, position emails via your own SMTP. Pay $29 once vs LaunchList at $29/mo — pays for itself in 1 month.

- **Product #31, Batch 7** · Price **$29** · Assigned port **5324** · Directory `C:\Users\ADMIN\Desktop\onetime-suite\waitlist-referral\`
- Follow `BUILD-SPEC.md` exactly: VPS web app (Node 20+ Express + better-sqlite3 + React/Vite + Tailwind + Lucide + Framer Motion) **plus** Electron desktop mode, Dockerfile + docker-compose, `.env.example`, launch-kit, MIT, git init (no push).

## MVP features
1. **Multiple waitlists** (admin creates; each gets a slug, hosted signup page at `/w/:slug`, and an embeddable widget snippet `<script src=".../embed.js" data-waitlist="slug">`).
2. **Signup** — email (+ optional name), returns position + unique referral link `/w/:slug?ref=CODE`.
3. **Referral ranking** — each verified referral moves the referrer up N positions (configurable, default 5) or points-based ranking (points = signup_order bonus + referrals×weight), position = rank in ORDER BY points DESC, created_at ASC. Show "You're #42 of 1,203 — refer 3 friends to jump the line."
4. **Email verification (BYO SMTP)** — double-check email via signed token link; unverified signups don't count for referrer credit. Nodemailer, SMTP settings in admin (host/port/user/pass/from), test-send button.
5. **Position emails** — welcome email (position + referral link), optional "you moved up" notification, and admin-triggered broadcast ("we're live!") to all/verified/top-N.
6. **Export** — CSV download (email, name, position, referral_count, verified, created_at, ref_source).
7. **Anti-spam** — disposable-email domain blocklist (vendor a static list, e.g. from the `disposable-email-domains` package data), per-IP rate limit (e.g. 5 signups/hour/IP via in-memory or SQLite counter), honeypot field in the form, optional signup cap, dedupe by normalized email (lowercase, strip gmail dots/+tags optional toggle), and self-referral prevention (referrer can't be the same email/IP fingerprint).
8. **Widget theming** — light/dark/accent color set in admin, reflected in embed + hosted page.

Out of scope for MVP: OAuth, captcha services, multi-user admin, analytics charts beyond simple counts.

## Architecture
- Single Express process serving `/api/*`, the built React admin SPA, the public hosted page `/w/:slug` (server-rendered or a small public bundle), and `embed.js`. Default `PORT=5324`.
- Admin auth: session cookie + `ADMIN_PASSWORD` from env (same pattern as uptime-monitor). Public endpoints (`signup`, `verify`, `position`) unauthenticated but rate-limited.
- Email: nodemailer transport built from settings stored in SQLite (fallback to env `SMTP_*`). All sends go through a small queue table with retry so a bad SMTP config can't lose signups.
- Electron wrapper `electron/main.js` boots the same server on a free port, data in `userData`, auto-login.

## Data model (SQLite)
- `waitlists(id, slug, name, headline, description, referral_boost, theme_json, signup_cap, require_verify, created_at)`
- `subscribers(id, waitlist_id, email, name, ref_code UNIQUE, referred_by (subscriber id nullable), points, verified INTEGER, verify_token, ip, ua, created_at)` — UNIQUE(waitlist_id, email)
- `referral_events(id, waitlist_id, referrer_id, referred_id, credited INTEGER, created_at)`
- `email_queue(id, to_email, subject, html, status, attempts, last_error, send_after, created_at)`
- `settings(key, value)` — SMTP config, blocklist toggle
- `blocked_domains(domain)` — seeded disposable list

## API endpoints
Public: `POST /api/public/:slug/signup` {email,name,ref,honeypot} → {position, refCode, total}; `GET /api/public/:slug/position?code=` ; `GET /api/public/verify/:token`; `GET /embed.js`; `GET /w/:slug`.
Admin (auth): `POST /api/login`; CRUD `/api/waitlists`; `GET /api/waitlists/:id/subscribers?search=&page=`; `DELETE /api/subscribers/:id`; `POST /api/waitlists/:id/broadcast`; `GET /api/waitlists/:id/export.csv`; `GET/PUT /api/settings/smtp` + `POST /api/settings/smtp/test`; `GET /api/health`.

## UI screens
1. **Login** 2. **Dashboard** — waitlist cards (signups, verified %, top referrer). 3. **Waitlist detail** — subscriber table (position, email, referrals, verified badge), search, delete, export button, broadcast composer. 4. **Waitlist settings** — copy, referral boost, theme, embed snippet with copy button. 5. **SMTP settings** with test send. 6. **Public hosted page** — hero, email form, post-signup "position card" with referral link + share buttons (X/copy). Dark-mode default, premium feel.

## Smoke test (`test/smoke.js`, style of `uptime-monitor/test/smoke.js`)
Boot real server via `spawn` with `PORT=5394, DB_PATH=test/smoke.db, ADMIN_PASSWORD, SMTP_DISABLED=true` (or point SMTP at a stub SMTP server started in-test with `smtp-server` npm pkg to capture mails). Assert:
1. health → login (wrong password 401, right 200); unauth admin API 401.
2. Create waitlist via API.
3. `signup` A → 201, position 1, refCode returned; verify email captured by stub SMTP (or row in `email_queue`); hit verify token URL → `verified=1` in SQLite (open db readonly like uptime-monitor does).
4. Signups B..F with `ref=A.refCode` + verify them → assert A's points increased, A's position recomputed to #1 stays / B jumps sample: create C without ref, then B with ref, verify B's referrer credit moves referrer above C. Assert `referral_events.credited=1` rows exist.
5. Duplicate email → 409; honeypot filled → silently accepted-but-dropped (no row); 6th signup from same IP within window → 429; disposable domain (`mailinator.com`) → 400.
6. Export CSV → 200, contains header + rows, positions match.
7. Broadcast → rows appear in email_queue / stub inbox count equals verified subscribers.
Cleanup db files, exit non-zero on failure. `npm test` runs it.

## Launch kit requirements
Competitor math: **LaunchList $29/mo** (Pro), also mention GetWaitlist ($50/mo Pro) and Prefinery (from $137/mo). Angle: "Your waitlist runs for months before launch — that's $87–$400 in subscriptions for a signup form. Queuecraft is $29 once, self-hosted, your emails stay yours." Product Hunt tagline ≤60 chars, maker comment "I got tired of paying $29/mo to collect emails…". Subreddits: r/SaaS, r/indiehackers, r/EntrepreneurRideAlong (rules-aware). Include "pays for itself in 1 month" math in strategy.md.

## Risks / gotchas
- **better-sqlite3 dual ABI (Node vs Electron):** copy `link-in-bio/scripts/setup-native.js` postinstall pattern verbatim — vendor both bindings into `vendor/`, pick via `nativeBinding` in `server/db.js`. Do not skip; `npm run desktop` will crash otherwise.
- Never write JSON via PowerShell (BOM). Use node.
- Position computation must be a query, not a stored column (rank drifts as referrals land); index `(waitlist_id, points DESC, created_at)`.
- Referral fraud: cap credits per referrer per IP; only count verified referrals.
- Email sending is BYO SMTP — never bundle a sending service; make "SMTP not configured" a graceful state (signups still work, verification optional-off).
- Embed must set CORS headers on public signup endpoint and be shadow-DOM or namespaced CSS so host-page styles don't bleed.
