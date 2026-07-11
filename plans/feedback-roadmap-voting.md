# Voicebox — Build Plan (Batch 20, #100)

## One-liner & positioning
Self-hosted public feedback board + roadmap: users submit ideas, upvote, you post status updates (planned/in-progress/shipped). **$34 one-time** vs Canny **$50+/mo**.

## MVP features
- Public board: submit idea (title/description/category), upvote (one per user, email or anonymous+cookie), comment thread per idea.
- Admin: change status (under review/planned/in progress/shipped/declined with reason), merge duplicate ideas, respond officially (pinned admin reply).
- Roadmap view: kanban-style public roadmap (columns = statuses) auto-populated from idea statuses.
- Changelog integration note: pairs naturally with the already-shipped Shipnotes (changelog-roadmap) — "shipped" ideas can link to the changelog entry that announced them.
- Embeddable "feedback" launcher widget for embedding the board inside an app.

## Architecture
Web app, port **5372**. Node+Express+better-sqlite3+React/Vite/Tailwind.

## Data model
`ideas`(id, title, description, category, status, votes, created_at), `votes`(id, idea_id, voter_key), `comments`(id, idea_id, author, body, is_admin, at).

## Launch kit notes
Angle: "Canny is $50+/mo to host an upvote button and a kanban board of your own users' ideas." SEO: canny alternative self hosted, feature request board software free, public roadmap tool, feedback voting widget one time purchase.

## Meta-use note
This app is itself the natural home for the community's own "vote the next SaaS to kill" mechanic described in the BenjisAiEmpire press kit (Section 3.2) — consider dogfooding it publicly as the official OneTime Suite roadmap-voting board once shipped.
