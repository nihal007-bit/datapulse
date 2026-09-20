import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.forecast import forecast_next_month
from app.ml.risk import predict_overspend_risk
from app.models import Transaction
from app.schemas import ForecastPoint, RiskResult

router = APIRouter(prefix="/api/predict", tags=["predict"])


def _monthly_dataframe(db: Session) -> pd.DataFrame:
    rows = db.query(Transaction).all()
    if not rows:
        return pd.DataFrame(columns=["month", "total_expense", "total_income"])

    df = pd.DataFrame([{"date": r.date, "amount": r.amount, "kind": r.kind} for r in rows])
    df["month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    pivot = df.pivot_table(index="month", columns="kind", values="amount", aggfunc="sum", fill_value=0)
    pivot = pivot.reset_index().rename(columns={"expense": "total_expense", "income": "total_income"})
    for col in ("total_expense", "total_income"):
        if col not in pivot.columns:
            pivot[col] = 0.0
    return pivot


@router.get("/forecast", response_model=ForecastPoint)
def forecast(db: Session = Depends(get_db)):
    monthly_df = _monthly_dataframe(db)
    predicted = forecast_next_month(monthly_df)
    next_month = "next-month"
    if not monthly_df.empty:
        last_period = pd.Period(monthly_df["month"].max())
        next_month = str(last_period + 1)
    return ForecastPoint(month=next_month, predicted_expense=round(predicted, 2))


@router.get("/risk", response_model=RiskResult)
def risk(db: Session = Depends(get_db)):
    monthly_df = _monthly_dataframe(db)
    label, probability = predict_overspend_risk(monthly_df)
    return RiskResult(risk_label=label, risk_probability=probability)
