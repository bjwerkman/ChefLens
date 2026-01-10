---
description: Safe database schema updates using Drizzle and migrations.
---

# Database Migration Workflow (`/db-migration`)

> [!CAUTION]
> This workflow is mandatory for ANY change to the database schema to prevent data loss or drift.

## ⚠️ Trigger Conditions
- Files: Changes to `backend/src/db/schema.ts`.
- Keywords: "Add a column", "New table", "Change database", "Migration".

## 1. Schema Update
- [ ] **Drizzle**: Modify the `@/db/schema.ts` file in the backend.
- [ ] **Types**: Update any TypeScript interfaces that reflect the DB structure.

## 2. Generation
- [ ] **Command**: Run the migration generator:
    ```bash
    cd backend && npx drizzle-kit generate
    ```
- [ ] **Review**: Open the generated `.sql` file in `backend/migrations/` and verify:
    - No unexpected `DROP` statements.
    - Correct default values for new columns.

## 3. Application
- [ ] **Local Run**: Apply the migration to the local/dev database.
- [ ] **Verification**: Query the database to ensure the new structure exists.

## 4. Backend Update
- [ ] **Drizzle Queries**: Update routes/services to use the new fields/tables.
- [ ] **Validation**: Update Zod schemas in the routes to include new fields.
