import flet as ft
from app.frontend.views.login import LoginView
from app.frontend.views.dashboard import DashboardView
from app.frontend.views.wizard import WizardView
import os

import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main(page: ft.Page):
    try:
        # Flet page might not have session_id directly in newer versions
        sid = getattr(page, "session_id", "unknown")
        logger.info(f"Flet App Connected. Session ID: {sid}")
        logger.info(f"Initial Route: {page.route}")
        
        page.title = "ChefLens"
        page.theme_mode = ft.ThemeMode.LIGHT
        page.scroll = ft.ScrollMode.AUTO
        page.padding = 0
        
        def router(route):
            logger.info(f"Routing to: {route}")
            page.controls.clear()
            
            try:
                if route == "/dashboard":
                    content = DashboardView(page)
                    page.add(content)
                elif route == "/wizard":
                    content = WizardView(page)
                    page.add(content)
                else:
                    content = LoginView(page)
                    page.add(content)
                
                page.update()
                logger.info(f"Page updated successfully for route: {route}")
            except Exception as e:
                logger.error(f"Error in router: {e}")
                traceback.print_exc()

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
