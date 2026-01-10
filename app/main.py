from fastapi import FastAPI
from app.core.config import get_settings
from app.backend.routers import auth, recipes
import flet.fastapi as flet_fastapi

settings = get_settings()
app = FastAPI(title="ChefLens API")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(recipes.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Mount Flet app
# Mount Flet app
from app.frontend.main import main as flet_main
import flet as ft
import os

# Dynamic assets path
current_dir = os.path.dirname(os.path.abspath(__file__))
assets_path = os.path.join(current_dir, "frontend", "assets")

app.mount("/", flet_fastapi.app(
    main=flet_main,
    before_main=None,
    assets_dir=assets_path,
    web_renderer=ft.WebRenderer.AUTO
))

