import { useEffect, useState } from "react";

import { deleteBudget, getBudgets, upsertBudget } from "../api/client";

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.5rem 0.7rem",
  color: "var(--text-primary)",
  fontSize: 13,
};

function progressTone(pct) {
  if (pct >= 100) return "var(--danger)";
  if (pct >= 80) return "var(--warning)";
  return "var(--success)";
}

export default function BudgetPanel({ categories = [] }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const load = () => getBudgets().then(setBudgets);

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!category || !limit) return;
    await upsertBudget(category, Number(limit));
    setCategory("");
    setLimit("");
    load();
  };

  const handleDelete = async (cat) => {
    await deleteBudget(cat);
    load();
  };

  return (
    <div>
      {budgets.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "0 0 1rem" }}>
          No budgets set yet — add one below to track spending against a monthly limit.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.25rem" }}>
          {budgets.map((b) => {
            const pct = b.monthly_limit > 0 ? Math.min((b.spent_this_month / b.monthly_limit) * 100, 100) : 0;
            const tone = progressTone((b.spent_this_month / b.monthly_limit) * 100);
            return (
              <div key={b.category}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{b.category}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {b.spent_this_month.toLocaleString()} / {b.monthly_limit.toLocaleString()}
                    <button
                      onClick={() => handleDelete(b.category)}
                      style={{
                        marginLeft: 8,
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 999 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: tone, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", gap: 8 }}>
        <select style={{ ...inputStyle, flex: 1 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select category…</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          style={{ ...inputStyle, width: 110 }}
          type="number"
          placeholder="Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <button
          type="submit"
          style={{ ...inputStyle, background: "var(--accent)", color: "#04202f", fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          Set
        </button>
      </form>
    </div>
  );
}
