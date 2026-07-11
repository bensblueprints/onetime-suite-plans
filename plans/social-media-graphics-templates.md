# Postcraft Templates — Build Plan (Batch 19, #93)

## One-liner & positioning
Local branded social-graphics batch generator: build a template once (logo/colors/fonts locked in), bulk-generate a week of posts from a CSV of headlines/quotes/images. **$19 one-time desktop** vs Canva Pro **$12.99/mo** (this isn't "another Canva" — it's a bulk/batch tool for the specific job of turning a content calendar into finished graphics fast).

## MVP features
- Template designer: canvas per platform size (IG post/story, FB, X, LinkedIn), locked brand elements (logo position, color bar, font), one or two editable text/image zones.
- Batch generate: CSV (headline, subtext, image path) → N finished graphics in one export pass, auto-fit text (shrink-to-fit long headlines).
- Template variants: quote-card, headline-card, stat-card, testimonial-card presets to start from.
- Preview grid before export; per-platform size export (multi-size from one template in one pass).

## Architecture
Electron desktop app, Canvas2D rendering (`fabric.js` or plain canvas), React/Vite/Tailwind chrome.

## Data model
Local project files: `template.json` (zones, brand config) + CSV input reference; no DB needed.

## Launch kit notes
Angle: "Canva is $13/mo for one design at a time — this batch-generates twenty from a spreadsheet, locally, for a flat fee." SEO: canva pro alternative offline, batch social media graphics generator, content calendar image generator, branded template maker desktop.
