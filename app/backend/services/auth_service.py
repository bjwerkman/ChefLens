from supabase import create_client, Client
from app.core.config import get_settings
from uuid import UUID
from typing import Dict, Optional
import json
from app.backend.services.cookidoo_service import CookidooService

settings = get_settings()

class AuthService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self.cookidoo_service = CookidooService()
        
    async def login_cookidoo(self, user_id: UUID, email: str, password: str) -> bool:
        """
        Authenticates with Cookidoo via Scraping, gets cookies, and stores them.
        """
        try:
            cookies = await self.cookidoo_service.login(email, password)
            
            if not cookies:
                print(f"Cookidoo Login Failed for {email} (No cookies returned)")
                return False
            
            print(f"Cookidoo Login Successful for {email}")
            
            # Store cookies as JSON string
            cookie_json = json.dumps(cookies)
            
            data = {
                "user_id": str(user_id),
                "cookidoo_refresh_token": cookie_json # Storing cookies in token field
            }
            
            self.supabase.table("user_tokens").upsert(data).execute()
            return True

        except Exception as e:
            print(f"Cookidoo Login Service Error: {e}")
            return False

    async def get_cookidoo_cookies(self, user_id: UUID) -> Dict[str, str] | None:
        response = self.supabase.table("user_tokens").select("cookidoo_refresh_token").eq("user_id", str(user_id)).single().execute()
        if response.data and response.data.get('cookidoo_refresh_token'):
            try:
                return json.loads(response.data['cookidoo_refresh_token'])
            except:
                return None
        return None

