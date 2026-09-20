import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearAllTransactions } from "../api/client";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import UploadForm from "../components/UploadForm";

export default function Upload() {
  const navigate = useNavigate();
  const [clearStatus, setClearStatus] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleClear = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const { deleted } = await clearAllTransactions();
    setClearStatus(`Cleared ${deleted} transactions.`);
    setConfirming(false);
  };

  return (
    <div style={{ padding: "2.5rem 2.5rem" }}>
      <PageHeader
        icon="⬆️"
        title="Upload transactions"
        subtitle="Upload an expenses CSV and an income CSV to populate the dashboard."
      />

      <Panel title="CSV format" style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 1.25rem" }}>
          Each file needs at least <code>date</code>, <code>category</code>, and <code>amount</code> columns —
          <code>account</code>, <code>currency</code>, and <code>tags</code> are optional.
        </p>
        <UploadForm onUploaded={() => navigate("/")} />
      </Panel>

      <Panel title="Danger zone">
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 1rem" }}>
          Remove every transaction currently stored, so you can start fresh with a new dataset.
        </p>
        <button
          onClick={handleClear}
          style={{
            background: confirming ? "var(--danger)" : "var(--surface)",
            color: confirming ? "#fff" : "var(--danger)",
            border: "1px solid var(--danger)",
            borderRadius: 8,
            padding: "0.5rem 1rem",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {confirming ? "Click again to confirm" : "Clear all transactions"}
        </button>
        {clearStatus && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10 }}>{clearStatus}</p>}
      </Panel>
    </div>
  );
}
