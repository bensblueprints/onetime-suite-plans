# Redirectly — Build Plan (Batch 20, #96)

## One-liner & positioning
Bulk 301/302 redirect manager for a domain: rules-based redirects, bulk CSV import, hit tracking, 404-to-redirect suggestions. **$24 one-time** vs Rebrandly's redirect/domain features gated behind **$29+/mo** enterprise tiers.

## MVP features
- Redirect rules: exact-match or wildcard/regex path, target URL, status code (301/302/307), active/inactive toggle.
- Bulk import/export CSV (for site migrations dumping hundreds of old-URL→new-URL mappings at once).
- Hit tracking per rule (count, last hit, referrer) — see which old URLs still get traffic.
- 404 log: if wired as the reverse-proxy target or via a small edge snippet, logs unmatched paths so you can spot high-traffic 404s and turn them into redirect rules with one click.
- Rule priority/ordering for overlapping patterns.

## Architecture
Web app, port **5369**. Node+Express+better-sqlite3+React/Vite/Tailwind. Runs as the actual redirect layer (reverse-proxied in front of the real site, or DNS-pointed for a full domain migration use case) or as an importable ruleset for nginx/Cloudflare (export nginx `rewrite` / Cloudflare Bulk Redirect JSON as an alternative to running it live).

## Data model
`rules`(id, match_type, pattern, target_url, status_code, active, priority, hits, last_hit_at), `not_found_log`(id, path, referrer, count, last_seen).

## Launch kit notes
Angle: "Enterprise redirect management is gated behind enterprise pricing for what's fundamentally a lookup table." SEO: rebrandly alternative, bulk redirect manager tool, 301 redirect tool free, site migration redirect mapping csv.
