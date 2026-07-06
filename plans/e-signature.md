# Inkseal — Build Plan (Batch 9, #43)

## One-liner & positioning
Send documents for e-signature from your own server — no per-envelope fees, ever. **$49 one-time** vs DocuSign Personal at **$10/mo** (5 envelopes/mo cap; pays for itself in 5 months and removes the cap). Also compare PandaDoc ($19/mo), SignWell ($8/mo), Dropbox Sign ($15/mo). Tagline: "Unlimited signatures. Pay once."

## MVP feature list
- **Upload PDF → place fields**: render pages with **pdf.js** on a canvas; drag field boxes (signature, initials, date-signed, text) onto pages from a palette; move/resize; assign each field to a signer (color-coded); required/optional toggle.
- **Signers & routing**: N signers (name + email), mode `sequential` (signer 2's link only activates after signer 1 completes) or `parallel`. Each signer gets a unique 24-char token link.
- **Signing page** (public, token): shows the PDF (pdf.js), highlights their fields, click each → modal to **draw** signature (canvas, pointer events, exported PNG) or **type** it (name rendered in a script font to canvas → PNG); date fields auto-fill; consent checkbox ("I agree to sign electronically") required before finishing.
- **Flatten to final PDF** via **pdf-lib**: after all signers complete, embed signature PNGs and text at the recorded coordinates into the original PDF, append an **audit certificate page** (document hash, per-event log), save as the executed document.
- **Audit trail, hash-chained**: every event (created, sent, viewed, consented, field_signed, completed, declined) stored with IP, user-agent, ISO timestamp, and `hash = sha256(prev_hash + canonical_json(event))`; genesis uses sha256 of the original PDF. `verify` endpoint recomputes the chain.
- **Emails** (BYO SMTP, nodemailer): signing invitation per signer (in order for sequential), completion email to owner + all signers **with the final flattened PDF attached**. No-SMTP = links shown for manual copy, warning banner.
- **Templates**: save a document's field layout; create new envelope from template with fresh PDF or reuse the same PDF, remap signers by role name.
- Decline flow, envelope voiding, reminder re-send.

## Legal note (must ship in launch kit + README)
Honest positioning: Inkseal implements the core requirements commonly associated with **ESIGN/UETA and basic eIDAS "simple electronic signature"** validity — demonstrated intent (click-to-sign actions), consumer consent capture, association of signature with the record, tamper-evident audit trail (hash chain + document hash), and retention/copies for all parties. It is **NOT** a Qualified Electronic Signature (eIDAS QES), does not use certificate-based digital signatures or a QTSP, and no compliance certification is claimed. Fine for everyday agreements; users needing QES or regulated-industry workflows should consult counsel. This paragraph goes verbatim-ish in `launch-kit/strategy.md` and README.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process. **Port 5334** default. Admin session auth; signing pages public via token. PDFs on disk under `DATA_DIR/docs/`. pdf.js (`pdfjs-dist`) in browser only; pdf-lib on the server for flattening. Dockerfile + docker-compose (volumes: DB + docs), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, DATA_DIR, BASE_URL, SMTP_*). Electron wrapper per spec.

### Coordinate mapping (the hard part — the approach)
pdf.js renders in **CSS pixels, top-left origin, at an arbitrary zoom**; pdf-lib places content in **PDF points (72/inch), bottom-left origin, unrotated page space**. Do NOT store pixels. The rule: **store all field geometry normalized to the PDF page's unrotated point size, top-left origin** — `{page, x, y, w, h}` as fractions 0..1 of `viewport(scale=1)` width/height. In the editor: get `viewport = page.getViewport({scale})`, convert mouse px → fractions by dividing by `viewport.width/height` (this bakes out zoom AND `/Rotate`, since pdf.js viewport already applies rotation — capture `viewport.rotation` and store it). On flatten with pdf-lib: `const {width, height} = page.getSize()`; for unrotated pages, `drawX = fx * width`, `drawY = height - (fy + fh) * height` (flip Y, anchor bottom-left of box). For rotated pages (`page.getRotation() ≠ 0`), transform the fractional coords back into unrotated space first (90°: `x' = fy, y' = 1-fx-fw`, swap w/h; 180/270 analogous) — write a single `toPdfSpace(field, rotation, pageSize)` helper with unit tests for 0/90/180/270 using a generated rotated fixture. Draw typed text with an embedded font sized to fit the box height (`h * 0.6`), signature PNGs with `drawImage` preserving aspect ratio inside the box. Verify visually once during build with a rotated test PDF.

## Data model (SQLite)
- `envelopes`: id, title, status ('draft'|'sent'|'completed'|'declined'|'voided'), routing ('sequential'|'parallel'), original_pdf_path, original_sha256, final_pdf_path, template_id, created_at, completed_at.
- `signers`: id, envelope_id, name, email, order_index, token (unique), status ('pending'|'active'|'signed'|'declined'), signed_at, consent_at.
- `fields`: id, envelope_id, signer_id, type ('signature'|'initials'|'date'|'text'), page, x,y,w,h (REAL fractions), rotation, required, value_text, signature_png (BLOB or path), signed_at.
- `audit_events`: id, envelope_id, seq, type, actor, ip, ua, at, data_json, hash, prev_hash.
- `templates`: id, name, pdf_path (nullable), fields_json, roles_json. `sessions`, `settings`.

## API endpoints
- Auth + health as usual.
- `POST /api/envelopes` (multipart PDF upload), `GET /api/envelopes`, `GET|PUT|DELETE /api/envelopes/:id`, `PUT /api/envelopes/:id/fields`, `POST /api/envelopes/:id/send`, `POST /api/envelopes/:id/remind`, `POST /api/envelopes/:id/void`, `GET /api/envelopes/:id/audit`, `GET /api/envelopes/:id/verify` (recompute chain → {valid, brokenAt?}), `GET /api/envelopes/:id/final.pdf`.
- Templates CRUD; `POST /api/envelopes/from-template/:id`.
- Public: `GET /sign/:token` (page), `GET /api/sign/:token` (doc meta + my fields + PDF url), `GET /api/sign/:token/pdf`, `POST /api/sign/:token/consent`, `POST /api/sign/:token/fields/:fieldId` (value/PNG), `POST /api/sign/:token/complete`, `POST /api/sign/:token/decline`.

## UI screens
1. Login. 2. Envelope list (status pills). 3. Editor: pdf.js page canvas + field palette + signer panel (add signers, colors, routing toggle). 4. Send review modal. 5. Public signing page (field navigator "Next field", draw/type modal, consent, finish). 6. Envelope detail (signer progress, audit log table with hashes, download final). 7. Templates. 8. Settings (SMTP + test send). Dark mode default (signing page light for trust).

## Smoke test spec (`test/smoke.js`)
Boot via `spawn` on port **5434**, temp DB/DATA_DIR. Generate fixture PDF with pdf-lib in-test (2 pages, known text). Assertions:
1. Auth gates; upload fixture → envelope; original_sha256 matches locally computed hash.
2. Place fields via API (signature p1, date p1, text p2) for 2 sequential signers; send → signer tokens exist; signer 2 status stays `pending` while 1 is `active`.
3. Signer 1: consent, POST a generated red 200×80 PNG as signature, complete → signer 2 becomes `active`; signer 2 signs → envelope `completed`, `final.pdf` exists.
4. **Flattened-PDF assertion**: load final.pdf with pdf-lib — page count = original + 1 (audit page); final file bytes ≠ original; size > original; extract page 1 content and assert the embedded image XObject exists (pdf-lib: check page node Resources/XObject has an image) — this asserts the rendered signature is really embedded, not just metadata.
5. **Audit chain verifies**: `GET /verify` → valid:true; then tamper a mid-row's `data_json` directly in SQLite → verify → valid:false with brokenAt = that seq.
6. Sequential enforcement: signer-2 field POST before signer-1 completes → 403 (do this before step 3's completion in a second envelope, or reorder).
7. Decline path → envelope `declined`; voided envelope's sign links → 410.
Cleanup: kill only spawned child; remove temp dirs.

## Launch kit requirements
Competitor table: DocuSign $10/mo (capped) / $25/mo Standard, PandaDoc, SignWell, Dropbox Sign. Include the **legal note verbatim** in strategy.md — honesty is the trust play in ads too ("real audit trail, no compliance theater"). Angle: "I paid DocuSign $120/yr to send six leases." Reddit: r/selfhosted, r/smallbusiness, r/realestateinvesting (rules-aware). HN Show HN. SEO: docusign alternative self hosted, e-signature one time purchase, open source esignature, sign pdf online self hosted, unlimited envelopes esignature.

## Risks / gotchas
- **Coordinate mapping** is the build's core risk — implement `toPdfSpace()` + unit tests for all four rotations FIRST, before UI polish. Fractions-of-viewport storage is non-negotiable.
- pdf.js worker: bundle `pdfjs-dist` worker via Vite `?url` import and set `GlobalWorkerOptions.workerSrc` — CDN URLs violate the no-network rule and break in Electron.
- **better-sqlite3 dual ABI**: copy `link-in-bio\scripts\setup-native.js` pattern. Never broad-kill node in tests.
- pdf-lib can't parse encrypted PDFs — detect and reject at upload with a clear message. Large PDFs: cap upload (25 MB) and stream to disk.
- Hash chain: canonicalize event JSON (sorted keys) before hashing or verification breaks spuriously; write audit rows and their hashes inside one synchronous transaction.
- Typed signatures need a bundled script font file (embed via `pdf-lib` `fontkit`) — pick one OFL font, ship it in repo.
- SMTP optional: completed envelopes must still be downloadable; email failures logged, never block completion.
