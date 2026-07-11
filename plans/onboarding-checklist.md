# Rampcheck — Build Plan (Batch 15, #73)

## One-liner & positioning
New-hire onboarding checklists + simple training docs: assign a template checklist per role, track completion, house SOPs/policies. **$29 one-time** vs Trainual **$99/mo**.

## MVP features
- Checklist templates per role (e.g. "Sales Rep Onboarding": 15 steps across day 1/week 1/month 1), assign to new hire, track step completion (self-check-off + manager verify toggle).
- Content library: SOP/policy docs (rich text, embeddable video/PDF links) organized by category, linked from checklist steps.
- New-hire portal: their personal checklist + linked docs, progress bar.
- Manager dashboard: all active onboardings, overdue-step alerts, completion rate report.
- Simple quiz step type (optional): multiple-choice check-for-understanding at end of a doc.

## Architecture
Web app, port **5356**. Node+Express+better-sqlite3+React/Vite/Tailwind.

## Data model
`templates`(id, role_name), `template_steps`(id, template_id, title, doc_id, order, due_offset_days), `docs`(id, title, body_html, category), `onboardings`(id, employee_name, template_id, started_at), `step_progress`(id, onboarding_id, step_id, done, verified, done_at).

## Launch kit notes
Angle: "Trainual is $99/mo to host a checklist and some docs." SEO: trainual alternative, employee onboarding software free, new hire checklist tool, sop documentation software self hosted.
