# Clientdesk — Build Plan (Batch 20, #97)

## One-liner & positioning
Customer-facing billing/usage dashboard layered on your own Stripe account: invoices, payment history, usage metrics, self-serve plan changes. **$39 one-time** vs ChartMogul/Baremetrics **$50+/mo**.

## MVP features
- Connect Stripe (BYO API key); customer portal shows invoice history, payment methods, upcoming invoice, plan/subscription details — wraps Stripe's billing portal with your own branding + adds a metrics layer Stripe doesn't show customers.
- Usage metrics: if the business tracks usage (API calls, seats, storage), a simple ingest endpoint (`POST /usage`) lets the dashboard show "you've used X of Y this period" alongside billing.
- Admin side: revenue dashboard (MRR, ARR, churn) computed from Stripe data — the analytics ChartMogul/Baremetrics charge for, built on the same webhook data you already receive.
- Email receipts/notifications on invoice paid/failed (can supplement or replace Stripe's default emails with branded ones).

## Architecture
Web app, port **5370**. Node+Express+better-sqlite3 (Stripe data cache via webhooks)+React/Vite/Tailwind. Two contexts: admin analytics + customer self-serve portal.

## Data model
`stripe_config`, `customers_cache`(stripe_id, email, mrr, plan), `invoices_cache`(stripe_id, customer_id, amount, status, period), `usage_events`(id, customer_id, metric, value, at), `metrics_daily`(date, mrr, arr, churn_pct, new_customers).

## Launch kit notes
Angle: "ChartMogul and Baremetrics are $50-100+/mo to chart data Stripe's webhooks already hand you for free." SEO: chartmogul alternative, baremetrics alternative self hosted, stripe customer portal custom, saas analytics dashboard self hosted.
