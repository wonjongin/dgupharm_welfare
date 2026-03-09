from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth.jwt import create_access_token
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.sid == user.sid).first():
        raise HTTPException(status_code=400, detail="학번이 이미 등록되어 있습니다")

    db_user = User(sid=user.sid, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "access_token": create_access_token(data={"sub": str(db_user.id)}),
        "token_type": "bearer",
        "user": db_user,
    }


@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.sid == user.sid, User.name == user.name).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="학번 또는 이름이 올바르지 않습니다")

    return {
        "access_token": create_access_token(data={"sub": str(db_user.id)}),
        "token_type": "bearer",
        "user": db_user,
    }
