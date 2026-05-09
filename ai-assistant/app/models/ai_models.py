from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = []
    category: Optional[str] = None
    city: Optional[str] = None
    items: Optional[List[dict]] = []

class CategorySuggestionRequest(BaseModel):
    title: str
    description: Optional[str] = ""

class CategorySuggestionResponse(BaseModel):
    suggested_category: str
    confidence: float
