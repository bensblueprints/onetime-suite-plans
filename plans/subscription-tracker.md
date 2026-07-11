# Renewcheck — Build Plan (Batch 16, #77)

## One-liner & positioning
Local subscription/recurring-bill tracker: log every subscription, see monthly/annual total, get renewal reminders before you're charged. **$15 one-time desktop** vs Rocket Money's premium tier (donation-based, effectively $3-12/mo) or Bobby app subscriptions.

## MVP features
- Add subscriptions: name, amount, billing cycle (monthly/annual/custom), next renewal date, category, logo (small bundled icon set + fallback initials).
- Dashboard: total monthly spend, total annual spend, upcoming renewals (next 7/30 days) list.
- Reminders: local notification N days before renewal (configurable per subscription).
- "Trial ending" flag type for free-trial tracking specifically (the classic forgot-to-cancel trap).
- Category breakdown chart (streaming, software, fitness, etc.), spend-over-time trend.
- Manual CSV import for bulk-adding from a bank statement scan (paste rows).

## Architecture
Electron desktop app, React/Vite/Tailwind, local SQLite, OS-native notifications for reminders.

## Data model
Local SQLite: `subscriptions`(id, name, amount, cycle, next_renewal, category, is_trial, trial_ends_at, notes).

## Launch kit notes
Angle: "Apps that track your subscriptions are, themselves, a subscription — this one isn't." SEO: rocket money alternative free, subscription tracker app offline, recurring bill tracker no subscription, trial reminder app.
