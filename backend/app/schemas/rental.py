from datetime import date, datetime
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
    rental_start: datetime  # 대여 일시
    rental_end: date  # 반납 기한
    return_date: Optional[datetime] = None  # 실제 반납 일시
    is_returned: bool

    class Config:
        from_attributes = True
