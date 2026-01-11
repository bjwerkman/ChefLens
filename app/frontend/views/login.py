import flet as ft
from app.frontend.state import AppState

def LoginView(page: ft.Page, state: AppState):
    email = ft.TextField(label="Email", width=300)
    password = ft.TextField(label="Password", password=True, can_reveal_password=True, width=300)
    error_text = ft.Text(color=ft.Colors.RED, visible=False)

    async def login_click(e):
        error_text.visible = False
        page.update()
        
        if not email.value or not password.value:
            error_text.value = "Please enter email and password"
            error_text.visible = True
            page.update()
            return

        success, msg = await state.api.login(email.value, password.value)
        if success:
            # Navigate to dashboard manually if using control swapping, 
            # or rely on the main.py router to handle the route change if we used page.go
            # We will use page.go("/dashboard") and let main.py handle it.
            page.go("/dashboard")
        else:
            error_text.value = f"Login failed: {msg}"
            error_text.visible = True
            page.update()

    return ft.Container(
        content=ft.Card(
            content=ft.Container(
                content=ft.Column(
                    [
                        ft.Image(src="/icons/ChefLens.png", width=100, height=100),
                        ft.Text("ChefLens Login", size=30, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                        ft.Container(email), 
                        ft.Container(password),
                        error_text,
                        ft.ElevatedButton("Login", on_click=login_click),
                    ],
                    alignment=ft.MainAxisAlignment.CENTER,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=20,
                ),
                padding=40,
                bgcolor=ft.Colors.WHITE,
            ),
            elevation=10,
        ),
        alignment=ft.Alignment(0, 0),
        bgcolor=ft.Colors.BLUE_GREY_100, # Keep page bg for contrast
        expand=True
    )
