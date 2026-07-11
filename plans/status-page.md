# Upkeep Status — Build Plan (Batch 11, #52)

## One-liner & positioning
Self-hosted public status page: manual + automated component status, incident timeline posts, subscriber email notifications. **$29 one-time** vs Statuspage.io (Atlassian) from **$29/mo**.

## MVP features
- Components list with status (operational/degraded/partial outage/major outage/maintenance); can auto-flip from linked uptime-monitor (Pingcron/Vaultkeeper-style webhook) or manual toggle.
- Incidents: create → post updates (investigating/identified/monitoring/resolved) with timestamps; auto-appends to public timeline.
- Scheduled maintenance windows shown in advance, auto-transition to "in progress"/"complete".
- Public page: clean status grid + 90-day uptime history bar per component + incident history feed. Custom domain support (reverse-proxy friendly).
- Email subscribers: subscribe/unsubscribe, notified on new incident + resolution (SMTP).
- RSS/Atom feed + JSON status API for programmatic checks.

## Architecture
Web app, port **5342**. Node+Express+better-sqlite3+React/Vite/Tailwind, public page is server-rendered/static-friendly for speed. Desktop wrapper optional (mainly a VPS product since it must be always-on public).

## Data model
`components`(id, name, status, order), `incidents`(id, title, status, impact, created_at, resolved_at), `incident_updates`(id, incident_id, body, status, created_at), `maintenance`(id, title, starts_at, ends_at, components_json), `subscribers`(id, email, confirmed), `uptime_daily`(component_id, date, pct).

## Launch kit notes
Pricing: Statuspage $29-999/mo, Instatus $20-80/mo, Better Uptime status pages bundled at $24+/mo. Angle: "Your status page shouldn't cost more than the incident it's reporting." Pair naturally with Pingcron (cron-monitor) and Serpdeck-style webhook triggers. SEO: statuspage alternative, self hosted status page, open source incident page, atlassian statuspage alternative.
