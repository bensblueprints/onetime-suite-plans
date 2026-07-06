# Vaultkeeper — Image Prompts

**Accent:** `#5EEAD4` · **Repo:** [vaultkeeper](https://github.com/bensblueprints/vaultkeeper) · **Replaces:** SimpleBackups ($29–$99/month) · **Price:** $39 one-time

> **Style block — prepend to every prompt below:**
> Premium dark-mode SaaS product visual, near-black background (#0B0E14), single accent color #5EEAD4 with soft neon glow, high contrast, subtle grid texture, clean modern sans-serif UI, soft shadows, cinematic rim lighting, crisp render, no text unless specified.

## Hero image (16:9)

A massive circular bank-vault door rendered in dark brushed metal, its rim glowing teal #5EEAD4, stands half-open; inside, neat rows of glowing encrypted capsules — each a compressed database backup — are being placed on shelves by beams of light arriving through three pipelines labeled by glyphs: a disk, a bucket, an FTP arrow. Four database cylinders (Postgres elephant hint, dolphin hint, leaf hint, feather hint abstracted as plain glowing cylinders) stream their contents through a gzip-and-lock pipeline toward the vault. Floating UI hint: a job card with a green "success" badge and "next run" time. Cinematic, secure, premium dark.

## Dashboard mockup (16:10)

Stylized screenshot-like render of the Vaultkeeper dashboard: dark UI, teal #5EEAD4 accents. A grid of backup job cards — "prod-postgres · nightly" with a green success badge, "last run 02:00 · 312 MB · 41s" and a size-trend sparkline; "app-mysql · hourly" green; "analytics-mongo · weekly" with a red FAILED badge and an alert icon; "local-sqlite · daily" green — each showing cron schedule chips like "0 3 * * *" and next-run times. Header stats: jobs total, success rate, storage used. Sidebar: Jobs, Destinations, Alerts, Settings; a teal "+ New job" button and a tool-check chip reading "pg_dump found".

## OG / social card (1200×630)

Dark #0B0E14 card with subtle grid texture. "Vaultkeeper" set very large left in clean sans-serif with a soft #5EEAD4 glow. Below in white: "Scheduled, encrypted database backups you actually own." Right side: a glowing teal vault-door glyph with a padlocked backup capsule emerging from it, small chips reading PG, MySQL, Mongo, SQLite orbiting, neon rim light. Bottom-left: rounded badge with exact text "$39 once · no subscription", teal outline.

## Product Hunt gallery (5)

### 1. Dashboard
Dark dashboard of backup job cards: green success badges, one red failed job, last-run and next-run times, backup size-trend sparklines per card, cron chips; #5EEAD4 accents, calm and mission-critical, premium dark UI.

### 2. Job wizard, schedule step
The new-job wizard on its schedule step: preset buttons (hourly, daily, weekly), a cron expression field containing exact text "0 3 * * *", a timezone selector, and a live "Next 3 runs" preview listing three datetimes; teal #5EEAD4 focus states, dark UI.

### 3. Restore helper modal
A restore modal over a dimmed dashboard: a copyable four-line command chain in a code block — download, decrypt via vk-decrypt.js, gunzip, then psql restore — each line with a copy icon; header reading the backup filename ending in ".dump.gz.enc"; teal glow, dark UI.

### 4. Failure alert
A Slack-style dark message card from the webhook: red dot, bold exact text "analytics-mongo backup FAILED", fields for job name and duration, and a monospaced stderr tail excerpt inside the message; Vaultkeeper dashboard blurred behind, #5EEAD4 rim light.

### 5. Comparison table
Pricing graphic, exact text: "SimpleBackups: $348+/yr" in muted white versus "Vaultkeeper: $39 once" glowing #5EEAD4, with a bullet chip reading exact text "your credentials never leave your box"; caption in exact text "One month of theirs buys a lifetime of yours."; dark background, subtle grid, no other text.
