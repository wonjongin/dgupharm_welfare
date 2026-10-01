from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth.jwt import get_admin_user
from ..database import get_db
from ..models.category import ItemCategory
from ..models.item import WelfareItem
from ..models.rental import RentalRecord
from ..models.user import User
from ..schemas.item import ItemCreate, ItemUpdate, ItemResponse, ItemWithStatusResponse

router = APIRouter(prefix="/api/v1/items", tags=["items"])


# ----------------------------------------------------------
# 조회
# ----------------------------------------------------------
@router.get("/", response_model=List[ItemResponse])
async def get_items(db: Session = Depends(get_db)):
    """전체 물품 목록 (관리자 페이지용)"""
    return db.query(WelfareItem).all()


@router.get("/category/{category_id}", response_model=List[ItemWithStatusResponse])
async def get_items_by_category(category_id: int, db: Session = Depends(get_db)):
    """카테고리별 물품 목록 + 대여 여부"""
    items = db.query(WelfareItem).filter(WelfareItem.category_id == category_id).all()
    result = []
    for item in items:
        active = (
            db.query(RentalRecord)
            .filter(RentalRecord.item_id == item.id, RentalRecord.is_returned.is_(False))
            .first()
        )
        result.append(
            {
                "id": item.id,
                "name": item.name,
                "eid": item.eid,
                "category": {"id": item.category.id, "title": item.category.title},
                "status": item.status,
                "uuid": item.uuid,
                "is_rented": active is not None,
            }
        )
    return result


@router.get("/uuid/{item_uuid}", response_model=ItemResponse)
async def get_item_by_uuid(item_uuid: str, db: Session = Depends(get_db)):
    item = db.query(WelfareItem).filter(WelfareItem.uuid == item_uuid).first()
    if not item:
        raise HTTPException(status_code=404, detail="물품을 찾을 수 없습니다")
    return item


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(WelfareItem).filter(WelfareItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="물품을 찾을 수 없습니다")
    return item


# ----------------------------------------------------------
# 관리자 CRUD
# ----------------------------------------------------------
@router.post("/", response_model=ItemResponse)
async def create_item(
    item: ItemCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if not db.query(ItemCategory).filter(ItemCategory.id == item.category_id).first():
        raise HTTPException(status_code=400, detail="카테고리가 존재하지 않습니다")
    if db.query(WelfareItem).filter(WelfareItem.eid == item.eid).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 물품 번호입니다")

    db_item = WelfareItem(
        name=item.name,
        eid=item.eid,
        category_id=item.category_id,
        status=item.status,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    item: ItemUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    db_item = db.query(WelfareItem).filter(WelfareItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="물품을 찾을 수 없습니다")

    if item.name is not None:
        db_item.name = item.name
    if item.eid is not None:
        db_item.eid = item.eid
    if item.category_id is not None:
        if not db.query(ItemCategory).filter(ItemCategory.id == item.category_id).first():
            raise HTTPException(status_code=400, detail="카테고리가 존재하지 않습니다")
        db_item.category_id = item.category_id
    if item.status is not None:
        db_item.status = item.status

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    db_item = db.query(WelfareItem).filter(WelfareItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="물품을 찾을 수 없습니다")

    # 대여기록이 참조하는 물품을 지우면 기록이 깨지므로 삭제 대신 상태 변경을 유도
    if db.query(RentalRecord).filter(RentalRecord.item_id == item_id).first():
        raise HTTPException(
            status_code=400,
            detail="대여기록이 있는 물품은 삭제할 수 없습니다. 상태를 '폐기' 또는 '분실'로 변경해 주세요",
        )

    db.delete(db_item)
    db.commit()
    return {"message": "물품이 삭제되었습니다"}
