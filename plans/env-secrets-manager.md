# Secretbox — Build Plan (Batch 12, #58)

## One-liner & positioning
Self-hosted team secrets/env-var manager: encrypted storage per project/environment, CLI to pull secrets into `.env`, access log. **$39 one-time** vs Doppler **$12/user/mo** (Team plan) or Infisical Cloud paid tiers.

## MVP features
- Projects → environments (dev/staging/prod) → key/value secrets, encrypted at rest (server-side envelope encryption, master key from `.env` on the host, never in DB).
- Web UI: add/edit/reveal (audit-logged) secrets, diff between environments, secret history/versions with rollback.
- CLI (`secretbox pull --project x --env prod > .env`) authenticated via API token; also `secretbox run -- npm start` to inject as process env without writing a file.
- Access control: per-project API tokens, read-only vs read-write, per-user roles.
- Audit log of every reveal/pull/edit.

## Architecture
Web app, port **5345**. Node+Express+better-sqlite3+React/Vite/Tailwind for the UI; small standalone Node CLI package (`secretbox-cli`) shipped alongside, talks to the server's REST API over HTTPS.

## Data model
`projects`, `environments`(id, project_id, name), `secrets`(id, environment_id, key, ciphertext, iv, version), `tokens`(id, project_id, scope, hashed_token), `audit_log`(id, actor, action, secret_id, at).

## Launch kit notes
Angle: "Doppler is $12/seat/mo to store key-value pairs — for a 5-person team that's $720/yr, forever." SEO: doppler alternative self hosted, env variable manager team, secrets manager open source, self hosted secret store.
