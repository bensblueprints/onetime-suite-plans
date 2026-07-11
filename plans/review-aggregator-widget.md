# Star Stack — Build Plan (Batch 14, #68)

## One-liner & positioning
Aggregates reviews from Google, Facebook, and manually-imported sources into one embeddable widget for your site. **$29 one-time** vs Trustpilot Business **$199+/mo** or EmbedSocial/Elfsight review-widget subscriptions.

## MVP features
- Sources: Google Business Profile (via Places API, user's own key), Facebook Page reviews (Graph API, user's own token), manual/CSV import (for review platforms without a usable API, or screenshots turned into text entries).
- Review moderation: approve/hide before they show publicly, feature/pin best ones.
- Widget: embeddable `<script>` snippet (carousel or grid layout), theme customization (colors/font to match site), aggregate star rating badge.
- Auto-refresh sync (scheduled pull from Google/FB) so widget stays current without manual work.
- Filter by source/rating in the embedded widget.

## Architecture
Web app, port **5351**. Node+Express+better-sqlite3+React/Vite/Tailwind for admin; the public embed is a lightweight vanilla-JS widget script served from the same server (cross-origin embeddable).

## Data model
`sources`(id, type google/facebook/manual, external_id, credentials_json), `reviews`(id, source_id, author, rating, text, review_date, approved, featured), `widget_configs`(id, theme_json).

## Launch kit notes
BYO API keys for Google/Facebook keeps it a one-time tool, not a recurring-cost proxy. Angle: "Trustpilot wants $199/mo to show five stars on your homepage — you already have the reviews, you just need the widget." SEO: trustpilot alternative free, google reviews widget embed, review aggregator widget self hosted, elfsight alternative.
