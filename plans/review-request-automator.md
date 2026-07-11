# Askback — Build Plan (Batch 17, #84)

## One-liner & positioning
Automated review-request tool for local businesses: after a job/visit, send an SMS/email asking for a Google review, filter unhappy customers to private feedback first. **$34 one-time** (BYO Twilio/SMTP) vs Podium **$289/mo**.

## MVP features
- Trigger a review request per customer (manual add or CSV/booking-import), send SMS/email with a short "how was it?" link.
- **Smart routing (gate)**: 4-5 stars → direct link to Google review page; 1-3 stars → routed to a private feedback form (captures complaint, notifies business owner) instead of a public review — standard, TOS-compliant "route unhappy customers to private feedback" pattern (not review-gating/suppression of negative reviews, which several platforms now prohibit — be explicit in README this filters *where feedback goes*, not *whether it's collected*).
- Campaign stats: requests sent, response rate, star distribution, reviews-clicked-through.
- Templates with merge fields, follow-up reminder if no response after N days.
- **BYO Twilio + SMTP**, same rationale as Remindly.

## Architecture
Web app, port **5362**. Node+Express+better-sqlite3+React/Vite/Tailwind, scheduler for follow-ups, Twilio + nodemailer.

## Data model
`customers`(id, name, phone, email, job_ref), `requests`(id, customer_id, sent_at, channel), `responses`(id, request_id, rating, feedback_text, routed_to public/private, at).

## Launch kit notes
Compliance note in README: this implements customer-experience routing, not review suppression — Google's guidelines prohibit discouraging negative reviews specifically; keep language and flow honest (ask everyone, just offer unhappy customers a private channel first). Angle: "Podium is $289/mo for a text message and a star-rating gate." SEO: podium alternative, review request software self hosted, google review automation tool, get more google reviews app.
