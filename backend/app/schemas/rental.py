from datetime import date
from typing import Optional

from pydantic import BaseModel

from .item import ItemResponse
from .user import UserResponse


class RentalCreate(BaseModel):
    item_eid: str       # 물품 번호(eid)


class RentalReturn(BaseModel):
    item_eid: str       # 물품 번호(eid)


class RentalResponse(BaseModel):
    id: int
    borrower: UserResponse
    item: ItemResponse
    rental_start: date  # 대여 시작일
    rental_end: date  # 반납 기한
    return_date: Optional[date] = None  # 실제 반납일
    is_returned: bool

    class Config:
        from_attributes = True
