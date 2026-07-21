# UrlVid — turn any website into a video

[![License: MIT](https://img.shields.io/badge/License-MIT-6d5efc.svg)](LICENSE)

**Paste a URL, get a video.** UrlVid drives a real headless Chromium through any web page and
records it — a smooth top-to-bottom scroll walkthrough, a Ken-Burns pan/zoom, or a fixed hero shot
that captures live CSS/JS animation — then encodes it to **MP4 / WebM / GIF** at the exact size you
need: 16:9 landscape, 1:1 square, or 9:16 vertical for Reels, TikTok and Shorts.

Everything runs **100% on your machine** — your Chromium, your ffmpeg. No render credits, no
watermark, no uploading the pages you capture to someone else's cloud.

> **Pay once. Own it forever. No subscription.**

![UrlVid playground](docs/screenshot.png)

## Why

Every "website → video" and "scrolling website recorder" tool rents you render credits by the month
and stamps a watermark on the output. UrlVid is a one-time purchase that renders unlimited videos
locally. Turn a landing page into an ad clip, a changelog into a social teaser, or a portfolio into
a scrolling showcase — as many times as you want.

## Features

- **Three capture modes** — `scroll` (deterministic auto-scroll walkthrough), `pan` (Ken-Burns
  drift + zoom), `hero` (hold the viewport and record animation).
- **Social-ready sizes** — landscape 1920×1080, square 1080×1080, vertical 1080×1920, or any custom
  width/height.
- **MP4 · WebM · GIF** — format auto-negotiated against your ffmpeg's actual encoders (clean 422 if
  a codec is missing, never a crash).
- **Full control** — duration, fps, quality, dark-mode emulation, wait strategy, post-load delay,
  hold-at-top/bottom, and `hide_selectors` to strip cookie banners/ads before recording.
- **REST API + async jobs** — `POST /api/v1/render` returns the video bytes, or `202 {job_id}` with
  `?async=1` and a pollable progress endpoint.
- **API keys** with per-key rate limits and daily quotas.
- **Library** — a gallery of every render with poster thumbnails, re-download, and delete.
- **Playground** — a slick admin UI to dial in a render, preview it inline, and copy the exact curl.

## Quick start

```bash
npm install
npm start
# → http://localhost:5361   (default admin password: "admin" — change it)
```

First run needs two things on the machine (auto-detected, or point at them explicitly):

- **Chromium/Chrome** — set `CHROMIUM_PATH` if it isn't in a standard location.
- **ffmpeg** — set `FFMPEG_PATH`, or `npm install ffmpeg-static` (optional dependency), or install a
  system ffmpeg. MP4 needs a build with libx264; GIF needs the gif encoder; WebM works with any
  build. The Docker image below installs a full ffmpeg for you.

Copy `.env.example` → `.env` to configure.

### Run it as a desktop app

```bash
npm run desktop     # Electron wrapper: same server, data in userData, auto-logged-in
npm run dist        # build a Windows installer (NSIS)
```

### Or deploy to a $5 VPS when you need it public

```bash
docker compose up -d    # installs Chromium + full ffmpeg in the image; data persists in a volume
```

## API

```bash
curl -X POST "http://localhost:5361/api/v1/render" \
  -H "X-Api-Key: uv_..." -H "Content-Type: application/json" \
  -d '{"url":"https://stripe.com","mode":"scroll","preset":"vertical","format":"mp4","duration":10}' \
  --output stripe.mp4
```

| Param | Values | Default |
|---|---|---|
| `url` | http/https URL (required) | — |
| `mode` | `scroll` · `pan` · `hero` | `scroll` |
| `preset` | `landscape` · `square` · `vertical` | `landscape` |
| `width` / `height` | 160–3840 (overrides preset) | — |
| `format` | `mp4` · `webm` · `gif` | `mp4` |
| `duration` | 1–60 seconds | `8` |
| `fps` | 1–60 | `30` |
| `quality` | 1–100 | `70` |
| `dark_mode` | `1` / `0` | `0` |
| `wait_until` | `load` · `domcontentloaded` · `networkidle0` · `networkidle2` | `networkidle2` |
| `delay` | ms after load (≤10000) | `0` |
| `hold_start` / `hold_end` | ms to linger at top/bottom | `400` |
| `hide_selectors` | comma-separated CSS selectors to remove | — |

Add `?async=1` to get `202 {job_id}` and poll `GET /api/v1/jobs/:id` for `progress`/`status`, then
download from `GET /api/v1/jobs/:id/file`.

## Tech stack

- **Backend**: Node 20+ · Express · better-sqlite3 (single process serves API + UI)
- **Engine**: `puppeteer-core` (your Chromium, no bundled download) + ffmpeg via `image2pipe`
- **Frontend**: hand-built dark-mode SPA (no build step)
- **Packaging**: Electron desktop wrapper (NSIS installer) · Dockerfile + docker-compose for VPS

## Comparison

| | UrlVid | Placid video | Veed recorder | Browserless |
|---|---|---|---|---|
| Price | **$39 once** | $39/mo | $24/mo | $30/mo+ |
| Renders | Unlimited | Metered | Metered | Metered |
| Watermark | None | Paid tiers | Free-tier watermark | — |
| Runs on your server | ✅ | ❌ | ❌ | ❌ |
| Captures your private/internal pages | ✅ | ❌ | ❌ | ❌ |
| One year cost | **$39** | $468 | $288 | $360+ |

## ☕ Skip the setup — get the 1-click installer

Want it packaged and ready to run (Chromium + ffmpeg bundled, no config)? Grab the one-time
installer: **https://whop.com/onetime-suite**. Same software, zero setup — pay once, own it forever.

## License

MIT © 2026 Ben ([bensblueprints](https://github.com/bensblueprints)). Part of the
[Onetime Suite](https://onetimesuite.com).
