export default function Panel({ title, subtitle, children, style }) {
  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.25rem",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {title && (
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
