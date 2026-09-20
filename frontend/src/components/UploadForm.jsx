import { useState } from "react";

import { uploadTransactions } from "../api/client";

function FileButton({ label, accentLabel, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "0.6rem 1rem",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      <span
        style={{
          background: "var(--accent)",
          color: "#04202f",
          fontWeight: 600,
          fontSize: 12,
          padding: "0.3rem 0.6rem",
          borderRadius: 6,
        }}
      >
        Choose file
      </span>
      <span style={{ color: "var(--text-secondary)" }}>{accentLabel}</span>
      <input type="file" accept=".csv" onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

export default function UploadForm({ onUploaded }) {
  const [status, setStatus] = useState("");
  const [expenseFile, setExpenseFile] = useState("No file chosen");
  const [incomeFile, setIncomeFile] = useState("No file chosen");

  const handleUpload = async (event, kind) => {
    const file = event.target.files[0];
    if (!file) return;
    (kind === "expense" ? setExpenseFile : setIncomeFile)(file.name);
    setStatus(`Uploading ${kind}...`);
    try {
      const { data } = await uploadTransactions(file, kind);
      setStatus(`Inserted ${data.inserted} ${kind} rows.`);
      onUploaded?.();
    } catch (err) {
      setStatus(err.response?.data?.detail ?? "Upload failed.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
      <FileButton label="Expenses CSV" accentLabel={expenseFile} onChange={(e) => handleUpload(e, "expense")} />
      <FileButton label="Income CSV" accentLabel={incomeFile} onChange={(e) => handleUpload(e, "income")} />
      {status && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{status}</span>}
    </div>
  );
}
