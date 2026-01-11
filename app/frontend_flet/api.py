import httpx
from typing import Optional, Dict, Any
from app.backend.models import RecipeData, LoginRequest, ParseRequest, UploadRequest

class ApiClient:
    def __init__(self, base_url: str = "http://localhost:8082/api/v1"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url, timeout=30.0)
        self.user_id: Optional[str] = None # Store user_id after login

    async def login(self, email: str, password: str) -> tuple[bool, str]:
        # Login is special, we want to handle the 401/400 explicitly here but let 500s bubble if we want
        # For consistency with existing view logic (success, msg), we keep the try/except but improve it.
        try:
            payload = LoginRequest(email=email, password=password).model_dump()
            response = await self.client.post("/auth/cookidoo", json=payload)
            if response.status_code == 200:
                data = response.json()
                self.user_id = data.get("user_id")
                return True, "Success"
            
            error_detail = response.json().get("detail", response.text)
            return False, error_detail
            
        except Exception as e:
            # Login view expects a tuple
            return False, str(e)

    async def get_recipes(self) -> list[Dict[str, Any]]:
        if not self.user_id:
            return []
        # Let exceptions bubble up to the View so we can show "Connection Error"
        response = await self.client.get("/recipes/", params={"user_id": self.user_id})
        response.raise_for_status()
        return response.json()

    async def parse_recipe(self, text: str = "", url: str = "") -> Dict[str, Any]:
        payload = ParseRequest(text=text, url=url).model_dump()
        response = await self.client.post("/recipes/parse", json=payload)
        response.raise_for_status()
        return response.json()

    async def create_recipe(self, recipe_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.user_id:
            raise Exception("User not authenticated")
        
        response = await self.client.post(
            "/recipes/", 
            json=recipe_data, 
            params={"user_id": self.user_id}
        )
        response.raise_for_status()
        return response.json()

    async def convert_recipe(self, recipe_id: str) -> Dict[str, Any]:
        if not self.user_id:
             raise Exception("User not authenticated")

        response = await self.client.post(
            f"/recipes/{recipe_id}/convert",
            params={"user_id": self.user_id}
        )
        response.raise_for_status()
        return response.json()

    async def upload_recipe(self, recipe_id: str, target_recipe_id: str) -> tuple[bool, str]:
        if not self.user_id:
            return False, "Not logged in"
        
        # Upload view expects tuple, but we can still improve the internal logic
        try:
            payload = {
                "recipe_id": recipe_id,
                "user_id": self.user_id,
                "target_recipe_id": target_recipe_id
            }
            
            response = await self.client.post("/recipes/upload", json=payload)
            if response.status_code == 200:
                return True, "Success"
            
            detail = response.json().get("detail", response.text)
            return False, f"Error {response.status_code}: {detail}"
        except Exception as e:
            return False, str(e)
