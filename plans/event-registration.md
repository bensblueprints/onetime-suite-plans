# Eventcraft — Build Plan (Batch 18, #90)

## One-liner & positioning
Self-hosted event registration/ticketing page: event page, ticket tiers, RSVP/checkout, check-in QR codes, no per-ticket fee. **$39 one-time** vs Eventbrite's **2.7% + $0.79/ticket** fees (adds up fast at volume) or Eventzilla.

## MVP features
- Event page builder: title, description, date/time/location (or virtual link), cover image, ticket tiers (free/paid, quantity limits, early-bird pricing windows).
- Registration/checkout: form fields (name/email + custom questions), Stripe Checkout for paid tickets (BYO Stripe key, zero platform fee).
- Confirmation email with a QR-code ticket (generated server-side).
- Check-in mode: scan QR at the door (webcam-based scanner in browser) → marks attendee checked-in, live attendee-count dashboard.
- Attendee list export CSV, capacity/waitlist handling when sold out.

## Architecture
Web app, port **5368**. Node+Express+better-sqlite3+React/Vite/Tailwind, `qrcode` for ticket generation, `jsQR`/browser camera API for check-in scanning.

## Data model
`events`(id, title, description, starts_at, location, cover_path), `ticket_tiers`(id, event_id, name, price, quantity, sold), `registrations`(id, event_id, tier_id, name, email, custom_answers_json, qr_code, checked_in_at, stripe_payment_id).

## Launch kit notes
Real cost math: 500 tickets at $20 through Eventbrite ≈ $500+ in fees; through Eventcraft, just Stripe's standard 2.9%+30¢ (no platform cut on top). Angle: "Eventbrite's fee is a tax on every ticket, forever — this is a flat fee, once." SEO: eventbrite alternative no fees, event registration software self hosted, ticketing platform one time purchase, event check in app qr code.
