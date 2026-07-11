# Pitchcraft — Build Plan (Batch 13, #63)

## One-liner & positioning
Shareable proposal/quote builder: pick a template, fill line items + content blocks, send a trackable link, client accepts/e-signs. **$29 one-time** vs Proposify **$19+/mo** or PandaDoc **$19+/mo**.

## MVP features
- Proposal builder: content blocks (cover, intro, pricing table with line items/qty/total, terms, testimonials, image blocks) drag-reorder.
- Templates library (5-8 starter templates), branding (logo/colors).
- Shareable public link; view tracking (opened, time spent per section, viewed how many times).
- Client actions on the link: accept (simple click-to-sign name/date capture) or request changes (comment).
- Pricing table supports optional add-ons the client can toggle (raises/lowers total live).
- Notification (email) to sender when viewed/accepted.

## Architecture
Web app, port **5348**. Node+Express+better-sqlite3+React/Vite/Tailwind, public view route separate from authed builder.

## Data model
`proposals`(id, title, client_name, status, total, created_at), `blocks`(id, proposal_id, type, content_json, order), `line_items`(id, proposal_id, name, qty, price, optional), `views`(id, proposal_id, viewed_at, duration_s), `acceptances`(id, proposal_id, signer_name, signed_at, ip).

## Launch kit notes
Angle: "Proposify/PandaDoc charge monthly for a pricing table with a signature box." SEO: proposify alternative, pandadoc alternative free, proposal software one time purchase, sales proposal tool self hosted.
