# Orgtree — Build Plan (Batch 15, #75)

## One-liner & positioning
Local org chart builder: add people/roles, drag to reorganize reporting lines, export a clean chart. **$19 one-time desktop** vs Pingboard **$99/mo**.

## MVP features
- Add people (name, title, photo, department, email), set manager (reporting line) via drag-connect or a dropdown.
- Auto-layout tree view (collapsible branches for large orgs), department color-coding.
- Multiple views: full tree, department-filtered, single-branch drill-down.
- Search person → highlight + auto-scroll to their node.
- Export PNG/PDF (full chart or filtered view), CSV import to bulk-load an existing roster.

## Architecture
Electron desktop app, tree layout via `d3-hierarchy` or a lightweight tree-layout lib, React/Vite/Tailwind renderer.

## Data model
Local SQLite: `people`(id, name, title, department, manager_id, photo_path, email).

## Launch kit notes
Angle: "Pingboard is $99/mo for a tree diagram with photos." SEO: pingboard alternative, org chart maker free, org chart software desktop, company hierarchy chart tool.
