from sqlalchemy import Column, Integer, String
from ..database import Base


class ItemCategory(Base):
    __tablename__ = "item_categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, nullable=False)
