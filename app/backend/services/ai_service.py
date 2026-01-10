import google.generativeai as genai
import json
from app.core.config import get_settings
from app.backend.models import RecipeData

settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

class AiService:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)
        # Detailed system prompt will be refined in Phase 5, using a functional base for now.
        self.system_prompt = """
        You are a specialized Data Converter for the Thermomix TM7. 
        You must extract recipe data and format it into this EXACT JSON structure.
        
        CRITICAL RULES FOR TM7 SETTINGS:
        1. Infer Temperature:
           - "Varoma" -> "Varoma" (do not use 120C)
           - "Sauté" -> "120°C" unless specified otherwise.
           - "Boil" -> "100°C"
        2. Infer Speed:
           - "Stir" -> "Speed 1" or "Speed Spoon"
           - "Puree" -> "Speed 8-10" (gradual)
           - "Chop" -> "Speed 5"
        3. Infer Mode:
           - "Knead" or "Dough" -> mode: "Dough"
           - "Turbo" -> mode: "Turbo"
           - "Blend" -> mode: "Blend"
        
        Clean up ingredient strings (remove "approx.", "room temp").
        
        Example output format:
        {
            "title": "String",
            "description": "String",
            "ingredients": [
                {"name": "String", "amount": "String", "unit": "String", "note": "String"}
            ],
            "steps": [
                {"description": "String", "temperature": "String", "time": "String", "speed": "String", "mode": "String"}
            ],
            "settings": {
                "total_time": "String",
                "preparation_time": "String",
                "portions": "String"
            },
            "language": "en"
        }
        """

    async def parse_recipe(self, content: str) -> RecipeData:
        prompt = f"{self.system_prompt}\n\nHere is the recipe content to parse:\n{content}\n\nRETURN JSON ONLY."
        
        try:
            response = self.model.generate_content(prompt)
            # Gemini text usually contains ```json ... ``` blocks, we need to clean clean it
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text: # Generic code block
                text = text.split("```")[1].split("```")[0]
            
            data = json.loads(text)
            return RecipeData(**data)
        except Exception as e:
            # Fallback or error handling
            print(f"AI Parsing failed: {e}")
            raise ValueError(f"Failed to parse recipe: {e}")
