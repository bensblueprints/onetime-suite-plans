# UrlVid — go-to-market strategy

## Target communities (rules-aware angles)

- **r/selfhosted** — Lead with "self-hosted website-to-video API, MIT-licensed, runs your own
  Chromium + ffmpeg." This sub loves pay-once-vs-SaaS and Docker one-liners. Show the
  `docker compose up` and the fact it can capture internal dashboards. Do NOT lead with the paid
  installer — post the repo, mention the installer once at the bottom.
- **r/SideProject** — Founder story: "I needed scrolling videos of my landing pages and every tool
  was $30/mo with a watermark, so I built this." Share the sample render.
- **r/socialmedia & r/NewTubers** — Angle: "turn any website/portfolio into vertical 9:16 clips for
  Reels/TikTok/Shorts without a subscription." Focus on the vertical preset and no-watermark output.
- **r/webdev** — The API angle: async jobs, `hide_selectors` to kill cookie banners, dark-mode
  emulation. Devs will appreciate the image2pipe/ffmpeg codec negotiation detail.
- **r/Entrepreneur / r/marketing** — "Turn a landing page into an ad clip in 30 seconds." ROI math.
- Each sub: read the self-promo rules, contribute genuinely first, and post the GitHub repo (free
  self-host) as the primary link — the Whop installer is the convenience upsell, not the pitch.

## Show HN draft

**Title:** Show HN: UrlVid – Turn any website into a video, self-hosted (MIT)

**Body:**
UrlVid renders any URL to a video. It drives a headless Chromium through the page and captures a
frame sequence — either a deterministic top-to-bottom scroll, a Ken-Burns pan/zoom, or a fixed hero
shot that catches live CSS/JS animation — then pipes the frames through ffmpeg to MP4/WebM/GIF at
landscape, square, or 9:16 vertical.

The thing I cared about was portability across ffmpeg builds: frames are streamed over `image2pipe`
as mjpeg rather than a numbered-file demuxer, and the server probes `-encoders` at boot so a missing
codec returns a clean 422 instead of blowing up mid-render. WebM (VP8) is the always-available floor;
MP4 needs libx264, which the Docker image installs.

It's a single Node/Express + better-sqlite3 process serving both the API and a small UI, with an
Electron wrapper for a desktop build and a Dockerfile for a VPS. API keys, rate limits, and async
render jobs are included. MIT source; there's also a one-click installer if you don't want to set up
Chromium + ffmpeg yourself.

Feedback I'm after: what capture modes are missing? Element-level recording (record just one
selector) and a "click through N pages" mode are next on my list.

## SEO keywords (10)

1. turn a website into a video
2. url to video
3. website to video generator
4. self hosted website recorder
5. scrolling website video
6. landing page to video ad
7. website to mp4
8. veed website recorder alternative
9. placid alternative self hosted
10. record a webpage as video api

## AppSumo / PitchGround pitch

UrlVid turns the "website → video" category on its head: instead of renting render credits by the
month and watermarking the output, it's a one-time purchase that runs entirely on the buyer's own
machine. It captures any URL as a scrolling walkthrough, pan-and-zoom, or hero-animation clip and
exports MP4/WebM/GIF in every social aspect ratio, including 9:16 vertical for Reels/TikTok/Shorts.
It ships as both a one-click desktop installer and a Dockerized VPS app with a full REST API (keys,
quotas, async jobs). Because rendering is local, it can capture private and internal pages that
hosted competitors physically cannot reach — a genuine differentiator for agencies and SaaS teams.
A perfect lifetime-deal fit: high perceived value (competitors are $24–39/mo) against a simple,
honest pay-once promise.

## Suggested price & math

**Launch price: $39 one-time** (intro $29).

The named competitors run $24–39/month:
- Veed website recorder ≈ $24/mo → **$288/year**
- Placid video ≈ $39/mo → **$468/year**
- Browserless recordings ≈ $30/mo+ → **$360+/year**

At $39 once vs a typical $29/mo tool ($348/yr), UrlVid **pays for itself in about six weeks** — and
every render after that is free, unlimited, and watermark-free. "Stop renting render credits."
