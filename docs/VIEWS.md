# ChefLens View Specifications

> This document details the User Interface (UI) Views of ChefLens, built using **Flet** (Python-based Flutter framework).

---

## 1. Login View (`app/frontend/views/login.py`)

### Purpose
The entry point of the application. Handles authentication via Supabase and provides immediate feedback on login status.

### Structure & Layout
*   **Container:** Centered content with a gradient background (Blue/Purple theme).
*   **Form Card:** A distinct "Card" or "Container" with a white/surface background, rounded corners (`border_radius=10`), and shadow to elevate it from the background.

### Components
1.  **Header:**
    *   `ft.Icon(name="lock_outline", size=50)`: Visual cue for security.
    *   `ft.Text("ChefLens Login", size=30, weight="bold")`: App branding.
2.  **Input Fields:**
    *   `email_field`: `ft.TextField` with placeholder "Email".
    *   `password_field`: `ft.TextField` with `password=True` to obscure text.
3.  **Actions:**
    *   `login_button`: `ft.ElevatedButton` labeled "Sign In". Triggers the async `login_click` event.
4.  **Feedback:**
    *   `error_text`: `ft.Text` positioned below the button, usually Red, hidden by default.

### Behavior
*   **On Click:**
    *   Calls `AppState().api.login(email, password)`.
    *   If Success: Navigates to `/dashboard`.
    *   If Failure: Updates `error_text` with the specific error message provided by the API (e.g., "Invalid credentials").

---

## 2. Dashboard View (`app/frontend/views/dashboard.py`)

### Purpose
The central hub for the user. Displays the library of converted recipes and provides access to the "Add Recipe" workflow.

### Structure & Layout
*   **AppBar:** Standard Flet `ft.AppBar` with title "ChefLens Dashboard".
*   **Main Content:** A responsive Grid or List of recipe cards.
*   **Floating Action Button (FAB):** A prominently placed button (`ft.icons.ADD`) to start the Wizard.

### Key Components
1.  **Recipe List:**
    *   Dynamically populated from `AppState().api.get_recipes()`.
    *   **Items:** `ft.ListTile` or Custom Card components.
    *   **Content:** Title, Description snippet, and optional Image.
    *   **Interactivity:** Clicking a recipe navigates to a detail view (or edit mode).
2.  **Add Button:**
    *   `ft.FloatingActionButton` using `SafeIcon("add")`.
    *   Action: `page.go("/wizard")`.
3.  **Refresh Mechanism:**
    *   Action button in AppBar to re-fetch data from the backend.

### State Management
*   **`on_mount` / `did_mount`:** Triggers the initial data fetch so the user sees data immediately upon arrival.

---

## 3. Wizard View (`app/frontend/views/wizard.py`)

### Purpose
The core feature of ChefLens. A sophisticated multi-step workflow to ingest, parse, convert, and upload recipes.

### Structure: The 4-Tab Workflow
The view is orchestrated by a custom Tab navigation bar (`ft.Row` of buttons) and a dynamic content area (`content_area`).

#### Tab 1: Input (`input_tab`)
*   **Goal:** Get raw recipe data.
*   **Components:**
    *   `ft.TextField` (Multiline): For pasting raw text.
    *   `ft.TextField` (Single line): For pasting a URL.
    *   `ft.ElevatedButton("Parse with AI")`: Triggers the Gemini parsing pipeline.
*   **Logic:** Upon success, stores data in `active_recipe_data` and auto-advances to Tab 2.

#### Tab 2: Review (`review_tab`)
*   **Goal:** Verify AI parsing accuracy.
*   **Components:**
    *   **Toggle Switch:** `ft.Switch("View as JSON")` allows toggling between code view and human-readable view.
    *   **Human View:** Nicely formatted parsed ingredients and steps.
    *   **JSON Editor:** Editable text field for power users to fix parsing errors manually.
    *   `ft.ElevatedButton("Save & Proceed")`: Commits the recipe to Supabase.

#### Tab 3: Thermomix (`thermomix_tab`)
*   **Goal:** Generate machine-specific instructions.
*   **Components:**
    *   `ft.ElevatedButton("Generate Thermomix Instructions")`: Calls `AiService.convert_to_thermomix`.
    *   **Step List:** Displays steps with color-coded "Badges" for Time (Blue), Temp (Amber), Speed (Green), and Mode (Purple).
    *   **Validation:** Ensures every step has valid machine settings before upload.

#### Tab 4: Upload (`upload_tab`)
*   **Goal:** Sync with Cookidoo.
*   **Components:**
    *   **Input:** `ft.TextField` for "Target Recipe ID".
        *   *Smart Logic:* Left empty = "Create New". Filled = "Overwrite".
        *   *Helper:* Accepts full URL or bare ID.
    *   **Action:** `ft.ElevatedButton("Upload to Cookidoo")`.
    *   **Feedback:** `ft.ProgressRing` and detailed status text (Red/Green).

### Implementation Details
*   **State Persistence:** Variables like `active_recipe_data`, `active_thermomix_data`, and `current_recipe_id` persist in the closure of the `WizardView` function while the user navigates tabs.
*   **Async Operations:** All AI and API calls are awaited with visual indicators (`ProgressRing`) to prevent UI freezing.
