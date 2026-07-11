# Contractly — Build Plan (Batch 13, #64)

## One-liner & positioning
Local contract template library + fill-in-the-blanks editor: NDAs, freelance agreements, service contracts, with variable merge and clean PDF export. **$29 one-time desktop** vs PandaDoc's template features gated behind $19+/mo, or paying a lawyer per doc.

## MVP features
- Bundled template pack (15-20 common templates: freelance/consulting agreement, NDA mutual/one-way, service contract, independent contractor, simple lease addendum, etc. — plain-language, clearly marked "not legal advice, have counsel review").
- Variable fields (`{{client_name}}`, `{{start_date}}`, `{{fee}}`) highlighted in editor, fill via a form panel that live-updates the doc.
- Rich-text editing of the template body itself (customize clauses per business).
- Save filled contracts locally, reuse as a base for the next client (clone).
- Export polished PDF; merge with e-signature (Inkseal, already-shipped product) via a documented handoff (export → open in Inkseal for signing) rather than rebuilding signing.

## Architecture
Electron desktop app, rich-text via TipTap/ProseMirror, PDF export via Electron printToPDF or `pdf-lib`.

## Data model
Local SQLite: `templates`(id, name, category, body_html), `contracts`(id, template_id, name, fields_json, body_html, created_at).

## Launch kit notes
Disclaimer prominent in README + app: templates are starting points, not legal advice. Angle: "Contract software with a subscription for a Word doc with blanks — here's the blanks, once." SEO: free contract templates editable, freelance agreement template generator, nda template tool, contract builder desktop.
