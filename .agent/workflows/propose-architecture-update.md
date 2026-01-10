---
description: Use this workflow when a user request conflicts with ARCHITECTURE.md or introduces a new design pattern.
---

# Architecture Deviation Protocol

**Trigger:** You have identified that the user's request:
1.  **Conflicts** with `ARCHITECTURE.md` (e.g., wrong color, direct DB access).
2.  **Introduces a New Pattern** not currently documented (e.g., new UI component library).
3.  **Relies on Missing Guidelines** (e.g., asking for a "Card" when no Card style is defined).

## 1. PAUSE WORK
**DO NOT** write code to implement the requested change yet. You must resolve the architectural conflict first.

## 2. Analyze the Deviation
*   **Current Rule:** What does `ARCHITECTURE.md` currently say? (Or is it validly silent?)
*   **User Request:** What is the user asking for?
*   **Impact:** Does this breaks consistency? Does it introduce technical debt?

## 3. Consult the User
You must ask the user for a decision. Use the `notify_user` tool (or simple response) to present the conflict.

**Template for your response:**
> ⚠️ **Architecture Update Required**
>
> **Issue:** You requested [User Request], but `ARCHITECTURE.md` [CONTRADICTS this / is MISSING a rule for this].
>
> **Action Required:**
> 1.  **Update Architecture:** Should I add/change the rule to support this?
> 2.  **Exception:** Is this a one-off exception?
> 3.  **Correction:** Or should we stick to the existing rules?

## 4. Execution (Post-Decision)
*   **If User says "Update":**
    1.  Update `ARCHITECTURE.md` with the new rule.
    2.  Proceed with the coding task.
*   **If User says "Exception":**
    1.  Proceed with the task (ignore the rule).
    2.  (Optional) Add a comment in the code `// NOTE: Exception to architecture rule [X]`.
*   **If User says "Correction":**
    1.  Proceed with the task using the *original* rule from `ARCHITECTURE.md`.
