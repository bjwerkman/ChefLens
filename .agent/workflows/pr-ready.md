---
description: Quality gate and verification steps before finishing a task or submitting code.
---

# PR-Ready Checklist (`/pr-ready`)

> [!IMPORTANT]
> Run this workflow before telling the user "I'm done" with a complex task.

## ⚠️ Trigger Conditions
- Keywords: "I'm done", "Submit this", "Prepare for PR", "Finished".

## 1. Code Quality
- [ ] **Linting**: Run `npm run lint` to ensure no lint errors.
- [ ] **Strict Types**: Ensure NO `any` types are used in new/modified code.
- [ ] **Cleanup**: Remove `console.log`, `TODO` comments, and unused imports/variables.
- [ ] **Consistency**: Ensure variable naming follows project standards.

## 2. Verification
// turbo
- [ ] **Build & Type-Check**: Run `npm run type-check && cd backend && npm run type-check`.
- [ ] **Functional**: Manually verify all acceptance criteria were met.
- [ ] **Architecture**: Run `/architecture-review` as a final check.

## 3. Documentation
- [ ] **Walkthrough**: Generate or update `walkthrough.md` with:
    - Description of changes.
    - Proof of work (output/logs/screenshots).
- [ ] **Architecture**: If rules were changed, ensure `ARCHITECTURE.md` was updated.

## 4. Versioning
- [ ] **Increment**: Ensure the version in `package.json` is updated (automatic via `pre-commit`).
- [ ] **Manual**: If `MANUAL.md` was changed, verify the **Manual Version** was incremented.

## 5. Cleanup
- [ ] **Temp Files**: Run `/cleanup-temp` to move any temporary scripts or files to `.temp/`.

## 6. Submission
- [ ] **Summary**: Provide a concise summary of what was accomplished to the user.
