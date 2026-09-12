import { useEffect, useState } from "react";
import { DISTRICTS, restoreManager } from "./workspace/districts";
import "./workspace/workspace.css";
import "./workspace/earth.css";

export default function App() {
  const [manager, setManager] = useState(restoreManager);

  return (
    <div className="workspace-shell" style={{ minHeight: "100vh", background: "#050b14", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <div style={{ maxWidth: "620px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", background: "rgba(85,212,245,0.1)", border: "1px solid rgba(85,212,245,0.3)", color: "#55d4f5", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          ThermalGuard • Satellite Intelligence
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Mission Control <span style={{ color: "#55d4f5" }}>Workspace</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.7, marginBottom: "2rem" }}>
          Frontend architecture and theme tokens initialized. Setting up 3D Earth, district pilot telemetry, and satellite observation pipeline.
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {DISTRICTS.map((d) => (
            <span key={d.id} style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
              {d.name} ({d.state})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
