import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { Link } from "react-router-dom";

import {
  getAnomalies,
  getByCategory,
  getForecast,
  getMonthly,
  getRisk,
} from "../api/client";
import BudgetPanel from "../components/BudgetPanel";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import StatCard from "../components/StatCard";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const CATEGORY_COLORS = ["#38bdf8", "#34d399", "#f97316", "#f472b6", "#94a3b8", "#fbbf24", "#a78bfa"];

const gridOptions = {
  color: "rgba(255,255,255,0.06)",
};

const tickOptions = {
  color: "#94a3b8",
  font: { size: 11 },
};

export default function Dashboard() {
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const [monthlyData, categoryData, anomalyData, forecastData, riskData] = await Promise.all([
      getMonthly(),
      getByCategory(),
      getAnomalies(),
      getForecast(),
      getRisk(),
    ]);
    setMonthly(monthlyData);
    setByCategory(categoryData);
    setAnomalies(anomalyData);
    setForecast(forecastData);
    setRisk(riskData);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const latestMonth = monthly.at(-1);
  const previousMonth = monthly.at(-2);
  const hasData = monthly.length > 0;

  const monthOverMonthPct =
    latestMonth && previousMonth && previousMonth.total_expense > 0
      ? ((latestMonth.total_expense - previousMonth.total_expense) / previousMonth.total_expense) * 100
      : null;

  const trendData = {
    labels: [...monthly.map((m) => m.month), forecast?.month].filter(Boolean),
    datasets: [
      {
        label: "Expense",
        data: monthly.map((m) => m.total_expense),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "Forecast",
        data: [...monthly.map(() => null).slice(1), monthly.at(-1)?.total_expense, forecast?.predicted_expense],
        borderColor: "#f97316",
        borderDash: [6, 4],
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const formatCompact = (value) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value);

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8", boxWidth: 10, padding: 16, font: { size: 12 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: tickOptions },
      y: { grid: gridOptions, ticks: { ...tickOptions, callback: formatCompact } },
    },
  };

  const categoryData = {
    labels: byCategory.map((c) => c.category),
    datasets: [
      {
        data: byCategory.map((c) => c.total),
        backgroundColor: CATEGORY_COLORS,
        borderColor: "var(--bg-panel)",
        borderWidth: 2,
      },
    ],
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#94a3b8", boxWidth: 10, padding: 12, font: { size: 11 } } },
    },
  };

  const riskTone = risk?.risk_label === "high" ? "danger" : risk?.risk_label === "low" ? "success" : "neutral";

  return (
    <div style={{ padding: "2.5rem 2.5rem" }}>
      <PageHeader
        icon="📊"
        title="Dashboard"
        subtitle="Spending trends, a next-month forecast, and overspend risk at a glance."
      />

      {loaded && !hasData && (
        <Panel>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            No transactions yet —{" "}
            <Link to="/upload" style={{ color: "var(--accent)" }}>
              upload an expenses and income CSV
            </Link>{" "}
            to populate the dashboard.
          </p>
        </Panel>
      )}

      {hasData && (
        <>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <StatCard
              icon="💰"
              label="This month"
              value={latestMonth.total_expense.toLocaleString()}
              changePct={monthOverMonthPct}
            />
            <StatCard icon="📈" label="Predicted next" value={forecast ? forecast.predicted_expense.toLocaleString() : "-"} />
            <StatCard icon="⚠️" label="Overspend risk" value={risk ? risk.risk_label : "-"} tone={riskTone} />
            <StatCard icon="🔍" label="Anomalies found" value={anomalies.length} tone={anomalies.length ? "danger" : "neutral"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <Panel title="Spending trend vs forecast">
              <div style={{ height: 280 }}>
                <Line data={trendData} options={trendOptions} />
              </div>
            </Panel>
            <Panel title="By category">
              <div style={{ height: 280 }}>
                <Doughnut data={categoryData} options={categoryOptions} />
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "1.5rem" }}>
          <Panel title="Budgets" subtitle="Set a monthly limit per category and track progress.">
            <BudgetPanel categories={byCategory.map((c) => c.category)} />
          </Panel>

          <Panel title="Flagged anomalies">
            {anomalies.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>No unusual transactions detected.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {anomalies.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      padding: "6px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {a.date} · {a.category}
                    </span>
                    <span style={{ color: "var(--danger)", fontWeight: 500 }}>{a.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          </div>
        </>
      )}
    </div>
  );
}
