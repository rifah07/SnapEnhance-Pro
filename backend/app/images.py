import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from .models import ImageProcess, EffectType, UserInDB
from .database import image_processes_collection
from .auth import get_current_user
from .image_processing import EFFECTS_MAP
from pathlib import Path
import cv2
import numpy as np
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

router = APIRouter()

BASE_DIR = Path(__file__).parent.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
PROCESSED_DIR = BASE_DIR / "static" / "processed"

#UPLOAD_DIR = os.getenv("UPLOAD_FOLDER", "backend/static/uploads")
#PROCESSED_DIR = os.getenv("PROCESSED_FOLDER", "backend/static/processed")

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
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        
        # Decode image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file format"
            )
        
        # Generate filenames
        unique_id = datetime.now().strftime("%Y%m%d%H%M%S")
        original_filename = f"{current_user.id}_{unique_id}_{file.filename}"
        processed_filename = f"processed_{current_user.id}_{unique_id}_{file.filename}"
        
        # Save paths
        original_path = os.path.join(UPLOAD_DIR, original_filename)
        processed_path = os.path.join(PROCESSED_DIR, processed_filename)
        
        # Save original file
        with open(original_path, "wb") as f:
            f.write(contents)
        
        # Apply effect
        processed_img = EFFECTS_MAP[effect.value](img)
        
        if len(processed_img.shape) == 2:
            processed_img = cv2.cvtColor(processed_img, cv2.COLOR_GRAY2BGR)
        
        # Save processed image
        cv2.imwrite(processed_path, processed_img)
        
        # Store processing record
        image_process = ImageProcess(
            user_id=current_user.id,
            original_filename=original_filename,
            processed_filename=processed_filename,
            effect=effect.value,
            created_at=datetime.utcnow()
        )
        image_processes_collection.insert_one(image_process.dict(by_alias=True))
        
        return {
            "original_url": f"/static/uploads/{original_filename}",
            "processed_url": f"/static/processed/{processed_filename}",
            "effect": effect.value,
            "message": "Image processed successfully"
        }
        
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid effect. Valid effects are: {list(EFFECTS_MAP.keys())}"
        )
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
            media_type="image/jpeg",
            filename=filename
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading file: {str(e)}"
        )