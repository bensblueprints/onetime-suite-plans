# Maptrail — Build Plan (Batch 11, #54)

## One-liner & positioning
Desktop crawler that generates XML/HTML sitemaps + a full crawl report (titles, meta, status codes, word count) from any URL. **$19 one-time desktop** vs Screaming Frog (£199/yr) or XML-Sitemaps.com Pro subscriptions.

## MVP features
- Enter URL, set crawl depth/page limit/include-exclude patterns, run local crawl (undici + cheerio).
- Live progress table: URL, status, title, meta description length, word count, canonical, noindex flag.
- Generate `sitemap.xml` (with lastmod/priority) + human `sitemap.html`; export crawl report to CSV.
- Split large sitemaps into a sitemap-index automatically at 50k URLs.
- Save/reload past crawls locally (SQLite).

## Architecture
Electron desktop app per BUILD-SPEC. Node crawler in main process, React/Vite/Tailwind renderer.

## Data model
Local SQLite: `crawls`(id, url, started_at), `pages`(id, crawl_id, url, status, title, meta_desc, word_count, canonical, noindex).

## Launch kit notes
Angle: "You don't need a £199/yr desktop app to make a sitemap — you need this once." SEO: sitemap generator free, screaming frog alternative, xml sitemap generator desktop, seo crawler tool one time purchase.
