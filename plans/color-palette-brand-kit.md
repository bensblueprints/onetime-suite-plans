# Paletteforge — Build Plan (Batch 19, #92)

## One-liner & positioning
Local color palette generator + brand kit organizer: generate harmonious palettes, extract colors from an image, save brand kits with export to CSS/Tailwind/Figma-friendly formats. **$15 one-time desktop** vs Coolors Pro (**$5-10/mo**, small but permanent rent for a color wheel).

## MVP features
- Palette generator: harmony rules (complementary/analogous/triadic/monochrome), lock individual colors and regenerate the rest, adjust via HSL sliders.
- Image color extraction: drop an image, pull dominant palette (k-means on pixel data).
- Contrast checker: WCAG AA/AAA pass/fail for any two colors in the palette (accessibility built in, not an afterthought).
- Brand kits: save named palettes + fonts (Google Fonts picker) + logo reference into one kit, organize multiple kits per client.
- Export: CSS custom properties, Tailwind config snippet, ASE (Adobe swatch), PNG palette card, JSON.

## Architecture
Electron desktop app, React/Vite/Tailwind, k-means extraction in-browser (Canvas pixel data).

## Data model
Local SQLite: `kits`(id, name, client), `colors`(id, kit_id, hex, name, order), `fonts`(id, kit_id, family, role heading/body).

## Launch kit notes
Angle: "Coolors is $5-10/mo forever for a color wheel and an export button." SEO: coolors alternative free, color palette generator offline, brand kit tool desktop, contrast checker wcag tool.
