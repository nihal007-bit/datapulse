# DataPulse

A full-stack personal finance analytics platform. Upload transaction CSVs and get categorized spending breakdowns, a next-month expense forecast, and an overspend-risk classifier — combining a React frontend, a FastAPI backend, PostgreSQL, and scikit-learn ML models.

## Screenshots

| Dashboard | Transactions |
| --- | --- |
| ![Dashboard](screenshots/dashboard.png) | ![Transactions](screenshots/transactions.png) |

| Insights | Upload |
| --- | --- |
| ![Insights](screenshots/insights.png) | ![Upload](screenshots/upload.png) |

## Features

**Dashboard**
- Stat cards: this month's spending (with month-over-month % change), next-month forecast, overspend risk label, and count of flagged anomalies
- Spending trend chart: monthly expense history with the forecast plotted as a dashed extension
- Spending-by-category doughnut chart
- Budgets panel: set a monthly limit per category and track progress with a colored bar (green/amber/red)
- Flagged anomalies list: unusual transactions relative to their category's normal range

**Transactions**
- Full transaction table with pagination
- Search by category and filter by type (expense/income)
- Sortable columns (date, category, amount)
- Inline editing of a transaction's category and amount
- Delete individual transactions

**Insights**
- Category spending over time (top categories by total spend, with the rest grouped into "Other")
- Spending by day of week, to spot weekday/weekend patterns

**Upload**
- Upload an expenses CSV and an income CSV to populate the database
- CSV format guidance (required vs. optional columns)
- "Danger zone": clear all stored transactions to start fresh with a new dataset

## Stack

- **Frontend:** React + Vite, Chart.js
- **Backend:** FastAPI, Pandas
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **ML:** scikit-learn (linear regression forecast, logistic regression overspend-risk classifier)

## Data

Built against the [Financial Transactions Dataset (Expenses & Income)](https://www.kaggle.com/datasets/artemkabseu/financial-transactions-dataset-expenses-and-income) (CC0), which ships `Expenses_clean.csv` and `Income_clean.csv` with columns `date, category, account, amount, currency, tags`.

Download it from Kaggle and drop the two CSVs into `backend/data/`, or generate sample data with the same schema to develop against immediately:

```bash
cd backend
python scripts/generate_sample_data.py
```

## Running locally

**Backend** (requires a local or hosted PostgreSQL instance):

```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/datapulse
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Then open the dashboard, upload `Expenses_clean.csv` as "Expenses CSV" and `Income_clean.csv` as "Income CSV" (or the generated sample files), and the dashboard will populate.

## How the ML works

- **Forecast:** fits a linear regression over the trailing monthly expense totals and predicts next month's figure. Swappable for Prophet once there's enough monthly history for seasonality to matter.
- **Overspend risk:** labels each historical month as "overspend" when expenses exceeded income, then trains a logistic regression on month-over-month expense change and the expense-to-income ratio to classify the most recent month's risk.
- **Anomaly detection:** flags transactions whose amount is a category-relative outlier (z-score ≥ 2.5 within that category).
