from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import schemas, users
from app import auth as jwt_auth

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    if users.get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = users.create_user(db, user_data.email, user_data.password)
    return user

@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = users.get_user_by_email(db, user_data.email)
    if not user or not users.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt_auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
