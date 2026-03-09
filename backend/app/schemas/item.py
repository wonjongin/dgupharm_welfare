from typing import Optional

from pydantic import BaseModel

from .category import CategoryResponse


class ItemCreate(BaseModel):
    name: str
    eid: int
    category_id: int
    status: str = "정상"


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    eid: Optional[int] = None
    category_id: Optional[int] = None
    status: Optional[str] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    eid: int
    category: CategoryResponse
    status: str
    uuid: str

    class Config:
        from_attributes = True


# 카테고리별 물품 목록 — 대여 여부 포함
class ItemWithStatusResponse(BaseModel):
    id: int
    name: str
    eid: int
    category: CategoryResponse
    status: str
    uuid: str
    is_rented: bool

    class Config:
        from_attributes = True
