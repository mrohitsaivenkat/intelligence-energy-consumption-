import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.setup_db_user import setup_mysql_service_and_users
from backend.app.init_db import init_db
from backend.app.routers.auth_router import router as auth_router
from backend.app.routers.household_router import router as household_router
from backend.app.routers.energy_router import router as energy_router
from backend.app.routers.provider_router import router as provider_router
from backend.app.routers.ai_router import router as ai_router

app = FastAPI(
    title="Smart Household Energy API",
    description="Production-grade Python FastAPI backend with MySQL, SQLAlchemy ORM, JWT authentication, and Mistral AI integration.",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database tables and initial seed data exist
@app.on_event("startup")
def on_startup():
    try:
        setup_mysql_service_and_users()
        init_db()
    except Exception as e:
        print(f"[Database Init Error] {e}")

# Include all API routers
app.include_router(auth_router)
app.include_router(household_router)
app.include_router(energy_router)
app.include_router(provider_router)
app.include_router(ai_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Smart Household Energy API",
        "backend": "Python + FastAPI",
        "database": "MySQL + SQLAlchemy ORM",
        "ai": "Mistral AI",
    }

# Fallback for undefined /api routes
@app.api_route("/api/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def catch_all_api(rest_of_path: str, request: Request):
    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "detail": f"API endpoint {request.method} /api/{rest_of_path} not found"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
