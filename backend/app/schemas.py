from datetime import date as date_

from pydantic import BaseModel


class TransactionOut(BaseModel):
    id: int
    date: date_
    category: str
    account: str | None
    amount: float
    currency: str
    kind: str
    tags: str | None

    class Config:
        from_attributes = True


class CategorySummary(BaseModel):
    category: str
    total: float
    count: int


class MonthlySummary(BaseModel):
    month: str
    total_expense: float
    total_income: float


class ForecastPoint(BaseModel):
    month: str
    predicted_expense: float


class RiskResult(BaseModel):
    risk_label: str
    risk_probability: float


class TransactionsPage(BaseModel):
    items: list[TransactionOut]
    total: int


class TransactionUpdate(BaseModel):
    date: date_ | None = None
    category: str | None = None
    account: str | None = None
    amount: float | None = None
    kind: str | None = None


class BudgetIn(BaseModel):
    category: str
    monthly_limit: float


class BudgetOut(BaseModel):
    category: str
    monthly_limit: float
    spent_this_month: float

    class Config:
        from_attributes = True
