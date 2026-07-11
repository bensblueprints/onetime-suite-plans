# Shiftly — Build Plan (Batch 15, #72)

## One-liner & positioning
Employee shift scheduling: drag-drop weekly calendar, shift swap requests, availability collection, labor-cost estimate. **$29 one-time** vs When I Work **$2.50/user/mo** or Deputy $4.50+/user/mo.

## MVP features
- Weekly/monthly calendar grid, drag-drop shifts onto employees, shift templates (morning/evening/etc.) for fast fill.
- Employee availability submission (recurring weekly + one-off time-off requests), scheduler sees conflicts highlighted red.
- Shift swap: employee requests swap with a colleague, manager approves; open-shift pickup board for unfilled shifts.
- Labor cost estimate: hourly rate per employee × scheduled hours, weekly total, over-budget warning.
- Publish/notify: publish a week's schedule, email/SMS-optional notification to affected employees; printable/exportable schedule PDF.

## Architecture
Web app, port **5355**. Node+Express+better-sqlite3+React/Vite/Tailwind, drag-drop via `@dnd-kit`.

## Data model
`employees`(id, name, hourly_rate, role), `shifts`(id, employee_id, starts_at, ends_at, role, published), `availability`(id, employee_id, day_of_week, start_time, end_time), `time_off_requests`(id, employee_id, starts_at, ends_at, status), `swap_requests`(id, shift_id, from_employee_id, to_employee_id, status).

## Launch kit notes
Angle: "$2.50/user/mo sounds cheap until you have 40 employees — that's $1,200/yr for a drag-drop calendar." SEO: when i work alternative, deputy alternative free, employee scheduling software one time purchase, shift schedule maker self hosted.
