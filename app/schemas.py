from pydantic import BaseModel
from datetime import datetime

# History with Recommendation
class MoodLogHistory(BaseModel):
    filename: str
    mood: str
    timestamp: datetime
    recommendation: str

    class Config:
        from_attributes = True

# Input schema for mood log creation
class MoodLogCreate(BaseModel):
    filename: str
    mood: str

# Output schema for mood log with ID and timestamp
class MoodLogResponse(MoodLogCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Registration schema
class UserCreate(BaseModel):
    email: str
    password: str

# Login schema
class UserLogin(BaseModel):
    email: str
    password: str

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Response model for user
class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True
