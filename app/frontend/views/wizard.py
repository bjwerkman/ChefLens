import flet as ft
from app.frontend.state import AppState
import json

def WizardView(page: ft.Page):
    # State for the wizard
    active_recipe_data = {} 
    
    # --- Tab 1: Input ---
    input_text = ft.TextField(label="Paste Recipe Text Here", multiline=True, min_lines=10, expand=True)
    input_url = ft.TextField(label="Or Enter Recipe URL")
    
    async def parse_click(e):
        page.overlay.append(ft.BottomSheet(content=ft.ProgressBar()))
        page.update()
        
        text = input_text.value
        url = input_url.value
        
        result = await AppState().api.parse_recipe(text=text, url=url)
        
        # Clear loading
        if page.overlay:
             page.overlay.clear()
        
        if result:
            active_recipe_data.update(result)
            # Update Review Tab fields
            populate_review_tab()
            tabs.selected_index = 1 # Move to Review
            page.update()
        else:
            page.snack_bar = ft.SnackBar(ft.Text("Parsing failed"))
            page.snack_bar.open = True
            page.update()

    input_tab = ft.Container(
        content=ft.Column([
            input_url,
            ft.Text("OR"),
            input_text,
            ft.ElevatedButton("Parse with AI", on_click=parse_click)
        ]),
        padding=20
    )

    # --- Tab 2: Review (Simple JSON Editor Concept) ---
    json_editor = ft.TextField(label="Review Parsed JSON", multiline=True, min_lines=20, expand=True)
    
    def populate_review_tab():
        json_editor.value = json.dumps(active_recipe_data, indent=2)

    async def save_click(e):
        try:
            data = json.loads(json_editor.value)
            # Create recipe in Supabase
            result = await AppState().api.create_recipe(data)
            if result:
                page.snack_bar = ft.SnackBar(ft.Text("Recipe Saved!"))
                page.snack_bar.open = True
                tabs.selected_index = 2 # Move to Upload Tab
                page.update()
            else:
                page.snack_bar = ft.SnackBar(ft.Text("Failed to save recipe"))
                page.snack_bar.open = True
                page.update()
        except Exception as ex:
             page.snack_bar = ft.SnackBar(ft.Text(f"JSON Error: {ex}"))
             page.snack_bar.open = True
             page.update()

    review_tab = ft.Container(
        content=ft.Column([
            json_editor,
            ft.ElevatedButton("Save & Proceed", on_click=save_click)
        ]),
        padding=20
    )

    # --- Tab 3: Upload ---
    async def upload_click(e):
         # Placeholder for upload logic
         page.snack_bar = ft.SnackBar(ft.Text("Upload to Cookidoo initiated (Mock)..."))
         page.snack_bar.open = True
         page.update()

    upload_tab = ft.Container(
        content=ft.Column([
            ft.Text("Ready to Upload to Cookidoo", size=20),
            ft.ElevatedButton("Upload Now", on_click=upload_click),
            ft.OutlinedButton("Back to Dashboard", on_click=lambda _: page.go("/dashboard"))
        ], alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER),
        padding=20,
        alignment=ft.Alignment(0, 0)
    )


    # Content mapping
    tab_contents = [input_tab, review_tab, upload_tab]
    
    # Area to display current content
    content_area = ft.Container(content=tab_contents[0], expand=True)

    def set_tab(idx):
        content_area.content = tab_contents[idx]
        
        # Simple styling
        c_active = "blue"
        c_inactive = "grey"
        
        b_input.bgcolor = c_active if idx==0 else c_inactive
        b_review.bgcolor = c_active if idx==1 else c_inactive
        b_upload.bgcolor = c_active if idx==2 else c_inactive
        
        page.update()

    b_input = ft.ElevatedButton("1. Input", on_click=lambda _: set_tab(0), bgcolor="blue", color="white")
    b_review = ft.ElevatedButton("2. Review", on_click=lambda _: set_tab(1), bgcolor="grey", color="white")
    b_upload = ft.ElevatedButton("3. Upload", on_click=lambda _: set_tab(2), bgcolor="grey", color="white")

    tab_bar = ft.Row(
        [b_input, b_review, b_upload],
        alignment=ft.MainAxisAlignment.CENTER,
        spacing=10
    )

    page.appbar = ft.AppBar(title=ft.Text("New Recipe Wizard"), bgcolor="surfaceVariant")
    page.floating_action_button = None

    return ft.Column([tab_bar, content_area], expand=True)
