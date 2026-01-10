---
description: Structured root-cause analysis and fix verification for bugs and errors.
---

# Debugging Workflow (`/debug-issue`)

> [!TIP]
> Use this workflow when the user reports an error, a 500 status code, or "something is broken."

## ⚠️ Trigger Conditions
- Keywords: "Fix", "Debug", "Error", "Broken", "Doesn't work", "500", "404".
- Context: When a specific bug report is provided.

## 1. Discovery & Reproduction
- [ ] **Logs**: Check backend console logs and browser console/network logs if applicable.
- [ ] **Trace**: Locate the exact file and line number where the error originates.
- [ ] **State**: Identify the data state (inputs/DB state) that causes the crash.

## 2. Root Cause Analysis
- [ ] **Validation**: Is it a validation error (Zod)?
- [ ] **Permissions**: Is it an auth/Supabase policy issue?
- [ ] **Logic**: Is it a null pointer, undefined, or incorrect business logic?
- [ ] **Regression**: Check if a recent change (migration/refactor) caused this.

## 3. Proposal & Fix
- [ ] **Plan**: Explain the root cause to the user before fixing.
- [ ] **Implementation**: Apply the fix carefully.
- [ ] **Cleanup**: Remove any `console.log` or debug statements added during discovery.

## 4. Verification
- [ ] **Test**: Verify the specific case that was failing.
- [ ] **Side Effects**: Ensure the fix doesn't break related functionality.
- [ ] **Architecture**: Run `/architecture-review` if the fix involved UI or API changes.
