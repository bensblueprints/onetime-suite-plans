# Fieldtrack — Build Plan (Batch 21, #102)

## One-liner & positioning
Field-team location tracker for door-to-door sales/canvassing/flyering crews: reps' phones ping location every 5 min, manager dashboard shows live map + **auto-detected stops with dwell time** — proof reps are actually knocking doors, not driving in circles. **$49 one-time** vs Badger Maps $58-119/user/mo or SalesRabbit $25-45/user/mo.

## Core requirement: stop detection (this is the product)
Raw 5-min pings aren't enough — managers need to see *where reps stopped and for how long*, since a stationary cluster of pings = a door knocked / flyer route walked, vs a moving trail = driving between areas.
- **Stop-clustering algorithm**: group consecutive pings where consecutive-point distance < radius threshold (~40m, configurable) into a "stop"; a stop starts when 2+ consecutive pings fall within radius, ends when a ping breaks outside it. Store `stop(lat, lng, arrived_at, left_at, duration_s, ping_count)`.
- **Duration heuristics**: flag stops by duration band — <30s = "drive-by / no visit" (red), 30s-5min = "likely door knock" (green), >5min = "extended visit" (blue), configurable thresholds per campaign type (flyering vs sales).
- **Daily route replay**: map with numbered stop pins in chronological order + connecting path; click a stop to see arrival/departure time and duration.
- **Territory overlay**: draw/import zone polygons (GeoJSON), assign reps to zones, dashboard shows stops-per-zone coverage % (helps confirm the whole block got hit, not just easy houses).
- **Manual "mark as knocked" button** in the rep's mobile app (optional confirmation layered on top of auto-detected stops, for outcome tagging: no answer/not interested/sale/callback).

## MVP features (rest)
- Rep mobile client (Capacitor Android/iOS, shared engine w/ FamPing): login, background GPS ping every 5 min + on-demand "check in", low-battery-safe (adaptive interval if battery <20%).
- Manager web dashboard: live map (all reps, color-coded), per-rep daily stop list + total time-in-field + stops count + avg dwell time, CSV export for payroll/compliance.
- Multi-rep, multi-team (org → teams → reps); manager sees own team, admin sees all.

## Architecture
Shared **location-ping engine** (also powers FamPing #101): Node+Express+better-sqlite3 ingest API (`POST /ping {rep_id, lat, lng, accuracy, battery, at}`), stop-clustering as a scheduled/on-write job. Web dashboard React/Vite/Tailwind + Leaflet (OSM tiles, no Google Maps API cost) or Mapbox free tier. Web app, port **5374**. Capacitor mobile client is a separate `mobile/` folder in the repo (Android + iOS build configs per Neon Piano precedent), background geolocation via `@capacitor/background-geolocation`-style plugin or Capacitor Background Runner.

## Data model
`orgs`, `teams`, `reps`(id, team_id, name, device_id), `pings`(id, rep_id, lat, lng, accuracy, battery, at), `stops`(id, rep_id, lat, lng, arrived_at, left_at, duration_s, ping_count, band), `zones`(id, team_id, name, geojson), `knock_marks`(id, rep_id, stop_id, outcome, note, at).

## Launch kit notes
Real pricing: Badger Maps $58-119/user/mo, SalesRabbit $25-45/user/mo + setup fees, Spotio ~$39-99/user/mo. Angle: "Field-sales tracking tools charge per-rep-per-month for a GPS ping and a map — this is a flat fee, once, no per-seat tax as your team grows." Communities: r/sales, r/doortodoor, r/smallbusiness, canvassing/political-field-org communities. SEO: badger maps alternative, salesrabbit alternative, door to door sales tracker, canvassing app tracker, field rep gps tracker one time purchase, flyering route tracker.

## Risks / gotchas
- **Consent & legal**: this is employer tracking of employee location during work hours — README must state clearly this is for consenting employees on company devices/shifts, include a sample consent-to-track clause, and a rep-visible "tracking active" indicator in the mobile app (never silent/covert tracking — that crosses into stalkerware territory and is a legal liability for buyers).
- Background GPS on iOS Safari PWA is unreliable — Capacitor native wrapper is required for consistent 5-min background pings, not a bare web app.
- Stop-clustering radius/duration thresholds need to be tunable per use case (urban dense doors vs suburban spread-out routes) — don't hardcode.
- Battery drain complaints are the #1 support issue for GPS-ping apps — ship adaptive interval (widen ping interval when stationary/low battery) from day one.
