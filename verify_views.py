
import flet as ft
import sys
import os

# Ensure we can import app modules
sys.path.append(os.getcwd())

from app.frontend.views.login import LoginView
from app.frontend.views.dashboard import DashboardView
# WizardView might need complex setup, add later if stable
from app.frontend.views.wizard import WizardView

print("--- STARTING VIEW VERIFICATION ---")

class MockPage:
    def __init__(self):
        # Minimal mock of ft.Page properties used in Views
        self.route = "/"
        self.controls = []
        self.views = []
        self.overlay = []
        self._session_id = "test-session"
        self.appbar = None
        self.floating_action_button = None
        self.scroll = None
        self.padding = 10
        self.title = "Mock Page"
        self.theme_mode = "light"
        self.platform = "macos"
        
    def go(self, route):
        print(f"MockPage.go({route}) called")
    
    def update(self):
        print("MockPage.update() called")

mock_page = MockPage()

def test_view(view_func, name):
    print(f"\nTesting {name}...")
    try:
        content = view_func(mock_page)
        print(f"✅ {name} Instantiated Successfully")
        print(f"   Type: {type(content)}")
        if isinstance(content, ft.Control):
            print("   Control matches expected type.")
        else:
            print("   ⚠️ WARNING: Did not return a Control?")
    except Exception as e:
        print(f"❌ CRITICAL FAILURE in {name}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

# Run tests
test_view(LoginView, "LoginView")
test_view(DashboardView, "DashboardView")
test_view(WizardView, "WizardView")

print("\n--- ALL VIEWS VERIFIED ---")
sys.exit(0)
