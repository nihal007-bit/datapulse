from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Transaction
from app.schemas import TransactionOut, TransactionsPage, TransactionUpdate

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

SORTABLE_COLUMNS = {
    "date": Transaction.date,
    "category": Transaction.category,
    "amount": Transaction.amount,
}


@router.get("", response_model=TransactionsPage)
def list_transactions(
    db: Session = Depends(get_db),
    kind: str | None = Query(None, pattern="^(expense|income)$"),
    category: str | None = None,
    search: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    sort_by: str = Query("date", pattern="^(date|category|amount)$"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    offset: int = 0,
    limit: int = 50,
):
    query = db.query(Transaction)

    if kind:
        query = query.filter(Transaction.kind == kind)
    if category:
        query = query.filter(Transaction.category == category)
    if search:
        query = query.filter(Transaction.category.ilike(f"%{search}%"))
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    total = query.count()

    sort_column = SORTABLE_COLUMNS[sort_by]
    sort_column = sort_column.desc() if sort_dir == "desc" else sort_column.asc()

    items = query.order_by(sort_column).offset(offset).limit(limit).all()
    return TransactionsPage(items=items, total=total)


@router.delete("/all")
def clear_all_transactions(db: Session = Depends(get_db)):
    deleted = db.query(Transaction).delete()
    db.commit()
    return {"deleted": deleted}


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(transaction)
    db.commit()
    return {"deleted": transaction_id}
