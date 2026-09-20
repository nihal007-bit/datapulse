import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def forecast_next_month(monthly_df: pd.DataFrame) -> float:
    """Predict next month's total expense from a monthly expense/income history.

    Uses linear regression on the trailing months when there's too little
    history for a seasonal model like Prophet to be reliable.
    """
    if monthly_df.empty:
        return 0.0

    series = monthly_df.sort_values("month")["total_expense"].reset_index(drop=True)
    if len(series) < 2:
        return float(series.iloc[-1])

    x = np.arange(len(series)).reshape(-1, 1)
    y = series.values
    model = LinearRegression().fit(x, y)
    next_x = np.array([[len(series)]])
    prediction = model.predict(next_x)[0]
    return float(max(prediction, 0.0))
