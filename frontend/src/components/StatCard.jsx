const TONES = {
  neutral: { badgeBg: "var(--surface-2)", text: "var(--text-primary)", border: "var(--border)" },
  danger: { badgeBg: "rgba(248, 113, 113, 0.14)", text: "var(--danger)", border: "rgba(248, 113, 113, 0.25)" },
  success: { badgeBg: "rgba(52, 211, 153, 0.14)", text: "var(--success)", border: "rgba(52, 211, 153, 0.25)" },
};

export default function StatCard({ label, value, icon, tone = "neutral", changePct }) {
  const { badgeBg, text, border } = TONES[tone] ?? TONES.neutral;
  const hasChange = typeof changePct === "number" && Number.isFinite(changePct);
  const changeUp = hasChange && changePct > 0;

  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: `1px solid ${tone === "neutral" ? "var(--border)" : border}`,
        borderRadius: "var(--radius)",
        padding: "1.1rem 1.25rem",
        flex: 1,
        minWidth: 170,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: badgeBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: text }}>{value}</div>
        {hasChange && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: changeUp ? "var(--danger)" : "var(--success)",
            }}
          >
            {changeUp ? "↑" : "↓"} {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
