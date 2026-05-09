import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import ai_routes
from .config.settings import settings

app = FastAPI(
    title=settings.app_name,
    description="Microservice d'assistance IA pour la plateforme DonateHub",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to Spring Boot's internal network address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ai_routes.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to DonateHub AI Assistant API",
        "docs": "/docs",
        "health": "/api/ai/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
