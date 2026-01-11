from typing import List, Optional, Dict, Any
from app.frontend.api import ApiClient

class AppState:
    def __init__(self):
        self.client = ApiClient()
        self.user_id = None
        # In-memory stores
        self.recipes: List[Dict[str, Any]] = []
        self.current_recipe: Optional[Dict[str, Any]] = None

    @property
    def api(self):
        return self.client
