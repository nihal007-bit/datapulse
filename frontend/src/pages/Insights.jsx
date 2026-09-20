import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";

import { getByWeekday, getCategoryTrend } from "../api/client";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const CATEGORY_COLORS = ["#38bdf8", "#34d399", "#f97316", "#f472b6", "#94a3b8", "#fbbf24", "#a78bfa"];

const gridOptions = { color: "rgba(255,255,255,0.06)" };
const tickOptions = { color: "#94a3b8", font: { size: 11 } };

export default function Insights() {
  const [trend, setTrend] = useState({ months: [], series: [] });
  const [weekday, setWeekday] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getCategoryTrend(), getByWeekday()]).then(([trendData, weekdayData]) => {
      setTrend(trendData);
      setWeekday(weekdayData);
      setLoaded(true);
    });
  }, []);

  const hasData = trend.months.length > 0;

  // Keep the chart readable: show only the top categories by total spend,
  // and fold the rest into "Other" instead of drawing a tangle of thin lines.
  const TOP_N = 4;
  const rankedSeries = [...trend.series].sort(
    (a, b) => b.values.reduce((sum, v) => sum + v, 0) - a.values.reduce((sum, v) => sum + v, 0)
  );
  const topSeries = rankedSeries.slice(0, TOP_N);
  const restSeries = rankedSeries.slice(TOP_N);
  const otherValues = trend.months.map((_, i) => restSeries.reduce((sum, s) => sum + s.values[i], 0));
  const visibleSeries = restSeries.length > 0 ? [...topSeries, { category: "Other", values: otherValues }] : topSeries;

  const trendChartData = {
    labels: trend.months,
    datasets: visibleSeries.map((s, i) => ({
      label: s.category,
      data: s.values,
      borderColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      backgroundColor: "transparent",
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
    })),
  };

  const weekdayChartData = {
    labels: weekday.map((w) => w.weekday.slice(0, 3)),
    datasets: [
      {
        label: "Spending",
        data: weekday.map((w) => w.total),
        backgroundColor: "#38bdf8",
        borderRadius: 6,
        maxBarThickness: 48,
      },
    ],
  };

  const formatCompact = (value) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8", boxWidth: 10, padding: 16, font: { size: 11 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: tickOptions },
      y: { grid: gridOptions, ticks: { ...tickOptions, callback: formatCompact } },
    },
  };

  return (
    <div style={{ padding: "2.5rem 2.5rem" }}>
      <PageHeader
        icon="🔎"
        title="Insights"
        subtitle="Deeper patterns: how each category trends over time, and which days you spend the most."
      />

      {loaded && !hasData && (
        <Panel>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Upload transactions to see insights here.</p>
        </Panel>
      )}

      {hasData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <Panel title="Category spending over time">
            <div style={{ height: 300 }}>
              <Line data={trendChartData} options={chartOptions} />
            </div>
          </Panel>
          <Panel title="Spending by day of week">
            <div style={{ height: 260 }}>
              <Bar data={weekdayChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
