# Slidecraft — Build Plan (Batch 19, #94)

## One-liner & positioning
Local presentation builder with auto-layout design (like Beautiful.ai): pick a layout, content auto-arranges to stay clean, export PPTX/PDF. **$29 one-time desktop** vs Beautiful.ai **$12-40/mo**.

## MVP features
- Smart layouts: content-aware slide layouts (title, bullet list, two-column, image+text, chart, quote, agenda) that auto-resize/reflow as you add/remove content — the core differentiator vs manual slide design.
- Theme system: color palette + font pairing applied globally, swap theme without breaking layout.
- Basic charts (bar/line/pie from typed-in data) as a native slide element.
- Speaker notes per slide; presenter mode (next-slide preview + notes + timer).
- Export: PPTX (editable in PowerPoint/Keynote/Google Slides) via `pptxgenjs`, and PDF.

## Architecture
Electron desktop app, React/Vite/Tailwind for layout engine + editor, `pptxgenjs` for export.

## Data model
Local project files: `.slidecraft` JSON (slides array, each with layout type + content blocks + theme ref).

## Launch kit notes
Angle: "Beautiful.ai is $40/mo for auto-layout — the auto-layout logic is the product, and now it's yours once." SEO: beautiful.ai alternative offline, presentation software no subscription, pptx generator desktop, auto layout slide maker.
