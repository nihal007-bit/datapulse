from sqlalchemy import Column, Float, Integer, String

from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, index=True, nullable=False)
    monthly_limit = Column(Float, nullable=False)
