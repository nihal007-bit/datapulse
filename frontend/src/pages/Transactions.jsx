import { useEffect, useState } from "react";

import { deleteTransaction, getTransactions, updateTransaction } from "../api/client";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.55rem 0.75rem",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
};

const PAGE_SIZE = 15;

function SortHeader({ label, field, sortBy, sortDir, onSort }) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      style={{ padding: "8px", fontWeight: 500, fontSize: 12, cursor: "pointer", userSelect: "none" }}
    >
      {label} {active && (sortDir === "asc" ? "↑" : "↓")}
    </th>
  );
}

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const load = async () => {
    setLoading(true);
    const data = await getTransactions({
      search: search || undefined,
      kind: kind || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
    setRows(data.items);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortDir, page]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditDraft({ category: row.category, amount: row.amount });
  };

  const saveEdit = async (id) => {
    await updateTransaction(id, { category: editDraft.category, amount: Number(editDraft.amount) });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    load();
  };

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div style={{ padding: "2.5rem 2.5rem" }}>
      <PageHeader icon="📋" title="Transactions" subtitle="Browse, sort, edit, and filter every uploaded transaction." />

      <form onSubmit={handleFilter} style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Search category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={inputStyle} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button
          type="submit"
          style={{ ...inputStyle, background: "var(--accent)", color: "#04202f", fontWeight: 600, cursor: "pointer", border: "none" }}
        >
          Filter
        </button>
      </form>

      <Panel title={loading ? undefined : `${total} transaction${total === 1 ? "" : "s"}`}>
        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>No transactions match this filter.</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
                  <SortHeader label="Date" field="date" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Category" field="category" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <th style={{ padding: "8px", fontWeight: 500, fontSize: 12 }}>Account</th>
                  <SortHeader label="Amount" field="amount" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <th style={{ padding: "8px", fontWeight: 500, fontSize: 12, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isEditing = editingId === r.id;
                  return (
                    <tr
                      key={r.id}
                      onMouseEnter={() => setHoveredRow(r.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderTop: "1px solid var(--border)",
                        background: hoveredRow === r.id ? "var(--surface)" : "transparent",
                        transition: "background 0.1s",
                      }}
                    >
                      <td style={{ padding: "9px 8px", color: "var(--text-secondary)" }}>{r.date}</td>
                      <td style={{ padding: "9px 8px" }}>
                        {isEditing ? (
                          <input
                            style={{ ...inputStyle, padding: "4px 8px", width: 130 }}
                            value={editDraft.category}
                            onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                          />
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "3px 9px",
                              borderRadius: 999,
                              fontSize: 12,
                              background: r.kind === "income" ? "rgba(52,211,153,0.12)" : "var(--surface-2)",
                              color: r.kind === "income" ? "var(--success)" : "var(--text-primary)",
                            }}
                          >
                            {r.category}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "9px 8px", color: "var(--text-muted)" }}>{r.account ?? "-"}</td>
                      <td
                        style={{
                          padding: "9px 8px",
                          fontWeight: 500,
                          color: r.kind === "income" ? "var(--success)" : "var(--text-primary)",
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            style={{ ...inputStyle, padding: "4px 8px", width: 100 }}
                            value={editDraft.amount}
                            onChange={(e) => setEditDraft({ ...editDraft, amount: e.target.value })}
                          />
                        ) : (
                          <>
                            {r.kind === "income" ? "+" : "-"}
                            {r.amount.toLocaleString()}
                          </>
                        )}
                      </td>
                      <td style={{ padding: "9px 8px", textAlign: "right" }}>
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(r.id)}
                            style={{ ...inputStyle, padding: "3px 10px", cursor: "pointer", marginRight: 6 }}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(r)}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginRight: 10 }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Page {page + 1} of {totalPages}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  style={{ ...inputStyle, cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    ...inputStyle,
                    cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                    opacity: page + 1 >= totalPages ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
