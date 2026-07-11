# Snapreceipt — Build Plan (Batch 16, #80)

## One-liner & positioning
Local receipt scanner + expense logger: photo/scan a receipt, OCR pulls vendor/date/total, categorize, export for taxes/reimbursement. **$19 one-time desktop** vs Expensify **$5-9/user/mo**.

## MVP features
- Import receipt image (drag-drop, webcam capture, or folder-watch for a phone-sync folder) — reuse local OCR pipeline from ocr-tool (Textract).
- Auto-extract: vendor name, date, total, tax amount (heuristic parsing of OCR text, editable if wrong).
- Categorize (bundled category list + custom), tag by project/client for billable-expense tracking.
- Reports: spend by category/month, exportable CSV + a PDF expense report with receipt thumbnails attached (for reimbursement submission).
- Mileage log (manual entry: date, purpose, miles, auto-calc at configurable rate) as a bonus expense type.

## Architecture
Electron desktop app, reuses local OCR engine (same Tesseract/local-OCR pattern as Textract), React/Vite/Tailwind.

## Data model
Local SQLite: `receipts`(id, image_path, vendor, date, total, tax, category, project_tag, ocr_raw_text), `mileage_entries`(id, date, purpose, miles, rate).

## Launch kit notes
Angle: "Expensify is $9/user/mo to OCR a receipt you could OCR locally for free, once." SEO: expensify alternative free, receipt scanner app offline, expense tracker with ocr, mileage log app desktop.
