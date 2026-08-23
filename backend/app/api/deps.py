from typing import Generator
from app.database import SessionLocal

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import User

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback for dev: return farmer1
        user = db.query(User).filter_by(username="farmer1").first()
        return user
        
    token = authorization.replace("Bearer ", "")
    user_id = token.split(":")[0]
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
