# Menuly — Build Plan (Batch 17, #82)

## One-liner & positioning
QR-code digital menu for restaurants/cafes: mobile-friendly menu page, easy price/item updates, no per-month SaaS fee. **$24 one-time** vs Toast QR menu tools **$29+/mo** or standalone QR-menu SaaS subscriptions.

## MVP features
- Menu builder: categories → items (name, description, price, photo, dietary tags: vegan/GF/spicy), drag-reorder.
- Public menu page: mobile-optimized, category tabs/scroll-jump, dark/light auto based on branding, out-of-stock 86'd-item toggle (instant hide).
- QR code generator (auto-generated pointing at the public menu URL, printable table-tent PDF).
- Multi-location support (one account, several venues, shared or distinct menus).
- Seasonal/daily specials section, easy to toggle visible.

## Architecture
Web app, port **5360**. Node+Express+better-sqlite3+React/Vite/Tailwind, image storage local disk.

## Data model
`venues`(id, name, slug), `categories`(id, venue_id, name, order), `items`(id, category_id, name, description, price, photo_path, tags_json, in_stock, order).

## Launch kit notes
Angle: "QR menu tools charge monthly rent to host a PDF's worth of text and photos." SEO: qr code menu maker free, digital menu software one time purchase, restaurant menu website builder, toast menu alternative.
