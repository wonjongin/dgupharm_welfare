from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .models import User, ItemCategory, WelfareItem, RentalRecord  # 모든 모델 등록
from .routers import auth, categories, items, rentals

# ---------- 테이블 생성 ----------
Base.metadata.create_all(bind=engine)

app = FastAPI(title="동국대학교 약학대학 학생복지시스템")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 라우터 등록 ----------
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(rentals.router)


# ---------- 기본 관리자 계정 시드 ----------
@app.on_event("startup")
async def startup():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.sid == "admin").first():
            db.add(User(sid="admin", name="관리자", permission=1))
            db.commit()
    finally:
        db.close()
