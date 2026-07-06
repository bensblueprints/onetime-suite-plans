# Pingcron — Image Prompts

**Accent:** `#4ADE80` · **Repo:** [pingcron](https://github.com/bensblueprints/pingcron) · **Replaces:** Cronitor ($10/month solo) / Healthchecks.io hosted ($20/month Business) · **Price:** $29 one-time

> **Style block — prepend to every prompt below:**
> Premium dark-mode SaaS product visual, near-black background (#0B0E14), single accent color #4ADE80 with soft neon glow, high contrast, subtle grid texture, clean modern sans-serif UI, soft shadows, cinematic rim lighting, crisp render, no text unless specified.

## Hero image (16:9)

A dark server room fades into abstraction: a single glowing green heartbeat line pulses across the frame like an ECG, each beat a cron job pinging home on time — until one beat is missing, leaving a red gap that triggers a radiating alert ring. Above the line float translucent glass panels from the actual app: a check row with a green "up" status pill, "last ping 3m ago", and a small sparkline of recent pings in #4ADE80. A dead-man's-switch lever glows faintly in the background. Cinematic tension, premium dark aesthetic.

## Dashboard mockup (16:10)

Stylized screenshot-like render of the Pingcron dashboard: dark UI, green #4ADE80 accents, header summary reading "3 up · 1 down". A grid of check cards — "nightly-db-backup" with a red down pill and "last ping 26h ago", "ssl-renew" green up pill with "next expected in 12h", "log-rotate" green with "last ping 3m ago", "weekly-report" amber grace-period pill — each card showing an uptime percentage like "99.2%" and a ping-history sparkline. One card displays a cron expression "0 3 * * *" with timezone tag. Sidebar: Checks, Alerts, Settings; a "+ New check" button glowing green.

## OG / social card (1200×630)

Dark #0B0E14 card with subtle grid texture. "Pingcron" set very large left in clean sans-serif with a soft #4ADE80 glow. Below in white: "Your cron jobs, watched 24/7 — alerts the moment a ping goes missing." Right side: a glowing green heartbeat line with one missed beat highlighted red, above a floating mini check-row panel with a green up pill and sparkline, neon rim light. Bottom-left: rounded badge with exact text "$29 once · no subscription", green outline.

## Product Hunt gallery (5)

### 1. Hero dashboard
Dark dashboard with a grid of cron checks: green up pills, one red down, one amber late, ping sparklines per row, uptime percentages, and a header summary with exact text "3 up · 1 down"; #4ADE80 glow, premium dark UI.

### 2. Check detail
A check detail screen: ping event log rows with timestamps, source IPs, and run durations; above it a highlighted copyable snippet with exact text "curl -fsS https://your-host/ping/TOKEN" in a code block with a copy button; green accents, dark UI.

### 3. Alert in Slack
A Slack-style dark message card rendered from the webhook: red dot, bold exact text "nightly-db-backup is DOWN", fields for last ping time and expected schedule, timestamped from a "Pingcron" bot; the Pingcron dashboard blurred behind it, #4ADE80 rim light.

### 4. Cron editor modal
A new-check modal, dark UI: a cron expression field containing exact text "0 3 * * *", a timezone selector reading "America/Chicago", and a live "Next 3 runs" preview listing three upcoming datetimes; grace period input below, green #4ADE80 focus ring.

### 5. Comparison card
Pricing math graphic, exact text: "Cronitor: $360 over 3 years" in muted white and "Pingcron: $29 once" larger, glowing #4ADE80; beside it a GitHub README snippet showing an embedded green SVG status badge reading "up"; dark background, subtle grid, no other text.
