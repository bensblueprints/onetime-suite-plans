# Billoop — Build Plan (Batch 16, #78)

## One-liner & positioning
Lightweight recurring-billing/subscription-management layer on top of your own Stripe account: create plans, manage customer subscriptions, dunning emails, MRR dashboard. **$49 one-time** vs Chargebee (from ~$0 but real pricing kicks in fast on volume, Performance plan $599+/mo) or Recurly.

## MVP features
- Connect your own Stripe account (API key, BYO — Billoop never touches funds, just orchestrates Stripe subscriptions/invoices via API).
- Plans: create products/prices in Stripe from the UI, trial periods, coupons.
- Customer list: subscription status, MRR contribution, upcoming invoice, payment method on file (via Stripe, never stored locally).
- Dunning: failed-payment retry schedule + templated email sequence (SMTP) when a card fails, auto-pause/cancel after N failures.
- Dashboard: MRR, churn rate, new/canceled this month, cohort retention chart (basic).
- Customer self-serve portal link (wraps Stripe's own billing portal, styled).

## Architecture
Web app, port **5358**. Node+Express+better-sqlite3 (caches Stripe data + local-only fields like dunning templates)+React/Vite/Tailwind. Stripe webhooks for real-time sync.

## Data model
`stripe_config`(api_key_masked, webhook_secret), `customers_cache`(stripe_id, email, mrr, status), `dunning_templates`(id, step, days_after_fail, subject, body), `dunning_log`(id, customer_id, step, sent_at).

## Launch kit notes
Angle: "You already pay Stripe's fees — Chargebee charges you again to manage the subscriptions Stripe already tracks." SEO: chargebee alternative, recurring billing dashboard stripe, subscription management tool self hosted, mrr dashboard stripe.
