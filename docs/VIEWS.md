# ChefLens View Specifications

> This document details the User Interface (UI) Views of ChefLens, built using **React** (Vite + TypeScript + Tailwind CSS).

---

## 1. Login View (`App.tsx`)

### Purpose
The entry point of the application. Handles authentication via Supabase and provides immediate feedback on login status. If the user is unauthenticated, the `App` component renders this view.

### Structure & Layout
*   **Container:** Centered layout (`flex items-center justify-center`) with a light gray background (`bg-gray-100`).
*   **Form Card:** A white card (`bg-white`) with shadow (`shadow-xl`) and rounded corners (`rounded-xl`).

### Components
1.  **Header:**
    *   **Text:** `h1` "ChefLens" with `text-3xl font-bold text-gray-800`.
    *   **Subtext:** "Please login to continue" in `text-gray-500`.
2.  **Input Fields:**
    *   Currently implemented as browser-native `prompt()` for rapid prototyping (Login/Password).
    *   *Upcoming:* Standard React `input` fields for email/password.
3.  **Actions:**
    *   **Sign In Button:** Indigo-styled button (`bg-indigo-600 hover:bg-indigo-700`) triggering `supabase.auth.signInWithPassword`.
4.  **Feedback:**
    *   Browser `alert()` on error for immediate feedback.

---

## 2. Dashboard / Sidebar Layout (`App.tsx`, `WizardLayout.tsx`)

### Purpose
The "Shell" of the application once logged in. It provides navigation and context.

### Structure & Layout
*   **Sidebar:** Fixed width (`w-64`), white background, persistent on the left (`hidden md:flex`).
*   **Main Content:** Flexible area (`flex-1`) with a light gray background (`bg-gray-50`) showcasing the active Wizard Step.

### Key Components
1.  **Sidebar Nav:**
    *   **Links:** "New Recipe", "My Recipes", "Settings".
    *   **User Profile:** Bottom section showing the user's email and a "Sign Out" button (`LogOut` icon).
2.  **Wizard Stepper:**
    *   Located at the top of the Main Content.
    *   Visual progress bar connecting 4 steps.
    *   **Active Step:** Indigo circle (`bg-indigo-600`).
    *   **Inactive Step:** Gray circle (`border-gray-300`).

---

## 3. Wizard Components (`src/components/wizard/*`)

### Purpose
The core feature of ChefLens. A sophisticated multi-step workflow to ingest, parse, convert, and upload recipes.

### Step 1: Input (`WizardStep1_Input.tsx`)
*   **Goal:** Get raw recipe data.
*   **Modes:** Toggle between "Import from URL" (`Link` icon) and "Paste Text" (`Type` icon).
*   **Action:** "Analyze Recipe" button.
*   **Logic:** Calls `POST /recipes/parse`. On success, updates Zustand store (`recipeJson`) and moves to Step 2.

### Step 2: Review (`WizardStep2_Review.tsx`)
*   **Goal:** Verify AI parsing accuracy.
*   **Components:**
    *   **JSON Editor:** Large text area (`h-96`) displaying the parsed JSON. Allows manual correction of AI errors.
    *   **Action:** "Confirm & Convert" button moves to Step 3.

### Step 3: Thermomix (`WizardStep3_Thermomix.tsx`)
*   **Goal:** Generate machine-specific instructions.
*   **Logic:**
    *   **Auto-Trigger:** On mount, checks if data exists; if not, calls `POST /recipes/{id}/convert`.
    *   **Feedback:** Shows `Loader2` spinner during conversion.
    *   **Display:** Read-only JSON view of the converted Thermomix structure.
    *   **Action:** "Proceed to Upload" moves to Step 4.

### Step 4: Upload (`WizardStep4_Upload.tsx`)
*   **Goal:** Sync with Cookidoo.
*   **Logic:**
    *   **Action:** "Upload to Cookidoo" button triggering `POST /recipes/upload`.
    *   **Success State:** Displays a large Green Checkmark and a "Start New Recipe" button to reset the wizard using `store.reset()`.

### State Management
*   **Zustand Store (`useWizardStore`):** Persists `url`, `rawText`, `recipeJson`, `recipeId`, and `thermomixData` across steps so data isn't lost if the user navigates back and forth.
