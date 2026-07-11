# UTMcraft — Build Plan (Batch 14, #66)

## One-liner & positioning
UTM link builder + campaign tracker: generate consistent tagged links, track clicks, see which campaigns/sources actually drive traffic. **$19 one-time** vs UTM.io **$29/mo**.

## MVP features
- Builder form: base URL + source/medium/campaign/term/content dropdowns (autocomplete from history, enforce naming consistency), generates tagged URL + optional short link (integrates with link-shortener/Scantrail pattern).
- Campaigns group multiple UTM links; click tracking via redirect-through (short link records referrer/UA/IP-geo lightweight) with dashboard: clicks by source/medium over time.
- Bulk generator: CSV of variants (e.g. 10 ad sets) → 10 tagged links at once.
- Naming convention enforcer: lock allowed values per dropdown so team doesn't create "Email" vs "email" vs "e-mail" duplicates.
- Export CSV of all links + click counts.

## Architecture
Web app, port **5349**. Node+Express+better-sqlite3+React/Vite/Tailwind; redirect endpoint doubles as the tracked short link.

## Data model
`campaigns`(id, name), `links`(id, campaign_id, base_url, source, medium, term, content, short_code, created_at), `clicks`(id, link_id, at, referrer, geo_country, device).

## Launch kit notes
Angle: "UTM.io charges $29/mo to fill out a form with dropdowns — this is the form, the dropdowns, and the click chart, once." SEO: utm builder tool, utm.io alternative, campaign url builder self hosted, utm link tracker free.
