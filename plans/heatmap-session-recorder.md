# Clickmap — Build Plan (Batch 14, #69)

## One-liner & positioning
Self-hosted click/scroll heatmaps + session recordings for your site: drop in a script tag, see where users click and how far they scroll. **$49 one-time** vs Hotjar Business **$39+/mo** (scales with sessions) or FullStory.

## MVP features
- Tracking script: captures clicks (x/y + element selector), scroll depth, viewport size, and a compressed sequence of DOM mutations + mouse moves for session replay (rrweb-style approach, or a lighter custom recorder for MVP).
- Heatmap view: overlay click density on a screenshot/live-render of the page, per URL, filterable by device (desktop/mobile) and date range.
- Scroll-depth chart: % of visitors reaching each fold.
- Session list: replay individual sessions (play/pause/speed), filter by page, duration, rage-clicks (auto-detected: 3+ clicks in same spot within 1s).
- Privacy: input fields masked by default (never record text typed into forms), configurable exclude-selectors, sampling rate to control data volume.

## Architecture
Web app, port **5352**. Ingest endpoint (`POST /collect`, beacon-friendly) + better-sqlite3 (event blobs compressed) + React/Vite/Tailwind dashboard. Session replay uses rrweb (open-source recorder) for the client script — battle-tested, avoids reinventing DOM-diff recording.

## Data model
`sites`(id, domain, tracking_key), `pageviews`(id, site_id, url, session_id, device, at), `clicks`(id, pageview_id, x_pct, y_pct, selector), `scroll_events`(pageview_id, max_depth_pct), `sessions`(id, site_id, events_blob_compressed, duration_s, started_at).

## Launch kit notes
Privacy-first framing matters here (self-hosted = the data stays with the site owner, not a third party). Angle: "Hotjar's pricing is per-session — the moment you go viral, your analytics tool becomes your biggest bill." SEO: hotjar alternative self hosted, session recording tool open source, heatmap tool free, rrweb session replay self hosted.

## Risks
GDPR/privacy: README must cover cookie/consent-banner integration guidance and the input-masking default; don't record sensitive fields under any config.
