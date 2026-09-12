/**
 * SmartAnalyser.jsx — XGBoost-powered Thermal Hotspot Decision Support Page
 *
 * Runs a gradient-boosted decision tree ensemble (XGBoost algorithm, JS port)
 * on all available hotspot data, review queue events, and uploaded CSV files.
 *
 * ⚠ IMPORTANT: This is a decision-SUPPORT tool. Every prediction requires
 *   human analyst review and approval before any action is taken.
 */

import { useState, useMemo, useRef, useCallback } from "react";
import {
  BrainCircuit, Upload, AlertTriangle, ShieldAlert, CheckCircle2,
  BarChart3, Download, RefreshCw, ChevronDown, ChevronUp,
  Flame, Wind, Thermometer, Layers, Info, TrendingUp, TrendingDown,
  FileText, Filter, X,
} from "lucide-react";
import { getAllHotspots } from "../data/hotspotDetails";
import { predict, featureImportance, featuresFromHotspot, featuresFromCsvRow, FEATURE_NAMES } from "./xgb";

// ── Risk level meta ───────────────────────────────────────────────────────────
const RISK_META = {
  Low:      { color: "#22c55e", bg: "rgba(34,197,94,0.10)",  icon: CheckCircle2,  order: 0 },
  Moderate: { color: "#f5a623", bg: "rgba(245,166,35,0.10)", icon: AlertTriangle,  order: 1 },
  High:     { color: "#ff9559", bg: "rgba(255,149,89,0.10)", icon: ShieldAlert,    order: 2 },
  Critical: { color: "#ff4444", bg: "rgba(255,68,68,0.12)",  icon: ShieldAlert,    order: 3 },
};

function parseCSV(text) {
  const lines  = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).filter(Boolean).map(line => {
    const vals = line.split(",");
    return Object.fromEntries(header.map((h, i) => [h, (vals[i] ?? "").trim()]));
  });
}

function RiskBadge({ label }) {
  const m = RISK_META[label] ?? RISK_META.Moderate;
  const Icon = m.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.06em", color: m.color,
      background: m.bg, border: `1px solid ${m.color}44`,
    }}>
      <Icon size={11} strokeWidth={2.5} /> {label.toUpperCase()}
    </span>
  );
}

function ProbBar({ label, prob }) {
  const m = RISK_META[label] ?? RISK_META.Moderate;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
      <span style={{ width: 64, color: "rgba(255,255,255,0.5)", textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ width: `${(prob * 100).toFixed(1)}%`, height: "100%", background: m.color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ width: 40, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}>
        {(prob * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function FeatureImportanceChart({ importances }) {
  const top = importances.slice(0, 10);
  const maxImp = top[0]?.importance || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {top.map(({ name, importance }) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ width: 180, color: "rgba(255,255,255,0.65)", textAlign: "right", flexShrink: 0, fontSize: 11 }}>{name}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
            <div style={{
              width: `${(importance / maxImp * 100).toFixed(1)}%`,
              height: "100%", borderRadius: 3,
              background: "linear-gradient(90deg, #55d4f5, #3a6fff)",
              transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{ width: 44, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            {(importance * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function HotspotCard({ result, expanded, onToggle }) {
  const { hotspot, prediction } = result;
  const m = RISK_META[prediction.label] ?? RISK_META.Moderate;
  const Icon = m.icon;
  const sat = hotspot.satellite ?? {};
  const bl  = hotspot.baseline ?? {};
  const wx  = hotspot.weather ?? {};

  return (
    <div style={{
      border: `1px solid ${m.color}44`,
      borderRadius: 12, background: m.bg,
      overflow: "hidden", transition: "border-color 0.2s",
    }}>
      {/* Card header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <Icon size={18} color={m.color} strokeWidth={2.3} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{hotspot.id}</span>
            <RiskBadge label={prediction.label} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {hotspot.district}, {hotspot.state}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {hotspot.class} · FRP {sat.frp ?? "—"} MW · Conf. {(prediction.score * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 6, borderRadius: 3,
            background: "rgba(255,255,255,0.08)", overflow: "hidden",
          }}>
            <div style={{ width: `${(prediction.score * 100).toFixed(0)}%`, height: "100%", background: m.color, borderRadius: 3 }} />
          </div>
          {expanded ? <ChevronUp size={14} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.4)" />}
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 14 }}>
            {/* Satellite data */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>SATELLITE</p>
              <SCell label="FRP" value={`${sat.frp ?? "—"} MW`} />
              <SCell label="Brightness T4" value={`${sat.bright_ti4 ?? "—"} K`} />
              <SCell label="Delta T" value={`${sat.delta_t ?? "—"} K`} />
              <SCell label="Sensor" value={`${sat.sensor} / ${sat.spacecraft}`} />
              <SCell label="Confidence" value={sat.confidence?.toUpperCase() ?? "—"} />
            </div>
            {/* Baseline */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>BASELINE</p>
              <SCell label="Median FRP" value={`${bl.median_frp ?? "—"} MW`} />
              <SCell label="Robust Deviation" value={bl.robust_deviation?.toFixed(2) ?? "—"} />
              <SCell label="Persistence" value={bl.persistence_rate ? `${(bl.persistence_rate * 100).toFixed(0)}%` : "—"} />
              <SCell label="Days 30d / 365d" value={`${bl.days_seen_30d ?? "—"} / ${bl.days_seen_365d ?? "—"}`} />
            </div>
            {/* Weather */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>WEATHER</p>
              <SCell label="Wind" value={wx.wind_speed_ms != null ? `${wx.wind_speed_ms} m/s · ${wx.wind_direction_deg}°` : "—"} />
              <SCell label="Temperature" value={wx.temperature_c != null ? `${wx.temperature_c} °C` : "—"} />
              <SCell label="Humidity" value={wx.humidity_pct != null ? `${wx.humidity_pct}%` : "—"} />
              <SCell label="Precipitation" value={wx.precipitation_mm != null ? `${wx.precipitation_mm} mm` : "—"} />
            </div>
          </div>

          {/* Class probability bars */}
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>RISK CLASS PROBABILITIES</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {["Low","Moderate","High","Critical"].map((lbl, i) => (
                <ProbBar key={lbl} label={lbl} prob={prediction.probabilities[i] ?? 0} />
              ))}
            </div>
          </div>

          {/* Model recommendation */}
          <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>MODEL RECOMMENDATION</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              {genRecommendation(hotspot, prediction)}
            </p>
          </div>

          {/* Human approval required */}
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 8,
            background: "rgba(255,196,0,0.07)", border: "1px solid rgba(255,196,0,0.22)",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <AlertTriangle size={14} color="#ffc400" strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "rgba(255,196,0,0.9)", lineHeight: 1.5, margin: 0 }}>
              <strong>Analyst Decision Required.</strong> This prediction is automated and must be reviewed and approved by a qualified district manager before any operational action is taken.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SCell({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-mono)", textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function genRecommendation(hs, pred) {
  const frp = hs.satellite?.frp ?? 0;
  const rd  = hs.baseline?.robust_deviation ?? 0;
  const pr  = hs.baseline?.persistence_rate ?? 0.5;
  switch (pred.label) {
    case "Critical":
      return `Immediate escalation recommended. FRP of ${frp} MW with robust deviation ${rd.toFixed(1)}σ significantly exceeds baseline. Dispatch inspection team; verify facility status, check adjacent weather for smoke dispersion risk.`;
    case "High":
      return `Priority review flagged. Anomalous thermal signal (${frp} MW, dev ${rd.toFixed(1)}σ). Cross-reference with recent facility operational logs and weather data. Prepare escalation if confirmed.`;
    case "Moderate":
      return `Monitor closely. Signal is ${pr > 0.7 ? "persistent and may be routine" : "episodic and context-dependent"}. Verify land-cover context (${hs.class}) and confirm with next satellite overpass before escalating.`;
    default:
      return `Low risk profile. Persistence rate of ${(pr * 100).toFixed(0)}% and FRP within normal bounds. Routine logging recommended; no immediate action required.`;
  }
}

function DistrictSummaryRow({ district, results }) {
  const riskScores = { Low: 0, Moderate: 1, High: 2, Critical: 3 };
  const avgScore = results.reduce((s, r) => s + riskScores[r.prediction.label], 0) / results.length;
  const label = ["Low","Moderate","High","Critical"][Math.min(3, Math.round(avgScore))];
  const m = RISK_META[label];
  const maxFrp = Math.max(...results.map(r => r.hotspot.satellite?.frp ?? 0));
  const critical = results.filter(r => r.prediction.label === "Critical").length;
  const high     = results.filter(r => r.prediction.label === "High").length;
  return (
    <tr>
      <td style={{ fontWeight: 700, color: "#fff", padding: "10px 12px" }}>{district}</td>
      <td style={{ textAlign: "center", padding: "10px 8px", color: "rgba(255,255,255,0.65)" }}>{results.length}</td>
      <td style={{ textAlign: "center", padding: "10px 8px", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)" }}>{maxFrp.toFixed(1)}</td>
      <td style={{ textAlign: "center", padding: "10px 8px" }}><RiskBadge label={label} /></td>
      <td style={{ textAlign: "center", padding: "10px 8px", color: critical > 0 ? "#ff4444" : "rgba(255,255,255,0.35)" }}>{critical}</td>
      <td style={{ textAlign: "center", padding: "10px 8px", color: high > 0 ? "#ff9559" : "rgba(255,255,255,0.35)" }}>{high}</td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SmartAnalyser({ feed, manager }) {
  const allHotspots = useMemo(() => getAllHotspots(), []);
  const [csvRows, setCsvRows]       = useState([]);
  const [csvName, setCsvName]       = useState("");
  const [csvError, setCsvError]     = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [sortBy, setSortBy]         = useState("risk");
  const [expandedId, setExpandedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  // Run XGBoost on all built-in hotspots
  const hotspotResults = useMemo(() => {
    return allHotspots.map(hs => ({
      hotspot: hs,
      source: "builtin",
      prediction: predict(featuresFromHotspot(hs)),
    }));
  }, [allHotspots]);

  // Run XGBoost on uploaded CSV rows
  const csvResults = useMemo(() => {
    return csvRows.map((row, i) => ({
      hotspot: {
        id: row.id || row.hs_id || `csv-${i + 1}`,
        district: row.district || "—",
        state: row.state || "—",
        class: row.class || row.hotspot_class || "—",
        satellite: {
          frp: parseFloat(row.frp) || 0,
          bright_ti4: parseFloat(row.bright_ti4) || 320,
          delta_t: parseFloat(row.delta_t) || 20,
          confidence: row.confidence || "n",
          sensor: "VIIRS",
          spacecraft: row.satellite || "—",
        },
        baseline: {
          median_frp: parseFloat(row.median_frp) || null,
          robust_deviation: parseFloat(row.robust_deviation) || null,
          persistence_rate: parseFloat(row.persistence_rate) || null,
          days_seen_30d: parseFloat(row.days_seen_30d) || null,
          days_seen_365d: parseFloat(row.days_seen_365d) || null,
        },
        weather: {
          wind_speed_ms: parseFloat(row.wind_speed_ms) || null,
          temperature_c: parseFloat(row.temperature_c) || null,
          humidity_pct: parseFloat(row.humidity_pct) || null,
        },
        cluster: {
          detection_count: parseFloat(row.detection_count) || null,
          spatial_spread_km2: parseFloat(row.spatial_spread_km2) || null,
          centroid_drift_rate: parseFloat(row.centroid_drift_rate) || 0,
        },
        facility: { overlap: !!parseFloat(row.facility_overlap) },
      },
      source: "csv",
      prediction: predict(featuresFromCsvRow(row)),
    }));
  }, [csvRows]);

  const allResults = useMemo(() => [...hotspotResults, ...csvResults], [hotspotResults, csvResults]);

  const importances = useMemo(() => featureImportance(), []);

  // Aggregate stats
  const stats = useMemo(() => {
    const counts = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    allResults.forEach(r => { counts[r.prediction.label] = (counts[r.prediction.label] || 0) + 1; });
    const avgScore = allResults.reduce((s, r) => s + r.prediction.score, 0) / (allResults.length || 1);
    return { counts, total: allResults.length, avgScore };
  }, [allResults]);

  // Filtered + sorted results
  const displayed = useMemo(() => {
    let list = filterRisk === "All" ? allResults : allResults.filter(r => r.prediction.label === filterRisk);
    if (sortBy === "risk") {
      const order = { Critical: 3, High: 2, Moderate: 1, Low: 0 };
      list = [...list].sort((a, b) => (order[b.prediction.label] - order[a.prediction.label]) || (b.prediction.score - a.prediction.score));
    } else if (sortBy === "frp") {
      list = [...list].sort((a, b) => (b.hotspot.satellite?.frp ?? 0) - (a.hotspot.satellite?.frp ?? 0));
    } else {
      list = [...list].sort((a, b) => (a.hotspot.district ?? "").localeCompare(b.hotspot.district ?? ""));
    }
    return list;
  }, [allResults, filterRisk, sortBy]);

  // District grouping for summary table
  const byDistrict = useMemo(() => {
    const map = {};
    allResults.forEach(r => {
      const d = r.hotspot.district || "Unknown";
      if (!map[d]) map[d] = [];
      map[d].push(r);
    });
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
  }, [allResults]);

  // CSV upload handler
  const handleFile = useCallback(file => {
    if (!file) return;
    setCsvError("");
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const rows = parseCSV(e.target.result);
        if (rows.length === 0) throw new Error("No data rows found in CSV.");
        if (!("frp" in rows[0]) && !("FRP" in rows[0])) throw new Error("CSV must contain an 'frp' column.");
        setCsvRows(rows);
        setCsvName(file.name);
      } catch (err) {
        setCsvError(err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(e => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
    else setCsvError("Please drop a valid .csv file.");
  }, [handleFile]);

  // Export results CSV
  const exportCSV = () => {
    const rows = allResults.map(r => ({
      id: r.hotspot.id, district: r.hotspot.district, state: r.hotspot.state,
      class: r.hotspot.class, frp: r.hotspot.satellite?.frp ?? "",
      source: r.source, risk_level: r.prediction.label,
      confidence_pct: (r.prediction.score * 100).toFixed(1),
      prob_low: (r.prediction.probabilities[0] * 100).toFixed(1),
      prob_moderate: (r.prediction.probabilities[1] * 100).toFixed(1),
      prob_high: (r.prediction.probabilities[2] * 100).toFixed(1),
      prob_critical: (r.prediction.probabilities[3] * 100).toFixed(1),
      human_approved: "REQUIRED",
    }));
    const keys = Object.keys(rows[0]);
    const csv  = [keys.join(","), ...rows.map(r => keys.map(k => `"${r[k]}"`).join(","))].join("\r\n");
    const url  = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a    = document.createElement("a");
    a.href = url; a.download = `thermalguard-xgboost-analysis-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="analyser-page">
      {/* ── Hero / header ─────────────────────────────────────── */}
      <div className="analyser-hero">
        <div className="analyser-hero-left">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(85,212,245,0.18), rgba(58,111,255,0.18))",
              border: "1px solid rgba(85,212,245,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BrainCircuit size={18} color="#55d4f5" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
                XGBoost Smart Analyser
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                Gradient-boosted decision tree ensemble · {allResults.length} records · 19 features
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="secondary" onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <Download size={14} /> Export Analysis
          </button>
        </div>
      </div>

      {/* ── Human approval banner ─────────────────────────────── */}
      <div className="analyser-approval-banner">
        <AlertTriangle size={16} color="#ffc400" strokeWidth={2.5} style={{ flexShrink: 0 }} />
        <div>
          <strong>Analyst Approval Required</strong> — Predictions generated by this XGBoost model are decision-support tools only.
          A qualified district manager must review, validate, and formally approve each recommendation before any operational action is taken.
          Model confidence scores below 70% should be treated as indicative and escalated for manual review.
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="analyser-stats">
        {[["Low", "#22c55e"], ["Moderate", "#f5a623"], ["High", "#ff9559"], ["Critical", "#ff4444"]].map(([lbl, col]) => (
          <button
            key={lbl}
            className={`analyser-stat-card${filterRisk === lbl ? " active" : ""}`}
            style={{ borderColor: filterRisk === lbl ? col : "rgba(255,255,255,0.07)" }}
            onClick={() => setFilterRisk(filterRisk === lbl ? "All" : lbl)}
          >
            <span style={{ fontSize: 26, fontWeight: 800, color: col, lineHeight: 1 }}>{stats.counts[lbl] ?? 0}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{lbl} Risk</span>
            <div style={{ width: "100%", height: 2, marginTop: 8, borderRadius: 1, background: col, opacity: 0.35 }} />
          </button>
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="analyser-grid">

        {/* Left: Predictions list */}
        <div className="analyser-main">
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <Filter size={14} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Filter:</span>
            {["All","Low","Moderate","High","Critical"].map(lbl => (
              <button key={lbl} onClick={() => setFilterRisk(lbl)}
                style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", border: "1px solid",
                  borderColor: filterRisk === lbl ? (RISK_META[lbl]?.color ?? "#55d4f5") : "rgba(255,255,255,0.1)",
                  background: filterRisk === lbl ? (RISK_META[lbl]?.bg ?? "rgba(85,212,245,0.1)") : "transparent",
                  color: filterRisk === lbl ? (RISK_META[lbl]?.color ?? "#55d4f5") : "rgba(255,255,255,0.5)",
                  transition: "all 0.15s",
                }}
              >{lbl}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Sort by</span>
              <select
                value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.65)", cursor: "pointer",
                }}
              >
                <option value="risk">Risk (highest first)</option>
                <option value="frp">FRP (highest first)</option>
                <option value="district">District (A–Z)</option>
              </select>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Showing {displayed.length} of {allResults.length} records
            {csvRows.length > 0 && ` · including ${csvRows.length} from ${csvName}`}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayed.map(result => (
              <HotspotCard
                key={`${result.source}-${result.hotspot.id}`}
                result={result}
                expanded={expandedId === `${result.source}-${result.hotspot.id}`}
                onToggle={() => setExpandedId(
                  expandedId === `${result.source}-${result.hotspot.id}`
                    ? null
                    : `${result.source}-${result.hotspot.id}`
                )}
              />
            ))}
            {displayed.length === 0 && (
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0", fontSize: 13 }}>
                No records match the current filter.
              </p>
            )}
          </div>
        </div>

        {/* Right: sidebar panels */}
        <div className="analyser-sidebar">

          {/* District summary table */}
          <div className="analyser-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <BarChart3 size={15} color="#55d4f5" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>District Summary</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["District","Spots","MaxFRP","Risk","Crit.","High"].map(h => (
                      <th key={h} style={{ padding: "4px 8px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byDistrict.map(([d, rs]) => <DistrictSummaryRow key={d} district={d} results={rs} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature importance */}
          <div className="analyser-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <TrendingUp size={15} color="#55d4f5" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Feature Importance</span>
            </div>
            <FeatureImportanceChart importances={importances} />
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 10, lineHeight: 1.5 }}>
              Top 10 of 19 features. Importance computed as normalised gain across all boosted trees.
            </p>
          </div>

          {/* CSV Upload */}
          <div className="analyser-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Upload size={15} color="#55d4f5" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Upload Additional Data</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12, lineHeight: 1.5 }}>
              Upload a CSV with <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>frp</code>, <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>confidence</code>, <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>district</code> columns (same format as ThermalGuard CSV export).
            </p>

            <div
              className={`analyser-upload-zone${isDragging ? " dragging" : ""}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={22} color={isDragging ? "#55d4f5" : "rgba(255,255,255,0.25)"} />
              <span style={{ fontSize: 12, color: isDragging ? "#55d4f5" : "rgba(255,255,255,0.4)", marginTop: 6 }}>
                {isDragging ? "Drop to analyse" : "Drop CSV here or click to browse"}
              </span>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])} />
            </div>

            {csvError && (
              <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.25)", fontSize: 11, color: "#ff8888" }}>
                ⚠ {csvError}
              </div>
            )}
            {csvName && !csvError && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                <FileText size={12} color="#22c55e" />
                <span style={{ flex: 1 }}>{csvName} · {csvRows.length} rows</span>
                <button onClick={() => { setCsvRows([]); setCsvName(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0, display: "flex" }}>
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Model info */}
          <div className="analyser-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Info size={15} color="#55d4f5" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Model Information</span>
            </div>
            {[
              ["Algorithm", "XGBoost (GBDT)"],
              ["Objective", "multi:softprob"],
              ["Classes", "Low / Moderate / High / Critical"],
              ["Trees", "20 rounds × 4 classes"],
              ["Max depth", "3"],
              ["Learning rate", "0.3"],
              ["Features", "19"],
              ["Training data", "30 hotspot records"],
              ["Python equiv.", "analyser/xgboost_analyser.py"],
            ].map(([k, v]) => <SCell key={k} label={k} value={v} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
