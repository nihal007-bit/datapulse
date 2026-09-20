import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Transaction

router = APIRouter(prefix="/api/upload", tags=["upload"])

REQUIRED_COLUMNS = {"date", "category", "amount"}


@router.post("")
def upload_transactions(
    kind: str = Query(..., pattern="^(expense|income)$"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    raw = file.file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}")

    df.columns = [c.strip().lower() for c in df.columns]
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400, detail=f"CSV is missing required columns: {missing}"
        )

    df["date"] = pd.to_datetime(df["date"]).dt.date
    df["amount"] = df["amount"].astype(float).abs()

    rows = [
        Transaction(
            date=row["date"],
            category=str(row["category"]),
            account=str(row.get("account")) if "account" in df.columns else None,
            amount=row["amount"],
            currency=str(row.get("currency", "INR")) if "currency" in df.columns else "INR",
            kind=kind,
            tags=str(row.get("tags")) if "tags" in df.columns else None,
        )
        for _, row in df.iterrows()
    ]

    db.bulk_save_objects(rows)
    db.commit()

    return {"inserted": len(rows), "kind": kind}
