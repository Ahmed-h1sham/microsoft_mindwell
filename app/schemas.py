from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Mood log schemas
class MoodLogBase(BaseModel):
    mood: str
    filename: str

class MoodLogCreate(MoodLogBase):
    user_id: int

class MoodLogResponse(MoodLogBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class MoodLogHistory(BaseModel):
    filename: str
    mood: str
    timestamp: Optional[datetime]
    recommendation: str
