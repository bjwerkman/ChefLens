@Codebase
ACT AS: Senior Python Architect and Flet Specialist.

CONTEXT:
We are experiencing critical instability in the "ChefLens" application (Stack: Flet + FastAPI + Supabase). The development cycle has stalled. Minor UI changes cause "Red Screen of Death" (Flutter exceptions), blank pages, or infinite loading. We are stuck in a loop of fixing one bug and creating two more.

YOUR GOAL:
Do NOT write code to "fix" the app yet. Instead, perform a DEEP ARCHITECTURAL AUDIT to identify the root cause of the instability.

AUDIT TASKS (Check these specifically):

1. EVENT LOOP BLOCKING (Critical):
   - Review `app/backend/services/cookidoo_service.py` and any other service using `requests` or `BeautifulSoup`.
   - Verify if `asyncio.to_thread` is correctly implemented for ALL synchronous operations.
   - If `time.sleep()` exists anywhere, flag it immediately; it blocks the Flet UI thread.

2. FLET LIFECYCLE & STATE RACES:
   - Review `app/frontend/state.py` (AppState) and `app/frontend/main.py`.
   - Are we initializing `AppState` or making async API calls *before* the Flet `page` is fully mounted?
   - Are we updating Flet UI controls from a background thread without using `page.update()`?
   - Are there circular imports between `app/frontend` and `app/backend` that cause initialization to hang?

3. EXCEPTION SWALLOWING:
   - Look at `app/frontend/views`. If the API returns a 500 or 404, does the UI handle it gracefully, or does it crash with a generic error (Red Frame)?
   - Are we catching exceptions in the Backend Router but returning formats the Frontend doesn't expect?

4. DEPENDENCY CONFLICTS:
   - Check `requirements.txt`. Are there conflicting versions of `uvicorn`, `flet`, or `fastapi` that might cause the async loops to fight?

OUTPUT REQUIRED:
Produce a bulleted "Stability Report" listing the exact files and lines of code causing the fragility. Explain WHY the current implementation causes "Red Frames" or hanging. Then, propose a refactoring plan.