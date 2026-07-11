# Punchcard — Build Plan (Batch 15, #74)

## One-liner & positioning
Employee time tracking + timesheet approval: clock in/out, weekly timesheet submission, manager approval, payroll-ready export. **$29 one-time** vs QuickBooks Time **$10+/user/mo** (Elite tier).

## MVP features
- Clock in/out (web + optional simple PIN-pad kiosk mode for shared devices), break tracking, daily hours auto-calculated.
- Weekly timesheet view per employee: hours by day, edit/annotate (with edit-audit note required), submit for approval.
- Manager approval queue: approve/reject with comment, bulk-approve.
- Overtime rule flagging (>40hrs/week highlighted, configurable threshold).
- Payroll export CSV (employee, regular hours, OT hours, period) formatted for common payroll import.

## Architecture
Web app, port **5357**. Node+Express+better-sqlite3+React/Vite/Tailwind. Desktop wrapper useful for a front-desk kiosk mode.

## Data model
`employees`(id, name, hourly_rate), `punches`(id, employee_id, type in/out/break_start/break_end, at), `timesheets`(id, employee_id, week_start, status, submitted_at), `approvals`(id, timesheet_id, approver, decision, comment, at).

## Launch kit notes
Angle: "QuickBooks Time is a punch clock and an approval button rented monthly per employee." SEO: quickbooks time alternative, employee time clock software free, timesheet approval app self hosted, punch clock software one time purchase.
