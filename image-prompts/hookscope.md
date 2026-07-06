# Hookscope — Image Prompts

**Accent:** `#C084FC` · **Repo:** [hookscope](https://github.com/bensblueprints/hookscope) · **Replaces:** Webhook.site Pro (€9/month, ~$120/yr) · **Price:** $24 one-time

> **Style block — prepend to every prompt below:**
> Premium dark-mode SaaS product visual, near-black background (#0B0E14), single accent color #C084FC with soft neon glow, high contrast, subtle grid texture, clean modern sans-serif UI, soft shadows, cinematic rim lighting, crisp render, no text unless specified.

## Hero image (16:9)

A giant translucent magnifying lens hovers over a stream of incoming webhook packets — small glowing envelopes of JSON flying along a violet #C084FC data pipeline toward a capture funnel; under the lens one request is frozen and exploded into layers: method badge, headers sheet, and a pretty-printed JSON body glowing with syntax colors. A second luminous pipe loops back out of the funnel, replaying a captured request toward a distant endpoint. Floating UI hint: a request-list panel from the app with colored method badges. Cinematic, forensic, premium dark.

## Dashboard mockup (16:10)

Stylized screenshot-like render of the Hookscope inspector: dark UI, violet #C084FC accents, split view. Left: a live request list for bin "stripe-dev" with colored method badges — POST, POST, GET, PUT — paths like "/in/stripe-dev/webhook", relative times ("2s ago", "1m ago"), sizes, and one row marked "forwarded 200". Right: detail tabs Headers / Body raw / Body pretty / Query with Body pretty active, showing syntax-highlighted JSON containing "event": "order.created" and "amount": 1999, plus source IP and content-type metadata; a "Copy as curl" button and a Replay button glowing violet. Filter-by-method dropdown and search box in the toolbar.

## OG / social card (1200×630)

Dark #0B0E14 card with subtle grid texture. "Hookscope" set very large left in clean sans-serif with a soft #C084FC glow. Below in white: "See every webhook. Replay any of them. On your own server." Right side: a floating inspector fragment — a request row with a violet POST badge feeding into a pretty-printed JSON pane — with a looping replay arrow glyph glowing #C084FC, neon rim light. Bottom-left: rounded badge with exact text "$24 once · no subscription", violet outline.

## Product Hunt gallery (5)

### 1. Hero
Split-view inspector, dark UI: live request list on the left with mixed colored method badges (POST, GET, PUT) and relative timestamps, a syntax-highlighted pretty-printed JSON body on the right; violet #C084FC accents, premium glow.

### 2. Replay
The replay panel open over a captured request: target URL field filled with an https endpoint, a violet "Replay" button, the target's 200 response shown inline with status pill and body, and a replay-history list of two earlier attempts below; dark UI.

### 3. Bin settings modal
A bin settings modal, dark UI: custom response section with status code set to 418, a response body field and delay input; forwarding section with a target URL and an enabled toggle glowing #C084FC; retention setting showing "keep 500 newest"; soft shadows.

### 4. Terminal
Side-by-side composition: a dark terminal running exact text `curl -X POST .../in/abc123 -d '{"event":"order.created"}'` on the left, and the Hookscope dashboard on the right with that request appearing at the top of the list highlighted violet; a copy-as-curl output block beneath; cinematic glow.

### 5. Comparison card
Pricing graphic, exact text rows: "Hookscope — $24 once" glowing #C084FC, "Webhook.site — €9/mo", "Pipedream — $29/mo", "Beeceptor — $10/mo" in muted white; beneath, three bullet chips with exact text "URLs never expire", "your server", "MIT source"; dark background, subtle grid, no other text.
