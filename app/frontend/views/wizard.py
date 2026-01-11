import flet as ft
from app.frontend.state import AppState
import json

def WizardView(page: ft.Page):
    # State for the wizard
    active_recipe_data = {} 
    active_thermomix_data = {}
    current_recipe_id = None 
    
    # --- Tab 1: Input ---
    # Check login
    if not AppState().api.user_id:
        page.snack_bar = ft.SnackBar(ft.Text("Session expired. Please login first."))
        page.snack_bar.open = True
        page.update()
        page.go("/")
        return ft.Container()

    input_text = ft.TextField(label="Paste Recipe Text Here", multiline=True, min_lines=10, expand=True)
    input_url = ft.TextField(label="Or Enter Recipe URL")
    
    # Feedback controls
    progress_ring = ft.ProgressRing(visible=False)
    status_text = ft.Text("", visible=False, color="blue")

    async def parse_click(e):
        # Show loading
        progress_ring.visible = True
        status_text.value = "Analyzing recipe with AI..."
        status_text.visible = True
        status_text.color = "blue"
        page.update()
        
        text = input_text.value
        url = input_url.value
        
        # Call API
        result = await AppState().api.parse_recipe(text=text, url=url)
        
        # Hide loading
        progress_ring.visible = False
        
        if result:
            status_text.value = "Success! Reviewing data..."
            status_text.color = "green"
            page.update()
            
            active_recipe_data.update(result)
            populate_review_tab()
            
            # Artificial delay to let user see success message before switch
            import asyncio
            await asyncio.sleep(0.5)
            
            # Switch tab
            set_tab(1)
        else:
            status_text.value = "Parsing failed. Please check the URL or Text."
            status_text.color = "red"
            page.update()

    input_tab = ft.Container(
        content=ft.Column([
            input_url,
            ft.Text("OR"),
            input_text,
            ft.ElevatedButton("Parse with AI", on_click=parse_click),
            ft.Row([progress_ring, status_text], alignment=ft.MainAxisAlignment.CENTER)
        ]),
        padding=20
    )

    # --- Tab 2: Review ---
    json_editor = ft.TextField(label="Review Parsed JSON", multiline=True, min_lines=20, expand=True, visible=False)
    
    # Human Readable View controls
    human_view_col = ft.Column(expand=True, scroll=ft.ScrollMode.AUTO)
    
    view_mode_switch = ft.Switch(label="View as JSON", value=False)

    def populate_review_tab():
        # Update JSON editor
        json_editor.value = json.dumps(active_recipe_data, indent=2)
        
        # Update Human View
        human_view_controls = []
        
        title = active_recipe_data.get("title", "Untitled Recipe")
        desc = active_recipe_data.get("description", "")
        
        human_view_controls.append(ft.Text(title, size=24, weight=ft.FontWeight.BOLD))
        if desc:
            human_view_controls.append(ft.Text(desc, italic=True))
        
        human_view_controls.append(ft.Divider())
        
        # Ingredients
        human_view_controls.append(ft.Text("Ingredients", size=18, weight=ft.FontWeight.BOLD))
        ingredients = active_recipe_data.get("ingredients", [])
        for ing in ingredients:
            name = ing.get("name", "")
            amount = ing.get("amount", "")
            unit = ing.get("unit", "")
            note = ing.get("note", "")
            line = f"- {amount} {unit} {name}".strip()
            if note:
                line += f" ({note})"
            human_view_controls.append(ft.Text(line))
            
        human_view_controls.append(ft.Divider())
            
        # Steps
        human_view_controls.append(ft.Text("Instructions", size=18, weight=ft.FontWeight.BOLD))
        steps = active_recipe_data.get("steps", [])
        for i, step in enumerate(steps, 1):
            desc = step.get("description", "")
            human_view_controls.append(ft.Text(f"{i}. {desc}"))
            # Add step details if valuable (speed, temp etc) - keeping simple for now
            
        human_view_col.controls = human_view_controls
        
        # Ensure correct visibility based on switch
        toggle_view_mode(None)

    def toggle_view_mode(e):
        is_json = view_mode_switch.value
        json_editor.visible = is_json
        human_view_col.visible = not is_json
        page.update()

    view_mode_switch.on_change = toggle_view_mode

    async def save_click(e):
        try:
            # Source of truth logic:
            # If in JSON mode, updated source from editor.
            # If in Text mode, assume source is valid in memory (active_recipe_data).
            # But populate_review_tab sets json_editor from memory.
            # So let's try to update memory from editor if visible
            
            data_to_save = active_recipe_data
            
            if json_editor.visible:
                try:
                    data_to_save = json.loads(json_editor.value)
                except:
                     page.snack_bar = ft.SnackBar(ft.Text("Invalid JSON in editor"))
                     page.snack_bar.open = True
                     page.update()
                     return

            # Create recipe in Supabase
            result = await AppState().api.create_recipe(data_to_save)
            
            if result:
                page.snack_bar = ft.SnackBar(ft.Text("Recipe Saved!"))
                page.snack_bar.open = True
                
                # Store ID for next steps
                nonlocal current_recipe_id
                if result.get("id"):
                    current_recipe_id = result.get("id")
                
                # Move to Thermomix Tab (2)
                set_tab(2)
                page.update()
            else:
                page.snack_bar = ft.SnackBar(ft.Text("Failed to save recipe"))
                page.snack_bar.open = True
                page.update()
        except Exception as ex:
             page.snack_bar = ft.SnackBar(ft.Text(f"Error: {ex}"))
             page.snack_bar.open = True
             page.update()

    review_tab = ft.Container(
        content=ft.Column([
            ft.Row([view_mode_switch], alignment=ft.MainAxisAlignment.END),
            json_editor,
            human_view_col,
            ft.ElevatedButton("Save & Proceed", on_click=save_click)
        ]),
        padding=20
    )

    # --- Tab 3: Thermomix Conversion ---
    tm_editor = ft.TextField(label="Thermomix Instructions (JSON)", multiline=True, min_lines=20, expand=True, visible=False)
    tm_view_col = ft.Column(expand=True, scroll=ft.ScrollMode.AUTO)
    tm_status = ft.Text("", color="blue")
    tm_progress = ft.ProgressRing(visible=False)
    tm_mode_switch = ft.Switch(label="View as JSON", value=False)
    
    async def convert_click(e):
        if not current_recipe_id:
             page.snack_bar = ft.SnackBar(ft.Text("Error: No recipe ID found. Please save first."))
             page.snack_bar.open = True
             page.update()
             return

        tm_status.value = "Converting to Thermomix format (AI)..."
        tm_progress.visible = True
        page.update()
        
        result = await AppState().api.convert_recipe(current_recipe_id)
        
        tm_progress.visible = False
        
        if result and result.get("thermomix_data"):
            tm_status.value = "Conversion Complete!"
            tm_status.color = "green"
            
            nonlocal active_thermomix_data
            active_thermomix_data = result.get("thermomix_data")
            populate_tm_tab()
        else:
            tm_status.value = "Conversion Failed or Empty Data."
            tm_status.color = "red"
        
        page.update()

    def populate_tm_tab():
        tm_editor.value = json.dumps(active_thermomix_data, indent=2)
        
        # Populate Human View for TM
        controls = []
        controls.append(ft.Text("Thermomix Settings", size=20, weight=ft.FontWeight.BOLD))
        
        steps = active_thermomix_data.get("steps", [])
        if not steps:
             controls.append(ft.Text("No steps generated. Check JSON view.", color="red"))
        
        for i, step in enumerate(steps, 1):
            desc = step.get("description", "")
            temp = step.get("temperature", "")
            time = step.get("time", "")
            speed = step.get("speed", "")
            mode = step.get("mode", "")
            
            # Create Badges
            badges = []
            if time: badges.append(ft.Container(content=ft.Text(time, size=12, color="white"), bgcolor="blue", padding=5, border_radius=5))
            if temp: badges.append(ft.Container(content=ft.Text(temp, size=12, color="black"), bgcolor="amber", padding=5, border_radius=5))
            if speed: badges.append(ft.Container(content=ft.Text(speed, size=12, color="white"), bgcolor="green", padding=5, border_radius=5))
            if mode: badges.append(ft.Container(content=ft.Text(mode, size=12, color="white"), bgcolor="purple", padding=5, border_radius=5))
            
            controls.append(
                ft.ListTile(
                    leading=ft.CircleAvatar(content=ft.Text(str(i))),
                    title=ft.Text(desc),
                    subtitle=ft.Row(badges, spacing=5) if badges else None,
                )
            )
            
        tm_view_col.controls = controls
        
        # Trigger visibility update
        toggle_tm_view_mode(None)

    def toggle_tm_view_mode(e):
        is_json = tm_mode_switch.value
        tm_editor.visible = is_json
        tm_view_col.visible = not is_json
        page.update()

    tm_mode_switch.on_change = toggle_tm_view_mode

    thermomix_tab = ft.Container(
        content=ft.Column([
            ft.Text("Convert Logic to Thermomix Settings", size=18),
            ft.Row([ft.ElevatedButton("Generate Thermomix Instructions", on_click=convert_click), tm_progress], spacing=10),
            tm_status,
            ft.Row([tm_mode_switch], alignment=ft.MainAxisAlignment.END), # Added Switch
            tm_editor,
            tm_view_col,
            ft.ElevatedButton("Confirm & Proceed to Upload", on_click=lambda _: set_tab(3))
        ], expand=True), # Ensure Main Column expands
        padding=20
    )

    # --- Tab 4: Upload ---
    target_id_field = ft.TextField(label="Target Cookidoo Recipe ID", hint_text="Leave empty to Create New Recipe", width=400)
    upload_status = ft.Text("", color="blue", visible=False)
    upload_progress = ft.ProgressRing(visible=False)
    
    async def upload_click(e):
         if not current_recipe_id:
             page.snack_bar = ft.SnackBar(ft.Text("Error: Save recipe first."))
             page.snack_bar.open = True
             page.update()
             return

         raw_input = target_id_field.value
         target_id = ""
         
         if raw_input:
             # EXTRACT ID LOGIC
             target_id = raw_input.strip()
             if "cookidoo" in target_id and "/" in target_id:
                  parts = target_id.split("/")
                  last = parts[-1]
                  if "?" in last: last = last.split("?")[0]
                  target_id = last
         
         # Show Loading
         mode_text = "Creating New Recipe..." if not target_id else "Overwriting Recipe..."
         upload_status.value = f"Uploading to Cookidoo ({mode_text})"
         upload_status.visible = True
         upload_progress.visible = True
         # Disable button
         e.control.disabled = True
         page.update()
         
         success, msg = await AppState().api.upload_recipe(current_recipe_id, target_id)
         
         upload_progress.visible = False
         e.control.disabled = False
         
         if success:
             upload_status.value = f"Success! {msg}"
             upload_status.color = "green"
             page.snack_bar = ft.SnackBar(ft.Text("Recipe Uploaded Successfully! 🚀"))
         else:
             upload_status.value = f"Failed: {msg}"
             upload_status.color = "red"
             
         page.snack_bar.open = True
         page.update()

    upload_view = ft.Column(
        [
            ft.Text("Upload to Cookidoo", size=24, weight=ft.FontWeight.BOLD),
            ft.Text("Generate a new recipe on your Cookidoo account or overwrite an existing one.", size=16),
            ft.Container(height=20),
            target_id_field,
            ft.Text("If you provide an ID (or URL), we will overwrite that recipe. If left blank, we create a new one.", size=12, color="grey"),
            ft.Container(height=20),
            ft.Row([
                ft.ElevatedButton("Upload to Cookidoo", icon="cloud_upload", on_click=upload_click),
                upload_progress
            ]),
            upload_status
        ],
        expand=True,
        scroll=ft.ScrollMode.AUTO,
        alignment=ft.MainAxisAlignment.START,
        horizontal_alignment=ft.CrossAxisAlignment.CENTER
    )
    upload_tab = ft.Container(
        content=upload_view,
        padding=20,
        alignment=ft.Alignment(0, -0.8)
    )


    # Content mapping
    tab_contents = [input_tab, review_tab, thermomix_tab, upload_tab]
    
    # Area to display current content
    content_area = ft.Container(content=tab_contents[0], expand=True)

    def set_tab(idx):
        content_area.content = tab_contents[idx]
        
        # Simple styling
        c_active = "blue"
        c_inactive = "grey"
        
        b_input.bgcolor = c_active if idx==0 else c_inactive
        b_review.bgcolor = c_active if idx==1 else c_inactive
        b_tm.bgcolor = c_active if idx==2 else c_inactive
        b_upload.bgcolor = c_active if idx==3 else c_inactive
        
        page.update()

    b_input = ft.ElevatedButton("1. Input", on_click=lambda _: set_tab(0), bgcolor="blue", color="white")
    b_review = ft.ElevatedButton("2. Review", on_click=lambda _: set_tab(1), bgcolor="grey", color="white")
    b_tm = ft.ElevatedButton("3. Thermomix", on_click=lambda _: set_tab(2), bgcolor="grey", color="white")
    b_upload = ft.ElevatedButton("4. Upload", on_click=lambda _: set_tab(3), bgcolor="grey", color="white")

    tab_bar = ft.Row(
        [b_input, b_review, b_tm, b_upload],
        alignment=ft.MainAxisAlignment.CENTER,
        spacing=10
    )

    page.appbar = ft.AppBar(title=ft.Text("New Recipe Wizard"), bgcolor="surfaceVariant")
    page.floating_action_button = None

    return ft.Column([tab_bar, content_area], expand=True)
