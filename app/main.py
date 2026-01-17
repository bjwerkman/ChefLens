from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.backend.routers import auth, recipes
import os

settings = get_settings()
app = FastAPI(title="ChefLens API")

# Configure CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(recipes.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Serve React App (only if build exists, e.g. in Docker)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

# Determine path to static files
static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(static_dir):
    # Mount assets (CSS, JS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        # Allow API routes to pass through (if they weren't caught by include_router above)
        if catchall.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if file exists (e.g. favicon.ico, logo.png)
        file_path = os.path.join(static_dir, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for SPA routing
        return FileResponse(os.path.join(static_dir, "index.html"))


