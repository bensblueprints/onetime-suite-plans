# UrlVid — Product Hunt launch kit

**Name:** UrlVid

**Tagline (60 char):** Turn any website into a video — runs on your machine

**Description (260 char):**
Paste a URL, get a video. UrlVid drives a headless Chromium through any web page and records a
scrolling walkthrough, a pan-and-zoom, or a hero animation shot — then encodes MP4/WebM/GIF in
landscape, square, or 9:16 vertical. 100% local. Pay once, no watermark.

## Full description

Every "website to video" tool rents you render credits by the month and stamps a watermark on the
result. UrlVid is different: it's a one-time purchase that runs entirely on your own machine.

Point it at any URL and pick a mode:
- **Scroll** — a smooth, deterministic top-to-bottom walkthrough of the page.
- **Pan** — a Ken-Burns drift with a subtle zoom for a cinematic feel.
- **Hero** — hold the viewport and record live CSS/JS animation, video backgrounds, and hover states.

Choose a social-ready size (16:9, 1:1, or 9:16 vertical for Reels/TikTok/Shorts), set duration, fps
and quality, optionally strip cookie banners with `hide_selectors`, and render. Out comes an
MP4, WebM, or GIF — no watermark, unlimited renders.

There's a slick playground UI to dial in a shot and preview it inline, plus a full REST API with
API keys, rate limits, and async render jobs so you can wire it into your own pipeline. Run it as a
desktop app (one-click installer) or `docker compose up` on a $5 VPS when you need it public.

Because it renders locally, you can even capture **private and internal pages** that a hosted tool
could never reach — internal dashboards, staging sites, localhost.

Pay once. Own it forever. No subscription.

## Maker's first comment

I make landing pages, and I kept needing short scrolling videos of them — for ads, for social, for
the "here's what it looks like" section. Every tool I tried wanted $20–40/month and slapped a
watermark on the free tier, and none of them could touch my staging sites behind a login.

So I built UrlVid. It's just my own Chromium + ffmpeg wired together with a nice UI and an API — the
same stack a hosted service uses, except it's yours and it costs $39 once instead of $39 every
month. It does scroll walkthroughs, Ken-Burns pans, and hero-animation shots, exports vertical for
TikTok/Reels, and never phones home.

It's MIT-licensed on GitHub if you want to self-host it for free, and there's a one-click installer
if you'd rather skip the setup. Would love your feedback on the capture modes — happy to add more.

## Gallery shot list (5)

1. **Hero / playground** — the dark UI with a URL typed in, mode = Scroll, vertical preset selected,
   and a freshly rendered video playing in the preview pane. (Primary image.)
2. **Three modes side by side** — three phone-frame mockups showing the same site rendered as
   Scroll, Pan, and Hero, captioned with each mode's name.
3. **Format + size grid** — the preset chips (16:9 / 1:1 / 9:16) and format toggles (MP4/WebM/GIF)
   with a note "auto-detects your ffmpeg's encoders."
4. **The API** — a clean code card showing the `curl` render call and the `--output video.mp4`, with
   "REST API · API keys · async jobs" as the caption.
5. **Pricing contrast** — "$39 once vs $468/yr" bar comparison against the named monthly competitors,
   with "unlimited renders · no watermark · runs on your machine."
