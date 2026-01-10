from typing import List, Optional, Dict, Any
from app.frontend.api import ApiClient

class AppState:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AppState, cls).__new__(cls)
            cls._instance.client = ApiClient()
            cls._instance.user_id = None
            cls._instance.recipes: List[Dict[str, Any]] = []
            cls._instance.current_recipe: Optional[Dict[str, Any]] = None
        return cls._instance

    @property
    def api(self):
        return self.client
