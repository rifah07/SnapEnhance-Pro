from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import db
from .auth import router as auth_router
from .users import router as users_router
from .images import router as images_router
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(images_router, prefix="/images", tags=["images"])

@app.get("/")
def read_root():
    return {"message": "SnapEnhance-Pro API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}