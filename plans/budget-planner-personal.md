# Ledgerlite Home — Build Plan (Batch 16, #76)

## One-liner & positioning
Local personal/household budgeting app: envelope-style zero-based budget, manual transaction entry or CSV bank-export import, category spend tracking. **$15 one-time desktop** vs YNAB **$14.99/mo** ($99/yr).

## MVP features
- Zero-based budget: assign every dollar of income to a category envelope, rollover unspent (configurable per category).
- Transactions: manual entry + CSV import (map columns once, remember mapping per bank export format), auto-categorize by remembered payee rules.
- Envelope view: budgeted vs spent vs available per category, over-budget warning.
- Reports: spend by category over time (bar/line), net worth tracker (optional manual account balances entry).
- Multiple budgets/profiles (e.g. personal + side business) in one install.

## Architecture
Electron desktop app, React/Vite/Tailwind, local SQLite.

## Data model
Local SQLite: `categories`(id, name, budgeted, rollover), `transactions`(id, date, payee, amount, category_id, account), `accounts`(id, name, balance), `payee_rules`(payee_pattern, category_id).

## Launch kit notes
Angle: "YNAB is a spreadsheet with rules, rented at $99/yr forever." SEO: ynab alternative free, envelope budgeting app offline, personal budget software no subscription, zero based budget tool desktop.
