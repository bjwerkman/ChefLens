---
description: Ensures docs/manual.md is updated whenever functional changes affect the user experience.
---

# User Manual Maintenance Workflow (`/update-manual`)

> [!TIP]
> Use this workflow whenever you implement a user-facing feature, change a UI flow, or modify application logic that impacts how the user interacts with the system.

## ⚠️ Trigger Conditions
- Keywords: "Add a feature", "Change UI", "Update logic", "New field", "Modify flow", "Bug fix (user-facing)".
- Files: Changes to components, pages, or complex business logic.

## 1. Analysis
- [ ] **Impact Assessment**: What has changed from the **user's perspective**?
- [ ] **Section ID**: Identify which section(s) in [`docs/manual.md`](file:///Users/ronaldtermaat/Applications/Eos/Eos/docs/manual.md) are affected.
- [ ] **New Sections**: Determine if a entirely new section or chapter is required.

## 2. Drafting
- [ ] **Clarity**: Write instructions in plain English (avoid technical jargon like "API", "Database", "React").
- [ ] **Visuals**: Check if existing screenshots or descriptions of the UI need updating.
- [ ] **Consistency**: Ensure the tone matches the existing manual.

## 3. Update & Sync
- [ ] **Formatting**: Ensure proper markdown headers and lists are used.
- [ ] **Version Type**: Decide if this is a `major` update (new feature/large rewrite) or `minor` (tweaks/clarity).
- [ ] **DB Sync**: Run the automated sync script:
  - For **Minor**: `cd backend && npm run sync-manual:dev`
  - For **Major**: `cd backend && npm run sync-manual:major`

## 4. Verification
- [ ] **Review**: Read the updated section to ensure it is helpful and accurate.
- [ ] **Cross-Reference**: Ensure any links to other parts of the manual still work.
