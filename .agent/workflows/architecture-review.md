---
description: Enforce architecture rules and design principles before completing tasks
---

# Architecture & Design Compliance Review

> [!CAUTION]
> **MANDATORY WORKFLOW** — This workflow MUST be consulted BEFORE making any code changes, not after.

## ⚠️ Trigger Conditions (ALWAYS CHECK FIRST)

This workflow is **AUTOMATICALLY TRIGGERED** when the user request involves ANY of the following:

| Trigger | Examples |
|---------|----------|
| **Styling/Colors** | Changing button colors, adding CSS classes, modifying themes |
| **UI Components** | Creating/modifying React components, buttons, modals, forms |
| **User Feedback** | Adding alerts, confirmations, toasts, error messages |
| **API Routes** | Adding new endpoints, modifying authentication |
| **Database Access** | Any data layer changes |
| **New Dependencies** | Adding npm packages |

**If the user request conflicts with ARCHITECTURE.md**, you MUST:
1. **STOP** before implementing
2. **WARN the user** about the conflict
3. Follow the workflow as described in [Propose Architecture Update] [file propose-architecture-update.md] 

---

## 1. Core Architecture Check

*   [ ] **Read the Rules**: Review [ARCHITECTURE.md](file ARCHITECTURE.md) to ensure you understand the strict Frontend/Backend separation.
*   [ ] **Check for Deviations**: If the user request conflicts with these rules, you MUST follow the [Propose Architecture Update](file .agent/workflows/propose-architecture-update.md) workflow.
*   [ ] **Automated Verification**: Run the architecture linter:
    ```bash
    npm run lint:arch
    ```
    *   **Pass**: Proceed.
    *   **Fail**: You MUST fix the violations or document them as explicit exceptions in `ARCHITECTURE.md` (only if absolutely necessary).

## 2. Frontend / UI Design Check

If your changes involve the UI (React components, CSS):

*   [ ] **Read the Design Rules**: Review [DESIGN.md](file /doc/UI/DESIGN.md) to ensure you understand the strict design and behaviour principles for the tables.

*   [ ] **Read the View Rules**: Review [VIEWDESIGN.md](file /doc/UI/VIEWDESIGN.md) to ensure you understand the strict design and behaviour principles for the views.

*   [ ] **Button Styling**:
    *   Did you use the correct Teal color `rgb(177, 193, 186)` for primary actions?
    *   Are modal buttons using the correct semantic colors (Cancel=Dark Teal, Delete=Red)?
    *   Are buttons `rounded-full`?
*   [ ] **User Feedback**:
    *   Did you use `window.alert` or `window.confirm`? **(FORBIDDEN)** -> Replace with Custom Modal or Toast.
    *   Are empty states handled?
*   [ ] **Theme**:
    *   Does it look good in Dark Mode? (`bg-background` = `#131314`)

## 3. Deployment & Security Check

*   [ ] **No Direct DB Access**: Confirm no new `supabase.from()` calls exist in the `src/` or `services/` directory (except for known debt).
*   [ ] **API Routes**: Did you add a new API route?
    *   Does it have `authenticate` middleware?
    *   Does it use `zod` for validation?