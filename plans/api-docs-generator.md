# Docsmith API — Build Plan (Batch 11, #55)

## One-liner & positioning
Local tool that turns an OpenAPI/Swagger spec (or JSDoc-annotated routes) into a branded, static API reference site (Stripe-docs style, 3-pane layout with try-it-out). **$29 one-time desktop** vs ReadMe.io from **$99/mo**.

## MVP features
- Import OpenAPI 3.x JSON/YAML (file or URL); parse endpoints, schemas, auth.
- Live preview: 3-pane docs (nav / description+params / code samples+response), curl/JS/Python request snippets auto-generated per endpoint.
- Try-it-out panel: fires a real request from the renderer (user supplies base URL + API key), shows response.
- Branding: logo, colors, custom domain-ready static export (`npm run export` → static `dist/` folder to host anywhere).
- Versioning: keep multiple spec versions, switcher in nav.

## Architecture
Electron desktop app. Parses spec with `@apidevtools/swagger-parser`, renders via React/Vite/Tailwind, static export via Vite build.

## Data model
Local project files: `docsmith.config.json` + imported spec cached in project folder; no server needed (static output).

## Launch kit notes
Angle: "ReadMe charges $99/mo to render a JSON file — this renders it once, forever, as static files you host free." SEO: readme.io alternative, openapi documentation generator, swagger to html static, api docs generator free, stripe style api docs.
