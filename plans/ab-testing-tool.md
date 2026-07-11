# Splitpoint — Build Plan (Batch 14, #70)

## One-liner & positioning
Self-hosted A/B testing / feature-flag tool: create experiments, split traffic, track conversion goals, statistical significance calculator. **$49 one-time** vs VWO **$199/mo** or Optimizely enterprise pricing.

## MVP features
- Experiments: define variants (control + N), traffic split %, targeting (URL match, device), goal event (JS `track()` call or pageview-URL-match conversion).
- Client SDK: tiny JS snippet, `splitpoint.getVariant('exp_key')` returns assigned variant (sticky via cookie/localStorage), works for both visual (CSS/DOM swap) and code-level (React hook wrapper provided) tests.
- Results dashboard: visitors/conversions/conversion-rate per variant, confidence interval + simple significance calc (two-proportion z-test), "declare winner" workflow.
- Feature-flag mode: same infra, boolean flags with % rollout, no goal tracking required — reusable for gradual feature releases.
- Mutual exclusion groups (optional) so overlapping experiments don't contaminate each other.

## Architecture
Web app, port **5353**. Node+Express+better-sqlite3+React/Vite/Tailwind dashboard; lightweight client SDK (vanilla JS, <3kb) served as a static asset.

## Data model
`experiments`(id, key, status, traffic_pct, targeting_json), `variants`(id, experiment_id, name, weight), `assignments`(id, experiment_id, variant_id, visitor_id, at), `goal_events`(id, experiment_id, visitor_id, at), `flags`(id, key, rollout_pct).

## Launch kit notes
Angle: "VWO is $199/mo for a coin flip and a chi-squared test." SEO: vwo alternative, optimizely alternative self hosted, ab testing tool open source, feature flag self hosted free.
