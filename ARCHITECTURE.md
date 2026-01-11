# ChefLens Architecture & Guidelines

> [!IMPORTANT]
> This document serves as the **SINGLE SOURCE OF TRUTH** for the ChefLens system architecture.
> Any agent working on this project MUST read and verify their work against these rules.

## 1. System Overview

**ChefLens** is a local Python application that digitizes, converts, and uploads cooking recipes to the Thermomix Cookidoo platform.

### Core Technology Stack
*   **Language:** Python 3.12+
*   **Frontend:** [Flet](https://flet.dev/) (Flutter for Python)
*   **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Async Web Framework)
*   **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + GoTrue)
*   **AI Engine:** Google Gemini Pro (`gemini-1.5-flash`)
*   **Integration:** Custom Cookidoo Scraper/API Wrapper

---

## 2. Architectural Patterns

### Strict Frontend/Backend Separation
Even though both run in the same Python process tree (via `uvicorn` mounting Flet), we maintain a strict logical separation:
1.  **Frontend (`app/frontend`)**: Responsible ONLY for UI, State Management, and API calls. It **NEVER** accesses the database or AI services directly.
2.  **Backend (`app/backend`)**: Responsible for Business Logic, Database interactions, AI processing, and External Integrations (Cookidoo).
3.  **Core (`app/core`)**: Shared configuration (`config.py`) and secrets management.

### Data Flow
1.  **User Action**: User clicks a button in a Flet View (e.g., `WizardView`).
2.  **API Client**: The View calls `AppState().api.<method>`.
3.  **HTTP Request**: `ApiClient` sends an async HTTP request (`httpx`) to `http://localhost:8082`.
4.  **Router**: FastAPI Router (`routers/recipes.py`) receives the request.
5.  **Service Layer**: Router calls a Service (`RecipeService`, `AiService`, `CookidooService`).
6.  **External/DB**: Service interacts with Supabase, Gemini, or Cookidoo.
7.  **Response**: Data flows back up the chain to the UI.

---

## 3. Directory Structure

```text
/app
  /backend
    /routers        # FastAPI Routes (endpoints)
    /services       # Business Logic (AI, DB, Cookidoo)
    models.py       # Pydantic Models (Shared Data Structures)
  /frontend
    /views          # Flet UI Screens (Dashboard, Wizard, Login)
    api.py          # HTTP Client for Backend
    state.py        # Singleton AppState
    main.py         # Flet Entry Point
  /core
    config.py       # Environment Variables & Settings
  main.py           # Application Entry Point (FastAPI + Flet Mount)
```

---

## 4. Key Components

### Frontend Components
*   **`AppState` (Singleton):** Holds global state like `user_id`, `api_client`, and `page_ref`.
*   **`WizardView`:** The core workflow engine. Implements a 4-tab process:
    1.  **Input:** Text or URL ingestion.
    2.  **Review:** JSON/Text toggle for validating AI parsing.
    3.  **Thermomix:** AI conversion to structure machine steps.
    4.  **Upload:** One-click sync to Cookidoo.

### Backend Services
*   **`AiService`:** Wraps Google GenAI. Handles Prompt Engineering for parsing and conversion.
*   **`RecipeService`:** Manages CRUD operations with Supabase.
*   **`CookidooService`:** The complex integration layer.
    *   **Login:** Simulates a browser login flow (Requests + BeautifulSoup) to handle efficient SSO redirects.
    *   **Create/Update:** Uses a "Create-then-Update" strategy to ensure atomic syncing with Cookidoo.

---

## 5. Coding Standards

### Python Verification
*   **Type Hinting:** Required for all function signatures (e.g., `def foo(id: str) -> bool:`).
*   **Async/Await:** Critical. The Backend is Async (FastAPI). The Frontend is Async (Flet). Verify `await` usage on all I/O bound calls.
*   **Sync Bridge:** When using synchronous libraries (like `requests` for Cookidoo), MUST wrap in `asyncio.to_thread` to prevent blocking the event loop.

### Error Handling
*   **Frontend:** Display user-friendly `SnackBar` messages. Do not crash the UI.
*   **Backend:** Raise `HTTPException` with clear status codes (400, 401, 404, 500) and details.
*   **Logging:** Use standard `logging` or `print` (during debug) to trace complex flows like Authentication.

---

## 6. Migration & Updates
*   **Database:** Supabase schema is currently managed manually. Future: implementations should use migration scripts.
*   **Dependencies:** Managed via `requirements.txt` (or user's `venv`). Always check for `google-generativeai` vs `google-genai` deprecations.
