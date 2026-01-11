import flet as ft
from app.frontend.views.login import LoginView
from app.frontend.views.dashboard import DashboardView
from app.frontend.views.wizard import WizardView
from app.frontend.state import AppState
import os
import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main(page: ft.Page):
    print("--- DEBUG: Flet Main Started (Full App) ---")
    try:
        # Initialize Session State
        print("--- DEBUG: Initializing AppState ---")
        state = AppState()
        print("--- DEBUG: AppState Initialized ---")
        
        # Flet page might not have session_id directly in newer versions
        sid = getattr(page, "session_id", "unknown")
        logger.info(f"Flet App Connected. Session ID: {sid}")
        logger.info(f"Initial Route: {page.route}")
        
        page.title = "ChefLens"
        page.theme_mode = ft.ThemeMode.LIGHT
        
        # --- MATERIAL 3 THEME ---
        page.theme = ft.Theme(
            color_scheme_seed="#008C19", # Cookidoo-like Green
            visual_density=ft.VisualDensity.COMFORTABLE,
        )
        page.padding = 0
        
        def router(route):
            logger.info(f"Routing to: {route}")
            page.controls.clear()
            
            try:
                content = None
                if route == "/dashboard":
                    content = DashboardView(page, state)
                elif route == "/wizard":
                    content = WizardView(page, state)
                else:
                    content = LoginView(page, state)
                
                # --- GLOBAL WRAPPER: GRADIENT BACKGROUND ---
                # Wraps every view in a premium gradient container
                bg_wrapper = ft.Container(
                    content=content,
                    expand=True,
                    gradient=ft.LinearGradient(
                        begin=ft.alignment.Alignment(-1, -1), # Top Left
                        end=ft.alignment.Alignment(1, 1),   # Bottom Right
                        colors=[
                            "#F0F9F0",  # Very light green/white
                            "white",      # White center/bottom
                        ],
                    ),
                )
                
                page.add(bg_wrapper)
                
                page.update()
                logger.info(f"Page updated successfully for route: {route}")
            except Exception as e:
                logger.error(f"Error in router: {e}")
                traceback.print_exc()
                page.add(ft.Text(f"Error loading view: {e}", color="red"))
                page.update()

        # Handle page route changes by calling our custom router
        # Note: We are NOT using page.views mechanism anymore.
        # page.on_route_change will still be called when URL changes, setup listeners
        page.on_route_change = lambda e: router(e.route)
        
        # Initial Route
        troute = page.route if page.route else "/"
        router(troute)
            
    except Exception as e:
        logger.error(f"CRITICAL ERROR in Flet Main: {e}")
        traceback.print_exc()
