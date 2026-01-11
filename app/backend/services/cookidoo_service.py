import re
import json
import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
import aiohttp
from app.backend.models import RecipeData
from app.core.config import get_settings

settings = get_settings()

import re
import json
import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
import httpx
import requests
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from app.backend.models import RecipeData
from app.core.config import get_settings

settings = get_settings()

class CookidooService:
    def __init__(self):
        self.country = settings.COOKIDOO_COUNTRY
        self.language = settings.COOKIDOO_LANGUAGE
        self.base_url = f"https://cookidoo.{self.country}"
        # Base headers for JSON API usage (default)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.logger = logging.getLogger(__name__)

    async def login(self, email: str, password: str) -> Dict[str, str]:
        """Async wrapper for sync login"""
        return await asyncio.to_thread(self._login_sync, email, password)

    def _login_sync(self, email: str, password: str) -> Dict[str, str]:
        """
        Logs in via Vorwerk SSO using requests (Sync) - Ported from Thermomix-Importer
        """
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

        try:
            # 1. Access Profile to trigger Redirect
            region = f"{self.language}-{self.country.upper()}"
            start_url = f"{self.base_url}/profile/{region}/login"
            
            nav_headers = {
                 "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                 "Upgrade-Insecure-Requests": "1"
            }
            
            self.logger.info(f"Starting login flow at {start_url}")
            resp = session.get(start_url, headers=nav_headers)
            
            if "login.vorwerk.com" in resp.url:
                self.logger.info("at Vorwerk Login page")
                
                soup = BeautifulSoup(resp.text, 'html.parser')
                form = soup.find('form')
                if not form:
                     forms = soup.find_all('form')
                     if forms: form = forms[0]
                     else: raise Exception("No login form found")
                
                action = form.get('action')
                if not action.startswith('http'):
                    action = urljoin(resp.url, action)
                
                # Inputs
                payload = {}
                for inp in form.find_all('input'):
                    name = inp.get('name')
                    if name: payload[name] = inp.get('value', '')
                
                # Fill credentials
                if 'email' in payload: payload['email'] = email
                elif 'username' in payload: payload['username'] = email
                
                if 'password' in payload: payload['password'] = password
                
                # Headers for POST (mimic Importer)
                post_headers = {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "Origin": "https://ciam.prod.cookidoo.vorwerk-digital.com",
                    "Referer": resp.url,
                    "Upgrade-Insecure-Requests": "1"
                }

                self.logger.info(f"Submitting credentials to {action}")
                post_resp = session.post(action, data=payload, headers=post_headers)
                
                # Check success
                if self.base_url in post_resp.url or ("cookidoo" in post_resp.url and "login" not in post_resp.url):
                    self.logger.info("Login Successful!")
                    return session.cookies.get_dict()
                else:
                    self.logger.error(f"Login failed? Landed at {post_resp.url} Status: {post_resp.status_code}")
                    return {}
            
            elif "/profile" in resp.url:
                 self.logger.info("Already logged in.")
                 return session.cookies.get_dict()
            
            return {}
        except Exception as e:
            self.logger.error(f"Login Exception: {e}")
            return {}

    async def update_recipe_details(self, recipe_id: str, cookies: Dict[str, str], recipe_data: RecipeData, thermomix_data: RecipeData = None) -> bool:
        """Async wrapper for sync update"""
        return await asyncio.to_thread(self._update_sync, recipe_id, cookies, recipe_data, thermomix_data)

    def _update_sync(self, recipe_id: str, cookies: Dict[str, str], recipe_data: RecipeData, thermomix_data: RecipeData = None) -> bool:
        
        # ... logic for building payload (same as before) ...
        # Reuse helper methods or copy logic
        
        # 1. Build Payload
        # (Copied logic for instructions building)
        sanitized_instructions = []
        data_source = thermomix_data if thermomix_data else recipe_data
        
        for step in data_source.steps:
            desc = step.description
            annotations = []
            final_text = desc
            
            # Helper to append text and add annotation
            def add_annot(text_to_append, type_code, data_obj):
                nonlocal final_text
                if final_text: final_text += " "
                start = len(final_text)
                final_text += text_to_append
                annot = {"type": type_code, "position": {"offset": start, "length": len(text_to_append)}, "data": data_obj}
                annotations.append(annot)

            # 1. Annotate Ingredients within the existing description (Logic: find and annotate)
            # This must be done on the 'final_text' (which is just 'desc' right now).
            # We need to find valid ingredients in the text and create annotations for them.
            # Note: Cookidoo API usually expects the annotations to match range in the final text string.
            # A simple approach: 
            #   - Iterate ingredients
            #   - If ingredient name is found in 'final_text' (case insensitive?), add annotation.
            #   - BEWARE: overlapping ingredients or multiple occurrences. 
            #   - Simplest robust way: Find first occurrence, add annotation, track ranges to avoid overlap.
            
            # We'll do a pass for ingredients on the 'desc' part BEFORE appending settings
            existing_annotations_ranges = [] # List of (start, end)
            
            # Prepare the full strings map first to link correctly
            # ing_strings list is created later in the original code, but we need it now for matching
            # So let's generate it or access it.
            # We need to correspond the ing object to the string we WILL send.
            
            # Refactored: Create the list of formatted strings first so we can refer to them
            
            for ing in data_source.ingredients:
                if not ing.name: continue
                # Basic search - can be improved with regex or word boundaries
                pattern = re.compile(re.escape(ing.name), re.IGNORECASE)
                for match in pattern.finditer(final_text):
                    start, end = match.span()
                    # Check overlap
                    overlap = False
                    for existing_start, existing_end in existing_annotations_ranges:
                        if not (end <= existing_start or start >= existing_end):
                            overlap = True
                            break
                    if not overlap:
                        # Found a new match!
                        # Add annotation
                        # FIX: The data structure matches the POC Reference (Working_Recipe.js)
                        # Structure: data: { description: { text: "FULL STRING", annotations: [] } }
                        full_ing_text = f"{ing.amount or ''} {ing.unit or ''} {ing.name}".strip()
                        
                        annot = {
                            "type": "INGREDIENT", 
                            "position": {"offset": start, "length": end - start}, 
                            "data": {
                                "description": {
                                    "text": full_ing_text,
                                    "annotations": []
                                }
                            }
                        }
                        annotations.append(annot)
                        existing_annotations_ranges.append((start, end))

            # 2. Append User Settings (Time/Temp/Speed)
            tts_data = {}
            has_tts = False
            if step.time:
                seconds = self._parse_time(step.time)
                if seconds > 0:
                    tts_data["time"] = seconds
                    has_tts = True
            if step.speed:
                # Speed cleaning: "Speed 1" -> "1"
                raw_spd = str(step.speed).lower().replace("speed", "").strip()
                
                # Handle common text speeds that might fail numeric validation
                if "spoon" in raw_spd or "stir" in raw_spd or "soft" in raw_spd:
                    spd = "1" # Map "spoon" to speed 1 to be safe
                else:
                    spd = raw_spd
                    
                tts_data["speed"] = spd
                has_tts = True
            if step.temperature:
                # Temp cleaning: "100°C" -> "100"
                val = str(step.temperature).replace("°C", "").replace("C", "").strip()
                if val.lower() == "varoma": 
                    tts_data["temperature"] = {"value": "Varoma", "unit": "C"}
                else: 
                    # Try to parse numeric value
                    try:
                       float(val) # just check validity
                       tts_data["temperature"] = {"value": val, "unit": "C"}
                    except:
                       pass # ignore weird temp string
                has_tts = True
            
            if has_tts:
                # User requested NO brackets []. 
                # Construct label like: "5 min 100°C Speed 2"
                parts = []
                if step.time: parts.append(step.time)
                if step.temperature: parts.append(str(step.temperature))
                if step.speed: 
                    # Use sanitized 'spd' to ensure consistent formatting (e.g. "Speed 1" instead of "Speed spoon")
                    parts.append(f"Speed {spd}")
                
                label = " ".join(parts)
                if label:
                    add_annot(label, "TTS", tts_data)
                
            if step.mode:
                mode_data = {}
                if step.time: mode_data["time"] = self._parse_time(step.time)
                # For modes, we might still want brackets or just the mode name? 
                # Let's stick to name only.
                # Common format: "Dough Mode"
                mode_name = step.mode
                add_annot(mode_name, "MODE", mode_data)
                # Fix up the last annotation's name/type if needed
                annotations[-1]["name"] = self._map_mode(step.mode)

            sanitized_instructions.append({"text": final_text, "type": "STEP", "annotations": annotations})

        ing_strings = [f"{i.amount or ''} {i.unit or ''} {i.name}".strip() for i in data_source.ingredients]
        
        payload = {
            "name": data_source.title,
            "description": data_source.description or "",
            "yield": {"value": 4, "unitText": "portion"}, 
            "ingredients": [{"type": "INGREDIENT", "text": line} for line in ing_strings],
            "instructions": sanitized_instructions,
            "recipeMetadata": {"requiresAnnotationsCheck": False}
        }
        
        region = f"{self.language}-{self.country.upper()}"
        # CORRECT ENDPOINT (No /foundation) based on Importer
        url = f"{self.base_url}/created-recipes/{region}/{recipe_id}"
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Prepare Browser-like headers for API interaction
        api_headers = self.headers.copy()
        api_headers.update({
            "Origin": self.base_url, # e.g. https://cookidoo.de
            "Referer": f"{self.base_url}/created-recipes/{region}/{recipe_id}",
            "Accept-Language": f"{self.language}-{self.country.upper()},{self.language};q=0.9",
            # "x-requested-with": "XMLHttpRequest" # Sometimes needed
        })
        session.headers.update(api_headers)
        
        self.logger.info(f"PATCHing to {url} with headers: {api_headers.keys()}")
        try:
            resp = session.patch(url, json=payload)
            if resp.status_code == 200:
                return True
            else:
                self.logger.error(f"Cookidoo Upload Failed: {resp.status_code} - {resp.text}")
                return False
        except Exception as e:
            self.logger.error(f"Upload Exception: {e}")
            return False

    async def create_recipe(self, cookies: Dict[str, str], name: str) -> Optional[str]:
        """Async wrapper for sync creation"""
        return await asyncio.to_thread(self._create_sync, cookies, name)

    def _create_sync(self, cookies: Dict[str, str], name: str) -> Optional[str]:
        region = f"{self.language}-{self.country.upper()}"
        # NOTE: Importer used /created-recipes/{region} directly (no /foundation prefix?)
        # Let's verify paths.
        # Importer: endpoint = f"{self.base_url}/created-recipes/{self.region}"
        # Update: url = f"{self.base_url}/foundation/created-recipes/{region}/{recipe_id}"
        # This implies Creation is on the main API, Update is on Foundation API?
        # Or maybe base_url in Importer included /foundation? No, it was "https://cookidoo.international"
        
        # Checking logic again: 
        # `create_recipe` in Importer: f"{self.base_url}/created-recipes/{self.region}"
        # So it posts to https://cookidoo.de/created-recipes/de-DE
        
        url = f"{self.base_url}/created-recipes/{region}"
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Headers similar to update
        api_headers = self.headers.copy()
        api_headers.update({
             "Origin": self.base_url,
             "Referer": f"{self.base_url}/profile/{region}", # Referer from profile usually works for creation
             "Accept-Language": f"{self.language}-{self.country.upper()},{self.language};q=0.9"
        })
        session.headers.update(api_headers)
        
        # Strategy: Try purely name first (Strategy 0 from Importer)
        payload = {"recipeName": name}
        
        self.logger.info(f"Creating Recipe at {url} with name '{name}'")
        try:
            resp = session.post(url, json=payload)
            if resp.ok:
                try:
                    data = resp.json()
                    new_id = data.get("id") or data.get("recipeId")
                    self.logger.info(f"Creation Successful. New ID: {new_id}")
                    return new_id
                except:
                    self.logger.error("Created but failed to parse JSON response.")
                    return None
            else:
                 self.logger.error(f"Creation Failed: {resp.status_code} - {resp.text}")
                 # Fallback strategies from Importer if needed?
                 # Importer tried: {"recipeName": name, "importUrl": "https://cookidoo.international"}
                 if resp.status_code == 400 or resp.status_code == 500:
                     self.logger.info("Retrying creation with importUrl strategy...")
                     payload2 = {"recipeName": name, "importUrl": "https://cookidoo.international"}
                     resp2 = session.post(url, json=payload2)
                     if resp2.ok:
                         data = resp2.json()
                         return data.get("id")
                     else:
                         self.logger.error(f"Retry Failed: {resp2.status_code}")
                 
                 return None
        except Exception as e:
            self.logger.error(f"Creation Exception: {e}")
            return None

    def _parse_time(self, time_str: str) -> int:
        if not time_str: return 0
        s = time_str.lower()
        total_sec = 0
        m_h = re.search(r'(\d+)\s*h', s)
        if m_h: total_sec += int(m_h.group(1)) * 3600
        m_m = re.search(r'(\d+)\s*min', s)
        if m_m: total_sec += int(m_m.group(1)) * 60
        m_s = re.search(r'(\d+)\s*sec', s)
        if m_s: total_sec += int(m_s.group(1))
        return total_sec

    def _map_mode(self, mode_str: str) -> str:
        m = mode_str.lower()
        if "dough" in m or "knead" in m: return "dough"
        if "turbo" in m: return "turbo"
        if "brown" in m or "saute" in m: return "browning"
        if "blend" in m: return "blend"
        return "manual"
