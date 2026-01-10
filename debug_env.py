
import os
from dotenv import load_dotenv

# Try loading .env explicitly
load_dotenv(verbose=True)

print("--- DEBUG ENV VARS ---")
keys = ["SUPABASE_KEY", "supabase_anon_key", "SUPABASE_ANON_KEY", 
        "GOOGLE_API_KEY", "google_api_key", "SUPABASE_PROJECT_ID"]

for k in keys:
    val = os.getenv(k)
    print(f"{k}: {'[FOUND]' if val else '[MISSING]'} - Len: {len(val) if val else 0}")

print("\n--- TEST PYDANTIC SETTINGS ---")
try:
    from app.core.config import get_settings
    s = get_settings()
    print(f"Settings Loaded: URL={s.SUPABASE_URL}")
    print(f"Settings Key: {'[PRESENT]' if s.SUPABASE_KEY else '[EMPTY]'}")
except Exception as e:
    print(f"Settings Load Failed: {e}")
