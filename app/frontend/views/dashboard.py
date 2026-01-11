import flet as ft
from app.frontend.state import AppState
from app.frontend.components import SafeIcon

def RecipeCard(recipe):
    return ft.Card(
        content=ft.Container(
            content=ft.Column(
                [
                    ft.ListTile(
                        leading=SafeIcon(name="restaurant_menu"),
                        title=ft.Text(recipe.get("title", "Untitled")),
                        subtitle=ft.Text(recipe.get("source_url", "No Source")),
                    ),
                    ft.Row(
                        [ft.TextButton("View"), ft.TextButton("Upload")],
                        alignment=ft.MainAxisAlignment.END,
                    ),
                ]
            ),
            width=300,
            padding=10,
        )
    )

def DashboardView(page: ft.Page):
    recipes_grid = ft.GridView(
        expand=1,
        runs_count=5,
        max_extent=350,
        child_aspect_ratio=1.0,
        spacing=10,
        run_spacing=10,
    )

    async def load_recipes():
        recipes = await AppState().api.get_recipes()
        recipes_grid.controls.clear()
        for r in recipes:
            recipes_grid.controls.append(RecipeCard(r))
        page.update()

    # Create a floating action button to go to Wizard
    page.floating_action_button = ft.FloatingActionButton(
        content=SafeIcon(name="add"),
        on_click=lambda _: page.go("/wizard")
    )
    
    # Set AppBar directly
    page.appbar = ft.AppBar(title=ft.Text("ChefLens Dashboard"), bgcolor="surfaceVariant")
    
    # Add a refresh button to the page logic or a separate row? 
    # The original view had it in the controls list. 
    # We can return a Column containing the refresh button and the grid.

    # Initial load trigger
    # We can trigger it immediately since we are in the view function
    # But better to schedule it to avoid blocking UI render?
    # For now, simplistic approach:
    # We will use on_mount or just call it after returning?
    # Let's just return the layout and rely on user or manual call.
    # Actually, we can just call load_recipes() as a background task? 
    # Or just let the Refresh button be the primary way for now to ensure stability.
    
    layout = ft.Column(
        [
            ft.ElevatedButton("Refresh Recipes", on_click=lambda _: page.run_task(load_recipes)), 
            recipes_grid
        ],
        expand=True 
    )
    
    return layout
