# Resumecraft — Build Plan (Batch 13, #62)

## One-liner & positioning
Local resume/CV builder: pick a template, fill structured sections, live-preview, export ATS-friendly PDF. **$19 one-time desktop** vs Zety **$23.70/mo** or Novoresume subscriptions.

## MVP features
- 6-8 bundled templates (single-column ATS-safe + a couple modern two-column), swap without losing data.
- Structured sections: contact, summary, experience (bullet points, drag-reorder), education, skills, projects, custom sections.
- Live WYSIWYG preview pane synced as you type; PDF export via headless print (Electron `printToPDF`) tuned for exact one-page fit with an "overflow" warning.
- ATS-safe mode toggle (strips columns/graphics, plain text order) + a plain-text export for pasting into job portals.
- Multiple resume versions per profile (tailor per job application), duplicate/rename.

## Architecture
Electron desktop app, React/Vite/Tailwind for form+preview, `electron printToPDF` for export.

## Data model
Local SQLite or JSON per profile: `resumes`(id, name, template, data_json).

## Launch kit notes
Angle: "Résumé builders are $24/mo to fill out a form and print a PDF — here's the form and the PDF, once." SEO: zety alternative, free resume builder no subscription, ats resume builder offline, resume maker desktop app.
