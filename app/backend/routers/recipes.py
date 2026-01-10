from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.backend.models import Recipe, RecipeData, ParseRequest, UploadRequest
from app.backend.services.recipe_service import RecipeService
from app.backend.services.ai_service import AiService
from uuid import UUID

router = APIRouter(prefix="/recipes", tags=["recipes"])

def get_recipe_service():
    return RecipeService()

def get_ai_service():
    return AiService()

import httpx

# ... existing imports ...

@router.post("/parse", response_model=RecipeData)
async def parse_recipe(
    request: ParseRequest,
    ai_service: AiService = Depends(get_ai_service)
):
    if request.text:
        return await ai_service.parse_recipe(request.text)
    
    if request.url:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(request.url, follow_redirects=True, timeout=10.0)
                resp.raise_for_status()
                content = resp.text
                return await ai_service.parse_recipe(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
            
    raise HTTPException(status_code=400, detail="No text or URL provided")

@router.get("/", response_model=list[Recipe])
async def get_recipes(
    user_id: UUID,  # Passed from frontend for now
    service: RecipeService = Depends(get_recipe_service)
):
    return await service.get_recipes(user_id)

@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe(
    recipe_id: UUID,
    user_id: UUID,
    service: RecipeService = Depends(get_recipe_service)
):
    recipe = await service.get_recipe(recipe_id, user_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.post("/", response_model=Recipe)
async def create_recipe(
    recipe_data: RecipeData,
    user_id: UUID,
    service: RecipeService = Depends(get_recipe_service)
):
    return await service.create_recipe(user_id, recipe_data)

@router.post("/upload")
async def upload_to_cookidoo(
    request: UploadRequest,
    # user_id: UUID, # Need user_id to get token
    # For now we might need to pass it or header
):
    # Retrieve token using AuthService
    # Call Cookidoo API
    return {"status": "not_implemented_yet", "message": "Cookidoo upload logic placeholder"}
