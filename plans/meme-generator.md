# Memeforge — Build Plan (Batch 13, #61)

## One-liner & positioning
Local meme/caption-image maker: template library, drag text with classic meme font + custom fonts, batch caption from CSV. **$15 one-time desktop** vs Kapwing Pro **$16/mo** or Canva Pro for meme use.

## MVP features
- Bundled template pack (public-domain/user-uploaded meme templates) + "upload your own image" canvas.
- Text boxes: drag/resize, Impact font default + font picker, stroke/fill color, auto-fit-to-width.
- Batch mode: CSV (image, top text, bottom text) → generate N images in one export pass.
- Export PNG/JPG/WebP, copy-to-clipboard, quick-share to file.
- Sticker/emoji overlay layer (small bundled pack).

## Architecture
Electron desktop app, canvas rendering via `fabric.js` or plain Canvas2D, React/Vite/Tailwind chrome.

## Data model
Local project files only (no DB needed) — saved `.meme` project JSON (layers + image ref) for re-editing.

## Launch kit notes
Angle: "You don't need a subscription to put text on a picture." SEO: meme generator offline, free meme maker no watermark, batch meme generator csv, kapwing alternative desktop.
