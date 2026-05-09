import re
import asyncio
import httpx
import numpy as np
from typing import Dict, Any, List, Optional, Tuple, Set
from ..models.ai_models import ChatResponse, CategorySuggestionResponse

# ─────────────────────────────────────────────
#  DONNÉES MÉTIER
# ─────────────────────────────────────────────
CATEGORIES = ["Électronique", "Vêtements", "Meubles", "Livres", "Sport", "Décoration"]

CITIES = [
    "casablanca", "rabat", "marrakech", "fès", "fes", "tanger", "agadir",
    "meknès", "meknes", "oujda", "tétouan", "tetouan", "essaouira",
    "el jadida", "nador", "kénitra", "kenitra", "safi", "settat", "taza",
    "beni mellal", "khénifra", "khenifra", "errachidia", "ouarzazate",
    "laayoune", "dakhla", "tiznit", "taroudant"
]

CITY_DISPLAY = {
    "fes": "Fès", "meknes": "Meknès", "tetouan": "Tétouan",
    "kenitra": "Kénitra", "khenifra": "Khénifra",
}

# ─────────────────────────────────────────────
#  STOP WORDS & CLEANING
# ─────────────────────────────────────────────
STOP_WORDS = {
    "ya", "til", "est", "ce", "qu", "il", "existe", "un", "une", "des", "le", "la", "les",
    "je", "veux", "cherche", "recherche", "besoin", "disponible", "dispo", "avez", "vous",
    "tu", "me", "dire", "peux", "pour", "avec", "dans", "sur", "chez", "moi", "montre",
    "donne", "voir", "trouver", "quelques", "plusieurs", "objet", "objets", "truc", "chose",
    "salut", "bonjour", "bonsoir", "coucou", "salam", "merci", "parfait", "ok", "super"
}

# ─────────────────────────────────────────────
#  SYNONYMES (Clé -> Liste de synonymes)
# ─────────────────────────────────────────────
SYNONYMS = {
    "velo": ["bicyclette", "bike", "vtt", "cyclette"],
    "vtt": ["velo", "bicyclette"],
    "ordinateur": ["pc", "laptop", "ordi", "computer"],
    "pc": ["ordinateur", "laptop"],
    "telephone": ["mobile", "smartphone", "tel", "iphone"],
    "smartphone": ["telephone", "mobile"],
    "vetements": ["habits", "fringues", "vetement", "chemise", "pantalon"],
    "meubles": ["mobilier", "meuble", "chaise", "table", "canape"],
    "livres": ["bouquin", "livre", "lecture", "ouvrage"],
}

# ─────────────────────────────────────────────
#  FAQ / SALUTATIONS
# ─────────────────────────────────────────────
SALUTATIONS = ["bonjour", "salut", "hi", "hello", "bonsoir", "hey", "salam", "yo"]

FAQ_RULES = [
    (["publier", "poster", "ajouter", "mettre", "créer", "creer", "don", "donner"],
     "Cliquez sur **«\u202fPublier un objet\u202f»** depuis le tableau de bord."),
    (["réserver", "reserver", "récupérer", "recuperer", "obtenir", "avoir", "demander"],
     "Ouvrez la fiche d'un objet et cliquez sur **«\u202fRéserver\u202f»**."),
    (["inscription", "compte", "register", "créer un compte", "s'inscrire"],
     "Cliquez sur **«\u202fCréer un compte\u202f»** sur la page d'accueil. C'est gratuit."),
    (["connexion", "login", "se connecter", "connecter", "mot de passe"],
     "Cliquez sur **«\u202fSe connecter\u202f»** en haut à droite."),
    (["qu'est-ce que", "c'est quoi", "donatehub", "plateforme"],
     "DonateHub est une plateforme gratuite de dons d'objets au Maroc."),
    (["gratuit", "payant", "prix", "coût", "cout", "combien"],
     "DonateHub est 100\u202f% gratuit pour tout le monde."),
]

# ─────────────────────────────────────────────
#  SESSIONS (In-Memory)
# ─────────────────────────────────────────────
SESSIONS: Dict[str, Dict[str, Any]] = {}

# ─────────────────────────────────────────────
#  SERVICE
# ─────────────────────────────────────────────
class AIService:
    def __init__(self):
        self.backend_url = "http://backend:8085"
        self.embedder = None
        self.categories_embeddings = None
        asyncio.create_task(self._load_embedder())

    async def _load_embedder(self):
        try:
            from sentence_transformers import SentenceTransformer
            print("🧠 [AI] Chargement embedder...")
            self.embedder = await asyncio.to_thread(SentenceTransformer, "paraphrase-multilingual-MiniLM-L12-v2")
            self.categories_embeddings = self.embedder.encode(CATEGORIES, convert_to_tensor=True)
            print("✅ [AI] Prêt !")
        except Exception as e: print(f"⚠️ [AI] Embedder fail: {e}")

    # 1. Pipeline NLP : Nettoyage & Normalisation
    def _clean_text(self, text: str) -> str:
        import unicodedata
        text = text.lower()
        # Ponctuation
        text = re.sub(r'[!?.,;:\(\)\"\'\-]', ' ', text)
        # Accents
        text = "".join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
        return " ".join(text.split())

    # 2. Détection Hors-Sujet
    def _check_off_topic(self, clean_text: str) -> bool:
        # Mots-clés de culture générale ou sujets non liés
        OFF_TOPIC = {
            "meteo", "recette", "cuisine", "musique", "film", "politique", "religion",
            "blague", "code", "coupe du monde", "gagnant", "score", "president",
            "capitale", "qui a", "combien fait", "traduit"
        }
        words = set(clean_text.split())
        if any(kw in clean_text for kw in OFF_TOPIC):
            return True
        # Si la phrase est une question complexe de culture G
        if re.search(r"\b(qui|quand|pourquoi|comment fait|quel est)\b", clean_text) and not any(kw in clean_text for kw in ["don", "objet", "chercher"]):
            return True
        return False

    # 3. Extraction de la Ville
    def _extract_city(self, clean_text: str) -> Optional[str]:
        for city in CITIES:
            if re.search(rf"\b{re.escape(city)}\b", clean_text):
                return CITY_DISPLAY.get(city, city.title())
        return None

    # 4. Extraction de la Catégorie
    def _extract_category(self, clean_text: str) -> Optional[str]:
        KW_MAP = {
            "Électronique": ["telephone", "portable", "laptop", "ordinateur", "tablette", "pc", "ecran"],
            "Vêtements": ["vetement", "habit", "robe", "pantalon", "chemise", "chaussure"],
            "Meubles": ["meuble", "canape", "table", "chaise", "lit"],
            "Livres": ["livre", "roman", "bouquin", "magazine"],
            "Sport": ["sport", "velo", "vtt", "ballon", "raquette"],
            "Décoration": ["decoration", "tableau", "plante", "vase", "lampe"],
        }
        for cat, keywords in KW_MAP.items():
            if any(kw in clean_text for kw in keywords):
                return cat
        return None

    # 5. Extraction des Mots-Clés (Expansion avec Synonymes)
    def _extract_keywords(self, clean_text: str) -> Tuple[List[str], Optional[str]]:
        raw_words = clean_text.split()
        significant_words = [w for w in raw_words if w not in STOP_WORDS and w not in CITIES and len(w) > 2]
        
        if not significant_words:
            return [], None

        display_word = significant_words[0] # Le premier mot tapé par l'utilisateur
        
        expanded_set = set()
        for w in significant_words:
            expanded_set.add(w)
            if w in SYNONYMS:
                for syn in SYNONYMS[w]:
                    expanded_set.add(syn)
        
        return list(expanded_set), display_word

    # 6. Gestion du Contexte (Smart Reset)
    def _manage_context(self, session_id: str, current_city: str, current_cat: str, current_kws: List[str], current_display: str):
        if session_id not in SESSIONS:
            SESSIONS[session_id] = {"city": None, "category": None, "keywords": [], "original_word": "objet"}
        
        state = SESSIONS[session_id]
        
        # RESET LOGIC: Si nouveau sujet, on reset les keywords et la catégorie
        if (current_cat and state["category"] and current_cat != state["category"]) or \
           (current_kws and state["keywords"] and not any(kw in state["keywords"] for kw in current_kws)):
            state["category"] = None
            state["keywords"] = []
            state["original_word"] = "objet"
        
        if current_city: state["city"] = current_city
        if current_cat:  state["category"] = current_cat
        if current_kws:  
            state["keywords"] = current_kws
            state["original_word"] = current_display if current_display else "objet"

        return state

    async def process_chat(self, message: str, session_id: str = "default") -> ChatResponse:
        raw_msg = message.strip()
        if not raw_msg: return ChatResponse(response="Posez votre question sur DonateHub.")
        
        clean_msg = self._clean_text(raw_msg)
        
        if self._check_off_topic(clean_msg):
            return ChatResponse(response="Je suis conçu uniquement pour aider sur DonateHub.")
        
        is_salutation = any(w in SALUTATIONS for w in clean_msg.split())
        if is_salutation and len(clean_msg.split()) <= 2:
            return ChatResponse(response="Bonjour ! Comment puis-je vous aider ?")
        
        for keywords, answer in FAQ_RULES:
            if any(kw in clean_msg for kw in keywords):
                return ChatResponse(response=answer)

        city = self._extract_city(clean_msg)
        cat  = self._extract_category(clean_msg)
        kws, display_word = self._extract_keywords(clean_msg)
        
        state = self._manage_context(session_id, city, cat, kws, display_word)

        if not state["city"] and not state["category"] and not state["keywords"]:
            return ChatResponse(response="Désolé, je n'ai pas compris. Que cherchez-vous (vélo, livre...) ?")
        
        async def do_search(c, ca, k):
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    p = {}
                    if c: p["city"] = c
                    if ca: p["category"] = ca
                    if k: p["query"] = " ".join(k)
                    r = await client.get(f"{self.backend_url}/api/ai/items/search", params=p)
                    return r.json() if r.status_code == 200 else []
            except: return []

        # 1. Recherche avec ville (si spécifiée ou en contexte)
        items = await do_search(state["city"], state["category"], state["keywords"])
        
        # 2. FALLBACK GLOBAL: Si rien trouvé avec la ville, on cherche partout
        if not items and state["city"]:
            global_items = await do_search(None, state["category"], state["keywords"])
            if global_items:
                count = len(global_items)
                word = state["original_word"]
                res = f"Je n'ai trouvé aucun **{word}** à **{state['city']}**, mais j'en ai trouvé **{count}** dans d'autres villes."
                return ChatResponse(response=res, items=global_items)

        # 3. Réponse standard
        word = state["original_word"]
        if not items:
            loc = f" à **{state['city']}**" if state['city'] else ""
            return ChatResponse(response=f"Désolé, aucun **{word}** trouvé{loc}. Essayez d'élargir votre recherche.")
        
        count = len(items)
        loc = f" à **{state['city']}**" if state['city'] else ""
        response_text = f"J'ai trouvé **{count} {word}{'s' if count > 1 else ''}**{loc}."
        return ChatResponse(response=response_text, items=items, city=state["city"], category=state["category"])

    async def suggest_category(self, title: str, description: str) -> CategorySuggestionResponse:
        text = self._clean_text(f"{title} {description}")
        detected = self._extract_category(text)
        if detected: return CategorySuggestionResponse(suggested_category=detected, confidence=0.95)
        return CategorySuggestionResponse(suggested_category="Autre", confidence=0.3)

ai_service = AIService()
