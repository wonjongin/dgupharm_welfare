import string
import secrets

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


def generate_short_code() -> str:
    """6자리 영숫자 코드 생성 (대문자 + 숫자)"""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(6))


class WelfareItem(Base):
    __tablename__ = "welfare_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    eid = Column(Integer, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("item_categories.id"))
    status = Column(String, default="정상")
    uuid = Column(String, unique=True, default=generate_short_code, index=True)  # 6자리 QR 코드

    category = relationship("ItemCategory", lazy="joined")
