
import logging
import flet as ft
import flet.fastapi as flet_fastapi
from fastapi import FastAPI
import uvicorn
import os
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("flet_debug")

# Define a minimal Login View
def LoginView(page: ft.Page):
    return ft.View(
        "/",
        [
            ft.AppBar(title=ft.Text("Debug Login"), bgcolor=ft.Colors.BLUE),
            ft.Text("Login Screen - Isolation Test", size=30),
            ft.ElevatedButton("Go to Dashboard", on_click=lambda _: page.go("/dashboard"))
        ],
    )

# Define a minimal Dashboard View
def DashboardView(page: ft.Page):
    return ft.View(
        "/dashboard",
        [
            ft.AppBar(title=ft.Text("Debug Dashboard"), bgcolor=ft.Colors.RED),
            ft.Text("Dashboard Screen - Isolation Test", size=30),
            ft.ElevatedButton("Go Back", on_click=lambda _: page.go("/"))
        ],
    )

async def main(page: ft.Page):
    sid = getattr(page, "session_id", "unknown")
    logger.info(f"Session started: {sid}")
    page.title = "Flet Debug App - Control Swap"
    
    # Root container for all content
    root = ft.Column(expand=True)
    page.add(root)

    def go_dashboard(e):
        print("Swapping to Dashboard")
        root.controls.clear()
        root.controls.append(
            ft.Column([
                ft.Text("DASHBOARD (Control Swap)", size=40, color="green"),
                ft.ElevatedButton("Logout", on_click=go_login)
            ])
        )
        page.update()

    def go_login(e):
        print("Swapping to Login")
        root.controls.clear()
        root.controls.append(
            ft.Column([
                ft.Text("LOGIN (Control Swap)", size=40, color="blue"),
                ft.ElevatedButton("Login", on_click=go_dashboard)
            ])
        )
        page.update()

    # Initial Load
    go_login(None)

# Create FastAPI app
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "debug_ok"}

# Mount Flet
app.mount("/", flet_fastapi.app(main=main, before_main=None, web_renderer=ft.WebRenderer.AUTO))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
