from sqlalchemy.orm import Session
from . import models

def create_mood_log(db: Session, filename: str, mood: str, user_id: int):
    log = models.MoodLog(
        filename=filename,
        mood=mood,
        user_id=user_id
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_user_mood_logs(db: Session, user_id: int):
    return (
        db.query(models.MoodLog)
        .filter(models.MoodLog.user_id == user_id)
        .order_by(models.MoodLog.timestamp.desc())
        .all()
    )
