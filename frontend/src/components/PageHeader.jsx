export default function PageHeader({ icon, title, subtitle }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1.75rem" }}>
      {icon && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <h1 style={{ fontSize: 26, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>{subtitle}</p>}
      </div>
    </header>
  );
}
