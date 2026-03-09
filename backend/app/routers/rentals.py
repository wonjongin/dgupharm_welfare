from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth.jwt import get_admin_user, get_current_user
from ..database import get_db
from ..models.item import WelfareItem
from ..models.rental import RentalRecord
from ..models.user import User
from ..schemas.rental import RentalCreate, RentalReturn, RentalResponse

router = APIRouter(prefix="/api/v1/rentals", tags=["rentals"])

RENTAL_DAYS = 7  # 기본 대여 기간(일)


@router.post("/", response_model=RentalResponse)
async def create_rental(
    rental: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(WelfareItem).filter(WelfareItem.eid == rental.item_eid).first()
    if not item:
        raise HTTPException(status_code=404, detail="해당 물품을 찾을 수 없습니다")
    if item.status != "정상":
        raise HTTPException(status_code=400, detail="대여 가능하지 않은 물품입니다")

    # 현재 대여 중 여부 확인
    if (
        db.query(RentalRecord)
        .filter(RentalRecord.item_id == item.id, RentalRecord.is_returned.is_(False))
        .first()
    ):
        raise HTTPException(status_code=400, detail="이미 대여 중인 물품입니다")

    today = date.today()
    record = RentalRecord(
        borrower_id=current_user.id,
        item_id=item.id,
        rental_start=today,
        rental_end=today + timedelta(days=RENTAL_DAYS),
        is_returned=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/return", response_model=RentalResponse)
async def return_rental(
    rental: RentalReturn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(WelfareItem).filter(WelfareItem.eid == rental.item_eid).first()
    if not item:
        raise HTTPException(status_code=404, detail="해당 물품을 찾을 수 없습니다")

    record = (
        db.query(RentalRecord)
        .filter(
            RentalRecord.item_id == item.id,
            RentalRecord.borrower_id == current_user.id,
            RentalRecord.is_returned.is_(False),
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="해당 물품의 활성 대여기록이 없습니다")

    record.is_returned = True
    record.return_date = date.today()  # 실제 반납일 기록 (rental_end는 반납 기한으로 유지)
    db.commit()
    db.refresh(record)
    return record


@router.get("/my", response_model=List[RentalResponse])
async def get_my_rentals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(RentalRecord)
        .filter(RentalRecord.borrower_id == current_user.id)
        .order_by(RentalRecord.id.desc())  # 최신순 정렬
        .all()
    )


@router.get("/", response_model=List[RentalResponse])
async def get_all_rentals(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """관리자 전용 — 전체 대여기록"""
    return db.query(RentalRecord).order_by(RentalRecord.id.desc()).all()
