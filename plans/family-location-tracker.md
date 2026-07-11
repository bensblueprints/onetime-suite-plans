# FamPing — Build Plan (Batch 21, #101)

## One-liner & positioning
Family/kid location tracker: child logs into a companion app, location pings every 5 minutes to a real-time parent dashboard with geofencing and history. **$39 one-time** vs Life360 Gold/Silver **$7.99-14.99/mo** ($95-180/yr).

## MVP features
- Kid mobile client (Capacitor Android/iOS, shared engine w/ Fieldtrack #102): login with family code, background GPS ping every 5 min, adaptive interval on low battery, visible "location sharing active" indicator (never covert).
- Parent web dashboard: live map (Leaflet/OSM), each family member's current pin + last-seen time + battery %, path history for the day (reuse Fieldtrack's stop-clustering to show "at school 6h40m", "at home", etc. — same engine, framed as places-visited instead of sales stops).
- Geofences: draw zones (home, school, grandma's) — enter/exit push notification + dashboard event log ("Emma arrived at School, 8:02am").
- Multiple parents/guardians per family, multiple kids; SOS button in kid app (instant ping + alert to all parents).
- History log: scrollable timeline of arrivals/departures per day, export.

## Architecture
Shares the **location-ping engine** with Fieldtrack (#102) — same ingest API, stop-clustering, and Capacitor mobile shell, different branding/UI/dashboard framing (family map vs sales-rep map) and separate repo/Whop listing. Web dashboard React/Vite/Tailwind + Leaflet. Web app, port **5373**.

## Data model
`families`(id, code), `members`(id, family_id, name, role parent/child, device_id), `pings`(id, member_id, lat, lng, accuracy, battery, at), `stops`(id, member_id, lat, lng, arrived_at, left_at, duration_s), `geofences`(id, family_id, name, lat, lng, radius_m), `geofence_events`(id, geofence_id, member_id, type enter/exit, at).

## Launch kit notes
Real pricing: Life360 Silver $7.99/mo, Gold $14.99/mo (~$95-180/yr per family); Google Family Link is free but lacks geofence-history/SOS depth. Angle: "Life360 sells you back your own kid's GPS coordinates every month — pay once." Communities: r/Parenting (careful, rules vary), r/homeschool, local parent Facebook groups. SEO: life360 alternative, family gps tracker app, kid location tracker no subscription, geofence app for parents.

## Risks / gotchas
- **Consent & legal**: only for tracking your own minor children (or with explicit adult consent) — README states this plainly; never market as covert/hidden tracking of another adult (stalkerware liability).
- Same background-GPS-on-iOS caveat as Fieldtrack: Capacitor native app required, not a bare PWA.
- Battery drain is the top complaint category for this app type — ship the adaptive-interval logic from the shared engine, test on real low-end Android hardware.
- App-store review risk: location-tracking-of-minors apps get extra scrutiny on Google Play/App Store — read current policy before submission, be ready for a privacy-policy + parental-consent-flow requirement.
