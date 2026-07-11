# OneTimeSuite.com — Master Growth Plan

*Goal: make onetimesuite.com the definitive destination for pay-once software — the site that ranks for every "[competitor] alternative" search, converts with native Whop checkout, and keeps customers inside one account no matter where they bought.*

*Drafted 2026-07-11. Current state: onetimesuite.com live (nginx proxy of advancedmarketing.co/software), 56 apps + $997 bundle on the catalog, 57/102 products shipped, Whop storefront at whop.com/onetime-suite, 76 comparison posts live, 39/56 real screenshots, LinkLeaf/BloomRecorder/WisperTalk on separate domains with 9 more SEO posts being written.*

---

## 1. Architecture — hub and spokes (how the individual product sites fit)

The multi-site question has a clean answer: **Whop is the commerce backbone, onetimesuite.com is the account hub, individual domains stay as conversion spokes.**

```
                    ┌─────────────────────────────┐
                    │      WHOP (one company)      │
                    │  one product per app + the   │
                    │  bundle · checkout · webhooks│
                    └──────────────┬──────────────┘
              payments & entitlements flow through here
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
  linkleaf.im            onetimesuite.com              wispertalk.com,
  bloomrecorder.com      ══════════════════            product repos,
  (conversion spokes:    MASTER HUB:                   advancedmarketing.co
  keep them! exact-      · catalog + bundle            /software (canonicals
  match SEO domains)     · blog/SEO engine             point → onetimesuite)
                         · ACCOUNT DASHBOARD
                         · upsells & license keys
```

**Rules that make it work:**

1. **One Whop company, one product per app** (+ the $997 bundle as its own product). Every buy button on every domain points at the same Whop products. Whichever site converts, the customer record is identical.
2. **onetimesuite.com/dashboard = the single account.** "Sign in with Whop" (OAuth) → Whop API lists the user's memberships → dashboard renders one card per owned app: installer download, license key, docs, self-host guide. Purchases made on linkleaf.im or wispertalk.com appear automatically because they're the same Whop customer.
3. **Upsell in place.** Dashboard buttons — "Add another app", "Add device/license keys", "Upgrade to the full Suite (credit what you've paid)" — open Whop checkout for the delta. Whop webhooks (`membership.created`/`updated`) sync entitlements instantly.
4. **Keep the individual domains.** linkleaf.im, bloomrecorder.com, wispertalk.com are exact-match SEO assets and focused converters. Unify them with: a "Part of OneTimeSuite" badge/nav link, the same Whop checkout, and a post-purchase "manage everything at onetimesuite.com/dashboard" pointer.
5. **Canonical discipline (do this first).** Right now onetimesuite.com mirrors advancedmarketing.co/software — Google will treat that as duplicate content and split or suppress rankings. Fix: onetimesuite.com is the canonical master; advancedmarketing.co/software pages carry `rel=canonical` → onetimesuite.com equivalents. Apps with their own domain keep their own domain as canonical for their deep content; the hub's catalog card links out.
6. **WisperTalk exception:** it has its own Stripe + Postgres license stack. Don't break it — phase-2 bridge (webhook its purchases into the hub, or just deep-link its account page from the dashboard) until it migrates to Whop.

License keys: prefer Whop's native license keys where they fit; for anything custom, dogfood **Keymaster** (our own license server) driven by Whop webhooks — which is also a great public case study.

## 2. Replace the proxy with a native site

- New repo `onetimesuite-site`: port `build-software.js` (it already generates 134 pages well) but with a **OneTimeSuite brand identity** — its own logo, palette, and nav, not Advanced Marketing's agency chrome.
- Sections: catalog (Desktop / Web-Hosted split), 56 product pages, bundle page, comparison blog, `/dashboard` (the app).
- Tech SEO baked in: `sitemap.xml`, `robots.txt`, schema.org Product+FAQ (already in the generator), RSS feed for the blog, OG images generated with **Cardsmith** (dogfood).
- Static HTML = already-perfect Core Web Vitals.

## 3. The SEO content engine ("auto-blogging")

**Inventory:** the competitor-map method (two angles per competitor: "[X] alternative" + "open source [X] alternative") applied across all 56 apps ≈ **400–600 target keywords**. The 9 hand-verified posts for LinkLeaf/BloomRecorder/WisperTalk are batch 1; the existing 76 posts migrate over with updated canonicals.

**Pipeline (the "auto" part):**
1. Keyword backlog lives in the repo (`content-backlog.json`: competitor, app, angle, priority, status).
2. A **weekly scheduled job** (Claude Code cron task) picks the next 3–5 keywords → web-searches the competitor's *current* pricing and weaknesses → writes a genuinely differentiated post (real numbers, honest "who should stay with X" section — this is what keeps it ranking instead of flagged) → appends to the posts data → rebuilds → commits → deploys → refreshes sitemap + RSS.
3. **Guardrails:** every price cited gets a "verified [date]" note internally; mandatory honest-tradeoffs section; template rotation so posts don't read as find-and-replace clones; hard cap of ~5/week (mass-publishing hundreds at once is a doorway-page flag).
4. **Interlinking:** product page ↔ its posts ↔ sibling posts; every post CTA → product page + bundle. Hub-and-spoke internal linking is half of what makes programmatic SEO stick.
5. **Maintenance cron (monthly):** re-verify competitor pricing in the oldest 20 posts; stale pricing kills trust and rankings.
6. Weekly digest email ("this week's pay-once alternatives") via **Postbird** (dogfood) + RSS.

## 4. Conversion layer

- **Native Whop checkout per product** — product-specific checkout links/embeds on every page, not one generic storefront link.
- Intro-pricing scarcity surfaced site-wide (the 1,000-license counters for Door Tracker/FamPing, "$X now → $299 at launch").
- **Bravowall** testimonial wall embedded on the hub + bundle page; **Hearback** feedback widget (dogfood, and public proof the apps are real).
- Exit-intent + footer email capture → Postbird list.

## 5. Distribution beyond Google

- **AlternativeTo.net listings for all 56 apps** — the single highest-intent channel that exists for "alternative" seekers; each listing links back and drives the exact audience.
- **awesome-selfhosted** PRs + selfh.st + opensourcealternative.to for the 38 web apps (MIT + self-hostable = qualifies).
- **Product Hunt: one launch per week** — the `launch-kit/` folder in every app repo already contains the PH listing copy. 56 apps = a year of weekly launches.
- Reddit (r/selfhosted, r/opensource, r/degoogle), HN Show HN — the honest self-host/own-it angle plays well there *if* it's not salesy.
- YouTube shorts/demo videos per app, recorded with **BloomRecorder** (dogfood).
- GitHub SEO: repo descriptions/topics standardized, every README links to the product page + hub.

## 6. Measurement — dogfood publicly

Run the suite on itself and say so (it's both instrumentation and marketing proof):
- **Statfox** analytics on onetimesuite.com
- **Serpdeck** tracking the entire keyword backlog (BYO SerpAPI key)
- **Upwatch + Pingcron** watching the site and the content-engine cron
- Weekly automated SEO report (rankings moved, posts published, traffic, conversions)

## 7. Sequence

| When | What |
|---|---|
| **Week 1** | Native site replaces proxy · canonicals fixed (AM /software → onetimesuite) · per-product Whop checkout links · finish the 17 desktop-app screenshots · publish the 9 batch-1 posts |
| **Week 2** | Content-engine cron live (3–5 posts/wk) · AlternativeTo submissions begin · dashboard schema + Whop OAuth working |
| **Weeks 3–4** | Dashboard v1 ships (memberships, downloads, license keys, upsell checkout) · Product Hunt cadence starts · Bravowall/Hearback/Statfox embedded |
| **Ongoing** | Autopilot: 3–5 posts/wk, 1 PH launch/wk, monthly pricing re-verification, weekly SEO report |

## Risks & mitigations

- **Duplicate content across domains** → canonical fix is step one, before any more content ships.
- **Doorway-page penalty** → differentiation guardrails + capped cadence; every post must contain competitor-specific facts and an honest counter-recommendation.
- **Whop as single point of failure** → Keymaster stays warm as the fallback license path; installers also sold as direct downloads if ever needed.
- **WisperTalk's separate billing stack** → bridge, don't break; migrate to Whop only when the dashboard is proven.
