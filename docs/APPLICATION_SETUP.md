# ChefLens Application Documentation

## 1. System Overview

**ChefLens** is a specialized web application designed to bridge the gap between generic cooking recipes and the Thermomix ecosystem ("Cookidoo"). It acts as an intelligent intermediary that ingests recipe content from various sources (URLs or text), uses Generative AI to restructure and "Thermomix-ify" the instructions, and then seamlessly uploads the result to the user's Cookidoo account.

The system is built as a **Local-First Web Application** where the backend runs locally on the user's machine (to handle complex scrubbing and browser emulation without needing a cloud proxy) while providing a modern, responsive web interface.

### High-Level Data Flow

1.  **Ingest**: User provides a URL or raw text in the **Frontend Wizard**.
2.  **Parse**: **Backend AI Service** (Gemini) extracts structured data (Ingredients, Steps, Metadata).
3.  **Review**: User validates the extracted data in the UI.
4.  **Convert**: **AI Service** rewrites instructions to be Thermomix-compatible (adding Speed, Temp, Time).
5.  **Persist**: Data is stored in **Supabase** (PostgreSQL) for the user's personal library.
6.  **Upload**: **Backend Cookidoo Service** emulates a browser session to push the recipe to Vorwerk's servers.

---

## 2. Architecture & Tech Stack

The application follows a standard **Client-Server** architecture with a strict separation of concerns.

### Frontend
*   **Framework**: React 18 (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand (Global Store for Wizard), Context API (Auth), React Query/Axios (Data Fetching).
*   **Key Libraries**: `lucide-react` (Icons), `axios` (API Client).

### Backend
*   **Framework**: FastAPI (Python 3.12+)
*   **Concurrency**: Fully Async (using `async/await` for high I/O throughput).
*   **Validation**: Pydantic Models.
*   **Database ORM**: `supabase-py` (REST wrapper around PostgreSQL).
*   **AI Engine**: Google Generative AI SDK (`google-generativeai`).
*   **External Integration**: `requests` + `BeautifulSoup4` (Synchronous implementation wrapped in `asyncio.to_thread` for non-blocking execution).

### Infrastructure
*   **Database**: Supabase (Cloud Hosted PostgreSQL).
*   **Authentication**: Supabase Auth (Email/Password) for App access; Custom Session Cookie management for Cookidoo access.

---

## 3. Database Schema

The core data model revolves around the `Recipe` entity.

### `Recipe` Object
*   **`id`**: UUID (Primary Key)
*   **`user_id`**: UUID (Owner)
*   **`created_at`**: Timestamp
*   **`title`**: String
*   **`source_url`**: String (Optional)
*   **`parsed_data`**: JSONB. Holds the *generic* version of the recipe.
    *   Structure: `{ ingredients: [], steps: [], settings: {} }`
*   **`thermomix_data`**: JSONB. Holds the *converted* version of the recipe.
    *   Structure: Same as parsed, but steps contain machine settings (`speed`, `temperature`, `time`, `mode`).
*   **`cookidoo_id`**: String. The external ID assigned by Vorwerk after upload.

---

## 4. Backend Services & API

The backend is organized into `routers` (controllers) and `services` (business logic).

### API Endpoints (`/recipes`)
*   `POST /recipes/parse`: Accepts URL/Text. Calls AI to return `RecipeData` JSON. Does NOT save to DB yet.
*   `POST /recipes/`: Saves a new recipe to Supabase.
*   `POST /recipes/{id}/convert`: Triggers the "Thermomix-ification" AI prompt. Updates `thermomix_data` in DB.
*   `POST /recipes/upload`: Handles the complex Cookidoo upload flow.
*   `GET /recipes/`: List all recipes for a user.
*   `GET /recipes/{id}`: Get details.
*   `DELETE /recipes/{id}`: Remove a recipe.

### AI Service (`AiService`)
Uses **Google Gemini 1.5 Flash** for speed and cost-efficiency.
*   **Parsing Prompt**: Extracts entities from unstructured text into strict JSON. Handles "approximate" amounts and messy formatting.
*   **Conversion Prompt**: Acts as an "Expert Thermomix Developer". Rewrites generic instructions (e.g., "Knead the dough") into specific machine parameters (e.g., "Knead 2 min / Dough Mode"). Infers temperatures (Sauté -> 120°C, Boil -> 100°C).

### Cookidoo Service (`CookidooService`)
This is the most complex component, implementing a **Reverse-Engineered Browser Pivot** to interact with the closed Cookidoo API.
1.  **Authentication**: Simulates a full login flow including redirects (`login.vorwerk.com` -> `ciam` -> `cookidoo`) to capture session cookies.
2.  **Creation**: Uses the Foundation API (`/created-recipes/{region}`) to create an empty recipe shell.
3.  **Update (Patch)**: Sends a complex JSON payload structured for their specific rich-text editor format.
    *   **Annotation Engine**: The service manually constructs "Annotations" to link ingredient substrings in the text to ingredient objects, and creates "TTS" (Time-Temp-Speed) markers for machine settings. This ensures the recipe is "Guided Cooking" ready on the device.

---

## 5. Frontend Walkthrough

The UI is divided into two primary Views: **The Wizard** (Creation) and **The Library** (Management).

### The Wizard (`WizardLayout`)
A linear, 4-step process managed by `wizardStore`.
1.  **Input (`WizardStep1_Input`)**:
    *   Users paste a URL or raw text.
    *   Calls `/parse` API.
2.  **Review (`WizardStep2_Review`)**:
    *   Displays the AI-parsed JSON in editable fields (Title, Description, Ingredients Table).
    *   Allows manual correction of AI hallucinations.
3.  **Thermomix (`WizardStep3_Thermomix`)**:
    *   Triggers `/convert` API.
    *   Side-by-side comparison: Generic Steps vs. Thermomix Steps.
    *   Users can fine-tune Machine Settings (Speed 1-10, Temp, Time).
4.  **Upload (`WizardStep4_Upload`)**:
    *   Cookidoo Login prompt (if session invalid).
    *   "One-Click Upload" button.
    *   Displays success link to view result on Cookidoo.

### The Library (`LibraryLayout`)
*   **Grid View**: Displays `RecipeCard` components with cover images and status tags.
*   **Filtering**:
    *   **Search**: Real-time filtering by Title/Description.
    *   **Ingredients**: Dropdown derived from unique ingredients in the user's library.
    *   **Sort**: By Date or Title.
*   **Detail View (`RecipeDetail`)**:
    *   Full-page read mode.
    *   Responsive layout for mobile/tablet cooking usage.
    *   "Sticky Header" for context maintenance while scrolling long recipes.

---

## 6. Access & Authorization

*   **Supabase Auth**: Protects the local app's data. User must be logged in to save/view recipes.
*   **Row Level Security (RLS)**: Although currently handled by valid `user_id` filtering in API, future iterations will enforce RLS at the database level to prevent cross-user data access.
*   **Cookidoo Auth**: Completely separate from App Auth. Credentials are never stored permanently; only session cookies are kept in memory/temp storage during the active session.
