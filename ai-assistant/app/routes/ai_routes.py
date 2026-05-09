from fastapi import APIRouter, HTTPException
from ..models.ai_models import ChatRequest, ChatResponse, CategorySuggestionRequest, CategorySuggestionResponse
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        return await ai_service.process_chat(request.message, request.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-category", response_model=CategorySuggestionResponse)
async def suggest_category(request: CategorySuggestionRequest):
    try:
        return await ai_service.suggest_category(request.title, request.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "DonateHub AI Assistant"}
