---
description: Keeps the root directory clean by moving ad-hoc scripts and temporary files to a gitignored .temp directory.
---

# Cleanup Workflow (`/cleanup-temp`)

> [!TIP]
> Use this workflow to declutter your workspace and organize "one-off" scripts.

## ⚠️ Trigger Conditions
- Keywords: "Clean up files", "Move temporary scripts", "Organize workspace", "Declutter".

## 1. Discovery
- [ ] **Scan**: Look for files in the root or `src/` that look temporary:
    - Patterns: `temp_*`, `test_*.ts`, `*.old.ts`, `backup_*`, `migration_v*_debug.sql`, `lint*`.
- [ ] **Classify**: For each file found, determine:
    - Its intended use (read comments or logic).
    - If it's still needed or should be deleted.

## 2. Organization
- [ ] **Prepare**: Ensure the `.temp/` directory exists in the project root.
- [ ] **Gitignore**: Ensure `.temp/` is added to your [`.gitignore`](file: .gitignore).
- [ ] **Move**: Move the identified files to `.temp/`.

## 3. Reporting
- [ ] **List**: Provide the user with a table of what was moved:
    | Original Path | New Path | Intended Use |
    | :--- | :--- | :--- |
    | `...` | `...` | `...` |

## 4. Final Review
- [ ] **Deletion**: Ask the user if any of the moved files can be deleted permanently.
- [ ] **Architecture**: Ensure no critical modules were accidentally moved.