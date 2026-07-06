# Wrangle — Build Plan (Batch 6, #29)

## One-liner & positioning
The developer's Swiss-army desktop app: convert, validate, format, query and diff JSON/CSV/YAML/XML, decode JWTs, encode base64/URL, hash, generate UUIDs, test regex, convert timestamps — 100% offline, no sketchy web tools. **$15 one-time** vs the scattered ad-riddled web tools (jsonformatter.org, jwt.io, regex101) and DevToys-style utility apps; closest paid comparable DevUtils (macOS, $29 but Mac-only). Tagline: "Stop pasting API keys into random websites."

## MVP feature list (tools, all offline)
1. **Convert** — any-to-any between JSON ⇄ CSV ⇄ YAML ⇄ XML (libs: `papaparse`, `js-yaml`, `fast-xml-parser`). Auto-detect input format; options: CSV delimiter/header row, JSON indent, XML attribute prefix. Handles arrays-of-objects for CSV; clear error when structure can't map (e.g. nested JSON → CSV flattens with dot notation).
2. **Validate + Format** — pretty-print / minify JSON, YAML, XML with precise error line/column highlighting on parse failure.
3. **Query (JSONPath)** — run JSONPath expressions (`jsonpath-plus`) against JSON input, live results panel, example cheatsheet sidebar.
4. **Diff view** — two-pane text diff with inline highlighting (`diff` npm, render side-by-side); "smart JSON diff" toggle that normalizes key order/whitespace before diffing.
5. **JWT decode** — paste token → header/payload pretty JSON, expiry human-readable + expired badge, signature NOT verified by default (offline; optional HS256 secret verification field using node `crypto`).
6. **Base64 / URL encode-decode** — text and file→base64 (drag-drop), URL encode/decode, base64url variant.
7. **Hash** — MD5/SHA-1/SHA-256/SHA-512 of text or dropped file (streaming for big files), uppercase toggle, HMAC mode with key.
8. **UUID** — v4 (crypto.randomUUID) and v7, bulk generate N, copy all.
9. **Regex tester** — pattern + flags, live matches with group highlighting, match table (index, groups), replace preview, common-patterns cheatsheet. Guard against catastrophic backtracking with a 2s worker timeout.
10. **Timestamp converter** — unix s/ms ⇄ ISO 8601 ⇄ local ⇄ UTC, "now" button, relative time, auto-detect s vs ms by magnitude.

Shared UX: every tool = input pane / options / output pane; copy button on all outputs; drag-drop file into any input; recent inputs per tool persisted locally (electron-store or JSON file in userData); global tool switcher (Ctrl+K palette + sidebar); everything works with zero network.

## Architecture
Per BUILD-SPEC this is a **desktop Electron app** (no port, no server). Electron main + preload + renderer; `npm start` runs it; electron-builder NSIS config present but `dist` not run. Renderer: React + Vite + Tailwind + Lucide + Framer Motion (spec allows plain HTML but React fits a 10-tool app). All parsing/conversion logic lives in plain-JS pure modules under `src/lib/*.js` with NO Electron/DOM imports — this is critical so `test/smoke.js` can run them under plain Node. Heavy work (file hashing, regex) in a Web Worker to keep UI responsive. Preload exposes only: file open/save dialogs, read/write file, clipboard. No better-sqlite3 needed — persistence is a small JSON prefs file (write via Node, never PowerShell).

## Data model
No database. `userData/wrangle-prefs.json`: `{ theme, lastTool, recentByTool: { [toolId]: [{ input: string (truncated 50KB), at }] (max 10) }, toolOptions: { [toolId]: {...} } }`. All tool state otherwise ephemeral.

## API endpoints
None (offline desktop). Internal IPC channels via preload: `file:open`, `file:save`, `file:readForHash` (returns stream/chunks), `prefs:get`, `prefs:set`, `clipboard:write`.

## UI screens
1. Main window: left sidebar (10 tools, Lucide icons, search filter) + tool workspace. 2. Command palette (Ctrl+K). 3. Each tool workspace as listed above (converter has format-pair selector; diff has dual editors). 4. Settings (theme, default indent, clear history). 5. About (version, MIT, Whop link). Dark default, monospace editors (plain `<textarea>`-based editor with line numbers is fine — avoid Monaco to keep bundle small; if syntax highlight desired use `highlight.js` on output panes only).

## Smoke test spec (`test/smoke.js`)
No app boot needed for logic — import `src/lib/*` pure modules directly under Node and assert real conversions (this matches "core processing logic verified with real fixtures"). `npm test` runs it; separately verify `npm start` boots the Electron window manually per BUILD-SPEC.
1. Convert: JSON fixture (3 objects, nested field) → CSV → parse back → deep-equal after flatten rules; JSON→YAML→JSON round-trip deep-equal; XML fixture → JSON asserting attribute handling; CSV with quoted commas parses to correct cell values.
2. Validate: malformed JSON returns `{ error, line, column }` with correct line number (fixture with error on line 3).
3. JSONPath: `$.store.book[?(@.price<10)]` on the classic bookstore fixture returns exactly 2 titles.
4. Diff: two JSON strings differing in one key → diff result contains exactly one added + one removed hunk; smart-diff of same data with shuffled keys → zero changes.
5. JWT: decode a locally-constructed HS256 token (build with `crypto` in the test) → payload matches, `expired=false`; expired-token fixture → `expired=true`; HS256 verify with right secret true, wrong secret false.
6. Base64: encode/decode round-trip incl. UTF-8 emoji; file→base64 on a generated 1KB binary fixture matches `Buffer.toString('base64')`.
7. Hash: SHA-256 of `"abc"` equals the known vector `ba7816bf...f20015ad`; file hash of generated fixture matches `crypto` direct.
8. UUID: 100 v4s all unique, regex-valid, version nibble `4`.
9. Regex: pattern `(\w+)@(\w+)\.com` against fixture returns matches with correct groups; catastrophic pattern `(a+)+$` on 40 a's + `b` returns timeout error (not a hang) within 3s.
10. Timestamp: `1700000000` → `2023-11-14T22:13:20.000Z`; ms auto-detection for 13-digit input.
Cleanup: delete generated fixtures; no processes spawned, nothing to kill.

## Launch kit requirements
Competitors: DevUtils (macOS $29, no Windows), DevToys (free OSS — angle: we're cross-tool-polished + one coherent UX + supports the maker), He3 ($9.9/mo!), random web tools (free but ads + you're pasting secrets/JWTs into strangers' servers — lead with this). Angle: "Your JWT contains prod credentials. Why are you pasting it into a website?" Reddit: r/webdev, r/devtools, r/programming (careful, show-don't-sell), r/node. SEO: offline json formatter, jwt decoder offline, devutils windows alternative, json to csv converter app, regex tester desktop.

## Risks / gotchas
- **No better-sqlite3 / no native modules at all** — keep it pure JS so there's no ABI issue and NSIS build stays trivial.
- Regex DoS: MUST run user regex in a worker with timeout; never on the main/renderer thread raw.
- CSV↔JSON is lossy by nature — define and document flatten rules (dot notation, arrays as JSON strings) rather than guessing.
- `fast-xml-parser` needs explicit options for attributes; lock them and test.
- **Never write prefs JSON via PowerShell** (BOM); Node `fs` only. Never broad-kill node/electron processes in any script.
