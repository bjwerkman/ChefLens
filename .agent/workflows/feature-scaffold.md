---
description: Standardized creation of new full-stack features or modules.
---

# Feature Scaffolding Workflow (`/feature-scaffold`)

> [!NOTE]
> Use this when starting a brand new feature or page from scratch.

## ⚠️ Trigger Conditions
- Keywords: "Create a new page", "Build a feature", "Add a module for X".

## 1. Planning
- [ ] **Architecture Check**: Review [ARCHITECTURE.md](file: ARCHITECTURE.md) for folder structure.
- [ ] **Schema**: Determine if new DB tables are needed (if so, run `/db-migration` first).

## 2. Backend Scaffold
- [ ] **Migration**: Create DB tables if needed.
- [ ] **Route**: Create `backend/src/routes/[feature].ts`.
- [ ] **Server**: Register the route in `backend/src/server.ts`.

## 3. Frontend Scaffold
- [ ] **Types**: Define strict interfaces (NO `any`) in a `types/` file or within the component.
- [ ] **Service**: Add API wrapper methods to `services/apiClient.ts`.
- [ ] **Component**: Create the React page/components in `components/` or `src/`.
- [ ] **Routing**: Add the new page to the main navigation/router.

## 4. Verification
- [ ] **Integration**: Ensure the frontend correctly talks to the backend.
- [ ] **Design**: Run `/architecture-review` to verify UI compliance.