---
description: Extending existing pages with new backend-driven functionality.
---

# Full-Stack Extension Workflow (`/full-stack-extension`)

> [!TIP]
> Use this for adding new fields, charts, or actions to an ALREADY EXISTING page.

## ⚠️ Trigger Conditions
- Keywords: "Add a field to this page", "Show X on this screen", "Implement saving for this form".

## 1. Data Analysis
- [ ] **DB Check**: Do we need to store more data? (If yes, run `/db-migration`).
- [ ] **API Check**: Is the existing endpoint sufficient, or do we need a new route?

## 2. Backend Extension
- [ ] **Query**: Update the Drizzle query to fetch the new data.
- [ ] **Route**: Update the Express route or Zod validation to handle new input/output.

## 3. Frontend Service
- [ ] **API Client**: Update the method in `services/apiClient.ts` to reflect change in API contract.

## 4. UI Implementation
- [ ] **State**: Update `useQuery` or `useState` to handle the new data.
- [ ] **Component**: Add the UI elements (Inputs, Displays, etc.).

## 5. Review
- [ ] **Compliance**: Run `/architecture-review` (especially for button colors and rounded corners).
- [ ] **Feedback**: Ensure proper loading (shimmer) and success states (toast).
