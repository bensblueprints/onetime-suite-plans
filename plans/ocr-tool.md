# Textract — Build Plan (Batch 10, #50)

## One-liner & positioning
100% offline desktop OCR: drag in images or PDFs, get selectable text per page, export searchable PDFs, batch whole folders, and snap a screenshot region to text with a global hotkey. **$19 one-time** vs online OCR subscriptions — Adobe Acrobat Pro **$19.99/mo**, ABBYY FineReader from **$99/yr**, OnlineOCR-style credit sites — and unlike all of them, your documents never leave your machine. Tagline: "Every scan, every screenshot, into text. Offline. Once."

## MVP feature list
- **Drag-drop OCR**: drop images (png/jpg/webp/bmp/tiff) or PDFs onto the window → per-file, per-page extracted text. PDFs are rasterized page-by-page (via `pdfjs-dist` render-to-canvas in a hidden renderer or `pdf-to-img`) then OCR'd with **tesseract.js**.
- **Per-page results**: page thumbnails on the left, text pane on the right, per-page **copy button** + copy-all, confidence indicator (tesseract mean confidence), plain-text and .txt/.md export per file.
- **Languages**: English traineddata **bundled** in the installer; other languages listed in a picker and **downloaded on demand** (from tessdata_fast CDN) into userData with progress UI — the only network call in the app, clearly surfaced per BUILD-SPEC. Multi-language OCR (`eng+deu`) supported.
- **Searchable-PDF output**: for a PDF (or image set), produce a new PDF where each page = original image + **invisible text layer** positioned from tesseract word bounding boxes via **pdf-lib** (draw text with `opacity: 0` at scaled word coordinates, font size derived from bbox height) → result is Ctrl-F-able and copy-able in any PDF reader.
- **Batch folder mode**: pick a folder (+ recursive toggle) → queue all supported files, progress list with per-file status, outputs written alongside sources or to a chosen output dir (.txt per file, optional searchable PDF), summary report (files, pages, words, failures).
- **Screenshot-to-text hotkey**: global hotkey (default `Ctrl+Shift+T`, configurable) → frameless fullscreen overlay for **region selection** → capture via Electron `desktopCapturer` → crop → OCR → result popup with auto-copy-to-clipboard toast. Works while app is minimized to tray.
- **History**: recent extractions (source, date, text) persisted locally, re-copy without re-OCR, clearable.
- Quality helpers: pre-processing toggle (grayscale + threshold via `sharp` or canvas) for low-contrast scans; page rotation buttons with re-run.

## Architecture
Desktop **Electron** app per BUILD-SPEC (`npm start`; electron-builder NSIS config present, `npm run dist` NOT run in-session). No assigned port — no server. Structure:
- `main.js` — window/tray lifecycle, `globalShortcut` registration, screenshot overlay window creation, `desktopCapturer` orchestration, file dialogs, language-file download (https → userData/tessdata), batch file discovery (fs walk).
- `preload.js` — contextBridge API (`window.textract.*`), contextIsolation on, nodeIntegration off.
- Renderer — plain HTML/CSS/JS or light React (spec allows plain; keep premium look: drop zone hover states, dark default). **OCR runs in the renderer** via tesseract.js workers (it's designed for browser contexts; worker + wasm paths must point at local `node_modules`/app resources, NOT CDN — set `workerPath`, `corePath`, `langPath` explicitly to bundled/userData locations for true offline).
- Heavy PDF rasterization also renderer-side (pdfjs canvas). pdf-lib assembly renderer-side, saved via main-process fs IPC.
- Data in `app.getPath('userData')`: `tessdata/`, `history.json` (written via Node, never PowerShell), `settings.json`.

## Data model (local JSON in userData)
- `settings.json`: hotkey, default langs, preprocessing on/off, output dir mode, searchable-pdf default, theme.
- `history.json`: [{id, source_path, kind ('image'|'pdf'|'screenshot'|'batch'), pages, chars, text_path or inline text (<50KB), mean_confidence, created_at}] — capped at 200 entries.
- `tessdata/`: downloaded `.traineddata` files (eng bundled in resources, copied to userData on first run).

## IPC surface (contextBridge)
- `ocr:openFiles()` / `ocr:openFolder(recursive)` → file list with types
- `fs:readFile(path)` → buffer (for renderer-side OCR), `fs:writeFile(path, buffer)`, `fs:writeText(path, text)`
- `lang:list()` → installed + available; `lang:download(code)` → progress events `lang:progress`
- `shot:beginRegionCapture()` → main opens overlay, resolves with cropped PNG buffer; `shot:setHotkey(accel)` → re-registers, returns success/conflict
- `history:get()/add(entry)/clear()`
- `settings:get()/set(patch)`
- `app:revealInFolder(path)`, `clipboard:write(text)`
- Events main→renderer: `hotkey:capture-done {buffer}`, `batch:progress`, `lang:progress`

## UI screens
1. **Home/drop zone** (big dashed target, "or browse / folder" buttons, recent history strip). 2. **Result view** (thumbnail rail, text pane, per-page copy, export buttons: TXT / searchable PDF, confidence chip, language selector + re-run). 3. **Batch view** (queue table with per-file status/progress, output dir picker, summary card). 4. **Region-capture overlay** (dim screen, crosshair drag rectangle, Esc cancels) + result toast popup. 5. **Settings** (hotkey recorder, language manager with download progress, preprocessing, theme). Dark mode default, tray icon with "Capture region" and "Open" items.

## Smoke test spec (`test/smoke.js`)
Pure-Node test (no Electron GUI needed — core logic must live in `src/core/` requireable from Node):
1. **Generate a text image fixture**: use `sharp` (dev-dep) to render an SVG string `<svg><text ...>THE QUICK BROWN FOX 12345</text></svg>` onto a white 900×200 PNG at 32px black text.
2. Run `core/ocr.js` (tesseract.js with explicit local `langPath`/`corePath`, eng traineddata vendored into `test/fixtures/tessdata` or downloaded once by a setup script and cached) on the PNG → **assert extracted text contains the words** `QUICK`, `BROWN`, `FOX`, and `12345` (case-insensitive, whitespace-normalized) and mean confidence > 60.
3. **Searchable PDF**: run `core/searchablePdf.js` on the same PNG + OCR words → assert output PDF exists, > 1KB, starts with `%PDF`; parse it back with `pdf-parse` (dev-dep) and assert the extracted text contains `QUICK BROWN FOX` (proves the invisible text layer is real, not just drawn pixels).
4. **PDF input path**: build a 2-page PDF from two generated text images via pdf-lib; run the pdf→pages→OCR pipeline headlessly (use `pdf-to-img` or pdfjs in Node canvas via `@napi-rs/canvas`) → assert 2 page results, each containing its distinct marker word (`PAGEONE` / `PAGETWO`).
5. **Batch**: point `core/batch.js` at a temp folder of 3 generated images → 3 .txt outputs exist with correct contents; summary reports 3/3 ok.
6. Preprocessing: OCR a low-contrast (light-gray-on-white) generated image with preprocessing on vs off → assert preprocessing result contains the marker word.
`npm test` runs it; first-run tessdata download in test must be cached and skipped when present. Verify separately (manual, reported honestly): `npm start` boots, hotkey overlay works, tray works.

## Launch kit requirements
Real pricing: Adobe Acrobat Pro **$19.99/mo** (OCR bundled), ABBYY FineReader PDF **$99/yr** (Standard), Readiris ~$99 one-time (position as: we're $19 and simpler), online credit services (OnlineOCR, OCR.space paid tiers) with page limits + privacy issues. Math: one month of Acrobat costs more than Textract forever. Angle: "I didn't want to upload contracts and IDs to a random OCR website — so OCR happens on my machine, full stop." Communities: r/software, r/datacurator, r/selfhosted, r/productivity (privacy angle; show the screenshot-hotkey GIF), Hacker News Show HN ("offline OCR desktop app with searchable-PDF export"). SEO (10): offline ocr software, searchable pdf converter offline, ocr without subscription, adobe acrobat ocr alternative, screenshot to text windows, batch ocr folder, tesseract gui windows, image to text app offline, pdf ocr one time purchase, abbyy finereader alternative.

## Risks / gotchas
- **tesseract.js offline paths**: default worker/core/lang URLs hit a CDN — must set `workerPath`, `corePath` (wasm), `langPath` to packaged local paths; verify in a network-disabled run. Also list these in electron-builder `files`/`extraResources` or the packaged app breaks while dev works.
- Invisible text layer alignment: tesseract bboxes are in source-image pixels; PDF pages are in points — scale correctly (72/dpi) and account for rasterization scale used for pdf input, or Ctrl-F highlights land in the wrong place. Test with pdf-parse round-trip, eyeball in a reader once.
- `globalShortcut` conflicts (another app owns Ctrl+Shift+T) — registration can fail silently; detect and surface in Settings.
- Multi-monitor + DPI scaling for region capture: capture each display at its scale factor, map overlay rect using `screen.getDisplayNearestPoint` and `scaleFactor`, or crops are offset on 125%/150% Windows scaling (this machine is Windows — test it).
- tesseract.js is slow on big scans — always OCR in a worker (never block UI), show per-page progress from the `logger` callback, cap concurrent workers at ~2.
- Large PDFs: rasterize lazily page-by-page at ~200 DPI, not all pages upfront (memory).
- Never write JSON via PowerShell (BOM) — node/Write only. No telemetry; the lang download is the sole network call and must show a consent-style progress UI.
