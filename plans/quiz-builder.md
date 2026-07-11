# Quizcraft — Build Plan (Batch 18, #87)

## One-liner & positioning
Embeddable quiz/interactive-form builder with branching logic and lead-gen result screens. **$29 one-time** vs Typeform **$25+/mo** or Outgrow **$14+/mo** (scales fast with volume).

## MVP features
- Builder: question types (multiple choice, text, rating, image choice), one-question-per-screen flow, conditional branching (if answer = X, jump to question Y).
- Scoring/result logic: point-based or answer-mapped result buckets ("You're a [Result A]") — core for the quiz-as-lead-magnet use case.
- Embed modes: full-page link, inline `<iframe>`/script embed, popup trigger.
- Response collection: dashboard of submissions, per-question breakdown/drop-off funnel, CSV export, optional email-capture gate before showing results (the classic lead-gen quiz pattern).
- Themes: color/font, progress bar style.

## Architecture
Web app, port **5365**. Node+Express+better-sqlite3+React/Vite/Tailwind; embed via lightweight iframe + postMessage for height auto-resize.

## Data model
`quizzes`(id, title, theme_json), `questions`(id, quiz_id, type, text, options_json, order), `branch_rules`(id, question_id, condition_json, next_question_id), `results`(id, quiz_id, name, criteria_json), `responses`(id, quiz_id, answers_json, result_id, email, at).

## Launch kit notes
Angle: "Outgrow and Typeform charge per response volume for a branching form." SEO: typeform alternative free, outgrow alternative, quiz maker for lead generation, interactive quiz builder self hosted.
