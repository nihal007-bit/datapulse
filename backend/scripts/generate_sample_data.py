"""Generate sample transaction CSVs matching the Kaggle
'Financial Transactions Dataset (Expenses & Income)' schema
(date, category, account, amount, currency, tags), so the app can be
developed and demoed before the real dataset is downloaded.
"""

import numpy as np
import pandas as pd

np.random.seed(42)

EXPENSE_CATEGORIES = {
    "Groceries": (800, 200),
    "Rent": (15000, 0),
    "Cafe": (400, 150),
    "Transport": (600, 200),
    "Shopping": (2000, 1200),
    "Utilities": (2500, 500),
    "Entertainment": (900, 400),
}

INCOME_CATEGORIES = {
    "Salary": (40000, 0),
    "Freelance": (5000, 3000),
    "Cashback": (150, 80),
}


def generate(months: int = 8, rows_per_month: int = 40) -> tuple[pd.DataFrame, pd.DataFrame]:
    dates = pd.date_range(end=pd.Timestamp.today(), periods=months, freq="MS")

    expense_rows = []
    for month_start in dates:
        for _ in range(rows_per_month):
            category = np.random.choice(list(EXPENSE_CATEGORIES.keys()))
            mean, std = EXPENSE_CATEGORIES[category]
            amount = max(round(np.random.normal(mean, std if std else mean * 0.05), 2), 10)
            day_offset = np.random.randint(0, 27)
            expense_rows.append(
                {
                    "date": (month_start + pd.Timedelta(days=day_offset)).date(),
                    "category": category,
                    "account": f"acct_{np.random.randint(1, 3)}",
                    "amount": amount,
                    "currency": "INR",
                    "tags": "",
                }
            )

    income_rows = []
    for month_start in dates:
        for category, (mean, std) in INCOME_CATEGORIES.items():
            amount = max(round(np.random.normal(mean, std if std else mean * 0.02), 2), 0)
            income_rows.append(
                {
                    "date": (month_start + pd.Timedelta(days=1)).date(),
                    "category": category,
                    "account": "acct_1",
                    "amount": amount,
                    "currency": "INR",
                    "tags": "",
                }
            )

    return pd.DataFrame(expense_rows), pd.DataFrame(income_rows)


if __name__ == "__main__":
    expenses, income = generate()
    expenses.to_csv("data/Expenses_sample.csv", index=False)
    income.to_csv("data/Income_sample.csv", index=False)
    print(f"Wrote {len(expenses)} expense rows and {len(income)} income rows to backend/data/")
