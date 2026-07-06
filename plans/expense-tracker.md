# Ledgerly — Build Plan (Batch 9, #44)

## One-liner & positioning
Business expense tracking with receipt OCR that runs 100% on your machine. **$29 one-time** vs Expensify at **$5/user/mo** (pays for itself in 6 months for a solo user, faster per team). Also compare Zoho Expense ($3/user/mo) and QuickBooks (overkill, $30+/mo). Tagline: "Your expenses, your data, your one-time price."

## MVP feature list
- **Expenses**: amount, currency, category, vendor, date, project (optional), payment method, notes, receipt image attached. Quick-add row + full form. List with filters (date range, category, project, search vendor/notes) and column sort.
- **Receipt photo upload + local OCR**: drop/upload JPG/PNG (and PDF page-1 via pdf.js render→canvas→PNG, stretch goal — MVP = images); run **tesseract.js entirely locally**; parse the text to **prefill amount, vendor, date** into the expense form with a confidence hint ("check these"). Parsing heuristics: amount = largest currency-formatted number near keywords TOTAL/AMOUNT DUE/BALANCE (regex `[\d,]+\.\d{2}` with currency symbols); date = first parseable date pattern (support `MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`, `Mon DD, YYYY` via `date-fns` parse attempts); vendor = first non-empty line that isn't a date/number (top of receipt). User always confirms — OCR prefills, never auto-saves.
- **Categories + budgets**: default category set (Meals, Travel, Software, Office, Marketing…), user-editable with color + icon. Monthly budget per category; progress bars (spent/budget, color shifts amber >80%, red >100%).
- **Monthly reports + charts**: month picker; total, by-category donut, daily spend bar chart, top vendors table, month-over-month delta. Charts via **Recharts** (per frontend-library preferences — installed lib, don't hand-roll SVG).
- **CSV/PDF export**: CSV of filtered expense list (proper escaping, ISO dates, one row per expense incl. converted amount); PDF monthly report via pdf-lib (summary table + category totals — no chart images required, keep it tabular).
- **Multi-currency with manual rates**: base currency in settings; per-currency manual rate table (rate → base, user-maintained); each expense stores original amount+currency AND converted base amount computed at entry time (rate snapshot, so later rate edits don't rewrite history; offer "recalculate" button per expense).
- **Recurring expenses**: template (all expense fields + frequency monthly/weekly/yearly + next_date); in-process daily sweep materializes due instances (marked auto-created, editable), advances next_date. Catch-up on boot for missed days.

## Architecture
Per BUILD-SPEC dual-mode web app: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion + Recharts. Single process, **port 5335** default. Session/password admin auth. Receipt images under `DATA_DIR/receipts/<expenseId>.<ext>`. **OCR runs in the browser** (tesseract.js in the renderer/page) — keeps the server thin and works identically in web and Electron modes; language data (`eng.traineddata.gz`) and worker/core JS are **bundled locally and served by Express** (no CDN — spec forbids network calls). Dockerfile + docker-compose (DB + receipts volumes), `.env.example` (PORT, ADMIN_PASSWORD, DB_PATH, DATA_DIR). Electron wrapper per spec.

## Data model (SQLite)
- `expenses`: id, date, vendor, amount (original), currency, rate_used, base_amount, category_id, project_id, method, notes, receipt_path, recurring_id (nullable), created_at.
- `categories`: id, name, color, icon, position. `projects`: id, name, archived.
- `budgets`: id, category_id, month ('YYYY-MM' or null = every month default), amount.
- `currencies`: code, rate_to_base, updated_at. `recurring`: id, template_json, frequency, next_date, active.
- `settings` (base_currency, default_category), `sessions`.

## API endpoints
- Auth + `GET /api/health`.
- `GET /api/expenses?from=&to=&category=&project=&q=`, `POST /api/expenses` (JSON), `GET|PUT|DELETE /api/expenses/:id`, `POST /api/expenses/:id/receipt` (multipart image), `GET /api/receipts/:id` (image stream), `POST /api/expenses/:id/recalculate`.
- `GET|POST /api/categories`, `PUT|DELETE /api/categories/:id`; same for projects, budgets, currencies, recurring (+ `POST /api/recurring/run` manual trigger — used by smoke test).
- `GET /api/reports/monthly?month=YYYY-MM` → {total, byCategory[], byDay[], topVendors[], prevMonthTotal}.
- `GET /api/export/csv?<filters>`, `GET /api/export/pdf?month=`.
- `GET /api/ocr/parse` is NOT a thing — OCR is client-side; but ship `POST /api/ocr/extract-fields` (text in → parsed {amount, vendor, date} out) so the parsing heuristics live server-side, are unit-testable, and the client just sends tesseract's raw text.

## UI screens
1. Login. 2. Dashboard: this-month total, budget progress bars, recent expenses, quick-add. 3. Expenses list (filters, inline edit, receipt thumbnail popover). 4. Add/edit expense with receipt dropzone → OCR spinner → prefilled fields flagged for review. 5. Reports (month picker, donut + bars, export buttons). 6. Budgets. 7. Settings (base currency, rates table, categories manager, recurring list). Dark mode default.

## Smoke test spec (`test/smoke.js`)
Boot via `spawn` on port **5435**, temp DB/DATA_DIR. Assertions:
1. Auth gates; login ok.
2. CRUD expense; multipart receipt upload → file exists on disk, `GET /api/receipts/:id` streams same bytes.
3. **OCR fixture test**: generate a receipt image in-test — render text onto a canvas-like PNG. No native canvas dep: build it with `pdf-lib` → sharp? Keep it simple: ship a tiny checked-in fixture `test/fixtures/receipt.png` (generated once during build with clear text: "ACME COFFEE\n2026-03-14\nTOTAL $42.50") AND generate a second synthetic one at test time using `pureimage` (pure-JS canvas, devDependency) drawing the same strings at 24px. Run **tesseract.js in Node** (supported) with bundled traineddata against the image; POST the raw text to `/api/ocr/extract-fields`; assert amount === 42.50, vendor === 'ACME COFFEE', date parses to 2026-03-14. This exercises the real OCR path end-to-end.
4. Multi-currency: base USD; add EUR rate 1.10; create €100 expense → base_amount 110.00; change rate to 1.20; old expense unchanged; recalculate → 120.00.
5. Budget: category budget 100 for current month; add 80 expense → report/budget endpoint shows 80% ; add 30 more → over-budget flag.
6. Monthly report: seed known expenses across 2 categories/3 days; assert totals, byCategory sums, byDay buckets exact.
7. CSV export: parse returned CSV, row count + a vendor containing a comma+quote survives escaping. PDF export → bytes start `%PDF`, size > 1 KB.
8. Recurring: create monthly recurring with next_date = today; `POST /api/recurring/run` → expense materialized with recurring_id, next_date advanced one month; run again same day → no duplicate.
Cleanup: kill only spawned child PID; delete temp dirs.

## Launch kit requirements
Competitors: Expensify $5/user/mo (anchor), Zoho Expense, Ramp/Brex (free but data-mining/card-locked — honest angle), QuickBooks. Angle: "I just wanted to photograph receipts without a subscription or my data in someone's cloud." Reddit: r/smallbusiness, r/freelance, r/selfhosted, r/Bookkeeping (rules-aware). HN Show HN. SEO: expensify alternative, self hosted expense tracker, receipt OCR local, expense tracker one time purchase, small business expense tracking no subscription.

## Risks / gotchas
- **tesseract.js paths in Electron**: the worker spawns from a file path — `workerPath`, `corePath` (wasm), and `langPath` must be explicit absolute/served paths, NOT CDN defaults. In web mode serve `node_modules/tesseract.js/dist/worker.min.js`, `tesseract.js-core/*.wasm`, and a local `lang-data/eng.traineddata.gz` via an Express static route; in Electron the same served URLs work (renderer loads from the local server — this is why client-side OCR + served assets is the right architecture; avoid `file://` worker loading, which breaks). Pin tesseract.js version; core/worker versions must match.
- First OCR run is slow (~wasm init); show progress via tesseract's `logger` callback, keep UI non-blocking.
- OCR parsing WILL be wrong sometimes — UX must frame it as prefill-with-review; never silently save.
- Money math: store cents as INTEGER or use round-to-2 consistently; never float-accumulate in reports (SUM in SQL on integer cents).
- Date ambiguity (03/04/2026): settings toggle for MDY/DMY parse preference, default MDY.
- **better-sqlite3 dual ABI**: copy `link-in-bio\scripts\setup-native.js`. Never broad-kill node in tests. CSV: prepend UTF-8 BOM? No — plain UTF-8, and never write JSON via PowerShell.
