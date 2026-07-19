# Daily Launch Tracker

`ROADMAP.md` marks all 103 products 🚀 (public repo published), but "published" and "actually fixed up and launched" are two different things. This tracker is for the second pass: **one app a day, go through it, fix it up, and get it properly launched** (Whop listing live, landing page live, working end-to-end) — not just sitting as a repo.

- **Source data:** [`LAUNCH-TRACKER.csv`](LAUNCH-TRACKER.csv) — id, repo, brand, platform (`web`/`desktop`), port (web apps only), price, and what it replaces. Parsed from `ROADMAP.md` + `README.md`.
- **Board:** tracked on the repo's [GitHub Project board](../../projects) — one card per app, generated from this CSV.
- **Board field `Launch Status`:** `Backlog → In Progress → Polished → Launched → Verified`
  - **Backlog** — not yet revisited since original build
  - **In Progress** — today's pick, actively fixing
  - **Polished** — bugs fixed, UI/UX pass done, smoke-tested locally
  - **Launched** — Whop listing / landing page live, publicly purchasable
  - **Verified** — confirmed working end-to-end in production (real purchase or full manual walkthrough)
- **Labels:** `platform:web` (VPS-hosted, has a port 5301–5374) or `platform:desktop` (installer/DMG), so you can filter the board by platform.

At one app/day, clearing the full backlog is ~103 days.
