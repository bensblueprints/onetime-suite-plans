# Remindly — Build Plan (Batch 17, #83)

## One-liner & positioning
SMS/email appointment reminder tool (BYO Twilio key): import appointments (manual or CSV/calendar sync), auto-send reminders, track confirmations, cut no-shows. **$34 one-time** vs SimpleTexting **$29+/mo** or dedicated reminder SaaS.

## MVP features
- Appointments: manual entry or CSV import (or connect to booking-page/Bookslot, already-shipped, via its API/export) — client name, phone, email, appointment time, service/notes.
- Reminder rules: send SMS/email at configurable offsets (24h before, 2h before), templated message with merge fields ({{client_name}}, {{time}}).
- Two-way confirm: reply "C" to confirm / "R" to reschedule (Twilio inbound webhook), status shown in dashboard (confirmed/pending/no reply).
- No-show tracking: mark past appointments as showed/no-show, no-show rate report per time slot/day (spot patterns).
- **BYO Twilio + SMTP** — same driver-pattern rationale as rank-tracker's BYO SERP API: metered SMS cost stays the user's own Twilio bill, keeping this a one-time tool.

## Architecture
Web app, port **5361**. Node+Express+better-sqlite3+React/Vite/Tailwind, in-process scheduler for send timing, Twilio SDK + nodemailer.

## Data model
`appointments`(id, client_name, phone, email, at, status, service), `reminder_rules`(id, offset_hours, channel, template), `sent_reminders`(id, appointment_id, rule_id, sent_at, response, confirmed).

## Launch kit notes
Real cost math: Twilio SMS ~$0.0079/msg US — 500 appts/mo ≈ $4 in SMS vs SimpleTexting $29+/mo minimum. Angle: "You're paying a SaaS markup on top of the SMS carrier fee you're already paying through them." SEO: simpletexting alternative, appointment reminder software self hosted, sms reminder tool byo twilio, reduce no shows software.
