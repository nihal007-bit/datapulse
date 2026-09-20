import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/transactions", label: "Transactions", icon: "📋" },
  { to: "/insights", label: "Insights", icon: "🔎" },
  { to: "/upload", label: "Upload", icon: "⬆️" },
];

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 232,
          borderRight: "1px solid var(--border)",
          padding: "1.5rem 1rem",
          background: "var(--bg-panel)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem", paddingLeft: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #38bdf8, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>DataPulse</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0.6rem 0.75rem",
                borderRadius: 8,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                textDecoration: "none",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--surface)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "background 0.15s, color 0.15s",
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <a
            href="https://github.com/nihal007-bit/datapulse"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-muted)",
              textDecoration: "none",
              paddingLeft: 8,
            }}
          >
            <span>⭐</span>
            <span>Star on GitHub</span>
          </a>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }} className="fade-in">
        <Outlet />
      </main>
    </div>
  );
}
