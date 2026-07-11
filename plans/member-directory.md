# Roster — Build Plan (Batch 18, #89)

## One-liner & positioning
Self-hosted searchable member directory for associations/alumni groups/clubs: profiles, custom fields, search/filter, admin roster management. **$19 one-time** vs Glue Up membership-management pricing (typically $100s/mo).

## MVP features
- Member profiles: photo, contact info, custom fields (configurable per org: chapter, membership tier, industry, etc.), bio.
- Public/member-only directory: search + filter by any field, card or table view.
- Admin: bulk CSV import/export, membership status (active/lapsed/pending), renewal date tracking with expiry reminder email.
- Simple self-serve profile edit (member logs in with email/magic link, edits own info).
- Groups/chapters sub-listing if org has multiple chapters.

## Architecture
Web app, port **5367**. Node+Express+better-sqlite3+React/Vite/Tailwind.

## Data model
`members`(id, name, email, photo_path, custom_fields_json, status, joined_at, renewal_date, chapter_id), `chapters`(id, name), `field_defs`(id, key, label, type).

## Launch kit notes
Angle: "Membership platforms charge per-member monthly fees to host a searchable spreadsheet." SEO: glue up alternative, member directory software free, association management software self hosted, alumni directory tool.
