# Iconforge — Build Plan (Batch 19, #95)

## One-liner & positioning
Local favicon/app-icon generator: drop one image, export every size/format a website or app store needs, all at once. **$15 one-time desktop** vs Iconscout/RealFaviconGenerator premium subscriptions.

## MVP features
- Drop source image (PNG/SVG, min recommended resolution warning if too small); auto-generate full favicon set (16/32/48px ico, apple-touch-icon, android chrome icons, manifest.json, safari pinned-tab SVG) plus app-store icon sizes (iOS 1024, Android adaptive icon foreground/background layers, Windows tile sizes).
- Background/padding controls per platform (some need full-bleed, some need safe-zone padding) with live preview grid showing every generated size at once.
- One-click zip export with a ready-to-drop `<head>` HTML snippet + `site.webmanifest`.
- Batch mode: process a folder of logos for multiple client projects in one pass.

## Architecture
Electron desktop app, `sharp` (or Canvas-based resize) for raster generation, React/Vite/Tailwind chrome.

## Data model
Local project files only — no DB needed, stateless generation tool.

## Launch kit notes
Angle: "You shouldn't need a subscription to resize a PNG twelve times." SEO: favicon generator offline, app icon generator all sizes, real favicon generator alternative, icon generator desktop tool.
