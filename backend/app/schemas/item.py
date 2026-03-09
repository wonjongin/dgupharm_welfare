from typing import Optional

from pydantic import BaseModel

from .category import CategoryResponse


class ItemCreate(BaseModel):
    name: str
    eid: str  # 문자열로 변경
    category_id: int
    status: str = "정상"


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    eid: Optional[str] = None  # 문자열로 변경
    category_id: Optional[int] = None
    status: Optional[str] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    eid: str  # 문자열로 변경
    category: CategoryResponse
    status: str
    uuid: str

    class Config:
        from_attributes = True


# 카테고리별 물품 목록 — 대여 여부 포함
class ItemWithStatusResponse(BaseModel):
    id: int
    name: str
    eid: str  # 문자열로 변경
    category: CategoryResponse
    status: str
    uuid: str
    is_rented: bool

    class Config:
        from_attributes = True
