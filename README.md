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

### 📊 Dashboard
The at-a-glance view of your finances.
- **Live stat cards** — current month's spend with a month-over-month % change indicator, next month's forecasted spend, an overspend-risk label, and a running count of flagged anomalies
- **Spending trend chart** — monthly expense history with the ML forecast rendered as a dashed continuation of the line
- **Category breakdown** — a doughnut chart of spending share per category
- **Budgets** — set a monthly limit per category and track progress with a color-coded bar that shifts from green to amber to red as you approach the limit
- **Anomaly feed** — a running list of transactions that broke from their category's usual pattern

### 📋 Transactions
The full transaction ledger, built for actually working with your data.
- Paginated table of every transaction, sortable by date, category, or amount
- Live search by category and filter by expense/income
- Inline editing — fix a miscategorized transaction or a typo'd amount without leaving the page
- One-click delete per row

### 🔎 Insights
Where the deeper patterns live.
- **Category trends over time** — a line chart tracking your top spending categories month by month, with smaller categories rolled into "Other" to keep it readable
- **Day-of-week breakdown** — a bar chart surfacing which days of the week you tend to spend the most

### ⬆️ Upload
The on-ramp for your data.
- Drop in an expenses CSV and an income CSV to populate everything above
- Inline guidance on the expected CSV schema (required vs. optional columns)
- A "danger zone" to wipe all stored transactions in one click, for starting over with a fresh dataset

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
