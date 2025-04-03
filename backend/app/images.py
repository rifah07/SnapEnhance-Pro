import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from .models import ImageProcess, EffectType, UserInDB
from .database import image_processes_collection
from .auth import get_current_user
from .image_processing import EFFECTS_MAP
from datetime import datetime
import cv2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

router = APIRouter()

# Configure upload directories
UPLOAD_DIR = os.getenv("UPLOAD_FOLDER", "static/uploads")
PROCESSED_DIR = os.getenv("PROCESSED_FOLDER", "static/processed")

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@router.post("/process")
async def process_image(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    file: UploadFile = File(...),
    effect: EffectType = Form(...)
):
    """Process an image with the specified effect and store the result"""
    try:
        # Save original file with user-specific filename
        file_location = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())
        
        # Generate processed filename and path
        processed_filename = f"processed_{current_user.id}_{file.filename}"
        processed_path = os.path.join(PROCESSED_DIR, processed_filename)
        
        # Apply the selected effect
        if effect == EffectType.background_remove:
            from PIL import Image
            result = EFFECTS_MAP[effect](file_location)
            if result:
                result.save(processed_path)
        else:
            img = cv2.imread(file_location)
            if img is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image file format"
                )
            processed_img = EFFECTS_MAP[effect](img)
            cv2.imwrite(processed_path, processed_img)
        
        # Store processing record in database
        image_process = ImageProcess(
            user_id=current_user.id,
            original_filename=f"{current_user.id}_{file.filename}",
            processed_filename=processed_filename,
            effect=effect.value
        )
        image_processes_collection.insert_one(image_process.dict(by_alias=True))
        
        return {
            "original_url": f"/static/uploads/{image_process.original_filename}",
            "processed_url": f"/static/processed/{image_process.processed_filename}",
            "effect": effect.value,
            "message": "Image processed successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.get("/history")
async def get_user_history(
    current_user: Annotated[UserInDB, Depends(get_current_user)]
):
    """Get processing history for the current user"""
    try:
        processes = list(image_processes_collection.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1))
        
        return [
            {
                "original_url": f"/static/uploads/{p['original_filename']}",
                "processed_url": f"/static/processed/{p['processed_filename']}",
                "effect": p["effect"],
                "created_at": p["created_at"]
            }
            for p in processes
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving history: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download a processed image file"""
    try:
        file_path = os.path.join(PROCESSED_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        return FileResponse(
            file_path,
            media_type="image/png",
            filename=filename
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading file: {str(e)}"
        )