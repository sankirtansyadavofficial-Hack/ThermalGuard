/**
 * SmartAnalyser.jsx — XGBoost-powered Thermal Hotspot Decision Support System
 *
 * Features:
 * - Location / Monitoring Hub Selector (Jamnagar, Ahmedabad, Ludhiana, Dhanbad, Surat, Mumbai, Chennai, All India)
 * - Controlled Analysis Flow: Choose place -> "Run Smart XGBoost Analysis"
 * - High-tech Simulation Animation with multi-step satellite & model telemetry decoding
 * - Clean, beautifully structured Tabular Evidence Dataset
 * - Deep Evidence Telemetry Dossier Modal (Radiance, Land Cover, Weather, Probabilities, Feature Importance)
 * - Human-in-the-Loop Decision & Approval workflow (persisted locally)
 * - Zero CSV file upload clutter
 */

import { useState, useMemo, useEffect, useRef } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Wind,
  Thermometer,
  Activity,
  MapPin,
  Clock3,
  X,
  Download,
  Flame,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Compass,
  Radio,
  FileSpreadsheet,
  Check,
  Cpu,
} from "lucide-react";
import { ALL_HOTSPOTS_BY_DISTRICT, getAllHotspots } from "../data/hotspotDetails";
import { DISTRICTS } from "./districts";
import { predict, featureImportance, featuresFromHotspot, FEATURE_NAMES } from "./xgb";

// ── Additional Pilot District Telemetry (Ahmedabad & Dhanbad) ─────────────────
const SUPPLEMENTAL_HOTSPOTS = {
  Ahmedabad: [
    {
      id: "HS-AHM-001",
      district: "Ahmedabad",
      state: "Gujarat",
      class: "Persistent Industrial Heat",
      classColor: "#3a9fff",
      lat: 22.981,
      lng: 72.632,
      satellite: {
        sensor: "VIIRS",
        spacecraft: "NOAA-20",
        acq_date: "2026-09-12",
        acq_time: "01:36",
        bright_ti4: 346.5,
        bright_ti5: 298.2,
        delta_t: 48.3,
        scan: 0.39,
        track: 0.36,
        confidence: "h",
        frp: 56.4,
        daynight: "N",
        version: "2.0NRT",
      },
      baseline: {
        median_frp: 52.1,
        mad_frp: 6.9,
        robust_deviation: 0.62,
        days_seen_30d: 28,
        days_seen_365d: 338,
        persistence_rate: 0.93,
      },
      landCover: { built_up: 78, tree_cover: 3, shrubland: 2, grassland: 2, cropland: 5, bare: 8, water: 2, wetland: 0 },
      weather: { wind_speed_ms: 3.2, wind_direction_deg: 210, temperature_c: 29.2, humidity_pct: 68, precipitation_mm: 0 },
      facility: { name: "Vatva GIDC Chemical & Dye Manufacturing Zone", type: "Chemical Manufacturing", distance_m: 140, overlap: true },
      cluster: { detection_count: 21, overpass_count: 14, spatial_spread_km2: 0.16, centroid_drift_rate: 0, growth_direction: null },
    },
    {
      id: "HS-AHM-002",
      district: "Ahmedabad",
      state: "Gujarat",
      class: "Routine Gas Flare",
      classColor: "#f5a623",
      lat: 23.054,
      lng: 72.612,
      satellite: {
        sensor: "VIIRS",
        spacecraft: "Suomi-NPP",
        acq_date: "2026-09-12",
        acq_time: "00:48",
        bright_ti4: 355.8,
        bright_ti5: 298.9,
        delta_t: 56.9,
        scan: 0.40,
        track: 0.37,
        confidence: "h",
        frp: 74.2,
        daynight: "N",
        version: "2.0NRT",
      },
      baseline: {
        median_frp: 68.4,
        mad_frp: 8.5,
        robust_deviation: 0.68,
        days_seen_30d: 25,
        days_seen_365d: 310,
        persistence_rate: 0.85,
      },
      landCover: { built_up: 64, tree_cover: 6, shrubland: 4, grassland: 3, cropland: 8, bare: 12, water: 3, wetland: 0 },
      weather: { wind_speed_ms: 3.5, wind_direction_deg: 200, temperature_c: 29.0, humidity_pct: 70, precipitation_mm: 0 },
      facility: { name: "Sabarmati Gas Distribution Terminal & Gate Station", type: "Gas Distribution", distance_m: 220, overlap: true },
      cluster: { detection_count: 16, overpass_count: 11, spatial_spread_km2: 0.12, centroid_drift_rate: 0, growth_direction: null },
    },
    {
      id: "HS-AHM-003",
      district: "Ahmedabad",
      state: "Gujarat",
      class: "Acute Industrial Fire",
      classColor: "#ff4444",
      lat: 23.088,
      lng: 72.671,
      satellite: {
        sensor: "VIIRS",
        spacecraft: "NOAA-21",
        acq_date: "2026-09-12",
        acq_time: "02:12",
        bright_ti4: 376.4,
        bright_ti5: 301.2,
        delta_t: 75.2,
        scan: 0.39,
        track: 0.36,
        confidence: "h",
        frp: 138.5,
        daynight: "N",
        version: "2.0NRT",
      },
      baseline: {
        median_frp: 41.2,
        mad_frp: 8.0,
        robust_deviation: 12.16,
        days_seen_30d: 3,
        days_seen_365d: 54,
        persistence_rate: 0.15,
      },
      landCover: { built_up: 70, tree_cover: 4, shrubland: 2, grassland: 2, cropland: 6, bare: 14, water: 2, wetland: 0 },
      weather: { wind_speed_ms: 4.6, wind_direction_deg: 225, temperature_c: 28.6, humidity_pct: 72, precipitation_mm: 0 },
      facility: { name: "Naroda Industrial Estate Recycling & Storage Facility", type: "Industrial Processing", distance_m: 90, overlap: true },
      cluster: { detection_count: 4, overpass_count: 2, spatial_spread_km2: 0.38, centroid_drift_rate: 18, growth_direction: 225 },
    },
  ],
  Dhanbad: [
    {
      id: "HS-DHN-001",
      district: "Dhanbad",
      state: "Jharkhand",
      class: "Acute Industrial Fire",
      classColor: "#ff4444",
      lat: 23.754,
      lng: 86.418,
      satellite: {
        sensor: "VIIRS",
        spacecraft: "NOAA-20",
        acq_date: "2026-09-12",
        acq_time: "01:24",
        bright_ti4: 382.4,
        bright_ti5: 302.1,
        delta_t: 80.3,
        scan: 0.39,
        track: 0.36,
        confidence: "h",
        frp: 168.2,
        daynight: "N",
        version: "2.0NRT",
      },
      baseline: {
        median_frp: 72.4,
        mad_frp: 11.2,
        robust_deviation: 8.55,
        days_seen_30d: 14,
        days_seen_365d: 195,
        persistence_rate: 0.53,
      },
      landCover: { built_up: 45, tree_cover: 6, shrubland: 10, grassland: 4, cropland: 8, bare: 25, water: 2, wetland: 0 },
      weather: { wind_speed_ms: 3.8, wind_direction_deg: 180, temperature_c: 27.5, humidity_pct: 76, precipitation_mm: 0 },
      facility: { name: "Jharia Coalfield Seam Fire Anomaly Zone (BCCL Sector 4)", type: "Coal Seam / Open Cast Mine", distance_m: 0, overlap: true },
      cluster: { detection_count: 12, overpass_count: 6, spatial_spread_km2: 0.65, centroid_drift_rate: 8, growth_direction: 180 },
    },
    {
      id: "HS-DHN-002",
      district: "Dhanbad",
      state: "Jharkhand",
      class: "Persistent Industrial Heat",
      classColor: "#3a9fff",
      lat: 23.792,
      lng: 86.368,
      satellite: {
        sensor: "VIIRS",
        spacecraft: "Suomi-NPP",
        acq_date: "2026-09-12",
        acq_time: "00:42",
        bright_ti4: 351.6,
        bright_ti5: 298.5,
        delta_t: 53.1,
        scan: 0.39,
        track: 0.36,
        confidence: "h",
        frp: 94.6,
        daynight: "N",
        version: "2.0NRT",
      },
      baseline: {
        median_frp: 88.2,
        mad_frp: 9.8,
        robust_deviation: 0.65,
        days_seen_30d: 29,
        days_seen_365d: 352,
        persistence_rate: 0.96,
      },
      landCover: { built_up: 58, tree_cover: 4, shrubland: 6, grassland: 3, cropland: 5, bare: 22, water: 2, wetland: 0 },
      weather: { wind_speed_ms: 3.1, wind_direction_deg: 170, temperature_c: 28.1, humidity_pct: 74, precipitation_mm: 0 },
      facility: { name: "Moonidih Coal Washery & Thermal Power Terminal", type: "Coal Washery & Power", distance_m: 110, overlap: true },
      cluster: { detection_count: 24, overpass_count: 15, spatial_spread_km2: 0.14, centroid_drift_rate: 0, growth_direction: null },
    },
    {
      id: "HS-DHN-003",
      district: "Dhanbad",
      state: "Jharkhand",
      class: "Persistent Industrial Heat",
      classColor: "#3a9fff",
      lat: 23.715,
      lng: 86.442,
      satellite: {
        sensor: "VIIRS",
        spacecraft: "NOAA-21",
        acq_date: "2026-09-12",
        acq_time: "02:08",
        bright_ti4: 344.2,
        bright_ti5: 297.8,
        delta_t: 46.4,
        scan: 0.39,
        track: 0.36,
        confidence: "n",
        frp: 62.8,
        daynight: "N",
        version: "2.0NRT",
      },
      baseline: {
        median_frp: 58.4,
        mad_frp: 7.2,
        robust_deviation: 0.61,
        days_seen_30d: 27,
        days_seen_365d: 328,
        persistence_rate: 0.90,
      },
      landCover: { built_up: 52, tree_cover: 6, shrubland: 5, grassland: 4, cropland: 6, bare: 25, water: 2, wetland: 0 },
      weather: { wind_speed_ms: 2.8, wind_direction_deg: 190, temperature_c: 27.2, humidity_pct: 78, precipitation_mm: 0 },
      facility: { name: "Dhanbad Coke Plant & Slag Sintering Unit", type: "Metallurgical Coke", distance_m: 180, overlap: true },
      cluster: { detection_count: 18, overpass_count: 12, spatial_spread_km2: 0.11, centroid_drift_rate: 0, growth_direction: null },
    },
  ],
};

// ── Master Location Definitions ───────────────────────────────────────────────
const MONITORING_PLACES = [
  { id: "all", name: "All Monitoring Hubs (National)", state: "All India", focus: "Comprehensive Multi-District Scan", count: 23 },
  { id: "jamnagar", name: "Jamnagar", state: "Gujarat", focus: "Coastal Petroleum & Refining Belt", count: 6 },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", focus: "Dense Urban–Industrial Interface", count: 3 },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", focus: "Post-Monsoon Agriculture & Stubble", count: 4 },
  { id: "dhanbad", name: "Dhanbad", state: "Jharkhand", focus: "Coalfield & Deep Thermal Seams", count: 3 },
  { id: "surat", name: "Surat", state: "Gujarat", focus: "Hazira Petrochemical & LNG Complex", count: 2 },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", focus: "Refining Cluster & SGNP Forest Border", count: 3 },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", focus: "Manali Petrochemical & Rural Buffer", count: 2 },
];

const RISK_META = {
  Critical: { color: "#ff4444", bg: "rgba(255,68,68,0.12)", border: "rgba(255,68,68,0.35)", icon: ShieldAlert, label: "Critical Risk" },
  High:     { color: "#ff9559", bg: "rgba(255,149,89,0.12)", border: "rgba(255,149,89,0.35)", icon: ShieldAlert, label: "High Risk" },
  Moderate: { color: "#f5a623", bg: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.35)", icon: AlertTriangle, label: "Moderate Risk" },
  Low:      { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", icon: CheckCircle2, label: "Low Risk" },
};

export default function SmartAnalyser({ feed, manager, initialArea }) {
  // Determine initial district based on manager or initialArea
  const initialPlaceId = useMemo(() => {
    if (manager?.district) {
      const match = MONITORING_PLACES.find((p) => p.name.toLowerCase() === manager.district.toLowerCase());
      if (match) return match.id;
    }
    if (initialArea?.id) {
      const match = MONITORING_PLACES.find((p) => p.id === initialArea.id);
      if (match) return match.id;
    }
    return "jamnagar";
  }, [manager, initialArea]);

  const [selectedPlaceId, setSelectedPlaceId] = useState(initialPlaceId);
  const [analyzedPlaceId, setAnalyzedPlaceId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simProgress, setSimProgress] = useState(0);

  // Table filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [sortBy, setSortBy] = useState("frp-desc");

  // Selected hotspot for Telemetry Dossier Modal
  const [activeDossier, setActiveDossier] = useState(null);

  // Human Review Decisions Store (persisted to localStorage)
  const [decisions, setDecisions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tg_smart_analyser_decisions_v1")) || {};
    } catch {
      return {};
    }
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Compile raw hotspots for a given place ID
  const getRawHotspotsForPlace = (placeId) => {
    const base = {
      ...ALL_HOTSPOTS_BY_DISTRICT,
      ...SUPPLEMENTAL_HOTSPOTS,
    };

    if (placeId === "all") {
      return Object.values(base).flat();
    }

    const placeObj = MONITORING_PLACES.find((p) => p.id === placeId);
    if (!placeObj) return [];

    return base[placeObj.name] || [];
  };

  // Run XGBoost prediction on hotspots
  const analyzedDataset = useMemo(() => {
    if (!analyzedPlaceId) return [];
    const raw = getRawHotspotsForPlace(analyzedPlaceId);

    return raw.map((hs) => {
      const featVector = featuresFromHotspot(hs);
      const prediction = predict(featVector);
      const userDecision = decisions[hs.id] || {
        status: "Pending Review",
        analystNote: "",
        updatedAt: null,
      };

      return {
        hotspot: hs,
        features: featVector,
        prediction,
        decision: userDecision,
      };
    });
  }, [analyzedPlaceId, decisions]);

  // Simulation runner
  const runSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);
    setSimProgress(15);

    const t1 = setTimeout(() => {
      setSimStep(2);
      setSimProgress(45);
    }, 550);

    const t2 = setTimeout(() => {
      setSimStep(3);
      setSimProgress(75);
    }, 1100);

    const t3 = setTimeout(() => {
      setSimStep(4);
      setSimProgress(95);
    }, 1650);

    const t4 = setTimeout(() => {
      setSimProgress(100);
      setIsSimulating(false);
      setAnalyzedPlaceId(selectedPlaceId);
      showToast(`XGBoost Analysis completed for ${MONITORING_PLACES.find((p) => p.id === selectedPlaceId)?.name}`);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const handlePlaceChange = (e) => {
    const newId = e.target.value;
    setSelectedPlaceId(newId);
  };

  // Filter and Sort Table Rows
  const filteredRows = useMemo(() => {
    let list = analyzedDataset.filter((item) => {
      const hs = item.hotspot;
      const pred = item.prediction;

      // Risk filter
      if (riskFilter !== "All" && pred.label !== riskFilter) return false;

      // Class filter
      if (classFilter !== "All" && hs.class !== classFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const str = `${hs.id} ${hs.district} ${hs.state} ${hs.facility?.name} ${hs.class} ${pred.label}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      const frpA = a.hotspot.satellite?.frp || 0;
      const frpB = b.hotspot.satellite?.frp || 0;
      const scoreA = a.prediction.score || 0;
      const scoreB = b.prediction.score || 0;
      const devA = a.hotspot.baseline?.robust_deviation || 0;
      const devB = b.hotspot.baseline?.robust_deviation || 0;

      if (sortBy === "frp-desc") return frpB - frpA;
      if (sortBy === "frp-asc") return frpA - frpB;
      if (sortBy === "conf-desc") return scoreB - scoreA;
      if (sortBy === "dev-desc") return devB - devA;
      if (sortBy === "id-asc") return a.hotspot.id.localeCompare(b.hotspot.id);
      return 0;
    });

    return list;
  }, [analyzedDataset, riskFilter, classFilter, searchQuery, sortBy]);

  // Aggregate statistics for the current analyzed place
  const stats = useMemo(() => {
    const counts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    let totalFrp = 0;
    let totalScore = 0;

    analyzedDataset.forEach((item) => {
      const label = item.prediction.label;
      counts[label] = (counts[label] || 0) + 1;
      totalFrp += item.hotspot.satellite?.frp || 0;
      totalScore += item.prediction.score || 0;
    });

    const total = analyzedDataset.length || 1;
    return {
      counts,
      total: analyzedDataset.length,
      meanFrp: (totalFrp / total).toFixed(1),
      avgConfidence: Math.round((totalScore / total) * 100),
    };
  }, [analyzedDataset]);

  // Handle human review decision update
  const handleSaveDecision = (hotspotId, status, note) => {
    const updated = {
      ...decisions,
      [hotspotId]: {
        status,
        analystNote: note,
        updatedAt: new Date().toISOString(),
        analyst: manager?.name || "Senior Duty Analyst",
      },
    };
    setDecisions(updated);
    try {
      localStorage.setItem("tg_smart_analyser_decisions_v1", JSON.stringify(updated));
    } catch {}

    showToast(`Decision saved for ${hotspotId}: ${status}`);
    setActiveDossier((prev) => (prev && prev.hotspot.id === hotspotId ? { ...prev, decision: updated[hotspotId] } : prev));
  };

  // Export full table evidence as CSV
  const exportEvidenceTable = () => {
    if (!analyzedDataset.length) return;
    const headers = [
      "Hotspot_ID",
      "District",
      "State",
      "Facility_Name",
      "Facility_Type",
      "Coordinates_Lat",
      "Coordinates_Lng",
      "Satellite_Sensor",
      "Acquisition_UTC",
      "FRP_MW",
      "Brightness_TI4_K",
      "Delta_T_K",
      "Robust_Deviation_Sigma",
      "Persistence_Rate",
      "Source_Classification",
      "XGBoost_Risk_Level",
      "Model_Confidence_Pct",
      "Human_Review_Status",
      "Analyst_Rationale",
    ];

    const rows = analyzedDataset.map((item) => {
      const hs = item.hotspot;
      const p = item.prediction;
      const d = item.decision;
      return [
        `"${hs.id}"`,
        `"${hs.district}"`,
        `"${hs.state}"`,
        `"${hs.facility?.name || ""}"`,
        `"${hs.facility?.type || ""}"`,
        hs.lat,
        hs.lng,
        `"${hs.satellite?.sensor} / ${hs.satellite?.spacecraft}"`,
        `"${hs.satellite?.acq_date} ${hs.satellite?.acq_time}"`,
        hs.satellite?.frp,
        hs.satellite?.bright_ti4,
        hs.satellite?.delta_t,
        hs.baseline?.robust_deviation,
        hs.baseline?.persistence_rate,
        `"${hs.class}"`,
        `"${p.label}"`,
        (p.score * 100).toFixed(1),
        `"${d.status}"`,
        `"${d.analystNote.replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const selectedName = MONITORING_PLACES.find((p) => p.id === analyzedPlaceId)?.name || "thermal-analysis";
    link.href = url;
    link.download = `thermalguard-xgboost-${selectedName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Evidence spreadsheet exported successfully.");
  };

  const selectedPlace = MONITORING_PLACES.find((p) => p.id === selectedPlaceId);
  const isSelectedAnalyzed = analyzedPlaceId === selectedPlaceId;

  return (
    <div className="smart-analyser-container">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="analyser-toast">
          <CheckCircle2 size={16} color="#55d4f5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Location Selector & Execution Header ──────────────────────────── */}
      <section className="analyser-control-card">
        <div className="analyser-control-top">
          <div className="analyser-brand-tag">
            <div className="pulse-icon-box">
              <BrainCircuit size={20} color="#55d4f5" />
            </div>
            <div>
              <h2>XGBoost Diagnostic & Decision Engine</h2>
              <p>Gradient-boosted decision trees fused with VIIRS 375m radiance, ERA5 meteorology, and land cover baselines.</p>
            </div>
          </div>

          {/* Place Selection Dropdown */}
          <div className="place-select-group">
            <label htmlFor="monitoring-place-select">
              <MapPin size={15} color="#55d4f5" />
              <span>Select Monitoring Hub:</span>
            </label>
            <div className="select-wrapper">
              <select
                id="monitoring-place-select"
                value={selectedPlaceId}
                onChange={handlePlaceChange}
                disabled={isSimulating}
              >
                {MONITORING_PLACES.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name} ({place.state}) — {place.count} Spots
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Place Metadata Pill & Action Row */}
        <div className="analyser-action-bar">
          <div className="place-meta-pill">
            <span className="dot-active" />
            <strong>{selectedPlace?.name}</strong>
            <span className="divider">·</span>
            <span>{selectedPlace?.focus}</span>
            <span className="divider">·</span>
            <span className="badge-count">{selectedPlace?.count} Sat Tracks</span>
          </div>

          <button
            className={`btn-run-analysis ${isSimulating ? "running" : ""} ${isSelectedAnalyzed ? "re-run" : "fresh"}`}
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <RefreshCw size={16} className="spin-slow" />
                <span>Processing XGBoost Telemetry...</span>
              </>
            ) : isSelectedAnalyzed ? (
              <>
                <RefreshCw size={16} />
                <span>Re-run Diagnostic Simulation</span>
              </>
            ) : (
              <>
                <Cpu size={16} />
                <span>Run Smart XGBoost Analysis</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── High-Tech Simulation Screen ──────────────────────────────────── */}
      {isSimulating && (
        <section className="simulation-overlay-card">
          <div className="simulation-grid">
            <div className="radar-scanner">
              <div className="radar-circle radar-c1" />
              <div className="radar-circle radar-c2" />
              <div className="radar-circle radar-c3" />
              <div className="radar-sweep" />
              <div className="radar-blip b1" />
              <div className="radar-blip b2" />
              <div className="radar-blip b3" />
            </div>

            <div className="simulation-content">
              <div className="sim-header">
                <span className="live-telemetry-badge">
                  <Radio size={12} className="pulse-fast" /> SATELLITE TELEMETRY INGESTION PIPELINE
                </span>
                <h3>Analyzing {selectedPlace?.name} Thermal Extent</h3>
              </div>

              <div className="sim-progress-track">
                <div className="sim-progress-bar" style={{ width: `${simProgress}%` }} />
              </div>

              <ul className="sim-stages-list">
                <li className={simStep >= 1 ? (simStep === 1 ? "active" : "done") : "waiting"}>
                  <span className="stage-num">01</span>
                  <div className="stage-info">
                    <strong>VIIRS 375m I-Band Radiance Ingestion</strong>
                    <small>Reading Channel 4 (3.74µm) and Channel 5 (11.45µm) brightness temperatures...</small>
                  </div>
                  {simStep > 1 && <Check size={14} color="#22c55e" />}
                </li>

                <li className={simStep >= 2 ? (simStep === 2 ? "active" : "done") : "waiting"}>
                  <span className="stage-num">02</span>
                  <div className="stage-info">
                    <strong>ESA WorldCover Land Use & ERA5 Wind Dispersion Vector Fusion</strong>
                    <small>Extracting 10m land cover raster and boundary overlay...</small>
                  </div>
                  {simStep > 2 && <Check size={14} color="#22c55e" />}
                </li>

                <li className={simStep >= 3 ? (simStep === 3 ? "active" : "done") : "waiting"}>
                  <span className="stage-num">03</span>
                  <div className="stage-info">
                    <strong>Evaluating 80 Gradient-Boosted Decision Trees (19 Dimensions)</strong>
                    <small>Evaluating tree split margins: Robust Dev, Persistence Rate, ΔT, Centroid Drift...</small>
                  </div>
                  {simStep > 3 && <Check size={14} color="#22c55e" />}
                </li>

                <li className={simStep >= 4 ? (simStep === 4 ? "active" : "done") : "waiting"}>
                  <span className="stage-num">04</span>
                  <div className="stage-info">
                    <strong>Consensus Risk Classification & Decision Evidence Compilation</strong>
                    <small>Generating confidence scores and formatting human review dossier...</small>
                  </div>
                  {simProgress === 100 && <Check size={14} color="#22c55e" />}
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── Unanalyzed Placeholder State ─────────────────────────────────── */}
      {!analyzedPlaceId && !isSimulating && (
        <section className="analyser-idle-card">
          <div className="idle-icon-wrap">
            <Cpu size={36} color="#55d4f5" />
          </div>
          <h3>Diagnostic Telemetry Ready for {selectedPlace?.name}</h3>
          <p>
            The XGBoost Decision Engine has indexed <strong>{selectedPlace?.count} thermal hotspots</strong> across the{" "}
            <strong>{selectedPlace?.focus}</strong>. Click the <strong>“Run Smart XGBoost Analysis”</strong> button above to
            commence multi-spectral anomaly scoring and structured evidence synthesis.
          </p>
          <button className="btn-run-analysis fresh" onClick={runSimulation}>
            <Cpu size={16} />
            <span>Commence XGBoost Analysis Now</span>
          </button>
        </section>
      )}

      {/* ── Tabular Evidence Results Section ─────────────────────────────── */}
      {analyzedPlaceId && !isSimulating && (
        <div className="analyser-results-flow">
          {/* Executive Risk KPIs Row */}
          <div className="analyser-kpi-grid">
            <div className="kpi-card kpi-critical">
              <span className="kpi-label">Critical Escalations</span>
              <div className="kpi-num-row">
                <span className="kpi-num">{stats.counts.Critical}</span>
                <ShieldAlert size={18} color="#ff4444" />
              </div>
              <span className="kpi-sub">Immediate inspection candidates</span>
            </div>

            <div className="kpi-card kpi-high">
              <span className="kpi-label">High Priority</span>
              <div className="kpi-num-row">
                <span className="kpi-num">{stats.counts.High}</span>
                <AlertTriangle size={18} color="#ff9559" />
              </div>
              <span className="kpi-sub">Severe anomaly deviation</span>
            </div>

            <div className="kpi-card kpi-moderate">
              <span className="kpi-label">Moderate / Watch</span>
              <div className="kpi-num-row">
                <span className="kpi-num">{stats.counts.Moderate}</span>
                <Activity size={18} color="#f5a623" />
              </div>
              <span className="kpi-sub">Routine gas flare / harvest</span>
            </div>

            <div className="kpi-card kpi-low">
              <span className="kpi-label">Low / Baseline</span>
              <div className="kpi-num-row">
                <span className="kpi-num">{stats.counts.Low}</span>
                <CheckCircle2 size={18} color="#22c55e" />
              </div>
              <span className="kpi-sub">Continuous process heat</span>
            </div>

            <div className="kpi-card kpi-stats">
              <span className="kpi-label">Mean FRP Observed</span>
              <div className="kpi-num-row">
                <span className="kpi-num">{stats.meanFrp}</span>
                <span className="kpi-unit">MW</span>
              </div>
              <span className="kpi-sub">Cluster thermal energy</span>
            </div>

            <div className="kpi-card kpi-stats">
              <span className="kpi-label">Model Confidence</span>
              <div className="kpi-num-row">
                <span className="kpi-num">{stats.avgConfidence}%</span>
                <BrainCircuit size={18} color="#55d4f5" />
              </div>
              <span className="kpi-sub">XGBoost cross-validated</span>
            </div>
          </div>

          {/* Mandatory Human-in-the-Loop Assistive Notice */}
          <div className="human-approval-notice">
            <AlertTriangle size={18} color="#f5a623" className="flex-shrink-0" />
            <div className="notice-content">
              <strong>Human-in-the-Loop Supervisory Mandate:</strong>
              <p>
                The XGBoost Decision Engine functions strictly as an assistive advisory tool for the district thermal officer.
                Machine learning scores do not substitute for authorized human verification. Every classification and recommended
                intervention must be reviewed and formally logged by an analyst before deploying field inspection units or issuing
                regulatory notifications.
              </p>
            </div>
          </div>

          {/* Table Controls Toolbar */}
          <div className="table-controls-bar">
            {/* Search */}
            <div className="search-control">
              <Search size={15} color="rgba(255,255,255,0.4)" />
              <input
                type="text"
                placeholder="Search by ID, facility, sector, or classification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="btn-clear-search" onClick={() => setSearchQuery("")}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Risk Filter */}
            <div className="filter-pill-group">
              <span className="filter-label">Risk:</span>
              {["All", "Critical", "High", "Moderate", "Low"].map((lvl) => (
                <button
                  key={lvl}
                  className={`btn-pill ${riskFilter === lvl ? "active" : ""}`}
                  onClick={() => setRiskFilter(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Classification Filter */}
            <div className="select-control">
              <Layers size={14} color="rgba(255,255,255,0.4)" />
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="All">All Source Classes</option>
                <option value="Acute Industrial Fire">Acute Industrial Fire</option>
                <option value="Routine Gas Flare">Routine Gas Flare</option>
                <option value="Persistent Industrial Heat">Persistent Industrial Heat</option>
                <option value="Agricultural Burning">Agricultural Burning</option>
                <option value="Wildfire / Natural Fire">Wildfire / Natural Fire</option>
                <option value="Uncertain / Other">Uncertain / Other</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="select-control">
              <SlidersHorizontal size={14} color="rgba(255,255,255,0.4)" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="frp-desc">FRP: Highest First</option>
                <option value="frp-asc">FRP: Lowest First</option>
                <option value="conf-desc">Model Confidence</option>
                <option value="dev-desc">Anomaly Deviation (σ)</option>
                <option value="id-asc">Hotspot ID (A–Z)</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button className="btn-export-csv" onClick={exportEvidenceTable}>
              <Download size={14} />
              <span>Export CSV Evidence</span>
            </button>
          </div>

          {/* ── High-Fidelity Tabular Evidence Dataset ─────────────────────── */}
          <div className="table-responsive-wrapper">
            <table className="analyser-evidence-table">
              <thead>
                <tr>
                  <th>Hotspot ID & Facility</th>
                  <th>Coordinates & Extent</th>
                  <th>Satellite & Sensor</th>
                  <th>FRP & Radiance</th>
                  <th>Source Classification</th>
                  <th>XGBoost Risk Assessment</th>
                  <th>Confidence</th>
                  <th>Analyst Decision</th>
                  <th style={{ textAlign: "right" }}>Evidence Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => {
                    const hs = row.hotspot;
                    const pred = row.prediction;
                    const dec = row.decision;
                    const rMeta = RISK_META[pred.label] || RISK_META.Moderate;
                    const RiskIcon = rMeta.icon;

                    return (
                      <tr key={hs.id} className={`table-row-risk-${pred.label.toLowerCase()}`}>
                        {/* 1. Hotspot ID & Facility */}
                        <td>
                          <div className="cell-id-facility">
                            <span className="hotspot-badge">{hs.id}</span>
                            <strong className="facility-title">{hs.facility?.name || "Local Industrial Sector"}</strong>
                            <div className="facility-meta">
                              <span>{hs.facility?.type || "Industrial Complex"}</span>
                              {hs.facility?.overlap && <span className="overlap-tag">On-Site SEZ</span>}
                            </div>
                          </div>
                        </td>

                        {/* 2. Coordinates */}
                        <td>
                          <div className="cell-coordinates">
                            <span className="mono-coords">
                              {hs.lat.toFixed(4)}°N, {hs.lng.toFixed(4)}°E
                            </span>
                            <span className="sector-loc">
                              {hs.district}, {hs.state}
                            </span>
                          </div>
                        </td>

                        {/* 3. Satellite & Sensor */}
                        <td>
                          <div className="cell-satellite">
                            <span className="spacecraft-pill">
                              <Radio size={11} /> {hs.satellite?.spacecraft || "VIIRS"}
                            </span>
                            <span className="time-utc">
                              {hs.satellite?.acq_time} UTC · {hs.satellite?.acq_date}
                            </span>
                          </div>
                        </td>

                        {/* 4. FRP & Radiance */}
                        <td>
                          <div className="cell-frp">
                            <div className="frp-top">
                              <Flame size={13} color="#ff9559" />
                              <strong>{hs.satellite?.frp || hs.frp} MW</strong>
                            </div>
                            <div className="frp-bar-track">
                              <div
                                className="frp-bar-fill"
                                style={{
                                  width: `${Math.min(100, ((hs.satellite?.frp || 40) / 200) * 100)}%`,
                                  background: (hs.satellite?.frp || 40) > 120 ? "#ff4444" : "#ff9559",
                                }}
                              />
                            </div>
                            <span className="delta-t">ΔT: {hs.satellite?.delta_t || "—"} K</span>
                          </div>
                        </td>

                        {/* 5. Classification */}
                        <td>
                          <span
                            className="source-class-badge"
                            style={{
                              borderColor: `${hs.classColor || "#55d4f5"}55`,
                              color: hs.classColor || "#55d4f5",
                              backgroundColor: `${hs.classColor || "#55d4f5"}14`,
                            }}
                          >
                            {hs.class}
                          </span>
                        </td>

                        {/* 6. XGBoost Risk Assessment */}
                        <td>
                          <div
                            className="risk-assessment-pill"
                            style={{
                              color: rMeta.color,
                              backgroundColor: rMeta.bg,
                              borderColor: rMeta.border,
                            }}
                          >
                            <RiskIcon size={13} strokeWidth={2.5} />
                            <span>{pred.label} Risk</span>
                          </div>
                        </td>

                        {/* 7. Confidence */}
                        <td>
                          <div className="cell-confidence">
                            <span className="conf-num">{Math.round(pred.score * 100)}%</span>
                            <div className="conf-bar">
                              <div
                                className="conf-bar-fill"
                                style={{
                                  width: `${Math.round(pred.score * 100)}%`,
                                  backgroundColor: rMeta.color,
                                }}
                              />
                            </div>
                            <span className="dev-sigma">
                              dev: {hs.baseline?.robust_deviation ? `+${hs.baseline.robust_deviation.toFixed(1)}σ` : "normal"}
                            </span>
                          </div>
                        </td>

                        {/* 8. Analyst Decision */}
                        <td>
                          <div className="cell-decision">
                            <span
                              className={`status-pill ${
                                dec.status === "Approved by Manager"
                                  ? "st-approved"
                                  : dec.status === "Flagged for Field Check"
                                  ? "st-flagged"
                                  : dec.status === "Marked False Alarm"
                                  ? "st-rejected"
                                  : "st-pending"
                              }`}
                            >
                              {dec.status === "Approved by Manager" ? (
                                <CheckCircle2 size={11} />
                              ) : dec.status === "Flagged for Field Check" ? (
                                <AlertTriangle size={11} />
                              ) : (
                                <Clock3 size={11} />
                              )}
                              <span>{dec.status}</span>
                            </span>
                            {dec.updatedAt && (
                              <small className="analyst-tag">by {dec.analyst || "Analyst"}</small>
                            )}
                          </div>
                        </td>

                        {/* 9. Actions */}
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn-inspect-dossier"
                            onClick={() => setActiveDossier(row)}
                            title="Inspect complete telemetry evidence"
                          >
                            <Eye size={13} />
                            <span>Inspect Telemetry</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="no-records-cell">
                      <div className="empty-state-box">
                        <Search size={22} color="rgba(255,255,255,0.2)" />
                        <p>No hotspots match your active search and filter criteria.</p>
                        <button
                          className="btn-pill active"
                          onClick={() => {
                            setSearchQuery("");
                            setRiskFilter("All");
                            setClassFilter("All");
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer-status">
            <span>
              Displaying <strong>{filteredRows.length}</strong> of <strong>{analyzedDataset.length}</strong> thermal
              observations for {selectedPlace?.name}
            </span>
            <span>All coordinates derived from NASA FIRMS VIIRS 375m I-Band products</span>
          </div>
        </div>
      )}

      {/* ── Deep Telemetry Evidence Dossier Modal ──────────────────────────── */}
      {activeDossier && (
        <div className="dossier-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setActiveDossier(null)}>
          <div className="dossier-modal-window">
            {/* Modal Header */}
            <div className="dossier-modal-header">
              <div className="header-left">
                <div className="badge-group">
                  <span className="dossier-id">{activeDossier.hotspot.id}</span>
                  <span
                    className="risk-tag"
                    style={{
                      color: RISK_META[activeDossier.prediction.label]?.color,
                      backgroundColor: RISK_META[activeDossier.prediction.label]?.bg,
                      borderColor: RISK_META[activeDossier.prediction.label]?.border,
                    }}
                  >
                    {activeDossier.prediction.label} Risk · {Math.round(activeDossier.prediction.score * 100)}% Confidence
                  </span>
                </div>
                <h3>{activeDossier.hotspot.facility?.name || "Target Industrial Sector"}</h3>
                <p>
                  {activeDossier.hotspot.district}, {activeDossier.hotspot.state} · Sector: {activeDossier.hotspot.lat.toFixed(4)}°N,{" "}
                  {activeDossier.hotspot.lng.toFixed(4)}°E
                </p>
              </div>
              <button className="btn-close-modal" onClick={() => setActiveDossier(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="dossier-modal-body">
              {/* Mandatory Assistive Caution Box */}
              <div className="modal-assist-banner">
                <AlertTriangle size={16} color="#f5a623" />
                <span>
                  <strong>Advisory Decision Notice:</strong> This diagnostic evidence is compiled by gradient-boosted decision
                  trees to support the duty manager. Official district protocol requires human authorization below before issuing
                  safety notices.
                </span>
              </div>

              {/* 4 Multi-Spectral Evidence Panels */}
              <div className="dossier-quad-grid">
                {/* Panel 1: Satellite Radiance & Baseline */}
                <div className="evidence-panel">
                  <div className="panel-header">
                    <Flame size={15} color="#ff9559" />
                    <h4>VIIRS 375m Radiance & Baseline</h4>
                  </div>
                  <div className="stats-table">
                    <div className="stat-row">
                      <span>Fire Radiative Power</span>
                      <strong>{activeDossier.hotspot.satellite?.frp} MW</strong>
                    </div>
                    <div className="stat-row">
                      <span>Brightness Channel 4</span>
                      <strong>{activeDossier.hotspot.satellite?.bright_ti4} K</strong>
                    </div>
                    <div className="stat-row">
                      <span>Brightness Channel 5</span>
                      <strong>{activeDossier.hotspot.satellite?.bright_ti5} K</strong>
                    </div>
                    <div className="stat-row">
                      <span>Thermal Delta (ΔT)</span>
                      <strong>{activeDossier.hotspot.satellite?.delta_t} K</strong>
                    </div>
                    <div className="stat-row">
                      <span>30-Day Median FRP</span>
                      <strong>{activeDossier.hotspot.baseline?.median_frp || "—"} MW</strong>
                    </div>
                    <div className="stat-row">
                      <span>Robust MAD Anomaly Deviation</span>
                      <strong style={{ color: activeDossier.hotspot.baseline?.robust_deviation > 4 ? "#ff4444" : "#55d4f5" }}>
                        +{activeDossier.hotspot.baseline?.robust_deviation?.toFixed(2) || "0.00"} σ
                      </strong>
                    </div>
                    <div className="stat-row">
                      <span>Historical Persistence Rate</span>
                      <strong>{Math.round((activeDossier.hotspot.baseline?.persistence_rate || 0) * 100)}% of days</strong>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Land Cover & Spatial Extent */}
                <div className="evidence-panel">
                  <div className="panel-header">
                    <Layers size={15} color="#55d4f5" />
                    <h4>ESA WorldCover Land Use & Footprint</h4>
                  </div>
                  <div className="stats-table">
                    <div className="stat-row">
                      <span>Identified Facility</span>
                      <strong className="truncate-text">{activeDossier.hotspot.facility?.name}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Facility Category</span>
                      <strong>{activeDossier.hotspot.facility?.type}</strong>
                    </div>
                    <div className="stat-row">
                      <span>On-Site Perimeter Distance</span>
                      <strong>{activeDossier.hotspot.facility?.distance_m} meters</strong>
                    </div>
                    <div className="stat-row">
                      <span>Built-Up / Industrial %</span>
                      <strong>{activeDossier.hotspot.landCover?.built_up}%</strong>
                    </div>
                    <div className="stat-row">
                      <span>Tree & Shrub Cover %</span>
                      <strong>{(activeDossier.hotspot.landCover?.tree_cover || 0) + (activeDossier.hotspot.landCover?.shrubland || 0)}%</strong>
                    </div>
                    <div className="stat-row">
                      <span>Cropland & Grassland %</span>
                      <strong>{(activeDossier.hotspot.landCover?.cropland || 0) + (activeDossier.hotspot.landCover?.grassland || 0)}%</strong>
                    </div>
                    <div className="stat-row">
                      <span>Spatial Cluster Spread</span>
                      <strong>{activeDossier.hotspot.cluster?.spatial_spread_km2 || 0.12} km²</strong>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Meteorological Dispersion Context */}
                <div className="evidence-panel">
                  <div className="panel-header">
                    <Wind size={15} color="#c5f277" />
                    <h4>Atmospheric & Wind Dispersion (ERA5)</h4>
                  </div>
                  <div className="stats-table">
                    <div className="stat-row">
                      <span>Surface Wind Speed</span>
                      <strong>{activeDossier.hotspot.weather?.wind_speed_ms} m/s</strong>
                    </div>
                    <div className="stat-row">
                      <span>Wind Vector Bearing</span>
                      <strong>{activeDossier.hotspot.weather?.wind_direction_deg}° (Azimuth)</strong>
                    </div>
                    <div className="stat-row">
                      <span>Ambient Temperature</span>
                      <strong>{activeDossier.hotspot.weather?.temperature_c} °C</strong>
                    </div>
                    <div className="stat-row">
                      <span>Relative Humidity</span>
                      <strong>{activeDossier.hotspot.weather?.humidity_pct}%</strong>
                    </div>
                    <div className="stat-row">
                      <span>Precipitation (Last 24h)</span>
                      <strong>{activeDossier.hotspot.weather?.precipitation_mm || 0} mm</strong>
                    </div>
                    <div className="stat-row">
                      <span>Centroid Drift Rate</span>
                      <strong>{activeDossier.hotspot.cluster?.centroid_drift_rate || 0} m/overpass</strong>
                    </div>
                    <div className="stat-row">
                      <span>Plume Growth Direction</span>
                      <strong>{activeDossier.hotspot.cluster?.growth_direction ? `${activeDossier.hotspot.cluster.growth_direction}°` : "Stationary"}</strong>
                    </div>
                  </div>
                </div>

                {/* Panel 4: XGBoost Probabilities & Reasoning */}
                <div className="evidence-panel">
                  <div className="panel-header">
                    <BrainCircuit size={15} color="#55d4f5" />
                    <h4>XGBoost Multi-Class Probability Softmax</h4>
                  </div>
                  <div className="prob-bars-stack">
                    {["Critical", "High", "Moderate", "Low"].map((clsName, idx) => {
                      const prob = activeDossier.prediction.probabilities[3 - idx] || 0;
                      const pMeta = RISK_META[clsName];
                      return (
                        <div key={clsName} className="prob-item">
                          <div className="prob-label-row">
                            <span style={{ color: pMeta.color }}>{clsName} Risk</span>
                            <span className="mono-prob">{Math.round(prob * 100)}%</span>
                          </div>
                          <div className="prob-bar-base">
                            <div
                              className="prob-bar-accent"
                              style={{ width: `${Math.round(prob * 100)}%`, backgroundColor: pMeta.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="model-recommendation-box">
                    <strong>Model Rationale:</strong>
                    <p>
                      {activeDossier.prediction.label === "Critical"
                        ? "Acute heat anomaly exceeding 8σ threshold with low persistence. Ground inspection and facility emergency status check strongly recommended."
                        : activeDossier.prediction.label === "High"
                        ? "Elevated radiative output with non-routine dispersion vector. Cross-reference with factory operating schedules."
                        : activeDossier.prediction.label === "Moderate"
                        ? "Thermal signature consistent with regulated gas flaring or seasonal agricultural burning. Continue satellite overpass monitoring."
                        : "Long-term persistent industrial heat within normal operational baseline envelope. No escalation required."}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Human Approval & Formal Sign-Off Section ───────────────── */}
              <div className="modal-decision-form">
                <div className="form-heading">
                  <ShieldCheck size={18} color="#22c55e" />
                  <h4>District Manager Formal Determination</h4>
                </div>

                <div className="form-body">
                  <div className="decision-buttons-row">
                    {[
                      { status: "Approved by Manager", label: "Approve AI Assessment", color: "#22c55e" },
                      { status: "Flagged for Field Check", label: "Flag for Field Inspection", color: "#ff9559" },
                      { status: "Marked False Alarm", label: "Mark as Routine / False Alarm", color: "#f5a623" },
                    ].map((btn) => (
                      <button
                        key={btn.status}
                        className={`btn-action-choice ${activeDossier.decision.status === btn.status ? "selected" : ""}`}
                        style={{
                          borderColor: activeDossier.decision.status === btn.status ? btn.color : "rgba(255,255,255,0.1)",
                          color: activeDossier.decision.status === btn.status ? btn.color : "rgba(255,255,255,0.7)",
                          background:
                            activeDossier.decision.status === btn.status ? `${btn.color}18` : "rgba(255,255,255,0.03)",
                        }}
                        onClick={() => {
                          const note = activeDossier.decision.analystNote || `Confirmed ${btn.label} by duty officer.`;
                          handleSaveDecision(activeDossier.hotspot.id, btn.status, note);
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="analyst-notes-area">
                    <label htmlFor="analyst-notes-input">Officer Operational Notes & Rationale:</label>
                    <textarea
                      id="analyst-notes-input"
                      rows={2}
                      placeholder="Enter verification notes (e.g., Contacted Nayara control room; confirmed scheduled flare maintenance...)"
                      value={activeDossier.decision.analystNote}
                      onChange={(e) => {
                        const note = e.target.value;
                        setActiveDossier((prev) => ({
                          ...prev,
                          decision: { ...prev.decision, analystNote: note },
                        }));
                      }}
                    />
                  </div>

                  <div className="form-submit-row">
                    <button
                      className="btn-save-determination"
                      onClick={() => {
                        handleSaveDecision(
                          activeDossier.hotspot.id,
                          activeDossier.decision.status || "Approved by Manager",
                          activeDossier.decision.analystNote
                        );
                      }}
                    >
                      <Check size={14} />
                      <span>Save & Log Analyst Determination</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
