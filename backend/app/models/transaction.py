from sqlalchemy import Column, Date, Float, Integer, String

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    account = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    kind = Column(String, index=True, nullable=False)  # "expense" or "income"
    tags = Column(String, nullable=True)
