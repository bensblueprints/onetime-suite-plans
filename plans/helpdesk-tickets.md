# Deskly — Build Plan (Batch 11, #51)

## One-liner & positioning
Self-hosted email-to-ticket helpdesk: shared inbox, ticket statuses/priorities, canned replies, SLA timers, basic reporting. **$49 one-time** vs Zendesk from **$55/agent/mo** — pays for itself in under a month for any team of 2+.

## MVP features
- Inbound email via IMAP polling (or forwarding webhook) creates tickets; outbound replies via SMTP, threaded.
- Ticket list: status (open/pending/solved/closed), priority, assignee, tags; saved views/filters.
- Canned responses (macros) with variable substitution ({{customer_name}}).
- Internal notes vs public replies; @mention teammate.
- SLA timers per priority (first-response, resolution) with breach badge.
- Basic dashboard: tickets by status, avg first-response time, CSAT (thumbs up/down link in resolved email).
- Multi-agent with simple roles (agent/admin).

## Architecture (per BUILD-SPEC)
Web app, port **5341**. Node+Express+better-sqlite3+React/Vite/Tailwind. IMAP client (imapflow) + nodemailer for SMTP. Desktop wrapper for solo/small-team local use.

## Data model
`tickets`(id, subject, requester_email, status, priority, assignee_id, sla_due_at, created_at), `messages`(id, ticket_id, direction, body, from, is_internal_note, created_at), `macros`(id, name, body), `agents`(id, name, email, role), `tags`, `ticket_tags`.

## Launch kit notes
Real pricing: Zendesk Suite Team $55/agent/mo, Freshdesk $15-79/agent/mo, Help Scout $22-65/user/mo. Angle: "A 3-person team pays Zendesk $2,000/yr forever — or $49 once." Communities: r/smallbusiness, r/selfhosted, r/sysadmin. SEO: zendesk alternative self hosted, free helpdesk software, open source ticket system, email to ticket self hosted, one time purchase helpdesk.
