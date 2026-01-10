# ChefLens Architecture & Agent Guidelines

> [!IMPORTANT]
> This document serves as the **SINGLE SOURCE OF TRUTH** for architectural rules.
> Any agent working on this project MUST read and verify their work against these rules.

## Core Principles

1.  **Strict Frontend/Backend Separation**
    *   **Rule:** The Frontend (React) must NEVER access the database directly.
    *   **Rule:** All data operations must go through the Backend API (Express.js).
    *   **Rule:** `supabase-js` client usage in the Frontend is RESTRICTED to Authentication only. All other usages are deprecated and forbidden in new code.

## Design Principles & UI Standards

### 1. Visual Language (Gemini-Inspired)
*   **Theme:** "Rich Aesthetics" with Premium feel.
*   **Modes:** Support both Light and Dark modes (System preference by default).
*   **Animations:** Use subtle micro-animations (framer-motion) for interactions.

### 2. Color System
*   **Primary Brand:
*   **Dark Mode Backgrounds:**
    *   `bg-background`:  (NOT pure black)
    *   `bg-surface`:  (Sidebar / Cards)
    *   `bg-surface-elevated`:  (Hover states / Modals)
*   **Light Mode Backgrounds:**
    *   `bg-background`: 
    *   `bg-surface`:  (Sidebar / Chat bubbles)
*   **Text:**
    *   Primary:  (Dark) /  (Light)
    *   Secondary: (Accents) or  (Muted)

### 3. Typography
*   **Font Family:** `Inter`, `Roboto`, or `Google Sans` (if available).
    *   [Google Fonts: Inter](https://fonts.google.com/specimen/Inter)
    *   [Google Fonts: Roboto](https://fonts.google.com/specimen/Roboto)
*   **Scale:**
    *   **H1 (Greeting):** `text-5xl` or `text-6xl`, `font-medium`, `tracking-tight`.
    *   **Headings:** `font-medium`, `tracking-tight`.
    *   **Body:** `text-base` (16px) or `text-[15px]`, `leading-relaxed` (1.6).
    *   **Labels:** `text-sm`, `font-medium`.

### 4. User Interaction & Feedback Rules
*   **NO System Alerts:** `window.alert()` and `window.confirm()` are **STRICTLY FORBIDDEN**.
*   **Toast Notifications:** Use non-intrusive Toasts (bottom-right) for success/info messages.
*   **Custom Modals:** Use custom-designed Modals (Radix/Shadcn) for confirmations and forms.
*   **Empty States:** Never leave a screen blank. Use illustrations or helpful text for empty states.
*   **Loading States:** Do NOT just show a spinner. Use a "shimmer" effect on text lines (Tailwind `animate-pulse` on gray blocks).
*   **Streaming Text:** For AI answers, text should appear character-by-character or word-by-word (e.g., using `framer-motion`).
*   **Active States:** Buttons must have a subtle scale effect or "ripple" (Material Design standard).
*   **Save Button Logic:**
    *   **Disabled by Default:** Save buttons must remain disabled until the user modifies at least one field (dirty state).
    *   **Implementation:** Use the `useFormDirty` hook to track changes.
    *   **Visual Feedback:** Clearly distinguish between disabled/enabled states.
*   **Modal Interactions:**
    *   **Save Action:** On success, trigger a specific sequence:
        1.  Show **Toast** (Success).
        2.  Wait **1 Second**.
        3.  **Close** Modal automatically.

### 5. Buttons & Component Specifications
*   **Primary Buttons:**
    *   **Color:** 
    *   **Text:** 
*   **Modal Actions (Standardized):**
    *   **Cancel:** 
    *   **Save/OK:** 
    *   **Delete:** 
    *   **Shape:** `rounded-full`.
    *   **Effects:** Shadow effects and hover transitions enabled.
*   **Cards:** Modern unified design system with `rounded-3xl` (24px) corners.
*   **Chat Input:** `rounded-full` (Pill shape).
*   **Icons:** Use [Material Symbols (Rounded weight)](https://fonts.google.com/icons) or `lucide-react`.

### 6. Tailwind Configuration (Standard)
Add the javascript for this configuration
Copy this into `tailwind.config.js` to strictly enforce the Gemini "Look & Feel".


### 7. Layout Reference: 
Describe the layout

---

## Technical Standards

### 1. API Design Guidelines
*   **REST Conventions:** Use plural nouns (e.g., `/api/companies`, not `/api/company`).
*   **Versioning:** Prefix all API routes with `/api`. Consider `/api/v1/` for breaking changes.
*   **Response Format:**
    *   Single Entity: `{ ...entity_fields }`
    *   List: `[ { ... }, { ... } ]` OR `{ data: [...], meta: { pagination: ... } }`
    *   Error: `{ error: "User friendly message", code: "ERROR_CODE" }`

### 2. Testing Strategy
*   **Frontend:**
    *   Use **Jest** + **React Testing Library**.
    *   Write **Unit Tests** for shared components/hooks.
    *   Write **Integration Tests** for critical user flows (e.g., login, form submission).
*   **Backend:**
    *   Use **Supertest** or **Vitest** for API endpoints.
    *   Mandatory: Unit/Integration tests for all new routes.

### 3. Error Handling & Logging
*   **Global Handler:** Ensure `errorHandler` middleware catches all sync/async errors.
*   **Logging:** Use structured logging (e.g., `console.error` with JSON objects or `pino`) for better observability.
*   **Client-Side:** APIs should return generic error messages to the client (to hide internals) while logging full stack traces on the server.

### 4. State Management
*   **Server State:** Prefer **React Query** (TanStack Query) for all API data.
*   **Client State:** Use **Local State** (`useState`, `useReducer`) where possible. Use **Zustand** only for complex global client state.

### 5. Deployment & Infrastructure
*   **Dev/Prod Separation:** Use separate Supabase projects for Development and Production.
*   **Environment Variables:**
    *   `VITE_API_URL`: Base URL for the backend.
    *   `DATABASE_URL`: Connection string.
    *   Config validation: Fail fast (at startup) if required vars are missing.

### 6. Performance & Data Loading
*   **Lazy Loading:** Only load related data for the selected row or item.
*   **No Eager Loading for Lists:** Do NOT fetch heavy related data (e.g., historical logs, full relational trees) when querying lists of items. Fetch it on demand when the user selects a specific item.

### 7. Localization Standards
*   **Standard Locale:** All number and date formatting MUST use **`nl-NL`** (Netherlands) locale.
*   **Currency Format:**
    *   Use `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })`
    *   Display: **€ 1.234,56** (period as thousand separator, comma as decimal)
    *   Example: `€ 50.000` for fifty thousand euros
*   **Number Format:**
    *   Use `Intl.NumberFormat('nl-NL')`
    *   Display: **1.234,56** (period as thousand separator, comma as decimal)
*   **Date Format:**
    *   Prefer `toLocaleDateString('nl-NL')` for Netherlands format (d-m-yyyy)
    *   For specific formats, use `Intl.DateTimeFormat('nl-NL', { ... })`
    *   Display: **4-1-2026** (day-month-year)
*   **IMPORTANT:** `'en-NL'` is NOT a valid locale code. Always use `'nl-NL'` for Netherlands/EU formatting.

---

## Technical Debt & Stack Guidelines

### Frontend (`/`)
*   **Tech:
*   **State:
*   **Data Layer:
*   **Auth:** 

### Backend (`/backend`)
*   **Tech:** 
*   **Database:** 
*   **ORM:** 
*   **Entry Point:** 

### Detailed Rules for Agents

#### 1. Frontend Development via Agent
*   **DO NOT** import `supabase` from `supabaseClient` to query tables directly.
*   **DO** use `services/apiClient.ts` methods.
*   **IF** an endpoint is missing, create it in the backend first.

#### 2. Backend Development via Agent
*   **DO** use **Drizzle ORM** for all database interactions.
*   **DO** use the `authenticate` middleware for all protected routes.
*   **Backend Code Standards:**
    *   **Rule:** Use explicit file extensions for ALL local imports (e.g., `import ... from './module.js'`).
    *   **Rule:** Do NOT use directory imports (e.g., `import ... from '../db'`). Must explicitly import index (e.g., `import ... from '../db/index.js'`).

#### 3. Migration Checklist (storageService)
*   [ ] Audit `services/storageService.ts`.
*   [ ] Refactor `supabase.from` calls to API calls.
*   [ ] Deprecate direct Supabase access methods.

---

## Directory Structure Enforcement

```
Dscribe directory structure
```
