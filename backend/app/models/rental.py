from sqlalchemy import Column, Integer, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship

from ..database import Base


class RentalRecord(Base):
    __tablename__ = "rental_records"

    id = Column(Integer, primary_key=True, index=True)
    borrower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("welfare_items.id"), nullable=False)
    rental_start = Column(Date, nullable=False)  # 대여 시작일
    rental_end = Column(Date, nullable=False)  # 반납 기한 (예정일)
    return_date = Column(Date, nullable=True)  # 실제 반납일
    is_returned = Column(Boolean, default=False)

    borrower = relationship("User", lazy="joined")
    item = relationship("WelfareItem", lazy="joined")
