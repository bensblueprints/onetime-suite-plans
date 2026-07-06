# Onetime Suite — 50 Pay-Once Softwares (Program Hub)

50 simple, self-hostable softwares that replace monthly-subscription SaaS with a **one-time purchase**. Public MIT source (dev portfolio), packaged 1-click versions sold on Whop, marketing hub at [advancedmarketing.co/software](https://advancedmarketing.co/software/).

This repo is the **program brain**: the roadmap, the shared build spec, and a complete build plan for every not-yet-built product — so any developer (or AI agent, on any model) can resume the program cold.

## How to build the next product

1. Read `BUILD-SPEC.md` (shared requirements: stack, dual-mode desktop/VPS, repo files, launch-kit contents, verification rules).
2. Pick a 📋 product in `ROADMAP.md` and read its `plans/<app>.md` — it contains the full feature list, architecture, data model, API surface, smoke-test assertions, launch-kit requirements, and known gotchas.
3. Build it in its own directory, verify per the plan's smoke-test spec, `git init` + commit.
4. Publish with `node publish.js <dir> "<description>"` (creates the public repo on github.com/bensblueprints and pushes; PAT read from `~/.ghpat`).
5. Add its landing page + comparison posts to advancedmarketing.co (`build-software.js` generator in the `advancedmarketing-main` repo).

## Shipped so far (15)

| Brand | Repo | Replaces |
|---|---|---|
| PDFsmith | [pdf-toolkit](https://github.com/bensblueprints/pdf-toolkit) | SmallPDF $15/mo |
| Cutaway | [bg-remover](https://github.com/bensblueprints/bg-remover) | remove.bg $9/mo |
| WhisperDesk | [whisper-transcriber](https://github.com/bensblueprints/whisper-transcriber) | Otter.ai $16.99/mo |
| Shrinkray | [image-compressor](https://github.com/bensblueprints/image-compressor) | TinyPNG Pro |
| ClipDeck | [screen-recorder-desktop](https://github.com/bensblueprints/screen-recorder-desktop) | Loom $15/mo |
| Upwatch | [uptime-monitor](https://github.com/bensblueprints/uptime-monitor) | UptimeRobot/Pingdom |
| Trimly | [link-shortener](https://github.com/bensblueprints/link-shortener) | Bitly $29/mo |
| Billcraft | [invoice-generator](https://github.com/bensblueprints/invoice-generator) | FreshBooks $19/mo |
| Bookslot | [booking-page](https://github.com/bensblueprints/booking-page) | Calendly $10/mo |
| Formforge | [form-builder](https://github.com/bensblueprints/form-builder) | Typeform $29/mo |
| PostDock | [social-scheduler](https://github.com/bensblueprints/social-scheduler) | Buffer |
| Linkleaf | [link-in-bio](https://github.com/bensblueprints/link-in-bio) | Linktree |
| Scantrail | [qr-tracker](https://github.com/bensblueprints/qr-tracker) | QR Tiger $15/mo |
| Cardsmith | [og-image-studio](https://github.com/bensblueprints/og-image-studio) | Bannerbear $49/mo |
| SigCraft | [email-signature](https://github.com/bensblueprints/email-signature) | WiseStamp $6/mo |

Batches 4–5 (Statfox, Shipnotes, Hearback, Docwell, Chatlet, Boardly, Timevault, Streakly, Deepdesk, Quillpad) are in active build. Batches 6–10 are fully planned in `plans/`.

## Program conventions

- Ports 5301+ assigned per product in ROADMAP.md (smoke tests use offset ports — see each plan).
- Cross-cutting gotchas every builder must know: better-sqlite3 Node-vs-Electron ABI (vendored dual-binding pattern in `link-in-bio/scripts/setup-native.js`), never write JSON via PowerShell 5.1 (BOM), never broad-kill node/electron processes during tests (parallel builds), BYO SMTP for all email.
- Whop checkout is a placeholder (`https://whop.com/onetime-suite`) until products are created in the Whop dashboard.
