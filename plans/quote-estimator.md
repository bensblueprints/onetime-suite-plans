# Quotewell — Build Plan (Batch 16, #79)

## One-liner & positioning
Local quote/estimate builder for service businesses (contractors, freelancers, agencies): line-item estimator with saved price catalogs, branded PDF export. **$29 one-time desktop** vs PandaDoc/Proposify quoting features gated behind $19+/mo.

## MVP features
- Price catalog: saved items/services with default price, unit, description — reuse across quotes (build once, quote fast).
- Quote builder: add catalog items or one-offs, quantity, discount (flat/%), tax rate, auto-totals, optional/alternate line items.
- Templates: cover page + terms boilerplate saved per business, branding (logo/colors).
- Client info + valid-until date + notes; PDF export.
- Quote history: duplicate a past quote for a similar job, track won/lost status locally.

## Architecture
Electron desktop app, React/Vite/Tailwind, PDF export via Electron printToPDF.

## Data model
Local SQLite: `catalog_items`(id, name, default_price, unit), `quotes`(id, client_name, status, valid_until, created_at), `quote_lines`(id, quote_id, item_name, qty, price, discount).

## Launch kit notes
Angle: "You don't need a document-automation SaaS to make a quote with a total at the bottom." SEO: free quote builder software, contractor estimate app offline, service business quoting tool, quote generator desktop no subscription.
