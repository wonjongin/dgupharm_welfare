from datetime import date
from typing import Optional

from pydantic import BaseModel

from .item import ItemResponse
from .user import UserResponse


class RentalCreate(BaseModel):
    item_uuid: str       # QR코드에서 받은 uuid


class RentalReturn(BaseModel):
    item_uuid: str


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
