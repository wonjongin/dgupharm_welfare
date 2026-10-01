from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth.jwt import get_admin_user
from ..database import get_db
from ..models.category import ItemCategory
from ..models.item import WelfareItem
from ..models.user import User
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    return db.query(ItemCategory).all()


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(ItemCategory).filter(ItemCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다")
    return cat


@router.post("/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if db.query(ItemCategory).filter(ItemCategory.title == category.title).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 카테고리입니다")

    db_cat = ItemCategory(title=category.title)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    db_cat = db.query(ItemCategory).filter(ItemCategory.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다")

    db_cat.title = category.title
    db.commit()
    db.refresh(db_cat)
    return db_cat


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    db_cat = db.query(ItemCategory).filter(ItemCategory.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다")

    if db.query(WelfareItem).filter(WelfareItem.category_id == category_id).first():
        raise HTTPException(
            status_code=400,
            detail="물품이 등록된 카테고리는 삭제할 수 없습니다. 물품을 먼저 다른 카테고리로 옮겨 주세요",
        )

    db.delete(db_cat)
    db.commit()
    return {"message": "카테고리가 삭제되었습니다"}
