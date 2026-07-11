# Reflink — Build Plan (Batch 14, #67)

## One-liner & positioning
Self-hosted affiliate/referral program: unique tracking links per affiliate, click + conversion tracking (postback or JS pixel), commission dashboard + payout export. **$39 one-time** vs Tapfiliate **$89/mo**, FirstPromoter $49+/mo.

## MVP features
- Affiliate signup/invite; each gets a unique ref code + tracking link (`yoursite.com/?ref=CODE`, or full redirect link like link-shortener).
- Click tracking (cookie-based attribution, configurable window e.g. 30/60/90 days).
- Conversion tracking: server-to-server postback URL (`GET /convert?ref=CODE&order_id=&amount=`) for the merchant's checkout to call, or a JS snippet for client-side conversion events.
- Commission rules: flat or % per conversion, tiered by affiliate (optionally per-product override).
- Affiliate portal: login, see own clicks/conversions/earnings, get their link + marketing assets (banners upload by admin).
- Admin: approve payouts, export CSV for Stripe/PayPal manual payout, leaderboard.

## Architecture
Web app, port **5350**. Node+Express+better-sqlite3+React/Vite/Tailwind. Two auth contexts: admin + affiliate portal.

## Data model
`affiliates`(id, name, email, ref_code, commission_pct), `clicks`(id, ref_code, at, ip, ua, landing_url), `conversions`(id, ref_code, order_id, amount, commission, at, status), `payouts`(id, affiliate_id, amount, period, paid_at).

## Launch kit notes
Angle: "Tapfiliate is $89/mo for a referral code and a spreadsheet of who gets paid what." SEO: tapfiliate alternative, self hosted affiliate program software, referral tracking system open source, affiliate program software one time purchase.
