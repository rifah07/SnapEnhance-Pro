from datetime import datetime
from enum import Enum
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, HttpUrl
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class EffectType(str, Enum):
    grayscale = "grayscale"
    invert = "invert"
    blur = "blur"
    edge_detect = "edge-detect"
    pencil_sketch = "pencil-sketch"
    cartoonify = "cartoonify"
    sharpen = "sharpen"
    sepia = "sepia"
    watercolor = "watercolor"
    hdr = "hdr"
    thermal = "thermal"
    night_vision = "night-vision"
    emboss = "emboss"
    mosaic = "mosaic"
    vignette = "vignette"
    halftone = "halftone"
    pop_art = "pop-art"

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: str
    created_at: datetime
    storage_used: int
    storage_quota: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ImageProcessCreate(BaseModel):
    effect: EffectType

class ImageProcessResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    original_filename: str
    processed_filename: str
    effect: EffectType
    is_temp: bool
    file_size: int
    created_at: datetime
    expires_at: Optional[datetime]
    original_url: HttpUrl
    processed_url: HttpUrl

class UserHistoryResponse(BaseModel):
    images: List[ImageProcessResponse]
    storage_used: int
    storage_quota: int

class AnonymousUploadResponse(BaseModel):
    image_id: str
    expires_at: datetime
    original_url: HttpUrl
    processed_url: HttpUrl

class HealthCheck(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    database: str
    storage: dict
    version: str

class ErrorResponse(BaseModel):
    detail: str
    code: str

responses = {
    400: {"model": ErrorResponse, "description": "Bad Request"},
    401: {"model": ErrorResponse, "description": "Unauthorized"},
    403: {"model": ErrorResponse, "description": "Forbidden"},
    404: {"model": ErrorResponse, "description": "Not Found"},
    422: {"model": ErrorResponse, "description": "Validation Error"},
    500: {"model": ErrorResponse, "description": "Internal Server Error"},
}