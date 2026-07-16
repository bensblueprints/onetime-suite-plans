# OneTimeSuite Launch Runbook — 100 Apps in 100 Days

**Any agent harness (Claude Code, Cursor, cloud agent) can execute a launch from this document alone.**
State lives in Notion: **OneTimeSuite Launch HQ → 🚀 Launch Tracker** (database id `39fbe862-03b3-81b3-a5e0-d810bee92f38`, workspace "Benjamin Boyce's Workspace"). This file is the mirrored copy of the Notion "🤖 Agent Runbook" page; Notion is canonical for *state*, this file is canonical for *procedure*.

## The program

103 apps total. 3 launched (Bloom Recorder, WisperTalk, Linkleaf). The remaining 100 launch **one per day** (Day 1 = Captionly, 2026-07-17). A launch = installers/deploy published + site card flipped to "Available now" + Whop checkout verified + social posts on Facebook, LinkedIn, Discord + Notion row closed out.

## Claiming today's app

1. Query Launch Tracker for the row with the **lowest `Day #`** whose Status is not `LAUNCHED`.
2. Set Status → `Launching Today` and write `Last Agent Update` = date + agent name + "claimed".
3. Never leave a row in `Launching Today` at end of session — either `LAUNCHED` or `Blocked` (+ reason in `Blockers / Notes`).

Status flow: `Backlog → Prepping → Ready → Launching Today → LAUNCHED`, with `Blocked` as the escape hatch.

## Where things live

| Thing | Location |
|---|---|
| App working dirs | `C:/Users/ADMIN/Desktop/onetime-suite/<dir>/` (each its own git repo → pushes to PRIVATE clean-name repo) |
| Repo-name ≠ dir-name cases | table in `README.md` of this repo |
| Marketing site | `C:/Users/ADMIN/Desktop/onetimesuite-com/` → `bensblueprints/onetimesuite-com`, deploy via Coolify |
| GitHub PAT | `~/.ghpat` on the Windows machine |
| Coolify API | `http://212.28.184.24:8000` (dashboard DNS is dead; use IP). Coolify project "OneTime Suite" uuid `xwhnfb6v1aqotr9lv7u4r0fa`, env uuid `f9yxs44jcqfp402bibv86vru`, server uuid `lcu0gium6zc89ljq96woj37n`. Site app uuid `byc1vxrtnbq8vrvaj1vxnc3z` |
| Whop | company `biz_Ro2hWjwgeK5rm8` (whop.com/benjisaiempire); v1 API key location: see private notes / ask user. Checkout links per app already in the Notion row |
| Social posting | Composio connections (Facebook page, LinkedIn, Discord) — use the Composio MCP tools |
| License module | `onetime-suite/_shared/whop-license/` + `INTEGRATION.md`; registry at license.onetimesuite.com |
| Mac builds | **User's Mac mini** (SSH address: TBD — ask user once; needs Node 20 + Xcode CLT + GitHub PAT one-time setup) |

## RULES (non-negotiable)

- **All source pushes go to the PRIVATE clean-name repos.** Public `<app>-mvp` repos stay frozen — never push source there. Only **Releases** (compiled installers) are published on `-mvp` repos.
- **Installers built before 2026-07-16 are STALE** (no Whop license gate). Every launch rebuilds from current private-repo HEAD. The old `Z:\software` installers must not be shipped.
- Marketing = **onetimesuite.com only** (never advancedmarketing.co).
- Never use git-worktree isolation inside `Desktop/onetime-suite/` (app dirs are gitignored by the meta repo's whitelist).
- Never broad-kill node processes (parallel agents share the machine).
- No fake urgency/counters in any copy. Real caps only (1,000 licenses intro pricing).

## Launch-day pipeline

### A. All apps — verify build
```
cd Desktop/onetime-suite/<dir>
npm ci (if needed) && npm test   # or the app's smoke script; SKIP_LICENSE_CHECK=1 env for CI
```
Confirm the Whop license gate is present (`license-gate.js` required at top of Electron main, or `npm run activate` flow for servers).

### B. Desktop apps (Type = desktop) — installers
1. **Windows**: `npm run dist` → NSIS installer in `dist/` or `release/`. Gotcha: better-sqlite3 ABI → vendored dual-binding pattern (`link-in-bio/scripts/setup-native.js`).
2. **Mac arm64**: on the Mac mini — clone private repo, `npm ci && npx electron-builder --mac --arm64` → `.dmg`. Unsigned (no Apple Dev ID yet): release notes must include right-click-→-Open Gatekeeper instructions.
3. **Publish**: create Release `v1.0.0` on the **public `-mvp` repo** with `.exe` + `.blockmap` + `latest.yml` + `.dmg` (Bloom Recorder precedent: bensblueprints/bloomrecorder v1.0.0). Include unsigned-install instructions + Whop buy link in release notes.
4. Tick `Win EXE Built`, `Mac ARM64 DMG Built`, `Installers Released`, set `Release URL`.

### C. Web apps (Type = web) — Coolify deploy
1. **Fix Dockerfile first**: ensure `apk add python3 py3-setuptools make g++` (the py3-setuptools distutils fix — latent bug in ~25 apps; signature: gyp fails silently right after headers download). Commit to private repo.
2. Create Coolify application in project "OneTime Suite": `POST /api/v1/applications/private-deploy-key` style (private repos need a **deploy key** — Coolify strips PATs from URLs; precedent: license-registry app). build_pack=dockerfile.
3. **Persistent storage**: `POST /api/v1/applications/{uuid}/storages` with `type:"persistent"` for `/app/data` — named volume, verified to survive redeploys. Do NOT rely on anonymous volumes.
4. **Custom domain**: `<slug>.onetimesuite.com` — wildcard DNS + Traefik wildcard router already live; set the domain on the Coolify app.
5. Verify: health endpoint + admin login via curl; then tick `Web Deployed`, `Subdomain Live`, set `Live URL`.
6. Also publish a source Release on `-mvp`? No — web apps deliver via `npm run activate` self-hosting docs; the purchase gates activation.

### D. Site flip
1. In `onetimesuite-com/build.js` add the slug to `AVAILABLE_SLUGS`.
2. Ensure the product page has: real download links (Release URL) or Live URL, YouTube embed (auto from `src/youtube-videos.json`).
3. `node build.js`, commit, push, trigger Coolify deploy of app `byc1vxrtnbq8vrvaj1vxnc3z`, Playwright-verify the hub card shows green "Available now".
4. Tick `Site Flipped Available`. Gotcha: check `git log` for concurrent-session commits before editing this repo.

### E. Whop verify
`curl -s -o /dev/null -w "%{http_code}"` the checkout URL from the Notion row → expect 200. Tick `Checkout Verified`. (Copy limits if editing listings: description ≤1500 chars, headline ≤80, no `<`/`>`.)

### F. Social posts (Facebook, LinkedIn, Discord via Composio)
Template — adapt per app from its tagline/oneliner:
> 🚀 Day {N} of 100 apps in 100 days: **{App}** — {tagline}
> {one benefit sentence vs the subscription competitor}. ${price} once, no subscription.
> 🎬 {YouTube URL}
> 🛒 {Whop checkout} · 🌐 onetimesuite.com/{slug}
Post to all three channels; log each as a row in **📣 Social Post Log** (relation → app, Channel, Post URL, Posted At); tick `FB Posted` / `LinkedIn Posted` / `Discord Posted`.

### G. Close out
All type-relevant checkboxes ✓ → Status `LAUNCHED`, `Last Agent Update` = date + agent + summary. Definition of done:
- desktop: B + D + E + F complete
- web: C + D + E + F complete
- dual: B + C + D + E + F complete

## Prep-ahead lane (do this when not launching)

Work rows with `Day # ≤ today+3`: pre-build installers, pre-create Coolify apps + deploy keys, pre-fix Dockerfiles, draft social copy into `Blockers / Notes`. Set Status → `Prepping` / `Ready`. Launch day should take ~20 minutes.

## Known one-time setup still pending

- [ ] Mac mini SSH access + Node 20 + Xcode CLT (ask user for address/user; Tailscale preferred)
- [ ] Real-purchase Whop OAuth activation test (HANDOFF-2026-07-16 ⚠ item) — do before Day 1's desktop launch if possible
- [ ] 28 remaining promo videos auto-uploading nightly (`RepoClips-FinishYouTubeBatch` scheduled task; PC must stay on). Re-sync YouTube URLs into Notion after it drains: rerun `notion-seed.js` diff or update rows manually
- [ ] Dealstack (Day 84) has no landing-page data — build product page before its launch day
- [ ] Door Tracker / FamPing (Days 99-100): already deployed on Coolify sslip.io domains — migrate to real subdomains + mobile-app follow-ups
