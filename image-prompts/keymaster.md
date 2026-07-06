# Keymaster — Image Prompts

**Accent:** `#EAB308` · **Repo:** [keymaster](https://github.com/bensblueprints/keymaster) · **Replaces:** Keygen.sh (from $99/mo) · **Price:** $49 one-time

> **Style block — prepend to every prompt below:**
> Premium dark-mode SaaS product visual, near-black background (#0B0E14), single accent color #EAB308 with soft neon glow, high contrast, subtle grid texture, clean modern sans-serif UI, soft shadows, cinematic rim lighting, crisp render, no text unless specified.

## Hero image (16:9)

A monumental golden #EAB308 cryptographic key floating in dark space, its blade formed from glowing base64 character glyphs, casting warm rim light onto a ring of small orbiting machine icons — laptops and desktops each tethered by a thin light-thread of an activated seat. In the foreground, a clean floating UI hint: a license row card with a masked key "KM1.••••••••.sig", a green "active" status pill and a "2/3 seats" counter. Subtle grid floor, vault-like atmosphere, sovereign-ownership mood.

## Dashboard mockup (16:10)

Stylized screenshot render of the Keymaster admin dashboard in dark mode: top row of stat tiles reading "1,284 licenses · 2,431 active seats · 5,102 downloads"; beneath, a 30-day activations bar chart glowing amber #EAB308; below that, a license table with masked keys ("KM1.eyJs…9aQ"), copy-icon buttons, status pills (active, revoked, expired), seat counts like "2/3", and product names ("Hawkwatch Pro v2.1.0"). Sidebar with Licenses, Products, Webhooks, Settings; "Issue keys" button top right.

## OG / social card (1200×630)

Dark #0B0E14 canvas with subtle grid texture. "Keymaster" in large bold white sans-serif, left-aligned; beneath it the line "Self-hosted license keys your app verifies offline." in soft grey. Right side: a glowing golden #EAB308 key silhouette with an ed25519 signature ribbon of tiny glyphs wrapping around it. Bottom-left, a rounded badge reading "$49 once · no subscription".

## Product Hunt gallery (5)

### 1. Dashboard
Stat tiles (licenses, active seats, downloads) above a 30-day activation bar chart in amber #EAB308, dark admin UI with sidebar. Include the caption text "Your licensing business at a glance."

### 2. License table + issue modal
License table with masked keys and copy buttons, status pills, seat counters; a bulk-issue modal open on top with a quantity field set to "100", product dropdown and seats-per-license selector. Caption text "Issue 1 or 1,000 keys in one click."

### 3. Key format diagram
Annotated technical diagram on dark background: the string "KM1.<payload>.<signature>" split into three glowing segments with callout lines to a canonical JSON payload block and an ed25519 signature label, plus the note "verifiable offline with your public key". Caption text "A key format you can implement in any language."

### 4. Snippet code shot
Dark code-editor panel showing verify-node.js usage: `verifyLicense(userKey, PUBKEY)`, `machineFingerprint()`, and a fetch to `/api/v1/activate` — syntax-highlighted with amber accents, roughly 15 lines. Caption text "Integrate in 20 lines. No SDK."

### 5. License detail drawer + customer portal
Split composition: left, an admin drawer listing activations per machine fingerprint with per-machine "Deactivate" buttons; right, the public no-login customer portal page showing license status, "2 of 3 seats used" and a golden Download button. Caption text "Seat management for you, a no-login portal for them."
