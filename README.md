# Onetime Suite — 103 Pay-Once Softwares (Program Hub)

103 simple, self-hostable softwares that replace monthly-subscription SaaS with a **one-time purchase**. Public MIT source (dev portfolio), packaged 1-click versions sold on Whop, marketing hub at [advancedmarketing.co/software](https://advancedmarketing.co/software/).

This repo is the **program brain**: the roadmap, the shared build spec, and a complete build plan for every not-yet-built product — so any developer (or AI agent, on any model) can resume the program cold.

> **2026-07-16 — Whop-native licensing is LIVE across all 101 apps.** Purchases on
> Whop are validated in-app (OAuth sign-in, per-app experience, 3-device cap for
> desktop, one-time activation for self-hosted — no phone-home after). Status,
> customer flows, and build instructions: **[LICENSING.md](LICENSING.md)**.

## Daily launch tracker

"Shipped" here means the repo is public — it doesn't mean every app has been polished and properly launched (Whop listing live, landing page live, verified end-to-end). **[LAUNCH-TRACKER.md](LAUNCH-TRACKER.md)** tracks the one-app-a-day fix-up-and-launch pass across all 103 apps, backed by a [GitHub Project board](../../projects) and [`LAUNCH-TRACKER.csv`](LAUNCH-TRACKER.csv).

## How to build the next product

1. Read `BUILD-SPEC.md` (shared requirements: stack, dual-mode desktop/VPS, repo files, launch-kit contents, verification rules).
2. Pick a 📋 product in `ROADMAP.md` and read its `plans/<app>.md` — it contains the full feature list, architecture, data model, API surface, smoke-test assertions, launch-kit requirements, and known gotchas.
3. Build it in its own directory, verify per the plan's smoke-test spec, `git init` + commit.
4. Publish with `node publish.js <dir> "<description>"` (creates the public repo on github.com/bensblueprints and pushes; PAT read from `~/.ghpat`).
5. Add its landing page + comparison posts to advancedmarketing.co (`build-software.js` generator in the `advancedmarketing-main` repo).

## Shipped ✅ 103 OF 103

All repo links verified live on github.com/bensblueprints (checked via `gh repo view`). Grouped by batch. Products 1–50 (Batches 1–10) are fully built, verified, and published. Products 51–100 were built and published on 2026-07-12, completing the original program. Products 101–103 (Batches 21–22: FamPing, Door Tracker, Clip Pipeline) were added afterward — see `ROADMAP.md` for the full current list; the table below still only covers the original Batches 1–10.

**#103 — Clip Pipeline** vs Opus Clip $19–119/mo, Submagic $18–39/mo — [clip-pipeline](https://github.com/bensblueprints/clip-pipeline) ($49 intro / $199 launch, desktop). Download → de-caption → rewrite script → re-voice → reassemble pipeline for repurposing social clips, plus a long-form-to-shorts "YouTube Clipper" mode and bulk/batch processing across a whole creator's page. Installer: [Releases](https://github.com/bensblueprints/clip-pipeline/releases/tag/v1.0.0).

### Batch 1 — Local media/file tools

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| PDFsmith | [pdf-toolkit](https://github.com/bensblueprints/pdf-toolkit) | SmallPDF Pro $12/mo | $29 |
| Cutaway | [bg-remover](https://github.com/bensblueprints/bg-remover) | remove.bg $9/mo | $24 |
| WhisperDesk | [whisper-transcriber](https://github.com/bensblueprints/whisper-transcriber) | Otter.ai $16.99/mo | $39 |
| Shrinkray | [image-compressor](https://github.com/bensblueprints/image-compressor) | TinyPNG Pro | $19 |
| ClipDeck | [screen-recorder-desktop](https://github.com/bensblueprints/screen-recorder-desktop) | Loom $15/mo | $29 |

### Batch 2 — Core VPS business tools

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Upwatch | [uptime-monitor](https://github.com/bensblueprints/uptime-monitor) | UptimeRobot $8/mo / Pingdom | $39 |
| Trimly | [link-shortener](https://github.com/bensblueprints/link-shortener) | Bitly $29/mo | $29 |
| Billcraft | [invoice-generator](https://github.com/bensblueprints/invoice-generator) | FreshBooks $19/mo | $39 |
| Bookslot | [booking-page](https://github.com/bensblueprints/booking-page) | Calendly $10/mo | $39 |
| Formforge | [form-builder](https://github.com/bensblueprints/form-builder) | Typeform $29/mo | $39 |

### Batch 3 — Marketing

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| PostDock | [social-scheduler](https://github.com/bensblueprints/social-scheduler) | Buffer $6/channel/mo | $49 |
| Linkleaf | [link-in-bio](https://github.com/bensblueprints/link-in-bio) | Linktree $5–9/mo | $19 |
| Scantrail | [qr-tracker](https://github.com/bensblueprints/qr-tracker) | QR Tiger $15/mo | $24 |
| Cardsmith | [og-image-studio](https://github.com/bensblueprints/og-image-studio) | Bannerbear $49/mo | $39 |
| SigCraft | [email-signature](https://github.com/bensblueprints/email-signature) | WiseStamp $6/mo | $15 |

### Batch 4 — SaaS-team tools

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Statfox | [web-analytics](https://github.com/bensblueprints/web-analytics) | Plausible $9–19/mo | $49 |
| Shipnotes | [changelog-roadmap](https://github.com/bensblueprints/changelog-roadmap) | Canny $79/mo | $49 |
| Hearback | [feedback-widget](https://github.com/bensblueprints/feedback-widget) | Hotjar Surveys $32/mo | $29 |
| Docwell | [knowledge-base](https://github.com/bensblueprints/knowledge-base) | GitBook $79/mo | $29 |
| Chatlet | [live-chat](https://github.com/bensblueprints/live-chat) | Crisp $95/mo | $49 |

### Batch 5 — Productivity

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Boardly | [boardly-kanban](https://github.com/bensblueprints/boardly-kanban) | Trello $5/user/mo | $19 |
| Timevault | [timevault-tracker](https://github.com/bensblueprints/timevault-tracker) | Toggl $10/user/mo | $29 |
| Streakly | [habit-tracker](https://github.com/bensblueprints/habit-tracker) | Habitify $5/mo | $15 |
| Deepdesk | [focus-dashboard](https://github.com/bensblueprints/focus-dashboard) | Centered ~$10/mo | $15 |
| Quillpad | [quillpad-notes](https://github.com/bensblueprints/quillpad-notes) | Notion $12/mo / Evernote $14.99/mo | $29 |

### Batch 6 — Developer tools

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Pingcron | [pingcron](https://github.com/bensblueprints/pingcron) | Cronitor $10/mo | $29 |
| Hookscope | [hookscope](https://github.com/bensblueprints/hookscope) | Webhook.site Pro €9/mo | $24 |
| Snapfleet | [snapfleet](https://github.com/bensblueprints/snapfleet) | Urlbox $19/mo | $39 |
| Wrangle | [wrangle-toolbox](https://github.com/bensblueprints/wrangle-toolbox) | He3 $9.90/mo | $15 |
| Vaultkeeper | [vaultkeeper](https://github.com/bensblueprints/vaultkeeper) | SimpleBackups $29+/mo | $39 |

### Batch 7 — Sales/commerce

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Queuecraft | [queuecraft](https://github.com/bensblueprints/queuecraft) | LaunchList Pro $29/mo | $29 |
| Bravowall | [bravowall](https://github.com/bensblueprints/bravowall) | Senja $19/mo | $29 |
| Hawkwatch | [hawkwatch](https://github.com/bensblueprints/hawkwatch) | Distill.io $12/mo | $34 |
| Postbird | [postbird](https://github.com/bensblueprints/postbird) | Mailchimp $20+/mo | $59 |
| Keymaster | [keymaster](https://github.com/bensblueprints/keymaster) | Keygen.sh $99/mo | $49 |

### Batch 8 — Content/creator

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Castport | [castport](https://github.com/bensblueprints/castport) | Transistor $19/mo | $39 |
| Inkpress | [inkpress](https://github.com/bensblueprints/inkpress) | Ghost $9/mo | $29 |
| Feedloft | [feedloft](https://github.com/bensblueprints/feedloft) | Feedly Pro $8/mo | $24 |
| Reelsnag | [reelsnag](https://github.com/bensblueprints/reelsnag) | Downloader subscriptions $10–15/mo | $24 |
| Voicebarn | [voicebarn](https://github.com/bensblueprints/voicebarn) | ElevenLabs Creator $22/mo | $34 |

### Batch 9 — Ops/business

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Droplink | [droplink](https://github.com/bensblueprints/droplink) | WeTransfer Pro $12/mo | $29 |
| Snipvault | [snipvault](https://github.com/bensblueprints/snipvault) | Cacher $6/mo | $19 |
| Inkseal | [inkseal](https://github.com/bensblueprints/inkseal) | DocuSign $10–25/mo | $49 |
| Ledgerly | [ledgerly-expenses](https://github.com/bensblueprints/ledgerly-expenses) | Expensify $5/user/mo | $29 |
| Dealstack | [dealstack-crm](https://github.com/bensblueprints/dealstack-crm) | Pipedrive $14/user/mo | $39 |

### Batch 10 — Niche

| Brand | Repo | Replaces | Price |
|---|---|---|---|
| Overlayr | [overlayr](https://github.com/bensblueprints/overlayr) | Streamlabs Ultra $19/mo | $24 |
| Signboard | [signboard](https://github.com/bensblueprints/signboard) | Yodeck $8/screen/mo | $49 |
| Serpdeck | [serpdeck](https://github.com/bensblueprints/serpdeck) | AccuRanker $129/mo | $39 |
| Chatterbox | [chatterbox-comments](https://github.com/bensblueprints/chatterbox-comments) | Disqus Plus $12/mo | $24 |
| Textract | [textract-ocr](https://github.com/bensblueprints/textract-ocr) | Adobe Acrobat Pro $19.99/mo | $19 |



## Image prompts

`image-prompts/` contains ready-to-paste image-generation prompts for every shipped product — hero image, dashboard mockup, OG card, and the 5 Product Hunt gallery shots from each launch kit — with a shared style block and a per-product accent color so the whole set renders as one visual family. See `image-prompts/README.md`.

## Program conventions

- Ports 5301+ assigned per product in ROADMAP.md (smoke tests use offset ports — see each plan).
- Cross-cutting gotchas every builder must know: better-sqlite3 Node-vs-Electron ABI (vendored dual-binding pattern in `link-in-bio/scripts/setup-native.js`), never write JSON via PowerShell 5.1 (BOM), never broad-kill node/electron processes during tests (parallel builds), BYO SMTP for all email.
- Whop checkout is a placeholder (`https://whop.com/onetime-suite`) until products are created in the Whop dashboard.
