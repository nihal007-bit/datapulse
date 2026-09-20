import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Budget, Transaction
from app.schemas import BudgetIn, BudgetOut

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


def _spent_this_month(db: Session, category: str) -> float:
    rows = db.query(Transaction).filter(Transaction.kind == "expense", Transaction.category == category).all()
    if not rows:
        return 0.0
    df = pd.DataFrame([{"date": r.date, "amount": r.amount} for r in rows])
    current_month = pd.Timestamp.today().to_period("M")
    df["month"] = pd.to_datetime(df["date"]).dt.to_period("M")
    return round(df[df["month"] == current_month]["amount"].sum(), 2)


@router.get("", response_model=list[BudgetOut])
def list_budgets(db: Session = Depends(get_db)):
    budgets = db.query(Budget).all()
    return [
        BudgetOut(category=b.category, monthly_limit=b.monthly_limit, spent_this_month=_spent_this_month(db, b.category))
        for b in budgets
    ]


@router.post("", response_model=BudgetOut)
def upsert_budget(payload: BudgetIn, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.category == payload.category).first()
    if budget:
        budget.monthly_limit = payload.monthly_limit
    else:
        budget = Budget(category=payload.category, monthly_limit=payload.monthly_limit)
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return BudgetOut(
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        spent_this_month=_spent_this_month(db, budget.category),
    )


@router.delete("/{category}")
def delete_budget(category: str, db: Session = Depends(get_db)):
    db.query(Budget).filter(Budget.category == category).delete()
    db.commit()
    return {"deleted": category}
