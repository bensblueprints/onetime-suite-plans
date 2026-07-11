# Listcraft — Build Plan (Batch 17, #81)

## One-liner & positioning
Self-hosted property listing website for independent agents/small brokerages: listings with photos/maps, lead-capture forms, MLS-style search filters. **$39 one-time** vs Zillow Premier Agent lead-gen fees or IDX website subscriptions ($50-300+/mo).

## MVP features
- Listings: address, price, beds/baths/sqft, description, photo gallery (drag-reorder), map (Leaflet + geocoding via free/BYO-key provider), status (active/pending/sold).
- Search/filter page: price range, beds/baths, location radius, sort.
- Lead capture: "request a showing" / "contact agent" form per listing → stored leads + email notification.
- Agent profile page(s) for multi-agent brokerages; branding (logo/colors/domain).
- Simple CMS pages (about, blog-lite for market updates) to round out an agent's site.

## Architecture
Web app, port **5359**. Node+Express+better-sqlite3+React/Vite/Tailwind, image storage on local disk/volume.

## Data model
`listings`(id, address, price, beds, baths, sqft, description, status, lat, lng, agent_id), `listing_photos`(id, listing_id, path, order), `agents`(id, name, bio, photo_path), `leads`(id, listing_id, name, email, phone, message, at).

## Launch kit notes
Angle: "IDX website providers charge monthly to host photos and a contact form." SEO: idx website alternative, real estate website builder self hosted, property listing website software, agent website no subscription.
