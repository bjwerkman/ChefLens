
import flet as ft

def SafeIcon(name: str, **kwargs) -> ft.Icon:
    """
    Safely creates an Icon handling version differences.
    Signature analysis showed ft.Icon takes 'icon', not 'name'.
    """
    # Force usage of 'icon' argument
    return ft.Icon(icon=name, **kwargs)

def MainLayout(page: ft.Page, content: ft.Control, title: str = "ChefLens") -> ft.Control:
    """
    Standard layout wrapper.
    Legacy views set page.appbar directly. This helper can standardize that.
    """
    return content
