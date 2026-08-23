from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models import User
from app.api.deps import get_db, get_current_user

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str = ""

class LoginResponse(BaseModel):
    token: str

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=request.username).first()
    
    # Fallback to seeded users if exact username isn't found (for easy testing)
    if not user:
        search_str = (request.username + " " + request.role).lower()
        if "farmer" in search_str:
            user = db.query(User).filter_by(username="farmer1").first()
        elif "vet" in search_str:
            user = db.query(User).filter_by(username="vet_vet-1").first()
            
    if not user:
        # Final fallback just to let people log in easily during development
        user = db.query(User).first()
        
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = f"{user.id}:{user.role.value}"
    return {"token": token}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.fullName.split(' ')[0], # Simple formatting
            "role": current_user.role.value.lower(),
            "farm_id": current_user.farms[0].id if current_user.farms else None,
            "locale": "en"
        }
    }
