# Hirestack — Build Plan (Batch 15, #71)

## One-liner & positioning
Lightweight applicant tracking system: job postings, candidate pipeline (kanban stages), resume storage, interview notes. **$49 one-time** vs Greenhouse/BambooHR ATS add-ons (typically $100s/mo).

## MVP features
- Job postings: title, description, public application-form link (name/email/resume upload/cover letter).
- Pipeline kanban per job: stages (applied/screening/interview/offer/hired/rejected), drag candidates between stages.
- Candidate profile: resume file, notes/comments (multi-user), interview scorecards (simple rubric: rating 1-5 per criterion + comments), email thread log (manual paste or SMTP send-from-app).
- Search/filter candidates across all jobs by tag/stage/rating.
- Public careers page (list of open job postings, brandable) auto-generated from postings.

## Architecture
Web app, port **5354**. Node+Express+better-sqlite3+React/Vite/Tailwind, file storage for resumes on local disk/volume.

## Data model
`jobs`(id, title, description, status, public_slug), `candidates`(id, job_id, name, email, resume_path, stage, rating), `notes`(id, candidate_id, author, body, at), `scorecards`(id, candidate_id, interviewer, criteria_json, at).

## Launch kit notes
Angle: "Full ATS suites are built for 200-person companies and priced like it — this is the kanban board and resume folder a 5-20 person company actually needs." SEO: greenhouse alternative small business, free applicant tracking system, ats software one time purchase, hiring pipeline tool self hosted.
