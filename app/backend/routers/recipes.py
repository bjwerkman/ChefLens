from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.backend.models import Recipe, RecipeData, ParseRequest, UploadRequest, RecipeUpdateRequest
from app.backend.services.recipe_service import RecipeService
from app.backend.services.ai_service import AiService
from uuid import UUID
from app.backend.dependencies import get_current_user_id

router = APIRouter(prefix="/recipes", tags=["recipes"])

def get_recipe_service():
    return RecipeService()

def get_ai_service():
    return AiService()

import httpx
import logging

logger = logging.getLogger(__name__)

# ... existing imports ...

@router.post("/parse", response_model=RecipeData)
async def parse_recipe(
    request: ParseRequest,
    user_id: UUID = Depends(get_current_user_id),
    ai_service: AiService = Depends(get_ai_service)
):
    try:
        if request.text:
            return await ai_service.parse_recipe(request.text)
        
        if request.url:
            async with httpx.AsyncClient() as client:
                try:
                    resp = await client.get(request.url, follow_redirects=True, timeout=10.0)
                    resp.raise_for_status()
                    content = resp.text
                    return await ai_service.parse_recipe(content)
                except httpx.HTTPError as e:
                     raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
                
        raise HTTPException(status_code=400, detail="No text or URL provided")
        
    except ValueError as ve:
         # Capture AI parsing errors specifically
         raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")

@router.get("/", response_model=list[Recipe])
async def get_recipes(
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service)
):
    return await service.get_recipes(user_id)

@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe(
    recipe_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service)
):
    recipe = await service.get_recipe(recipe_id, user_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.delete("/{recipe_id}")
async def delete_recipe(
    recipe_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service)
):
    success = await service.delete_recipe(recipe_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found or could not be deleted")
    return {"message": "Recipe deleted successfully"}

@router.post("/", response_model=Recipe)
async def create_recipe(
    recipe_data: RecipeData,
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service)
):
    return await service.create_recipe(user_id, recipe_data)

@router.put("/{recipe_id}", response_model=Recipe)
async def update_recipe(
    recipe_id: UUID,
    update_data: RecipeUpdateRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service)
):
    updates = update_data.model_dump(exclude_unset=True)
    if "parsed_data" in updates:
        updates["parsed_data"] = update_data.parsed_data.model_dump(mode='json')
    if "thermomix_data" in updates:
        updates["thermomix_data"] = update_data.thermomix_data.model_dump(mode='json')
        
    try:
        return await service.update_recipe(recipe_id, user_id, updates)
    except ValueError:
        raise HTTPException(status_code=404, detail="Recipe not found or update failed")

@router.post("/{recipe_id}/convert", response_model=Recipe)
async def convert_recipe_to_thermomix(
    recipe_id: UUID,
    language: str = "en",
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service),
    ai_service: AiService = Depends(get_ai_service)
):
    # 1. Get Generic Recipe
    recipe = await service.get_recipe(recipe_id, user_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    # 2. Convert Data
    thermomix_data = await ai_service.convert_to_thermomix(recipe.parsed_data, language=language)
    
    # 3. Update DB
    updated_recipe = await service.update_thermomix_data(recipe_id, user_id, thermomix_data)
    
    return updated_recipe

@router.post("/upload")
async def upload_to_cookidoo(
    request: UploadRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: RecipeService = Depends(get_recipe_service)
):
    # 1. Get Recipe Data
    recipe = await service.get_recipe(request.recipe_id, user_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # 2. Get Cookidoo Session
    from app.backend.services.auth_service import AuthService
    auth_service = AuthService()
    cookies = await auth_service.get_cookidoo_cookies(user_id)
    
    if not cookies:
        raise HTTPException(status_code=401, detail="Not authenticated with Cookidoo. Please login again.")

    # 3. Upload (Overwrite or Create)
    from app.backend.services.cookidoo_service import CookidooService
    cookidoo_service = CookidooService()
    
    target_id = request.target_recipe_id
    
    if not target_id:
        # Create new recipe first
        logger.info(f"Creating new recipe '{recipe.parsed_data.title}' on Cookidoo...")
        target_id = await cookidoo_service.create_recipe(cookies, recipe.parsed_data.title)
        
        if not target_id:
            raise HTTPException(status_code=500, detail="Failed to create new recipe on Cookidoo.")
    else:
        pass # Target ID provided, skip create
            
    logger.info(f"Updating recipe {target_id} on Cookidoo...")
    success = await cookidoo_service.update_recipe_details(
        target_id, 
        cookies, 
        recipe.parsed_data, 
        recipe.thermomix_data
    )
    
    if success:
        return {"status": "success", "message": "Recipe uploaded to Cookidoo!", "cookidoo_id": target_id}
    else:
        raise HTTPException(status_code=500, detail="Failed to update recipe details on Cookidoo.")
