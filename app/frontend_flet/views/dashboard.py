import flet as ft
from app.frontend.state import AppState
from app.frontend.components import SafeIcon

def RecipeTile(recipe):
    """
    Cookidoo-style Recipe Tile
    - Image (2/3 height) - Placeholder for now
    - Info (1/3 height) - Title, Rating, Time
    - Menu (3 dots) - Actions
    """
    
    # Placeholder Image Container
    image_area = ft.Container(
        height=150,
        bgcolor="#F0F0F0", # Light grey placeholder
        alignment=ft.alignment.Alignment(0, 0),
        content=ft.Icon("image", size=40, color="grey"), # Placeholder icon
        border_radius=ft.border_radius.only(top_left=12, top_right=12),
        clip_behavior=ft.ClipBehavior.HARD_EDGE, 
    )
    
    # Info Area
    info_area = ft.Container(
        padding=10,
        content=ft.Column(
            spacing=5,
            controls=[
                ft.Row(
                    [
                        ft.Text(recipe.get("title", "Untitled"), weight=ft.FontWeight.BOLD, size=16, expand=True, max_lines=1, overflow=ft.TextOverflow.ELLIPSIS),
                        ft.PopupMenuButton(
                            icon="more_horiz", # String literal
                            items=[
                                ft.PopupMenuItem(text="View Details", icon="visibility"),
                                ft.PopupMenuItem(text="Upload to Thermomix", icon="cloud_upload"),
                                ft.PopupMenuItem(text="Delete", icon="delete", content=ft.Text("Delete", color="red")),
                            ]
                        ),
                    ],
                    alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                    vertical_alignment=ft.CrossAxisAlignment.START,
                ),
                # Metadata Row (Time, Rating example)
                ft.Row(
                    [
                        ft.Icon("access_time", size=14, color="grey"),
                        ft.Text("30 min", size=12, color="grey"), # Mock data for now
                        ft.Container(width=10),
                        ft.Icon("star", size=14, color="amber"),
                        ft.Text("4.5", size=12, color="grey"), # Mock data
                    ],
                    spacing=2
                )
            ]
        )
    )

    return ft.Card(
        elevation=0, # Flat style like Cookidoo? Or slight shadow. Let's do slight.
        surface_tint_color="surface",
        variant=ft.CardVariant.ELEVATED,
        content=ft.Container(
            content=ft.Column([image_area, info_area], spacing=0),
            padding=0,
            border_radius=12,
            on_click=lambda _: print(f"Open {recipe.get('title')}"),
            ink=True,
        )
    )

def DashboardView(page: ft.Page, state: AppState):
    
    # --- HEADER SECTION ---
    search_bar = ft.TextField(
        hint_text="Search recipes...",
        prefix_icon="search", # String literal
        border_radius=30,
        content_padding=10,
        expand=True,
        text_size=14,
        bgcolor="white",
        border_color="transparent", # Clean look
    )
    
    # Wrap search in card for shadow/elevation if desired, or just container
    search_container = ft.Container(
        content=search_bar,
        expand=True,
        bgcolor="white",
        border_radius=30,
        shadow=ft.BoxShadow(blur_radius=5, color=ft.colors.with_opacity(0.1, "black") if hasattr(ft, "colors") else "#1A000000", offset=ft.Offset(0,2)),
    )
    
    # Custom IconButton since stock one is buggy in this version
    def ActionIcon(icon_name, tooltip):
        return ft.Container(
            content=ft.Icon(icon_name, size=24, color="grey"),
            padding=8,
            border_radius=50,
            ink=True,
            on_click=lambda _: print(f"{tooltip} clicked"),
            tooltip=tooltip,
        )

    header = ft.Container(
        padding=ft.padding.only(left=20, right=20, top=10, bottom=10),
        content=ft.Row(
            controls=[
                search_container,
                ActionIcon("filter_list", "Filter"),
                ActionIcon("sort", "Sort"),
            ],
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN
        )
    )

    # --- GRID SECTION ---
    recipes_grid = ft.GridView(
        expand=True,
        max_extent=300, # Adjusted for Tile look
        child_aspect_ratio=0.8, # Taller cards for images
        spacing=15,
        run_spacing=15,
        padding=20,
    )
    
    # Message for when there are no recipes
    empty_state = ft.Container(
        content=ft.Column(
            [
                ft.Icon("menu_book", size=64, color="grey"),
                ft.Text("No recipes found", size=18, color="grey"),
                ft.Text("Click + to add your first recipe!", size=14, color="grey"),
            ],
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER
        ),
        alignment=ft.alignment.Alignment(0, 0),
        expand=True,
        visible=False
    )

    async def load_recipes():
        print("DEBUG: Starting load_recipes...")
        try:
            recipes = await state.api.get_recipes()
            print(f"DEBUG: Fetched {len(recipes)} recipes.")
            
            # LIFECYCLE CHECK: If user navigated away, stop.
            if page.route != "/dashboard":
                print("DEBUG: Navigation occurred, aborting UI update.")
                return
            
            recipes_grid.controls.clear()
            
            if not recipes:
                recipes_grid.visible = False
                empty_state.visible = True
            else:
                recipes_grid.visible = True
                empty_state.visible = False
                for r in recipes:
                    print(f"DEBUG: Adding tile for {r.get('title')}")
                    recipes_grid.controls.append(RecipeTile(r))
            
            page.update()
            print("DEBUG: Page updated with recipes.")
        except Exception as e:
            print(f"DEBUGGING ERROR: load_recipes failed: {e}")
            page.snack_bar = ft.SnackBar(
                content=ft.Text(f"Failed to load recipes: {e}"),
                bgcolor="error",
                action="Retry",
                on_action=lambda _: page.run_task(load_recipes)
            )
            page.snack_bar.open = True
            page.update()

    # --- MAIN LAYOUT ---
    layout = ft.Column(
        [
            header,
            empty_state,
            recipes_grid
        ],
        expand=True,
        spacing=0,
    )
    
    # --- FAB Implementation ---
    # Page FAB is global. We set it here.
    page.floating_action_button = ft.FloatingActionButton(
        icon="add",
        bgcolor="#008C19", # Cookidoo Green
        content=ft.Icon("add", size=30, color="white"), # Big icon
        shape=ft.CircleBorder(),
        on_click=lambda _: page.go("/wizard"),
        tooltip="Create New Recipe"
    )

    # Initial Load
    page.run_task(load_recipes)
    
    return layout
