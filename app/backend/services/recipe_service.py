from supabase import create_client, Client
from app.core.config import get_settings
from app.backend.models import Recipe, RecipeData
from uuid import UUID
import json
from datetime import datetime

settings = get_settings()

class RecipeService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    async def get_recipes(self, user_id: UUID) -> list[Recipe]:
        print(f"DEBUG BACKEND: Fetching recipes for user_id={user_id}")
        
        # DEBUG: Try to fetch ALL recipes first to see if we have access/data
        try:
            all_response = self.supabase.table("recipes").select("*").execute()
            print(f"DEBUG BACKEND: Total recipes in DB (visible to client): {len(all_response.data)}")
            if len(all_response.data) > 0:
                print(f"DEBUG BACKEND: Sample User ID from DB: {all_response.data[0].get('user_id')}")
        except Exception as e:
            print(f"DEBUG BACKEND: Failed to fetch all recipes: {e}")

        # Original Query
        response = self.supabase.table("recipes").select("*").eq("user_id", str(user_id)).execute()
        recipes = []
        for item in response.data:
            # parsed_data is stored as jsonb, need to convert to Pydantic
            item['parsed_data'] = RecipeData(**item['parsed_data'])
            recipes.append(Recipe(**item))
        
        print(f"DEBUG BACKEND: Found {len(recipes)} recipes for this user.")
        return recipes

    async def get_recipe(self, recipe_id: UUID, user_id: UUID) -> Recipe | None:
        response = self.supabase.table("recipes").select("*").eq("id", str(recipe_id)).eq("user_id", str(user_id)).single().execute()
        if response.data:
            item = response.data
            item['parsed_data'] = RecipeData(**item['parsed_data'])
            return Recipe(**item)
        return None

    async def create_recipe(self, user_id: UUID, recipe_data: RecipeData, raw_content: str = "", title: str = "") -> Recipe:
        if not title:
            title = recipe_data.title

        data = {
            "user_id": str(user_id),
            "title": title,
            "raw_content": raw_content,
            "parsed_data": recipe_data.model_dump(mode='json'),
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = self.supabase.table("recipes").insert(data).execute()
        if response.data:
            item = response.data[0]
            item['parsed_data'] = RecipeData(**item['parsed_data'])
            return Recipe(**item)
        raise ValueError("Failed to create recipe")

    async def update_recipe_cookidoo_id(self, recipe_id: UUID, user_id: UUID, cookidoo_id: str):
         self.supabase.table("recipes").update({"cookidoo_id": cookidoo_id}).eq("id", str(recipe_id)).eq("user_id", str(user_id)).execute()

    async def update_thermomix_data(self, recipe_id: UUID, user_id: UUID, thermomix_data: RecipeData) -> Recipe:
        data = {
            "thermomix_data": thermomix_data.model_dump(mode='json')
        }
        response = self.supabase.table("recipes").update(data).eq("id", str(recipe_id)).eq("user_id", str(user_id)).execute()
        
        if response.data:
            item = response.data[0]
            item['parsed_data'] = RecipeData(**item['parsed_data'])
            if item.get('thermomix_data'):
                item['thermomix_data'] = RecipeData(**item['thermomix_data'])
            return Recipe(**item)
        raise ValueError("Failed to update recipe with thermomix data")

    async def delete_recipe(self, recipe_id: UUID, user_id: UUID) -> bool:
        response = self.supabase.table("recipes").delete().eq("id", str(recipe_id)).eq("user_id", str(user_id)).execute()
        # Supabase returns the deleted row in data. If len > 0, it was deleted.
        return len(response.data) > 0

    async def update_recipe(self, recipe_id: UUID, user_id: UUID, updates: dict) -> Recipe:
        response = self.supabase.table("recipes").update(updates).eq("id", str(recipe_id)).eq("user_id", str(user_id)).execute()
        
        if response.data:
            item = response.data[0]
            item['parsed_data'] = RecipeData(**item['parsed_data'])
            if item.get('thermomix_data'):
                item['thermomix_data'] = RecipeData(**item['thermomix_data'])
            return Recipe(**item)
        raise ValueError("Failed to update recipe")
