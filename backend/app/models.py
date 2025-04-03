from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId
from enum import Enum

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

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    disabled: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ImageProcess(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    original_filename: str
    processed_filename: str
    effect: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

from enum import Enum

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