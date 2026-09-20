from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import analytics, budgets, predict, transactions, upload

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DataPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analytics.router)
app.include_router(predict.router)
app.include_router(transactions.router)
app.include_router(budgets.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
