import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Transaction
from app.schemas import CategorySummary, MonthlySummary, TransactionOut

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _to_dataframe(db: Session) -> pd.DataFrame:
    rows = db.query(Transaction).all()
    return pd.DataFrame(
        [
            {
                "date": r.date,
                "category": r.category,
                "amount": r.amount,
                "kind": r.kind,
            }
            for r in rows
        ]
    )


@router.get("/by-category", response_model=list[CategorySummary])
def by_category(db: Session = Depends(get_db)):
    df = _to_dataframe(db)
    if df.empty:
        return []
    expenses = df[df["kind"] == "expense"]
    grouped = expenses.groupby("category")["amount"].agg(["sum", "count"]).reset_index()
    return [
        CategorySummary(category=row["category"], total=round(row["sum"], 2), count=int(row["count"]))
        for _, row in grouped.iterrows()
    ]


@router.get("/monthly", response_model=list[MonthlySummary])
def monthly(db: Session = Depends(get_db)):
    df = _to_dataframe(db)
    if df.empty:
        return []
    df["month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    pivot = df.pivot_table(index="month", columns="kind", values="amount", aggfunc="sum", fill_value=0)
    pivot = pivot.reset_index()
    return [
        MonthlySummary(
            month=row["month"],
            total_expense=round(row.get("expense", 0), 2),
            total_income=round(row.get("income", 0), 2),
        )
        for _, row in pivot.iterrows()
    ]


@router.get("/anomalies", response_model=list[TransactionOut])
def anomalies(db: Session = Depends(get_db), z_threshold: float = 2.5):
    rows = db.query(Transaction).filter(Transaction.kind == "expense").all()
    if not rows:
        return []
    df = pd.DataFrame([{"id": r.id, "category": r.category, "amount": r.amount} for r in rows])
    df["z"] = df.groupby("category")["amount"].transform(
        lambda x: (x - x.mean()) / x.std(ddof=0) if x.std(ddof=0) > 0 else 0
    )
    flagged_ids = set(df[df["z"].abs() >= z_threshold]["id"])
    return [r for r in rows if r.id in flagged_ids]


@router.get("/category-trend")
def category_trend(db: Session = Depends(get_db)):
    df = _to_dataframe(db)
    if df.empty:
        return {"months": [], "series": []}
    expenses = df[df["kind"] == "expense"].copy()
    expenses["month"] = pd.to_datetime(expenses["date"]).dt.to_period("M").astype(str)
    pivot = expenses.pivot_table(index="month", columns="category", values="amount", aggfunc="sum", fill_value=0)
    pivot = pivot.sort_index()
    return {
        "months": pivot.index.tolist(),
        "series": [
            {"category": category, "values": [round(v, 2) for v in pivot[category].tolist()]}
            for category in pivot.columns
        ],
    }


@router.get("/by-weekday")
def by_weekday(db: Session = Depends(get_db)):
    df = _to_dataframe(db)
    if df.empty:
        return []
    expenses = df[df["kind"] == "expense"].copy()
    expenses["weekday"] = pd.to_datetime(expenses["date"]).dt.day_name()
    order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    grouped = expenses.groupby("weekday")["amount"].sum().reindex(order, fill_value=0)
    return [{"weekday": day, "total": round(total, 2)} for day, total in grouped.items()]
