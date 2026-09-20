import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression


def _build_features(monthly_df: pd.DataFrame) -> pd.DataFrame:
    df = monthly_df.sort_values("month").copy()
    df["expense_change_pct"] = df["total_expense"].pct_change().fillna(0)
    df["expense_to_income"] = df["total_expense"] / df["total_income"].replace(0, np.nan)
    df["expense_to_income"] = df["expense_to_income"].fillna(df["expense_to_income"].mean() or 1.0)
    return df


def predict_overspend_risk(monthly_df: pd.DataFrame) -> tuple[str, float]:
    """Classify overspend risk for the most recent month.

    Ground truth isn't collected from the user, so a month is labeled
    "overspend" when expenses exceeded income - a reasonable proxy that lets
    a real classifier be trained instead of hand-coding thresholds.
    """
    if monthly_df.empty or len(monthly_df) < 3:
        return "insufficient-data", 0.0

    df = _build_features(monthly_df)
    df["label"] = (df["total_expense"] > df["total_income"]).astype(int)

    features = df[["expense_change_pct", "expense_to_income"]]
    labels = df["label"]

    if labels.nunique() < 2:
        risk = "high" if labels.iloc[-1] == 1 else "low"
        return risk, float(labels.iloc[-1])

    model = LogisticRegression().fit(features, labels)
    latest = features.iloc[[-1]]
    probability = float(model.predict_proba(latest)[0][1])
    risk = "high" if probability >= 0.5 else "low"
    return risk, round(probability, 3)
