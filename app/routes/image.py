from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from PIL import Image
from app import crud, schemas, ai_model, auth, users
from app.database import SessionLocal
from typing import List
import io

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")  # For token-based auth

# --- Dependencies ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.verify_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload["sub"]
    user = users.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- Upload Route ---

@router.post("/upload", response_model=schemas.MoodLogResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    mood = ai_model.predict_mood(image)
    log = crud.create_mood_log(db, filename=file.filename, mood=mood, user_id=current_user.id)
    return log

# --- Mood History Route ---

@router.get("/history", response_model=List[schemas.MoodLogHistory])
def get_my_history(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    logs = crud.get_user_mood_logs(db, user_id=current_user.id)

    return [
        {
            "filename": log.filename,
            "mood": log.mood,
            "timestamp": log.timestamp,
            "recommendation": ai_model.generate_recommendation(log.mood)
        }
        for log in logs
    ]