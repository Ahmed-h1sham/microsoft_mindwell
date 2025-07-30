from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

# Mood log operations
def create_mood_log(db: Session, filename: str, mood: str, user_id: int):
    """Create a new mood log entry"""
    db_mood_log = models.MoodLog(
        filename=filename,
        mood=mood,
        user_id=user_id
    )
    db.add(db_mood_log)
    db.commit()
    db.refresh(db_mood_log)
    return db_mood_log

def get_user_mood_logs(db: Session, user_id: int):
    """Get all mood logs for a user, ordered by timestamp descending"""
    return db.query(models.MoodLog).filter(
        models.MoodLog.user_id == user_id
    ).order_by(models.MoodLog.timestamp.desc()).all()

def get_mood_log(db: Session, log_id: int):
    """Get a specific mood log by ID"""
    return db.query(models.MoodLog).filter(models.MoodLog.id == log_id).first()

def delete_mood_log(db: Session, log_id: int):
    """Delete a mood log by ID"""
    db_log = db.query(models.MoodLog).filter(models.MoodLog.id == log_id).first()
    if db_log:
        db.delete(db_log)
        db.commit()
        return True
    return False
