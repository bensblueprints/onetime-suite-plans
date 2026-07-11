# Pulsecheck — Build Plan (Batch 20, #98)

## One-liner & positioning
NPS/CSAT survey tool: send/embed a one-question survey, track score trend, follow-up on detractors. **$29 one-time** vs Delighted **$224/mo**.

## MVP features
- Survey types: NPS (0-10 "how likely to recommend"), CSAT (1-5), CES (effort score) — pick one per campaign.
- Delivery: embeddable widget (in-app), email send (via SMTP, merge fields), or standalone link.
- Response capture: score + optional free-text follow-up ("what's the reason for your score?").
- Dashboard: score trend over time, NPS calculation (promoters − detractors), response-rate, segment by tag (e.g. plan tier, if passed as a custom field).
- Detractor alert: webhook/email notification when a low score comes in, so the team can follow up fast.

## Architecture
Web app, port **5371**. Node+Express+better-sqlite3+React/Vite/Tailwind, lightweight embeddable widget script.

## Data model
`surveys`(id, type, question, active), `responses`(id, survey_id, score, feedback_text, respondent_email, tags_json, at), `alert_rules`(id, survey_id, threshold, channel).

## Launch kit notes
Angle: "Delighted charges $224/mo to ask 'how likely are you to recommend us, 0 to 10?' and do subtraction." SEO: delighted alternative, nps survey tool self hosted, csat survey software free, customer satisfaction survey tool one time purchase.
