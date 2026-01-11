from pydantic import BaseModel, Field
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

class Ingredient(BaseModel):
    name: str
    amount: Optional[str] = None
    unit: Optional[str] = None
    note: Optional[str] = None

class Step(BaseModel):
    description: str
    temperature: Optional[str] = None # e.g. "100°C" or "Varoma"
    time: Optional[str] = None        # e.g. "5 min"
    speed: Optional[str] = None       # e.g. "Speed 3"
    mode: Optional[str] = None        # e.g. "Sauté", "Knead"

class RecipeSettings(BaseModel):
    total_time: Optional[str] = None
    preparation_time: Optional[str] = None
    portions: Optional[str] = None

class RecipeData(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: List[Ingredient] = []
    steps: List[Step] = []
    settings: Optional[RecipeSettings] = None
    language: str = "en"

class Recipe(BaseModel):
    id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    title: str
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    raw_content: Optional[str] = None
    parsed_data: RecipeData
    thermomix_data: Optional[RecipeData] = None
    cookidoo_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ParseRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class UploadRequest(BaseModel):
    recipe_id: UUID
    user_id: UUID
    target_recipe_id: str
