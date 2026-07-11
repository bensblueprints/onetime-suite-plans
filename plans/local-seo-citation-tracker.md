# Citewatch — Build Plan (Batch 17, #85)

## One-liner & positioning
Local SEO NAP (name/address/phone) consistency tracker: monitor your business listing across directories, spot inconsistencies that hurt local rankings. **$34 one-time** vs BrightLocal **$39+/mo**.

## MVP features
- Add business profile (canonical NAP: name, address, phone, website, hours) as the source of truth.
- Directory check list: manually-entered current listing data per directory (Google Business, Yelp, Facebook, Apple Maps, Bing Places, industry-specific directories) — since most directories lack free bulk APIs, MVP is a structured manual-audit workflow with a periodic "recheck due" reminder, not automated scraping (avoids ToS/scraping fragility, same rationale as rank-tracker's BYO-API stance).
- Diff view: canonical vs each directory entry, mismatch highlighted (phone format, suite number, hours).
- Task list: "fix listing on Yelp" checklist with direct deep-links to each directory's edit page.
- Local rank-check integration note: pairs naturally with the already-shipped Serpdeck (rank-tracker) for the ranking side of local SEO.

## Architecture
Web app, port **5363**. Node+Express+better-sqlite3+React/Vite/Tailwind. Optionally a Places-API-based BYO-key auto-pull for Google Business specifically (most other directories stay manual).

## Data model
`businesses`(id, name, address, phone, website, hours_json), `directories`(id, name, edit_url_template), `listings`(id, business_id, directory_id, current_name, current_address, current_phone, last_checked_at, status).

## Launch kit notes
Angle: "BrightLocal charges monthly to remind you your Yelp listing has the wrong suite number." SEO: brightlocal alternative, local seo citation tool, nap consistency checker, google business profile audit tool.
