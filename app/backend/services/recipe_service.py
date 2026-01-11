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
        response = self.supabase.table("recipes").select("*").eq("user_id", str(user_id)).execute()
        recipes = []
        for item in response.data:
            # parsed_data is stored as jsonb, need to convert to Pydantic
            item['parsed_data'] = RecipeData(**item['parsed_data'])
            recipes.append(Recipe(**item))
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
