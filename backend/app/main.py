from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import check_db_connection
from .auth import router as auth_router
from .users import router as users_router
from .images import router as images_router
import os

app = FastAPI(title="SnapEnhance-Pro",
              description="Advanced Image Processing API",
              version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(images_router, prefix="/images", tags=["images"])

@app.on_event("startup")
async def startup_db_client():
    if not check_db_connection():
        raise Exception("MongoDB connection failed")

@app.get("/")
async def root():
    return {"message": "SnapEnhance-Pro API is running"}