# Onetime Suite — Shared Build Spec (all products)

Every product in this suite MUST ship with the following. Build in your assigned directory under `C:\Users\ADMIN\Desktop\onetime-suite\<app-name>\`.

## Business context
- Source is public (MIT) on github.com/bensblueprints — it doubles as the owner's developer portfolio, so code quality and README polish matter.
- The paid one-time product on Whop is the packaged installer / convenience version. README must include a "☕ Skip the setup — get the 1-click installer" section with a placeholder link `https://whop.com/onetime-suite` (wired later).
- Positioning: "Pay once. Own it forever. No subscription." — always contrast against the named monthly competitor.

## Code requirements
- Desktop apps: Electron (main + preload + renderer), `npm start` runs it. Include an `electron-builder` config in package.json for a Windows NSIS installer (`npm run dist`) but DO NOT run dist during the build session.
- VPS web apps: Node 20+ Express + better-sqlite3 + React (Vite) + Tailwind + Lucide + Framer Motion. Single process serves API + built frontend (`npm run build` then `npm start`). Include a `Dockerfile` + `docker-compose.yml` (volume for the SQLite db) and a `.env.example` (PORT, ADMIN_PASSWORD, etc.). Simple session/password auth for admin areas — no external auth providers. Use your ASSIGNED PORT as the default so parallel builds don't collide.
- **Web apps must ALSO ship a desktop mode**: an Electron wrapper (`npm run desktop`) whose main process starts the same Express server on a free local port (data dir → Electron userData) and opens a BrowserWindow pointing at it, auto-logged-in as admin. Include electron-builder NSIS config (don't run dist). Keep it thin — one `electron/main.js`, reuse the server code unchanged. README documents both modes: "Run it as a desktop app, or deploy to a $5 VPS when you need it public."
- UI: clean, modern, dark-mode default. If using React use Tailwind + Lucide icons + Framer Motion (motion). Plain HTML/CSS/JS renderer is fine for simple tools — still make it look premium (spacing, typography, drag-drop zones with hover states).
- All processing 100% local. No telemetry, no network calls (except model/binary downloads on first run, clearly surfaced in UI).
- Windows-first (this machine), but keep code cross-platform where trivial.
- Node 24 available. NEVER write JSON files via PowerShell (BOM breaks JSON.parse) — use node or your Write tool.

## Repo files (required)
- `README.md` — hero description, feature list, screenshots placeholder (`docs/screenshot.png` reference), quick start (`npm i && npm start`), tech stack, comparison table vs the monthly competitor, Whop section, MIT badge.
- `LICENSE` — MIT, copyright 2026 Ben (bensblueprints).
- `.gitignore` — node_modules, dist, output artifacts.
- `launch-kit/` folder:
  - `product-hunt.md` — name, 60-char tagline, description (260 chars), full description, maker first-comment (personal, honest, "I got tired of paying $X/mo…"), gallery shot list (5 shots described).
  - `ad-copy.md` — 3 FB/IG short ads (hook/body/CTA), 2 Google search ads (headlines + descriptions within char limits), 1 X/Twitter launch post.
  - `strategy.md` — target communities (specific subreddits with rules-aware angle), Hacker News "Show HN" post draft, SEO keywords (10), AppSumo/PitchGround pitch paragraph, suggested one-time price with competitor monthly-price math ("pays for itself in N months").

## Verification (required before you finish)
- `npm i` clean, `npm start` boots the Electron app without errors (close it after).
- Core processing logic verified via a Node smoke-test script in `test/smoke.js` run with real generated fixtures (e.g. actually merge two PDFs, actually compress a generated image) — assert output exists and is valid. `npm test` runs it.
- Report honestly what was verified and anything that wasn't.

## Git
- Run `git init`, commit everything with a clean initial commit message. Do NOT push (publishing handled centrally).
