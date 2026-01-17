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
           - "Stir" -> "Speed 1" (stat: "1") - NEVER use "Speed Spoon" or "Spoon"
           - "Puree" -> "Speed 8-10" (gradual)
           - "Chop" -> "Speed 5"
           - "Soft" or "Gentle" -> "Speed 1"
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
            # Enforce JSON mode
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
            )
            
            text = response.text
            # Basic cleanup if model adds markdown blocks despite JSON mode
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text: 
                text = text.split("```")[1].split("```")[0]
            
            data = json.loads(text)
            return RecipeData(**data)
        except Exception as e:
            print(f"AI Parsing failed: {e}")
            try:
                print(f"FAILED RAW TEXT: {response.text}")
            except:
                pass
            raise ValueError(f"Failed to parse recipe: {e}")

    async def convert_to_thermomix(self, recipe_data: RecipeData, language: str = "en") -> RecipeData:
        # Create a specialized prompt for conversion
        conversion_prompt = f"""
        You are an expert Thermomix Recipe Developer.
        Your task is to take a generic recipe and rewrite the steps to be fully compatible with the Thermomix TM6.
        
        INPUT: Generic Recipe JSON
        OUTPUT: Enhanced Recipe JSON with specific Thermomix settings, TRANSLATED into {{language}}.
        
        INSTRUCTIONS:
        1. Keep the 'ingredients' list mostly the same, but you may regroup them if the steps require it.
        2. Rewrite each 'step' description to use Thermomix terminology.
        3. For each step, explicitly assign:
           - time: e.g. "5 sec", "10 min"
           - temperature: e.g. "100°C", "120°C", "Varoma"
           - speed: e.g. "Speed 1", "Speed 5", "Speed Spoon" (use reverse implied by context if needed).
           - mode: e.g. "Dough", "Turbo", "Sauté" (only if applicable).
        4. TRANSLATION: Ensure the Title, Description, Ingredient Names/Notes, and Step Descriptions are in the target language: {language}.
           - Keep technical Thermomix terms (Varoma, Speed, etc.) in a format appropriate for that language's machine (usually english terms are standard but check language norms).
           - Set the "language" field in the output JSON to "{language}".
        
        Output must be valid JSON matching the RecipeData schema.
        """
        
        content = json.dumps(recipe_data.model_dump(mode='json'), indent=2)
        prompt = f"{conversion_prompt}\n\nINPUT RECIPE:\n{content}\n\nRETURN JSON ONLY."

        try:
            # Enforce JSON mode
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
            )
            
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            data = json.loads(text)
            return RecipeData(**data)
        except Exception as e:
            print(f"AI Conversion failed: {e}")
            try:
                print(f"FAILED RAW TEXT: {response.text}")
            except:
                pass
            raise ValueError(f"Failed to convert recipe: {e}")
