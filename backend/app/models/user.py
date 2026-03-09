from sqlalchemy import Column, Integer, String
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    sid = Column(String, unique=True, index=True)       # 학번
    name = Column(String, nullable=False)
    permission = Column(Integer, default=0)             # 0: 학생, 1: 관리자
