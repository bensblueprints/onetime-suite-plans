# Linkguard — Build Plan (Batch 11, #53)

## One-liner & positioning
Site-wide broken link + redirect-chain crawler with scheduled re-checks and email alerts. **$24 one-time** vs Ahrefs Site Audit ($99+/mo) or Dr. Link Check ($14.90+/mo).

## MVP features
- Add a site (start URL + crawl depth/limit); crawler (undici + simple HTML parser) walks internal links, checks all internal+external hrefs for status code, follows redirect chains (flag >2 hops).
- Results table: URL, status, found-on pages, link text, last checked; filter broken/redirect/ok.
- Scheduled re-crawl (daily/weekly) with diff — "3 new broken links since last scan".
- Email alert (SMTP) on new breaks; CSV export.
- Respect robots.txt + configurable crawl-delay + concurrency cap.

## Architecture
Web app, port **5343**. Node+Express+better-sqlite3+React/Vite/Tailwind, in-process crawl queue. Desktop wrapper for ad-hoc local scans.

## Data model
`sites`(id, start_url, depth, schedule), `pages`(id, site_id, url, status), `links`(id, site_id, from_page_id, to_url, status_code, redirect_chain_json, checked_at).

## Launch kit notes
Angle: "SEOs pay $99/mo for a crawler that's a headless browser and a cron job." SEO: broken link checker self hosted, ahrefs site audit alternative, free link checker tool, redirect chain checker.
