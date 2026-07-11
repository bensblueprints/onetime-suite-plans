# Whop Product Listings — Onetime Suite apps 51-102 (generated 2026-07-12)

Source: onetimesuite-com product data. Published via whop-publish-2.js.

## Deskly — The email-to-ticket help desk you own forever.

- **Product title:** Deskly — The email-to-ticket help desk you own forever.
- **Price:** $49 one-time
- **Tagline:** The email-to-ticket help desk you own forever.

**Description:**

Zendesk Suite Team is $55 per agent per month — a 3-person team pays around $2,000 a year, forever, and every ticket lives in Atlassian's cloud. Deskly does the same job on a $5 VPS: email-to-ticket, SLA timers, macros, CSAT, all landing in a SQLite file you own. $49, once, no matter how many agents you add.

- Email → ticket — Poll any IMAP inbox or POST to a token-protected webhook — replies thread automatically via subject markers.
- Threaded SMTP replies — Answer over SMTP, threaded back to the requester, with an optional CSAT footer on every reply.
- Full ticket workflow — Open / pending / solved / closed, four priorities, assignees, tags, saved views and search.
- Canned responses — Macros with variable substitution — customer name, ticket id, subject and more.
- Notes vs public replies — Internal notes never email the customer; @mention teammates privately.
- SLA timers per priority — First-response and resolution clocks with live breach badges and a breach counter on the dashboard.
- Built-in CSAT — Solved tickets email a thumbs up/down link; ratings roll up into a satisfaction score.
- Ops dashboard — Tickets by status, open by priority, average first-response time, SLA breaches and CSAT %.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/helpdesk-tickets
- Lifetime v1 updates
- Setup guide (README quick start)

## Upkeep Status — The public status page you own forever.

- **Product title:** Upkeep Status — The public status page you own forever.
- **Price:** $29 one-time
- **Tagline:** The public status page you own forever.

**Description:**

Atlassian Statuspage starts at $29 a month and climbs to $999 — $348 a year at the bottom, forever, and your status page lives in their cloud. Upkeep Status does the same job on a $5 VPS: components with uptime bars, incident timelines, scheduled maintenance, email subscribers, RSS and a JSON API, all in a SQLite file you own. $29, once. Your status page shouldn't cost more than the incident it's reporting.

- Components with five states — Operational, degraded, partial or major outage and maintenance — toggle manually or auto-flip from your uptime monitor via a per-component webhook.
- Incident timelines — The classic investigating → identified → monitoring → resolved flow, every update timestamped on the public page.
- Scheduled maintenance — Windows shown in advance that auto-transition scheduled → in progress → complete, with no cron required.
- 90-day uptime bars — Per component, computed from real status-change history and cached daily.
- Email subscribers — A subscribe form with double opt-in when SMTP is set, notified on new incidents and resolutions, one-click unsubscribe.
- RSS + JSON status API — A /feed.xml feed and /api/status.json endpoint for programmatic checks.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/status-page
- Lifetime v1 updates
- Setup guide (README quick start)

## Maptrail — Crawl any site on your own machine and ship a clean sitemap.

- **Product title:** Maptrail — Crawl any site on your own machine and ship a clean sitemap.
- **Price:** $19 one-time
- **Tagline:** Crawl any site on your own machine and ship a clean sitemap.

**Description:**

Screaming Frog charges £199 a year, forever, for a crawler most people use to do one thing: audit a site and ship a sitemap. Maptrail does exactly that on your own machine — point it at a URL, crawl locally, and get a standards-compliant sitemap.xml, a human-readable HTML sitemap and a full CSV SEO report. $19, once. Your sitemap is not a subscription.

- Local breadth-first crawler — Enter a URL and crawl the whole site from your machine with a live progress table — status, depth, title, meta length, H1, word count.
- Depth, limit & pattern controls — Set max depth and page limit, plus include/exclude URL patterns (substrings or /regex/) to skip tag and sort pages.
- Standards-compliant sitemap.xml — lastmod pulled from real Last-Modified headers, priority scaled by crawl depth.
- Automatic 50k index chunking — Sites over 50,000 URLs split into numbered sitemaps plus a sitemap-index.xml, exactly per the sitemaps.org spec.
- Full CSV SEO report — Every crawled page with status, title, meta, H1, word count, canonical and noindex — including the 404s the sitemap correctly leaves out, so you can fix them.
- Local crawl history — Every crawl saved locally so you can reload, re-export or delete it — nothing leaves your disk.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/sitemap-generator
- Lifetime v1 updates
- Setup guide (README quick start)

## Linkguard — The site-wide broken-link and redirect crawler you own forever.

- **Product title:** Linkguard — The site-wide broken-link and redirect crawler you own forever.
- **Price:** $24 one-time
- **Tagline:** The site-wide broken-link and redirect crawler you own forever.

**Description:**

Ahrefs Site Audit is bundled at $99+ a month — around $1,188 a year to keep a crawler that is, underneath, an HTTP client and a cron job. Dr. Link Check wants $14.90+/mo for the same idea. Linkguard is that HTTP client and that cron job: it walks your pages, checks every internal and external link, follows redirect chains, and re-scans on a schedule with a diff. $24, once, on your own box.

- Real crawler — Give it a start URL plus depth and page limits and it walks your internal pages with undici, no headless browser, checking every internal and external link it finds.
- Redirect-chain analysis — Follows redirects hop by hop, stores the full chain, and flags anything over two hops so you catch link-equity leaks.
- Filterable results table — URL, status code, hops, link text and the pages each link was found on, filterable to broken, redirects, over two hops, or OK.
- Scheduled re-crawls with diffs — Daily or weekly re-scans diffed against the last run, so you get new-broken-links-since-last-scan instead of a raw dump.
- Email alerts only on new breaks — SMTP alerts fire only when new broken links appear, so there is no alert fatigue.
- CSV export — Export any scan to CSV for client reports.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/broken-link-checker
- Lifetime v1 updates
- Setup guide (README quick start)

## Docsmith API — Turn any OpenAPI spec into branded, Stripe-style API docs,…

- **Product title:** Docsmith API — Turn any OpenAPI spec into branded, Stripe-style API docs,…
- **Price:** $29 one-time
- **Tagline:** Turn any OpenAPI spec into branded, Stripe-style API docs, locally, forever.

**Description:**

ReadMe.io charges $99+ a month, about $1,188 a year, essentially to render a JSON file and host it. Docsmith renders it once on your own machine: a three-pane, Stripe-style reference with try-it-out, auto-generated curl/JavaScript/Python snippets and versioning, exported as static files you host anywhere for $0. Pay $29, once, and your spec never leaves your desk.

- Import OpenAPI / Swagger — Load OpenAPI 3.x or Swagger from a file or URL, JSON or YAML, with $refs fully dereferenced.
- Stripe-style 3-pane layout — Endpoint nav grouped by tag, full descriptions with parameters and schemas, and code samples beside live response examples.
- Try-it-out that works — Requests fire from the app main process so there is no CORS pain, returning status, timing, headers and a pretty-printed body.
- Auto-generated snippets — cURL, JavaScript fetch and Python requests per endpoint, with path params filled from spec examples and auth headers included for secured endpoints.
- Custom branding — Bake your product name, logo text, primary color and default base URL into every export.
- Static export — One click or one CLI command produces a self-contained folder you host free on Netlify, GitHub Pages, S3 or nginx with your own domain.
- Versioning — Keep multiple spec versions with a switcher in the nav.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/api-docs-generator
- Lifetime v1 updates
- Setup guide (README quick start)

## Vaultly — The zero-knowledge team password manager you own forever.

- **Product title:** Vaultly — The zero-knowledge team password manager you own forever.
- **Price:** $39 one-time
- **Tagline:** The zero-knowledge team password manager you own forever.

**Description:**

1Password Teams is $7.99 per user per month, so a five-person team pays roughly $1,438 over three years, forever, with everything in someone else's cloud. Vaultly runs the same zero-knowledge model on your own $5 VPS: everything is encrypted in your browser with AES-256-GCM before it reaches the server, which only ever stores ciphertext. $39, once, however many people you add.

- Zero-knowledge client-side crypto — PBKDF2 at 600k iterations into AES-256-GCM via the Web Crypto API, so a server compromise is not a vault compromise.
- Shared team vaults — Vault keys are wrapped with each member RSA-OAEP public key in the browser, and the server only relays wrapped keys it cannot read.
- Logins, notes and cards — Store logins, secure notes and cards with folders, search, a strong password generator and a strength meter.
- Inline TOTP — Store a 2FA secret alongside a login and get live 6-digit codes with copy-to-clipboard that auto-clears.
- Opt-in breach check — HaveIBeenPwned k-anonymity range lookups only when you click, off by default, and your password never leaves the browser.
- Audit log — Registrations, logins, item create/edit/delete/reveal and vault sharing are all recorded with who did what and when.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/password-manager-selfhosted
- Lifetime v1 updates
- Setup guide (README quick start)

## Keyloop — The 2FA authenticator that never holds your codes hostage.

- **Product title:** Keyloop — The 2FA authenticator that never holds your codes hostage.
- **Price:** $19 one-time
- **Tagline:** The 2FA authenticator that never holds your codes hostage.

**Description:**

Authy makes exporting your 2FA secrets deliberately impossible, and 1Password wants $2.99+ a month, about $36 a year, just to hold the same codes in someone else's cloud. Keyloop is a desktop authenticator where you hold the vault: AES-256 encrypted on your own disk, exportable to an encrypted file, a printable QR paper backup, or a standard otpauth:// list. Pay $19 once, and you are never locked out or locked in.

- Live 6-digit codes — Per-account countdown rings and click-to-copy with a clipboard that auto-clears.
- Add accounts three ways — Scan a QR screenshot, paste an otpauth:// URI, or type the secret manually, with SHA1/256/512, 6-8 digits and custom periods.
- Encrypted local vault — scrypt key derivation into AES-256-GCM using Node built-in crypto; the master password is never stored and it auto-locks after five minutes idle.
- Encrypted .keyloop backups — One file, one password, restore anywhere.
- Printable QR paper backup — Every account as a QR code on one sheet for your safe or deposit box, the escape hatch Authy refuses to give you.
- Bulk migration — Paste an otpauth:// URI list from any other authenticator export.
- Zero network — No accounts, no cloud, no telemetry; the app makes no network calls at all.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/2fa-authenticator-backup
- Lifetime v1 updates
- Setup guide (README quick start)

## Secretbox — Self-hosted team secrets and env-var manager, no per-seat…

- **Product title:** Secretbox — Self-hosted team secrets and env-var manager, no per-seat…
- **Price:** $39 one-time
- **Tagline:** Self-hosted team secrets and env-var manager, no per-seat Doppler bill.

**Description:**

Doppler charges $12 per user per month to store key-value pairs, so a five-person team pays about $2,160 over three years, forever, in Doppler's cloud. Secretbox does projects, environments, envelope-encrypted secrets, versioning with rollback, env diffs, scoped API tokens and a zero-dependency CLI on your own box. $39, once.

- Envelope encryption at rest — Every value gets its own random AES-256-GCM data key, wrapped by a master key that lives only in your .env and never in the database.
- Projects and environments — Organize projects into dev, staging, prod and custom environments, with secret versioning and one-click rollback.
- Audit-logged reveals — Every reveal, pull, edit and rollback is recorded with who, what and when.
- Environment diff — See which keys are missing or different between dev and prod without exposing the values.
- Scoped API tokens — Per-project, read-only or read-write tokens, shown once and stored as SHA-256 hashes.
- Zero-dependency CLI — secretbox pull writes an env file, secretbox run injects env and writes nothing to disk, and secretbox push adds a key.
- Desktop mode or VPS — Run it as an Electron app, or docker compose up on a $5 VPS.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/env-secrets-manager
- Lifetime v1 updates
- Setup guide (README quick start)

## Certwatch — SSL certificate and domain expiry monitoring you own forever.

- **Product title:** Certwatch — SSL certificate and domain expiry monitoring you own forever.
- **Price:** $24 one-time
- **Tagline:** SSL certificate and domain expiry monitoring you own forever.

**Description:**

Uptime-tool SSL add-ons and SSLMate-style monitors run $10 to $20 a month, roughly $360 to $720 over three years for 50 domains. One expired cert is a 2am page either way. Certwatch does a real TLS handshake against every site you care about on a schedule, and alerts you by email or webhook at 30, 14, 7 and 1 days before a cert or the domain itself expires. $24, once.

- Traffic-light dashboard — Green over 30 days, yellow at 30 or under, red under 7 days, or for expired, invalid or unreachable hosts.
- Real TLS handshake checks — Node tls checks expiry, issuer, SAN list, chain validity, self-signed certs and weak keys (RSA under 2048, EC under 224).
- Domain WHOIS expiry — Best-effort registry lookups so the domain registration itself does not lapse either.
- Threshold alerts — Configurable days (default 30, 14, 7, 1) via webhook and SMTP email, with exactly one alert per threshold per certificate.
- Chain viewer — See the full presented certificate chain per check in the UI.
- Check history — Every check is stored, and unreachable hosts are recorded with the error.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/ssl-cert-monitor
- Lifetime v1 updates
- Setup guide (README quick start)

## Logbin — Self-hosted log aggregation with live tail, search and alert rules.

- **Product title:** Logbin — Self-hosted log aggregation with live tail, search and alert rules.
- **Price:** $34 one-time
- **Tagline:** Self-hosted log aggregation with live tail, search and alert rules.

**Description:**

Papertrail's free tier is 50MB a day, so one bad night of stack traces pushes you onto a paid plan that scales with your worst outage, from $7 a month into the hundreds. Logbin is the pay-once alternative: ship logs from any server over HTTP or syslog, tail them live in a web UI, search everything, and get alerted when ERROR starts screaming. $34, once, on your own box.

- Ingest anything — POST /ingest takes plaintext, JSON, arrays or NDJSON with levels auto-detected, plus a syslog UDP listener that auto-creates sources and two tiny file-shipper scripts.
- Live tail — An SSE stream with source and level filters, text matching, pause/resume and auto-scroll.
- Search and filter — Text search with match highlighting, per-source and per-level filters and saved views.
- Alert rules — Fire a webhook or email when a regex like /ERROR|FATAL/ matches N times in M seconds, with cooldowns so one incident is one alert.
- Per-source retention — Auto-purge old rows (default 14 days) to keep SQLite lean, with rotatable per-source API keys and color-coded sources.
- Desktop mode or VPS — Electron app for local dev-log tailing, Docker for the real thing.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/log-viewer-aggregator
- Lifetime v1 updates
- Setup guide (README quick start)

## Resumecraft — Build a resume you own forever, on your own machine.

- **Product title:** Resumecraft — Build a resume you own forever, on your own machine.
- **Price:** $19 one-time
- **Tagline:** Build a resume you own forever, on your own machine.

**Description:**

Zety charges $23.70 a month, forever, just to let you fill out a form and download the PDF of your own resume. Resumecraft is $19 once. Pick one of 7 templates, fill structured sections with a live preview, flip on ATS-safe mode, and export a real PDF — 100% local, zero cloud, zero telemetry. Your job hunt is not a subscription.

- 7 bundled templates — Classic, Modern, Minimal, Executive, Compact, Tech and Elegant — swap any time without losing a word of your data.
- ATS-safe mode — One toggle strips columns, colors and decoration into a plain single-column layout that applicant tracking systems parse cleanly.
- Plain-text portal export — Export or copy a clean text version for pasting into Workday and Greenhouse-style job portal forms.
- Real PDF export — Headless Chromium print to US Letter, with a live one-page overflow warning in the preview so you know before you export.
- Structured sections — Contact, summary, experience with reorderable bullets, education, skills, projects and unlimited custom sections.
- Versions and duplicates — Keep multiple resumes, duplicate one per job application and tailor it, rename or delete freely.
- Local-first storage — Everything lives in a human-readable JSON file on your machine — no account, no cloud, no network calls.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/resume-builder
- Lifetime v1 updates
- Setup guide (README quick start)

## Pitchcraft — Send trackable, sign-ready proposals from your own server.

- **Product title:** Pitchcraft — Send trackable, sign-ready proposals from your own server.
- **Price:** $29 one-time
- **Tagline:** Send trackable, sign-ready proposals from your own server.

**Description:**

Proposify and PandaDoc charge $19+ per user every month, forever, for what is fundamentally a pricing table with a signature box. Pitchcraft is $29 once. Build proposals from content blocks, drop in a pricing table with client-toggleable add-ons, send a trackable link, and get a click-to-sign acceptance — all self-hosted, all yours. Your sales documents are not a subscription.

- Block-based builder — Cover, text, pricing table, terms, testimonial and image blocks that you drag to reorder.
- 6 starter templates — Web design, marketing retainer, consulting, video production, freelance dev, or blank.
- Pricing tables with add-ons — Mark line items optional and your client toggles them on the live page, watching the total update before they sign.
- Trackable share links — See when a proposal was opened, how many times, and total reading time.
- Click-to-sign acceptance — The client types their name and you get a stored record with signer, timestamp, IP and the exact total including chosen add-ons.
- Request-changes flow — Clients comment right on the proposal and the status flips to changes requested.
- Optional email notifications — Get pinged on first open, acceptance and comments via your own SMTP.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/proposal-generator
- Lifetime v1 updates
- Setup guide (README quick start)

## Contractly — Sixteen plain-language contract templates you fill in and own.

- **Product title:** Contractly — Sixteen plain-language contract templates you fill in and own.
- **Price:** $29 one-time
- **Tagline:** Sixteen plain-language contract templates you fill in and own.

**Description:**

PandaDoc gates template features behind $19+ per user every month, and a lawyer charges per document. Contractly is $29 once: the blanks, the form that fills them, and the PDF — on your machine. Sixteen plain-language templates for NDAs, freelance agreements, service contracts, SOWs and releases, with a rich-text clause editor and live preview. Your contracts are not a subscription.

- 16 bundled templates — NDAs, freelance and consulting agreements, retainers, SOWs, releases and more across 6 categories.
- Fill-in-the-blanks variables — Placeholders become a form panel — type once and the document updates live with a filled/blank progress counter.
- Edit the contract body — A rich-text editor for bold, italic, headings and lists lets you customize clauses and insert your own variables anywhere.
- Save your own templates — Your edited NDA becomes your NDA for every future client.
- Clone for the next client — Reuse a finished contract as the base for the next deal, with fields kept independent.
- Clean PDF export — Headless Chromium print on Letter with 1-inch margins and serif type; unfilled blanks export as underscores so nothing sneaks through half-merged.
- E-signature handoff — Export merged HTML and open it in Inkseal, our pay-once signing tool, rather than rebuilding signing.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/contract-templates
- Lifetime v1 updates
- Setup guide (README quick start)

## Captionly — Burn karaoke captions onto your clips, all on your own hardware.

- **Product title:** Captionly — Burn karaoke captions onto your clips, all on your own hardware.
- **Price:** $34 one-time
- **Tagline:** Burn karaoke captions onto your clips, all on your own hardware.

**Description:**

Submagic charges $18–39 a month to run Whisper and ffmpeg on your clips. Captionly is $34 once. Drop a video, run Whisper locally for word-level timestamps, pick a caption style, fix any misheard words inline, and burn a ready-to-post MP4 — 100% on your machine. Same pipeline, your hardware, zero subscription.

- Local Whisper transcription — whisper.cpp with word-level timestamps; the engine and model download once on first run, then run fully offline.
- Karaoke word-highlight captions — Real ASS timing tags per word for the TikTok and Reels look, rendered by ffmpeg exactly as previewed.
- 3 style presets — Karaoke Highlight, Bold Center and Classic Subtitle, plus font size, position and highlight color controls.
- Inline editing with re-sync — Click a caption, fix the words, and timings redistribute proportionally across the cue with no re-transcribing.
- Keyword to emoji decoration — Optional mapping turns words like money into an emoji, with 50+ built-in mappings.
- Burn-in export — ffmpeg ass filter to H.264 MP4 with audio stream-copied and live progress.
- SRT and ASS export — Export subtitle files for YouTube uploads or further editing.
- 100% local — Your footage never leaves your machine — no accounts, no telemetry.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/video-clip-captioner
- Lifetime v1 updates
- Setup guide (README quick start)

## UTMcraft — Consistent campaign links and honest click counts on your own domain.

- **Product title:** UTMcraft — Consistent campaign links and honest click counts on your own domain.
- **Price:** $19 one-time
- **Tagline:** Consistent campaign links and honest click counts on your own domain.

**Description:**

UTM.io charges $29 a month to fill out a form with dropdowns. UTMcraft is $19 once, self-hosted, and the click data is yours. Build consistently-tagged campaign links with autocomplete and a naming-convention enforcer, generate 10 ad-set variants from CSV in one shot, and track real clicks through your own redirect short links. Your click data is not a subscription.

- Builder with autocomplete — Source, medium, campaign, term and content fields suggest from your own history with a live URL preview as you type.
- Auto-normalization — Every value is lowercased with spaces turned to underscores, so Email, email and E-mail can never split your analytics again.
- Naming-convention enforcer — Optionally lock utm_source and utm_medium to team-approved lists, with off-list values rejected with a helpful error.
- Bulk generator — Paste a CSV of variants and get tagged links plus short codes at once, with per-row error reporting.
- Click tracking via short links — Share a redirect short link that records referrer, device, country from geo headers and time, then 302s to the tagged URL.
- Dashboards — Clicks over time, by source, by medium, by device and top links across 7, 30 and 90-day ranges.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/utm-campaign-builder
- Lifetime v1 updates
- Setup guide (README quick start)

## Reflink — Run your affiliate program from one Node process and one SQLite file.

- **Product title:** Reflink — Run your affiliate program from one Node process and one SQLite file.
- **Price:** $39 one-time
- **Tagline:** Run your affiliate program from one Node process and one SQLite file.

**Description:**

Tapfiliate is $89 a month and FirstPromoter starts at $49 a month, forever, to answer one question: who sent this sale and what do I owe them. Reflink is $39 once. Give every affiliate a tracking link, count their clicks, attribute their conversions, compute their commissions, and export the payout CSV — from one Node process and one SQLite file that you own. No subscription.

- Tracking links — A short link records the click and 302-redirects to your landing page with a ref code appended for client-side pickup.
- Cookie-based attribution — A configurable window of 30, 60 or 90 days is your call.
- Conversion tracking two ways — A server-to-server postback from your checkout webhook, or a JS pixel with a convert call.
- Order-ID dedupe — The same order can never pay commission twice.
- Commission rules per affiliate — Percent of sale or a flat amount.
- Approval workflow — Pending to approved or rejected to paid, so nothing pays out by accident.
- Affiliate portal — Affiliates sign in with an access key and see only their own clicks, conversions, earnings, link and your banners.
- Privacy-sane — Visitor IPs are stored only as salted hashes, never raw.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/affiliate-tracker
- Lifetime v1 updates
- Setup guide (README quick start)

## Star Stack — Show the five stars you already earned, on your own site.

- **Product title:** Star Stack — Show the five stars you already earned, on your own site.
- **Price:** $29 one-time
- **Tagline:** Show the five stars you already earned, on your own site.

**Description:**

Trustpilot Business is $199+ a month, forever, to display the reviews you already earned. Star Stack is $29 once. Aggregate your Google, Facebook, and manually-imported reviews into one embeddable, themeable widget — with moderation, featured pins, and an aggregate star badge, from one Node process and one SQLite file. Your reviews are not a subscription.

- Multiple sources — Google Business Profile, Facebook Page reviews, and manual or CSV import for everything else.
- BYO API keys — You plug in your own free-tier Google and Facebook credentials, so there is no proxy service to bill you monthly.
- Moderation first — Synced and imported reviews arrive hidden — approve, hide or feature from the dashboard, so nothing goes public without your click.
- Embeddable widget — One script tag, shadow-DOM isolated, in grid or carousel with light, dark or auto theme and a custom accent color.
- XSS-safe by construction — Review text renders as text nodes only; the widget never assigns innerHTML.
- Aggregate star badge — Average and count in the widget header, plus a badge.json endpoint for custom integrations.
- Filters — Minimum rating and per-source, set in the saved config or per-page via data attributes.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/review-aggregator-widget
- Lifetime v1 updates
- Setup guide (README quick start)

## Clickmap — Click heatmaps and session replay you own forever.

- **Product title:** Clickmap — Click heatmaps and session replay you own forever.
- **Price:** $49 one-time
- **Tagline:** Click heatmaps and session replay you own forever.

**Description:**

Hotjar starts at $39/mo and prices per session — the moment you go viral, your analytics tool becomes your biggest bill. Clickmap drops one script tag on your site and stores everything in your own SQLite file on your own box. $49, once, unlimited sessions.

- One-tag install — Drop a single defer script tag with your site key and start collecting.
- Click heatmaps — Click density on a proportional page canvas, per URL, filterable by device and date range, with a most-clicked elements list.
- Scroll-depth chart — See what percentage of visitors reach each 10% fold of the page.
- Session recordings — Lightweight click/cursor/scroll event stream with a replay player: play/pause, scrubbing, 0.5-4x speed.
- Rage-click detection — Three-plus clicks in the same spot within a second auto-flags the session; filter recordings to rage sessions only.
- Input recording is impossible — The tracker has no code path that reads input values or keystrokes — the capability does not exist, so it cannot be misconfigured.
- DNT/GPC respected twice — The tracker no-ops when Do Not Track or Global Privacy Control is set, and the server drops flagged payloads anyway.
- Compressed storage — Session event streams are gzipped in SQLite to keep data volume down.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/heatmap-session-recorder
- Lifetime v1 updates
- Setup guide (README quick start)

## Splitpoint — A/B testing and feature flags you own forever.

- **Product title:** Splitpoint — A/B testing and feature flags you own forever.
- **Price:** $49 one-time
- **Tagline:** A/B testing and feature flags you own forever.

**Description:**

VWO is $199/mo and Optimizely is talk-to-sales — both meter your traffic and keep your results in their cloud. Splitpoint defines experiments, assigns visitors with a tiny SDK and reads significance with a proper two-proportion z-test, all on your own server. $49, once.

- Experiments — Control plus N variants, weighted traffic split, holdout percentage, and URL/device targeting.
- Goals two ways — A JS track() call, or automatic conversion when a visitor hits a matching pageview URL.
- Tiny SDK — Vanilla JS under 3KB, no dependencies, never touches the DOM; assignments stick via deterministic hashing and localStorage so there is no flicker.
- React hook wrapper — An included hook for wiring code-level tests directly into your components.
- Results that mean something — Visitors, conversions and CR per variant with 95% CI, relative lift, a z-test p-value and a declare-winner workflow.
- Feature-flag mode — Boolean flags with percentage rollout on the same deterministic hashing, for gradual releases with zero extra setup.
- Mutual exclusion groups — Experiments sharing a group never run on the same visitor, so overlapping tests do not contaminate each other.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/ab-testing-tool
- Lifetime v1 updates
- Setup guide (README quick start)

## Hirestack — The hiring pipeline a small company actually needs.

- **Product title:** Hirestack — The hiring pipeline a small company actually needs.
- **Price:** $49 one-time
- **Tagline:** The hiring pipeline a small company actually needs.

**Description:**

Greenhouse and BambooHR ATS add-ons run hundreds per month on annual contracts, priced for 200-person companies. Hirestack is the kanban board and resume folder a 5-20 person company actually needs — post jobs, get an instant careers page, and drag candidates through a pipeline. $49, once.

- Job postings — Title, description, location and type; each gets a clean public URL the moment you publish.
- Public careers page — Auto-generated at /careers, brandable, server-rendered and fully HTML-escaped.
- Application form — Name, email, phone, cover letter and a resume upload with a 10MB cap and file-type validation.
- Pipeline kanban — Drag candidate cards between applied, screening, interview, offer, hired and rejected.
- Candidate profiles — Resume download, star rating, tags, cover letter and full history in one place.
- Notes and email log — Multi-user notes plus a paste-in email thread log per candidate.
- Interview scorecards — A simple rubric: criteria rated 1-5 with comments, per interviewer.
- Cross-job search — Filter every candidate you have ever had by text, stage, tag or minimum rating.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/applicant-tracker
- Lifetime v1 updates
- Setup guide (README quick start)

## Shiftly — Employee shift scheduling you own forever.

- **Product title:** Shiftly — Employee shift scheduling you own forever.
- **Price:** $29 one-time
- **Tagline:** Employee shift scheduling you own forever.

**Description:**

When I Work is $2.50 per user per month and Deputy starts at $4.50 — for 20 employees that is $600 to over $1,000 a year, forever. Shiftly is the useful 90% of both: a drag-drop weekly calendar, swaps, open shifts and a live labor-cost estimate on your own server. $29, once.

- Drag-drop weekly schedule — Drag shifts between employees and days; shift templates like Morning or Close fill a week in two clicks.
- Availability and time off — Weekly windows and approved time off, with unavailable, time-off and double-booked conflicts flagged red on the grid.
- Shift swaps — Employee-to-employee swap requests with manager approval; approving reassigns the shift instantly.
- Open-shift pickup board — Post unfilled shifts and assign a claimer in one click.
- Labor cost estimate — Hourly rate times scheduled hours per employee and week, with an over-budget warning, all in integer cents.
- Publish and notify — Publish a week and affected employees get notified (email optional via your SMTP), plus CSV export and a print-friendly view.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/shift-scheduler
- Lifetime v1 updates
- Setup guide (README quick start)

## Rampcheck — New-hire onboarding you own forever.

- **Product title:** Rampcheck — New-hire onboarding you own forever.
- **Price:** $29 one-time
- **Tagline:** New-hire onboarding you own forever.

**Description:**

Trainual is $99/mo — over $1,188 a year, forever, and more than $3,500 by year three. Rampcheck is the core of it self-hosted: role-based checklists, an SOP library, a private portal for every new hire, quizzes and a manager dashboard. $29, once — still $29 in year three.

- Checklist templates per role — Multi-step onboarding across day 1 / week 1 / month 1, each step with a due-day offset, assignable to a hire in one click.
- New-hire portal — Every hire gets a private tokenized link with their checklist, progress bar, linked docs and self check-off — no account needed.
- Content library — SOPs and policies as rich HTML docs with optional video links, organized by category and linked from checklist steps.
- Quiz steps — Multiple-choice checks with a pass threshold; the step only completes on a passing score, and answers never leak to the portal payload.
- Manager dashboard — All active onboardings, overdue-step alerts, completion-rate reporting and per-step manager verification.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/onboarding-checklist
- Lifetime v1 updates
- Setup guide (README quick start)

## Punchcard — Time tracking and timesheet approval you own forever.

- **Product title:** Punchcard — Time tracking and timesheet approval you own forever.
- **Price:** $29 one-time
- **Tagline:** Time tracking and timesheet approval you own forever.

**Description:**

QuickBooks Time is $10+ per user per month plus a base fee — for 10 employees that is over $1,200 a year, forever, and your wage data lives in their cloud. Punchcard is the core of it self-hosted: clock in/out with breaks, a PIN kiosk, audited timesheets, an approval queue and payroll CSV export. $29, once.

- Clock in / out / break — One-click punch board per employee; daily hours computed from punch pairs with breaks deducted.
- PIN kiosk mode — A big-button PIN pad at /kiosk for a shared tablet or front desk; one tap toggles in/out, no admin session, disable it in settings.
- Weekly timesheets — Hours by day with punch-level detail; edits require an audit note recording who changed what and why, in integer cents.
- Approval queue — Submit, then approve or reject with a comment (required on reject), bulk approve, full decision audit trail.
- Overtime flagging — Configurable weekly threshold (default 40h) and multiplier (default 1.5x), highlighted everywhere OT appears.
- Payroll CSV export — Employee, period, regular hours, OT hours and pay, formatted for common payroll imports.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/timesheet-approval
- Lifetime v1 updates
- Setup guide (README quick start)

## Ledgerlite Home — Envelope budgeting that lives on your computer, not a…

- **Product title:** Ledgerlite Home — Envelope budgeting that lives on your computer, not a…
- **Price:** $15 one-time
- **Tagline:** Envelope budgeting that lives on your computer, not a server you rent.

**Description:**

YNAB is $14.99/mo — $99 or more a year, forever — for envelope math on top of your transactions that does not need a server, a login or a rent payment. Ledgerlite Home does the same job locally: zero-based budgets, CSV imports and a net-worth tracker, all in a SQLite file on your own machine. $15, once.

- Zero-based budget — Assign every dollar of monthly income to a category envelope, with Income / Assigned / To-budget always in the header.
- Rollover envelopes — Per-category toggle to reset monthly or carry unspent funds forward for sinking funds like Vacation or Car Repairs.
- CSV bank import — Fast manual entry plus CSV import of any bank export.
- Map columns once — Ledgerlite fingerprints each bank's header format and remembers your date/payee/amount mapping for next time.
- Payee rules — Rules like payee contains KROGER to Groceries apply automatically on every import, creatable inline while editing a transaction.
- Over-budget warnings — Envelopes turn red the moment available drops below zero.
- Reports — Stacked spend-by-category bars for the last 6 months.
- Net worth — Manual account balances with debts negative and a snapshot line chart over time.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/budget-planner-personal
- Lifetime v1 updates
- Setup guide (README quick start)

## Lessonforge — The course platform you own forever — no monthly fee, no cut…

- **Product title:** Lessonforge — The course platform you own forever — no monthly fee, no cut…
- **Price:** $49 one-time
- **Tagline:** The course platform you own forever — no monthly fee, no cut of your sales.

**Description:**

Teachable charges $39 or more a month and still takes a transaction fee on your sales — $468 to $1,428 a year, forever. Lessonforge takes neither. It's $49 once, runs on your $5 VPS or your desktop, and paid enrollments go through your own Stripe account at Stripe's standard rates with zero platform cut.

- Courses, modules, lessons — Video via YouTube/Vimeo embed or self-hosted upload up to 500MB, rich-text lessons, downloadable attachments, reorder everything.
- Three enrollment paths — Add a student manually, let them self-serve with a per-course access code, or take paid enrollment via your own Stripe Checkout.
- Progress and certificates — Mark-complete per lesson with a live completion percentage, and a PDF certificate generated the moment a student hits 100%.
- Quizzes per module — Multiple-choice and true/false with a configurable pass threshold and unlimited retakes; correct answers are never sent to the browser.
- Instructor dashboard — Enrollment counts, average completion, completion rate and revenue per course.
- Two separate auth realms — Instructor password from env plus student email/password accounts with scrypt-hashed passwords and fully separate sessions.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/course-builder-lms
- Lifetime v1 updates
- Setup guide (README quick start)

## Quizcraft — Lead-gen quizzes you own — never metered per response.

- **Product title:** Quizcraft — Lead-gen quizzes you own — never metered per response.
- **Price:** $29 one-time
- **Tagline:** Lead-gen quizzes you own — never metered per response.

**Description:**

Typeform starts at $25 a month and meters your responses; Outgrow starts at $14 and scales up fast with volume. That's $300 a year and climbing to run a quiz. Quizcraft is $29 once, with unlimited quizzes and unlimited responses, because it runs on your server.

- One-question-per-screen builder — Multiple choice, image choice, rating and text questions in a clean flow you can reorder freely.
- Conditional branching — If answer = X, jump to question Y rules resolved server-side so the logic cannot be tampered with.
- Scoring and result buckets — Per-option points with score-range or answer-mapped results; points and criteria never reach the browser.
- Lead-gen gate — Optionally require an email before revealing the result — the quiz-as-lead-magnet pattern without per-lead pricing.
- Analytics and CSV export — Views, submissions, per-question drop-off funnel and captured emails, exported as CSV with formula-injection protection.
- Three embed modes — Full-page link, inline iframe via one script tag, or a popup trigger, with auto-resizing via postMessage.
- XSS-safe by construction — Quiz content is delivered as JSON and rendered as React text nodes; the server never injects user content into HTML.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/quiz-builder
- Lifetime v1 updates
- Setup guide (README quick start)

## Forumly — Your community, your server — forums existed before SaaS pricing did.

- **Product title:** Forumly — Your community, your server — forums existed before SaaS pricing did.
- **Price:** $39 one-time
- **Tagline:** Your community, your server — forums existed before SaaS pricing did.

**Description:**

Circle is $89 or more a month — over $1,068 a year — for a community suite where the part your members actually open daily is the discussion board. Forumly is that board, done properly. $39 once, on a $5 VPS with Docker or as a desktop app, all of it in one SQLite file you can back up with a copy-paste.

- Categories, threads, replies — One-level nesting for readability, thread pinning and locking, and new-since-your-last-visit indicators.
- Reactions — A six-emoji reaction set with toggling and per-member state.
- Member profiles — Avatar or generated initials, bio, join date, post count and a manual-award badge system.
- Notifications — Reply-to-your-thread and @mention notifications with an unread bell (email digest is a stub — wire your own SMTP).
- Search — Across thread titles and post bodies, with snippets.
- Moderator tools — Pin, lock, delete any post or thread, ban members, award badges and manage categories behind a separate admin password.
- Spam defense on every write — A hidden honeypot that gives bots a fake success, a minimum time-to-post, and a per-IP sliding-window rate limit, all tunable via env.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/community-forum
- Lifetime v1 updates
- Setup guide (README quick start)

## Roster — The member directory you buy once and own forever.

- **Product title:** Roster — The member directory you buy once and own forever.
- **Price:** $19 one-time
- **Tagline:** The member directory you buy once and own forever.

**Description:**

Membership platforms like Glue Up charge hundreds of dollars a month — around $1,500 a year — to host what is, at its core, a searchable list of your members. Roster is $19 once, runs on a $5 VPS or your own desktop, and your member data never leaves a machine you control.

- Member profiles — Photo, contact info, bio, status (active / pending / lapsed), and join and renewal dates.
- Custom fields per organization — Text, select or URL fields that appear on cards, in the table, in search and in CSV round-trips.
- Real search and filtering — Full-text search across names, emails, bios and every custom field, with filters by status, chapter or exact value.
- Chapters — Sub-listings for multi-chapter orgs with member counts, auto-created on CSV import.
- Bulk CSV import/export — A quoted-field-safe parser where unknown columns become custom fields and existing emails update instead of duplicating.
- Magic-link self-serve editing — Members request a link by email and edit their own profile, but can never touch their status, renewal date or chapter.
- Renewal tracking — See everyone due in the next N days and send reminders via optional SMTP (a safe no-op without it).

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/member-directory
- Lifetime v1 updates
- Setup guide (README quick start)

## Eventcraft — Event registration and ticketing you buy once — with zero…

- **Product title:** Eventcraft — Event registration and ticketing you buy once — with zero…
- **Price:** $39 one-time
- **Tagline:** Event registration and ticketing you buy once — with zero per-ticket fees.

**Description:**

Eventbrite charges 2.7% plus $0.79 per ticket, on every ticket, forever. Sell 500 tickets at $20 and that's roughly $665 in fees for one event. Eventcraft is $39 once — after your first event it's already the cheapest ticketing stack you'll ever run, and it never touches the funds or takes a cut.

- Event pages — Title, rich description, date and time, venue or virtual link, cover image and a shareable clean URL.
- Ticket tiers — Free or paid, quantity limits and early-bird pricing windows, with all money handled as integer cents to avoid rounding bugs.
- BYO Stripe Payment Link — Paste your own Payment Link per tier; attendees pay Stripe's standard rate and only Stripe's rate, with zero API calls to any payment provider.
- QR-code tickets — Generated server-side, emailed on confirmation via optional SMTP, and always viewable at a private ticket URL.
- Door check-in mode — An in-browser webcam scanner with duplicate-scan detection, a live checked-in counter and a manual code fallback.
- Capacity and waitlist — Sold-out tiers auto-waitlist, and cancelling a confirmed seat auto-promotes the earliest waitlister and emails their ticket.
- Add to calendar — Spec-correct RFC 5545 .ics files with proper escaping and line folding.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/event-registration
- Lifetime v1 updates
- Setup guide (README quick start)

## Mockcraft — The product mockup generator you buy once and own forever.

- **Product title:** Mockcraft — The product mockup generator you buy once and own forever.
- **Price:** $19 one-time
- **Tagline:** The product mockup generator you buy once and own forever.

**Description:**

Placeit charges $14.95 a month, forever — about $179 a year — to drag your image onto a stock photo of a phone. Mockcraft is $19 once and runs entirely on your machine. Your mockups are not a subscription.

- 12 bundled templates — Devices (phone, laptop, tablet, browser), apparel (t-shirt, hoodie) and print (business card, framed poster, book cover, sticker).
- Real perspective placement — Angled scenes use a full homography transform with bilinear sampling, so your design sits on the surface like it was photographed there.
- Placement controls — Scale, X/Y offset, rotation and cover/contain/stretch fit modes, all live-previewed as you drag the sliders.
- Garment color variants — Eight swatches swap the shirt or hoodie color instantly, with the design multiply-shaded into the fabric so it looks printed.
- Batch mode — Check any set of templates and export your design across all of them in one pass into a folder you pick.
- Full-resolution PNG export — Every template exports at its full scene resolution of 1600 to 1920px wide, with a true alpha channel on transparent templates.
- Extensible template pack — Every scene is vector-defined in one spec file — add an object and you have added a template, no bitmap assets to license.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/mockup-generator
- Lifetime v1 updates
- Setup guide (README quick start)

## Postcraft Templates — Turn a spreadsheet into a quarter of on-brand posts —…

- **Product title:** Postcraft Templates — Turn a spreadsheet into a quarter of on-brand posts —…
- **Price:** $19 one-time
- **Tagline:** Turn a spreadsheet into a quarter of on-brand posts — bought once.

**Description:**

Canva Pro is $12.99 a month, forever — $156 a year — and you still make one design at a time. Postcraft Templates is deliberately not another Canva: it's a batch machine that turns a content calendar into finished graphics. $19 once, 100% local, and it makes twenty posts from a spreadsheet.

- Card presets — Quote, headline, stat, testimonial and image+headline cards, with every zone defined fractionally so one template renders at every size.
- Locked brand kit — Background, panel, accent and text colors, font family and logo set once and applied to every graphic.
- CSV batch generation — Columns for headline, subtext, attribution and image, parsed by a zero-dependency RFC 4180 parser that handles quoted commas and newlines.
- Auto-fit text — A shrink-to-fit engine wraps and scales long headlines so nothing ever overflows or clips.
- Multi-size export in one pass — IG post, IG story, Facebook, X and LinkedIn sizes from one template in a single export.
- Live preview grid — See the first dozen graphics re-render as you tweak brand colors.
- Headless CLI — An npm run batch command drives the pure-Node render pipeline for automation, no window needed.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/social-media-graphics-templates
- Lifetime v1 updates
- Setup guide (README quick start)

## Slidecraft — The auto-layout deck builder you buy once.

- **Product title:** Slidecraft — The auto-layout deck builder you buy once.
- **Price:** $29 one-time
- **Tagline:** The auto-layout deck builder you buy once.

**Description:**

Beautiful.ai charges $12-40 a month, forever, for auto-layout slides. The auto-layout logic is the whole product, and your decks live in their cloud. Slidecraft does the same reflow trick entirely on your machine, for $29 once.

- Content-aware smart layouts — Title, bullet list, two-column, image+text, chart, quote and agenda layouts recompute font sizes, columns and spacing automatically so nothing overflows or overlaps.
- Theme system — 5 palettes plus font pairings apply globally and carry zero geometry, so swapping a theme never breaks a layout.
- Native charts — Bar, line and pie charts from typed-in data render as vectors in the editor and PDF, and export as real editable PowerPoint charts, not screenshots.
- Speaker notes + presenter mode — Full-screen presenting with next-slide preview, a notes pane, an elapsed timer and keyboard navigation.
- Real exports — .pptx via pptxgenjs opens in PowerPoint, Keynote or Google Slides, and 16:9 vector .pdf via pdfkit, both running headless in pure Node.
- Own your files — Decks are plain-JSON .slidecraft files you can version in git if you like.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/presentation-builder
- Lifetime v1 updates
- Setup guide (README quick start)

## Redirectly — Bulk 301/302 redirect management you own forever.

- **Product title:** Redirectly — Bulk 301/302 redirect management you own forever.
- **Price:** $24 one-time
- **Tagline:** Bulk 301/302 redirect management you own forever.

**Description:**

Rebrandly gates real redirect features behind $29+/month tiers, with rules plan-capped and everything in their cloud. Redirectly is the same job self-hosted: it runs as the actual redirect layer or exports rules for nginx and Cloudflare. $24, once.

- Exact, wildcard and regex rules — 301, 302 or 307 status codes with $1 to $9 capture substitution and active/inactive toggles.
- Bulk CSV import/export — Dump hundreds of old-URL to new-URL mappings straight from a migration spreadsheet.
- Hit tracking per rule — Count, last hit and last referrer show which old URLs still get traffic, and tracking soft-fails so it can never break a redirect.
- 404 rescue — Unmatched paths are logged with counts so you can convert a high-traffic 404 into a redirect rule in one click.
- UTM / query passthrough — Incoming ?utm_* params merge into the target URL via a per-rule toggle.
- Edge exports — Export nginx location/rewrite config or Cloudflare Bulk Redirects JSON if you would rather run rules at the edge.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/redirect-manager
- Lifetime v1 updates
- Setup guide (README quick start)

## Clientdesk — Revenue analytics and a customer portal on your own Stripe data.

- **Product title:** Clientdesk — Revenue analytics and a customer portal on your own Stripe data.
- **Price:** $39 one-time
- **Tagline:** Revenue analytics and a customer portal on your own Stripe data.

**Description:**

ChartMogul and Baremetrics charge $50-100+/month to read the Stripe data you already receive, and it all lives in their cloud. Clientdesk computes the same metrics from your own webhook feed and adds a branded customer portal. $39, once.

- Revenue dashboard — MRR with trials excluded and yearly plans normalized, plus ARR, 30-day churn, LTV, ARPU and cash collected, with daily snapshots building trend history.
- Stripe webhook ingestion — Point /webhooks/stripe at your account and customers, subscriptions and invoices cache locally, with optional signature verification and no Stripe SDK or API polling.
- Customer portal — Per-customer tokenized portal links show plan, status, invoice history and usage bars, with strict isolation so a token only ever sees its own data.
- Usage metering — Your backend POSTs /api/usage with an ingest key and customers see how much of their allowance they have used next to their bill.
- Branded receipt emails — Optional SMTP sends payment-received and payment-failed notices in your name and color, and soft-fails so email problems never break webhooks.
- Manual mode — No Stripe? Manage customers and invoices by hand and all the analytics still work.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/customer-portal-billing
- Lifetime v1 updates
- Setup guide (README quick start)

## Pulsecheck — NPS, CSAT and CES surveys you own forever.

- **Product title:** Pulsecheck — NPS, CSAT and CES surveys you own forever.
- **Price:** $29 one-time
- **Tagline:** NPS, CSAT and CES surveys you own forever.

**Description:**

Delighted charges $224 a month to ask your customers one question and store the answers in their cloud. Pulsecheck does the same NPS, CSAT and CES capture on your own server, with detractor alerts and per-segment breakdowns. $29, once. It is subtraction.

- Three survey types — NPS (0-10), CSAT (1-5) and CES (1-7), each with correct documented score math (NPS = %promoters minus %detractors, ranged -100 to 100).
- Three delivery channels — A standalone survey link, personalized email sends via your own SMTP, and an embeddable widget script.
- One response per recipient — Email-keyed dedupe at the database level means a second submit gets a friendly already-responded message.
- Detractor alerts — A Slack-ready webhook and/or email fire instantly on low scores, and soft-fail so they never block response capture.
- Dashboard — Score trend over time, the promoter/passive/detractor split, and a response feed with comments.
- Segments — Pass tags like plan:pro with responses and get per-segment NPS breakdowns.
- XSS-safe by construction — The public survey page escapes every user-controlled string and the widget renders via textContent only.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/nps-survey-tool
- Lifetime v1 updates
- Setup guide (README quick start)

## Billoop — Recurring billing on your own Stripe, owned forever.

- **Product title:** Billoop — Recurring billing on your own Stripe, owned forever.
- **Price:** $49 one-time
- **Tagline:** Recurring billing on your own Stripe, owned forever.

**Description:**

Chargebee charges you again, on top of Stripe's fees and a cut of your revenue, to manage subscriptions Stripe already tracks. Billoop is a self-hosted subscription layer for your own Stripe account with proration, dunning and churn analytics. $49, once, no fee on your revenue.

- BYO Stripe (optional) — Drop in your own API key and plans become Stripe products, customers sync and the portal wraps Stripe's billing portal; without a key it runs the full engine in local mode, and it never touches funds.
- Plans, trials, coupons — Monthly and yearly plans, trial periods and percent or amount coupons (once or forever), all in integer cents, never floats.
- Real proration — Mid-cycle plan changes credit the unused fraction of the old plan and charge the same fraction of the new one as explicit line items, covered by exact-figure tests.
- Dunning that finishes — A failed payment triggers a templated email sequence at +0/+3/+7 days, then auto-cancels or auto-pauses after N attempts, and every send is logged.
- Renewal sweep — Runs hourly or on demand to handle trial conversions, renewals with correct coupon semantics and cancel-at-period-end.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/recurring-billing-mini
- Lifetime v1 updates
- Setup guide (README quick start)

## Askback — More Google reviews on autopilot, owned forever.

- **Product title:** Askback — More Google reviews on autopilot, owned forever.
- **Price:** $34 one-time
- **Tagline:** More Google reviews on autopilot, owned forever.

**Description:**

Podium charges $289+ a month, on an annual contract, for the review engine most customers actually buy it for. Askback is that engine as a tool you own, running on your own $5 VPS or desktop with your own Twilio and SMTP credentials. $34, once.

- SMS + email review requests — Bring your own Twilio and/or SMTP so you pay Twilio's roughly $0.008/SMS directly instead of a platform markup, on your own sender reputation.
- Smart routing — 4-5 star ratings go to your Google review page with click-through tracked, while 1-3 star ratings go to a private feedback form in your inbox.
- Customer import — Add customers manually or import a CSV from your booking or invoicing tool, with common header aliases accepted.
- Templates with merge fields — Separate initial and follow-up templates per channel using name, business, link and job-ref placeholders.
- Automatic follow-up — One polite reminder after N days if there is no response, never more than one, guaranteed at the database level.
- STOP opt-out honored — An inbound Twilio webhook handles STOP/START, and opted-out numbers are never messaged again.
- Dry-run mode — DRY_RUN=1 runs the whole pipeline of render, queue and log without sending anything so you can test templates safely.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/review-request-automator
- Lifetime v1 updates
- Setup guide (README quick start)

## Citewatch — One NAP, everywhere, always, owned forever.

- **Product title:** Citewatch — One NAP, everywhere, always, owned forever.
- **Price:** $34 one-time
- **Tagline:** One NAP, everywhere, always, owned forever.

**Description:**

BrightLocal charges $39-59 a month to remind you your Yelp listing has the wrong suite number. Citewatch is that citation-tracking core as a tool you own: set your canonical NAP once, then audit what every directory actually shows. $34, once.

- Canonical NAP profile — Name, address, phone, website and hours as the single source of truth, with multiple businesses supported.
- Structured audit workflow — 11 seeded core and industry directories plus your own custom ones: open the directory, paste what it shows, done.
- Smart diffing — Normalizes phone formats, case, punctuation and USPS abbreviations so it flags only real problems as match, formatting only, incomplete or mismatch.
- Auto fix-tasks — A genuine mismatch files a fix task with the exact wrong values and a deep link to the edit page, and re-auditing clean closes the task itself.
- Recheck reminders — A per-listing recheck interval (default 30 days) flags overdue audits.
- Optional Google Places auto-pull — Set GOOGLE_PLACES_API_KEY to pull your Google Business Profile listing automatically; every other directory is a deliberate manual audit with no scraping to break.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/local-seo-citation-tracker
- Lifetime v1 updates
- Setup guide (README quick start)

## Syncvault — Encrypted backups to storage you already own — no Backblaze…

- **Product title:** Syncvault — Encrypted backups to storage you already own — no Backblaze…
- **Price:** $29 one-time
- **Tagline:** Encrypted backups to storage you already own — no Backblaze subscription on top.

**Description:**

Backblaze Personal is $9 a month, forever, for backups that live on their cloud. Syncvault watches your folders, encrypts everything on your machine with AES-256-GCM, and pushes versioned, deduplicated backups to storage you already pay for. $29, once. Your recurring cost is your storage provider's bytes (~$6/TB/mo on B2), not a software subscription stacked on top.

- Client-side AES-256-GCM — Key is derived from your passphrase with scrypt, never uploaded and never stored in plaintext.
- Content-addressed dedupe — Objects are keyed by SHA-256 of content, so identical or unchanged files upload exactly once.
- Point-in-time versioning — Keep the last N versions of every file and browse the backed-up tree as of any point in time to restore.
- BYO destinations — Any S3-compatible endpoint (AWS, B2, Wasabi, R2, MinIO) or a plain local/network folder, mixed per folder.
- Per-folder scheduling — Manual, continuous, hourly or daily per folder, with deletion tombstones that track removed files without losing history.
- 100% local index — A SQLite index lives on your machine with zero telemetry and no accounts.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/data-backup-cloud-sync
- Lifetime v1 updates
- Setup guide (README quick start)

## Voicebox — A self-hosted feedback board and public roadmap on your own box.

- **Product title:** Voicebox — A self-hosted feedback board and public roadmap on your own box.
- **Price:** $34 one-time
- **Tagline:** A self-hosted feedback board and public roadmap on your own box.

**Description:**

Canny charges $50+ a month to host an upvote button and a board of your own users' ideas. Voicebox is that same board and public roadmap, running on your box, forever. $34, once. Your data is a SQLite file you own, not a plan-capped seat on someone else's cloud.

- Public board — Anyone submits ideas and upvotes with one vote per visitor, plus comment threads on every idea.
- Spam defense built in — Per-IP rate limits on submissions, votes and comments, with vote dedupe enforced by a database UNIQUE constraint.
- Status workflow — Open, planned, in progress, shipped and declined-with-reason, with illegal jumps rejected so the roadmap stays true.
- Public roadmap — Kanban columns for Planned, In progress and Shipped, auto-populated from idea statuses and sorted by votes.
- Moderation — Merge duplicates so votes union and comments move, pin official replies, flag comments and delete.
- Embeddable widget — A one-line script adds a floating Feedback launcher to your app, and /embed serves a compact server-rendered board.
- 100% local — SQLite storage, no accounts required for voters, and no telemetry.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/feedback-roadmap-voting
- Lifetime v1 updates
- Setup guide (README quick start)

## Quotewell — Build a price catalog once and turn out branded PDF quotes offline.

- **Product title:** Quotewell — Build a price catalog once and turn out branded PDF quotes offline.
- **Price:** $29 one-time
- **Tagline:** Build a price catalog once and turn out branded PDF quotes offline.

**Description:**

PandaDoc and Proposify run $19–$49 per user per month, forever, for a document-automation platform you didn't ask for. Quotewell is a fast local quote builder that puts a total at the bottom of a branded page and nothing between you and it. $29, once. Everything lives in a SQLite file on your machine — no accounts, no cloud, no per-seat pricing.

- Price catalog — Save your services and materials with default price, unit and description — build it once, quote fast forever.
- Line-item builder — Pull items from the catalog or add one-offs, with fractional quantities, per-line and quote-level discounts, tax and live totals.
- Optional / alternate lines — Show upsells and alternates on the quote, priced but excluded from the total.
- Exact money math — Every amount is stored and computed in integer cents, so there is no floating-point drift ever.
- Templates and branding — Cover note and terms boilerplate saved per business, plus logo and accent color, selectable per quote.
- Branded PDF export — One click via the built-in renderer, with no watermarks.
- Quote history and pipeline — Duplicate a past quote in one click and track won / lost / sent / draft status to see your open pipeline.
- 100% local and private — SQLite on your disk that works offline with no telemetry.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/quote-estimator
- Lifetime v1 updates
- Setup guide (README quick start)

## Snapreceipt — Scan receipts with local OCR and export tax-ready reports —…

- **Product title:** Snapreceipt — Scan receipts with local OCR and export tax-ready reports —…
- **Price:** $19 one-time
- **Tagline:** Scan receipts with local OCR and export tax-ready reports — nothing uploaded.

**Description:**

Expensify is $5–$9 per user every month, forever, and your receipts live on their servers. Snapreceipt reads receipts with OCR that runs entirely on your machine, prefills the vendor, date, total and tax, and lets you review before anything saves. $19, once. No image or text ever leaves your machine.

- Import anything — Drag and drop images, use the file picker, or point a watched folder at your phone-sync directory to land photos in a review inbox.
- Local OCR auto-extract — tesseract.js runs entirely on-disk to pull vendor, date, total and tax as an editable prefill you review before saving.
- Categories + project tags — A bundled category list plus your own, with free-form project and client tags for billable-expense tracking.
- Reports — Spend by category and by month, filterable, with all math in exact integer cents.
- Exports — RFC 4180 CSV for your accountant and a PDF expense report with receipt thumbnails embedded.
- Mileage log — Date, purpose, miles and a configurable cents-per-mile rate, with reimbursement auto-calculated to the cent.
- Private by design — SQLite file on your disk, receipt images copied into your app data folder, and zero network calls at runtime.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/receipt-scanner-expense
- Lifetime v1 updates
- Setup guide (README quick start)

## Listcraft — A self-hosted property listing website — your listings, your…

- **Product title:** Listcraft — A self-hosted property listing website — your listings, your…
- **Price:** $39 one-time
- **Tagline:** A self-hosted property listing website — your listings, your domain, no…

**Description:**

IDX website providers charge $50–300+ a month, forever, to host your photos and a contact form — and if you cancel, the site and its SEO disappear. Listcraft is a self-hosted listing website for independent agents and small brokerages. $39, once. Your data is a SQLite file plus photos on your own disk, and your leads come straight to you.

- Listings — Address, price, beds/baths/sqft, description and active/pending/sold status on premium dark-mode cards.
- Photo galleries — Multi-upload with drag-to-reorder, first photo as the cover, stored on your own disk.
- Local maps — Leaflet and OpenStreetMap bundled locally with no CDN, showing pins on search and every listing.
- MLS-style search — Price range, beds, baths, status, text search and sorting, with a live map of results.
- Lead capture — A request-a-showing form on every listing lands in your leads inbox with optional SMTP email notification.
- Agent profiles — Multi-agent brokerages get a profile page per agent listing their properties.
- Simple CMS — About page, market updates and neighborhood guides in markdown with publish/unpublish.
- 100% yours — One Node process, one SQLite file and images on local disk, with no telemetry and no required external services.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/property-listing-site
- Lifetime v1 updates
- Setup guide (README quick start)

## Menuly — QR menus you own forever — update a price and the guest sees it the…

- **Product title:** Menuly — QR menus you own forever — update a price and the guest sees it the…
- **Price:** $24 one-time
- **Tagline:** QR menus you own forever — update a price and the guest sees it the instant…

**Description:**

Toast and other QR-menu SaaS charge $29+ a month, forever, with per-location fees and your menu held hostage in their cloud. Menuly builds your menu in a drag-and-drop editor and serves a fast, phone-first menu page from your own server. $24, once. Change a price or 86 a dish and it updates the instant a guest scans.

- Menu builder — Categories and items with name, description, photo and dietary tags, all drag-to-reorder.
- Server-rendered menu page — Pure HTML with inline critical CSS and no JS bundle, so it loads instantly on any phone with sticky category nav.
- 86 it in one click — Toggle an item out of stock and it vanishes from the live menu immediately, toggle back when the kitchen restocks.
- Specials section — Mark items as specials and flip one switch to show a Today's Specials section at the top of the menu.
- Branding per venue — Dark or light theme, accent color, logo and tagline, all respected on the public page.
- QR + printable table tent — A locally-generated QR PNG with no external APIs, plus a fold-ready US-Letter table-tent PDF.
- Multi-location — One admin managing many venues, each with its own slug, QR and branding, with one-click menu copying between them.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/restaurant-menu-qr
- Lifetime v1 updates
- Setup guide (README quick start)

## Remindly — SMS and email appointment reminders on your own Twilio account —…

- **Product title:** Remindly — SMS and email appointment reminders on your own Twilio account —…
- **Price:** $34 one-time
- **Tagline:** SMS and email appointment reminders on your own Twilio account — no SaaS markup.

**Description:**

SimpleTexting starts at $29 a month, forever, for 500 credits on top of effectively the same carrier network you're already paying for. Remindly sends templated reminders through your own Twilio account, so the metered SMS cost stays on your bill at carrier-ish rates and is never marked up. $34, once. A busy shop's reminders cost about $4/mo in real Twilio fees instead of a SaaS markup on them.

- Appointments — Manual entry or CSV import with per-row validation and error reporting.
- Reminder rules — Any offset like 24h, 2h or 15min, by SMS or email, with per-rule templates and merge fields.
- Two-way confirm — Clients reply C to confirm or R to reschedule via the Twilio inbound webhook, with confirmed / pending / no-reply status.
- STOP/START opt-out — Compliant by design — STOP blocks all future sends to that number and is logged, START re-subscribes.
- Quiet hours — Reminders due at 3 AM wait politely until your quiet window ends, deferred and never dropped.
- No-show tracking — Mark appointments showed or no-show and get no-show rate per weekday and per hour-of-day to spot patterns.
- Full send log — Every reminder is logged before dispatch with the rendered message, and duplicates are impossible via a DB unique constraint.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/appointment-reminder-sms
- Lifetime v1 updates
- Setup guide (README quick start)

## Memeforge — Classic meme captioning with a real template library — no…

- **Product title:** Memeforge — Classic meme captioning with a real template library — no…
- **Price:** $15 one-time
- **Tagline:** Classic meme captioning with a real template library — no watermark, no upload.

**Description:**

Imgflip's free tier slaps a watermark on every export and gates batch tools behind a $6.99/month Pro plan. Memeforge does the same captioning job — template library, drag-to-position text, stroke and shadow controls, instant export — locally, with no watermark and no account, for $15 once.

- Built-in template library — Dozens of classic formats ready to caption, plus upload your own base image.
- Drag & resize text boxes — Position, scale and rotate top/bottom or freeform text with live preview.
- Custom fonts & stroke — Impact-style outline by default, swap fonts, adjust stroke width, color and shadow.
- Upload your own image — Any JPG/PNG becomes a base template — not limited to the built-in set.
- Batch export queue — Caption a whole folder of images with the same text layout in one pass.
- Zero watermark — Every export is a clean PNG — nothing added, ever, on any plan.
- Keyboard shortcuts — Nudge, duplicate and cycle text layers without touching the mouse.
- Fully offline — No image is ever uploaded anywhere — captioning happens entirely on your machine.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/meme-generator
- Lifetime v1 updates
- Setup guide (README quick start)

## Orgtree — Build and maintain your org chart without a seat-priced diagram tool.

- **Product title:** Orgtree — Build and maintain your org chart without a seat-priced diagram tool.
- **Price:** $19 one-time
- **Tagline:** Build and maintain your org chart without a seat-priced diagram tool.

**Description:**

Lucidchart charges $7.95/month per editor just to keep an org chart current — and most companies only touch it a handful of times a year. Orgtree imports your team list from a spreadsheet, auto-lays it out, and lets you drag to reassign reporting lines, for $19 once with no seats to manage.

- CSV / spreadsheet import — Paste or upload name, title and manager columns — the chart builds itself.
- Auto-layout engine — Reporting lines position automatically as you add or reassign people.
- Drag to reparent — Move anyone under a new manager by dragging their card — the tree re-flows instantly.
- Department color coding — Color-code by team or department so structure is visible at a glance.
- Photos & avatars — Attach a headshot per person, or fall back to initials.
- PDF & PNG export — Print-ready or presentation-ready output in one click.
- Unlimited people, unlimited charts — No node cap, no per-diagram limit, no per-editor seat.
- Local file storage — Your org structure is a file on your machine — no account, no cloud sync required.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/org-chart-builder
- Lifetime v1 updates
- Setup guide (README quick start)

## Renewcheck — Track every subscription's renewal date without linking your…

- **Product title:** Renewcheck — Track every subscription's renewal date without linking your…
- **Price:** $15 one-time
- **Tagline:** Track every subscription's renewal date without linking your bank account.

**Description:**

Rocket Money charges $6–12/month and requires linking your bank account through Plaid to track subscriptions it could just as easily let you enter by hand. Renewcheck does the tracking, reminders and spend reporting without ever asking for banking credentials — you add subscriptions yourself, and everything stays on your machine, for $15 once.

- Add subscriptions manually — No bank link, no Plaid, no OAuth to a financial account — just name, price and renewal date.
- Renewal countdown & reminders — Native OS notifications before a charge hits, with enough lead time to actually cancel.
- Spend totals — Monthly and yearly totals calculated automatically as you add subscriptions.
- Category breakdown — See spend by category — streaming, software, fitness, whatever you define.
- Price-change history — Log a price bump when it happens and see the trend per subscription over time.
- Free-trial-ending alerts — Mark a subscription as a trial and get reminded before it silently converts to paid.
- CSV export — Full subscription list with dates and amounts, exportable in one click.
- No bank credentials, ever — There's nothing to link and nothing sensitive to leak — it's a local list you maintain.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/subscription-tracker
- Lifetime v1 updates
- Setup guide (README quick start)

## Paletteforge — Generate, lock and export brand color palettes — no account,…

- **Product title:** Paletteforge — Generate, lock and export brand color palettes — no account,…
- **Price:** $15 one-time
- **Tagline:** Generate, lock and export brand color palettes — no account, no export limits.

**Description:**

Coolors' free tier caps exports and gates its palette-from-image and extended-export tools behind a $5.99/month Pro plan. Paletteforge does the generating, locking, contrast-checking and exporting locally — CSS variables, Tailwind config, ASE swatches, PNG — for $15 once.

- Generate & shuffle palettes — Spacebar-driven random palette generation, five colors at a time.
- Lock colors while regenerating — Keep the ones you like, reroll the rest until the palette clicks.
- WCAG contrast checker — Instant AA/AAA pass-fail for any foreground/background pairing in your palette.
- Export to CSS, Tailwind, ASE, PNG — Drop straight into a codebase or design tool — no manual re-typing of hex codes.
- Saved brand kits — Name and keep multiple palettes per project or client.
- Extract palette from an image — Upload a logo or photo and pull its dominant colors automatically.
- Shade & tint ramps — Generate a full 50–900 ramp from any base color for design systems.
- Fully offline — No image or color data is ever uploaded — all generation and extraction runs locally.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/color-palette-brand-kit
- Lifetime v1 updates
- Setup guide (README quick start)

## Iconforge — One image in, every favicon and app-icon size out — batched,…

- **Product title:** Iconforge — One image in, every favicon and app-icon size out — batched,…
- **Price:** $15 one-time
- **Tagline:** One image in, every favicon and app-icon size out — batched, offline, no…

**Description:**

Iconscout's Unlimited plan is $9.99/month just to keep generating icon sets — and every source image still gets uploaded to do it. Iconforge takes one image and outputs the full favicon and app-icon set — ICO, PNG sizes, Apple touch icons, Android adaptive icons, a PWA manifest.json — entirely on your machine, for $15 once.

- Drop one source image — PNG, JPG or SVG in — every required size and format generated automatically.
- Full favicon set — 16×16, 32×32, 48×48 packed into a proper multi-resolution ICO, plus standalone PNGs.
- Apple touch icons — All iOS home-screen sizes generated with correct naming and padding.
- Android adaptive icons — Foreground/background layer support for Android's adaptive icon format.
- PWA manifest.json — A ready-to-use manifest with icon references pre-filled, matching sizes.
- Batch mode — Generate icon sets for multiple apps or projects in one pass.
- Live size preview — See every generated size rendered at actual scale before export.
- Fully offline — No source image is ever uploaded — every size is rendered locally.

Runs as a Windows desktop app.

What's included:
- Full source code (MIT): https://github.com/bensblueprints/icon-favicon-generator
- Lifetime v1 updates
- Setup guide (README quick start)

## FamPing — Real-time family locations and place alerts — without selling your…

- **Product title:** FamPing — Real-time family locations and place alerts — without selling your…
- **Price:** $39 one-time
- **Tagline:** Real-time family locations and place alerts — without selling your location…

**Description:**

Life360's free tier is deliberately crippled to push the $99.99+/year Plus and Platinum plans — and the company has a well-documented history of selling aggregated location data to data brokers. FamPing does the same core job — pings every 5 minutes, named-place arrival/departure alerts, a real-time family map — on a server only you control, with a $39 introductory price locked for the first 1,000 licenses before it moves to $299.

- 5-minute location pings — Every family member's phone reports position automatically to your dashboard.
- Named-place geofences — Mark home, school, work — get an alert the moment someone arrives or leaves, no third party ever sees the address.
- Full-day path per member — The same stop-clustering engine as Door Tracker draws each family member's day as a route with numbered, timed stops.
- Multiple family members, no per-seat fee — Add everyone in the household on one license — Life360 gates member count behind paid tiers.
- Android app for family phones — Simple login, background ping with a visible indicator, battery-friendly interval.
- No data-broker business model — There's no ad network or data-sale revenue stream to fund — the app has no business reason to look at what it collects.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/famping
- Lifetime v1 updates
- Setup guide (README quick start)

## Door Tracker — Prove the route was actually walked — not just driven.

- **Product title:** Door Tracker — Prove the route was actually walked — not just driven.
- **Price:** $49 one-time
- **Tagline:** Prove the route was actually walked — not just driven.

**Description:**

Badger Maps and SalesRabbit bill $58–119 per rep, per month, forever — a 10-rep canvassing team is $7,000+/year before it proves a single door got knocked. Door Tracker runs the same route-verification job on a server you control: every rep's phone pings every 5 minutes, the engine auto-clusters pings into stops, and duration alone tells you drive-by from doorstep. Introductory price is $49 — locked for the first 1,000 licenses, then $299 — and it never meters per rep.

- 5-minute GPS pings — Reps' phones report location automatically in the background — no manual check-ins to forget.
- Auto stop-clustering — A haversine-distance engine groups consecutive pings into stops the moment a rep parks or lingers, with a configurable radius per team.
- Duration bands do the judging — Drive-by (under 30s), likely knock (30s–5min), extended visit (over 5min) — color-coded so a manager sees the shape of the day at a glance.
- Full-day route map — A connected polyline through every ping plus numbered, timestamped stop pins — click any stop for arrival, departure and duration.
- Team overview dashboard — Every rep's time-in-field, stop count and average dwell for the day, one list, click through to any route.

Runs as a Windows desktop app or on any $5 VPS (Docker included).

What's included:
- Full source code (MIT): https://github.com/bensblueprints/door-tracker
- Lifetime v1 updates
- Setup guide (README quick start)
