# Vaultly — Build Plan (Batch 12, #56)

## One-liner & positioning
Self-hosted team password manager: end-to-end encrypted vault, shared folders, browser autofill via extension-free bookmarklet or copy-paste, audit log. **$39 one-time** vs 1Password Teams **$7.99/user/mo** or Bitwarden Teams $4/user/mo.

## MVP features
- Client-side AES-256 encryption (master password never leaves browser; zero-knowledge server per Bitwarden model).
- Vault items: login (url/user/pass/notes/TOTP secret), secure note, card. Folders + shared vaults with per-user access.
- Password generator; strength meter; breach-check via local HaveIBeenPwned k-anonymity API call (optional, off by default).
- TOTP code generation inline (otpauth), copy-to-clipboard with auto-clear timer.
- Audit log: who accessed/edited/shared what, when.
- Admin: invite users, revoke access, org-wide vault export (encrypted).

## Architecture
Web app, port **5344**. Node+Express+better-sqlite3 (stores only ciphertext) + React/Vite/Tailwind. Crypto in-browser (Web Crypto API, PBKDF2/Argon2 for master key derivation). Desktop wrapper for local single-user use.

## Data model
`users`(id, email, encrypted_key_json, salt), `vault_items`(id, owner_id/shared_vault_id, ciphertext, iv), `shared_vaults`(id, name), `vault_access`(vault_id, user_id, role), `audit_log`(id, user_id, action, item_id, at).

## Launch kit notes
Be explicit in README: zero-knowledge, self-hosted, you own your keys. Angle: "Password managers are a subscription for math you can run on a $5 VPS." Communities: r/selfhosted, r/Bitwarden (careful, informational not competitive spam), r/sysadmin. SEO: bitwarden alternative self hosted, 1password alternative team, self hosted password manager open source, zero knowledge vault self hosted.

## Risks
Crypto correctness is the whole product — use audited primitives (Web Crypto, well-known libs), never roll custom crypto; document threat model honestly in README (server compromise ≠ vault compromise, but a compromised client is compromised).
