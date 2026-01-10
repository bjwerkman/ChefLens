import httpx
from typing import Optional, Dict, Any
from app.backend.models import RecipeData, LoginRequest, ParseRequest, UploadRequest

class ApiClient:
    def __init__(self, base_url: str = "http://localhost:8082/api/v1"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url, timeout=30.0)
        self.user_id: Optional[str] = None # Store user_id after login

    async def login(self, email: str, password: str) -> tuple[bool, str]:
        try:
            payload = LoginRequest(email=email, password=password).model_dump()
            response = await self.client.post("/auth/cookidoo", json=payload)
            if response.status_code == 200:
                data = response.json()
                self.user_id = data.get("user_id")
                return True, "Success"
            
            # Try to get error detail
            try:
                error_detail = response.json().get("detail", "Unknown error")
            except:
                error_detail = response.text
            return False, error_detail
            
        except Exception as e:
            print(f"Login error: {e}")
            return False, str(e)

    async def get_recipes(self) -> list[Dict[str, Any]]:
        if not self.user_id:
            return []
        try:
            response = await self.client.get("/recipes/", params={"user_id": self.user_id})
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Get Recipes error: {e}")
            return []

    async def parse_recipe(self, text: str = "", url: str = "") -> Dict[str, Any] | None:
        try:
            payload = ParseRequest(text=text, url=url).model_dump()
            response = await self.client.post("/recipes/parse", json=payload)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Parse error: {e}")
            return None

    async def create_recipe(self, recipe_data: Dict[str, Any]) -> Dict[str, Any] | None:
        if not self.user_id:
            return None
        try:
            # The backend router expects: create_recipe(recipe_data: RecipeData, user_id: UUID, ...)
            # BUT typical REST API bodies don't mix Query and Body well for simple Pydantic unless specified.
            # My router implementation:
            # @router.post("/", response_model=Recipe)
            # async def create_recipe(recipe_data: RecipeData, user_id: UUID, ...)
            # FastAPI typically expects `user_id` as query param if not in body Pydantic.
            
            response = await self.client.post(
                "/recipes/", 
                json=recipe_data, 
                params={"user_id": self.user_id}
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Create Recipe error: {e}")
            return None

    async def close(self):
        await self.client.aclose()
