# Lessonforge — Build Plan (Batch 18, #86)

## One-liner & positioning
Self-hosted course/LMS platform: modules of video/text lessons, quizzes, student progress tracking, no per-transaction fee. **$49 one-time** vs Teachable **$39+/mo + transaction fees** or Thinkific.

## MVP features
- Courses → modules → lessons (video embed/upload, rich text, downloadable attachments); drag-reorder.
- Enrollment: manual add, self-serve signup with access code, or paid via Stripe Checkout (BYO Stripe key, no per-sale platform cut).
- Progress tracking: mark-complete per lesson, course completion %, certificate generation (PDF) on 100%.
- Quizzes: multiple-choice/true-false per module, pass threshold, retake allowed.
- Student dashboard (my courses, progress); instructor dashboard (enrollment count, completion rate, revenue if paid).

## Architecture
Web app, port **5364**. Node+Express+better-sqlite3+React/Vite/Tailwind, video via self-hosted file or external embed (YouTube/Vimeo unlisted) to avoid heavy video-infra scope for MVP.

## Data model
`courses`(id, title, price), `modules`(id, course_id, title, order), `lessons`(id, module_id, title, type, content_url_or_html, order), `enrollments`(id, course_id, student_email, enrolled_at), `progress`(id, enrollment_id, lesson_id, completed_at), `quiz_attempts`(id, enrollment_id, module_id, score, at).

## Launch kit notes
Angle: "Teachable takes a monthly fee AND a cut of every sale — this takes neither." SEO: teachable alternative no transaction fee, self hosted course platform, thinkific alternative, lms software one time purchase.
