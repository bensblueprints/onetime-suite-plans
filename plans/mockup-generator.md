# Mockcraft — Build Plan (Batch 19, #91)

## One-liner & positioning
Local product/device mockup generator: drop your design into a phone/laptop/apparel/print mockup scene, export marketing-ready images. **$19 one-time desktop** vs Placeit **$14.95/mo**.

## MVP features
- Bundled mockup template pack (devices: phone/laptop/tablet frames at multiple angles; apparel: t-shirt/hoodie flat + worn; print: business card/poster/book) with smart-object-style placement zones.
- Drop image/screenshot onto the template, auto-warp to the placement zone (perspective transform where the template calls for it), adjust position/scale/rotation.
- Color variants for apparel templates (swap garment color without re-placing design).
- Batch mode: apply one design across multiple templates in one export pass.
- Export PNG (transparent-bg where relevant) at marketing resolution.

## Architecture
Electron desktop app, Canvas2D/WebGL for perspective warp, React/Vite/Tailwind chrome. Template pack ships as bundled assets + a JSON placement-zone spec per template (extensible for future template packs).

## Data model
Local project files only; `templates.json` manifest (bundled) defines placement zones per template.

## Launch kit notes
Angle: "Placeit is $14.95/mo to drag your image onto a stock photo of a phone." SEO: placeit alternative offline, mockup generator free desktop, product mockup tool no subscription, phone mockup maker.
