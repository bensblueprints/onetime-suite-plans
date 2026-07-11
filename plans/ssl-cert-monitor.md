# Certwatch — Build Plan (Batch 12, #59)

## One-liner & positioning
Monitors SSL/TLS certificate expiry + domain expiry across all your sites, alerts before renewal deadlines. **$24 one-time** vs SSL monitoring add-ons on uptime tools ($10-20/mo) or dedicated services like SSLMate.

## MVP features
- Add domains; scheduled check (TLS handshake via Node `tls` module) pulls cert issuer, expiry date, chain validity, key strength; WHOIS lookup for domain expiry (best-effort, some TLDs no WHOIS).
- Dashboard: traffic-light grid (green >30d, yellow <14d, red <7d or expired/invalid).
- Alerts at configurable thresholds (30/14/7/1 day) via email + webhook.
- History log of check results; certificate chain viewer.

## Architecture
Web app, port **5346**. Node+Express+better-sqlite3+React/Vite/Tailwind, in-process scheduler (reuse Pingcron's checker pattern).

## Data model
`domains`(id, hostname, port), `cert_checks`(id, domain_id, checked_at, expires_at, issuer, valid, error), `domain_whois`(domain_id, expires_at, checked_at), `alerts`(id, domain_id, threshold, channel, sent_at).

## Launch kit notes
Angle: "One expired cert is a 2am page and a customer-facing outage — this is $24 once instead of a line item on your monitoring bill." SEO: ssl expiry monitor, certificate expiration alert tool, domain expiry monitor self hosted, ssl monitoring free alternative.
