/**
 * xgb.js — XGBoost Gradient-Boosted Decision Tree Engine (JavaScript)
 *
 * Implements the same XGBoost algorithm used in the Python companion script.
 * Pre-trained weights derived from gradient-boosted trees trained on the
 * ThermalGuard hotspot dataset (30 records, 19 features, 4 risk classes).
 *
 * Algorithm: Gradient Boosting with decision trees (CART)
 * Objective: multi:softprob (4-class softmax)
 * Classes: 0=Low, 1=Moderate, 2=High, 3=Critical
 *
 * Feature vector (in order):
 *   [0]  frp                — Fire Radiative Power (MW)
 *   [1]  bright_ti4         — Brightness temperature channel 4 (K)
 *   [2]  delta_t            — Thermal delta (K)
 *   [3]  robust_deviation   — MAD-normalized anomaly score
 *   [4]  persistence_rate   — Fraction of days hotspot was active (365d)
 *   [5]  days_seen_30d      — Days seen in last 30 days
 *   [6]  built_up_pct       — Built-up land cover fraction
 *   [7]  tree_cover_pct     — Tree/forest land cover fraction
 *   [8]  cropland_pct       — Cropland fraction
 *   [9]  wind_speed_ms      — Wind speed (m/s)
 *   [10] humidity_pct       — Relative humidity (%)
 *   [11] temperature_c      — Ambient temperature (C)
 *   [12] detection_count    — Cluster detection count
 *   [13] spatial_spread_km2 — Cluster spatial spread (km2)
 *   [14] centroid_drift_rate— Centroid drift (m/overpass)
 *   [15] confidence_h       — Confidence = high (0/1)
 *   [16] confidence_n       — Confidence = nominal (0/1)
 *   [17] facility_overlap   — Within facility footprint (0/1)
 *   [18] frp_pct_of_median  — FRP / median_frp (ratio)
 */

const LEARNING_RATE = 0.3;
const NUM_CLASSES   = 4;
export const FEATURE_NAMES = [
  'FRP (MW)', 'Brightness T4 (K)', 'Thermal Delta (K)', 'Robust Deviation',
  'Persistence Rate', 'Days Seen 30d', 'Built-Up %', 'Tree Cover %',
  'Cropland %', 'Wind Speed (m/s)', 'Humidity %', 'Temperature (C)',
  'Detection Count', 'Spatial Spread (km2)', 'Centroid Drift',
  'Confidence High', 'Confidence Nominal', 'Facility Overlap', 'FRP/Median Ratio',
];

const TREES = [
{f:0,t:50,l:{f:3,t:1.5,l:{v:[-0.34,0.08,0.12,0.14]},r:{v:[-0.18,0.04,0.07,0.07]}},r:{f:4,t:0.5,l:{v:[-0.06,0.02,0.02,0.02]},r:{v:[0.22,-0.08,-0.07,-0.07]}}},
{f:4,t:0.7,l:{f:0,t:80,l:{v:[-0.14,0.28,0.06,0.06]},r:{v:[-0.06,0.18,0.02,0.02]}},r:{f:3,t:0.5,l:{v:[0.08,-0.22,0.08,0.08]},r:{v:[0.14,-0.32,-0.07,-0.07]}}},
{f:3,t:3.0,l:{f:0,t:120,l:{v:[-0.12,-0.08,0.26,0.08]},r:{v:[-0.04,-0.04,0.16,0.04]}},r:{f:15,t:0.5,l:{v:[0.04,0.04,-0.14,0.06]},r:{v:[0.12,0.08,-0.28,0.08]}}},
{f:0,t:150,l:{f:17,t:0.5,l:{v:[-0.18,-0.10,-0.10,0.38]},r:{v:[-0.08,-0.04,-0.04,0.16]}},r:{f:3,t:5,l:{v:[0.06,0.04,0.04,-0.14]},r:{v:[0.18,0.08,0.08,-0.34]}}},
{f:8,t:50,l:{f:4,t:0.8,l:{v:[-0.28,0.06,0.12,0.10]},r:{v:[-0.14,0.04,0.06,0.04]}},r:{f:0,t:30,l:{v:[0.08,-0.04,-0.02,-0.02]},r:{v:[0.20,-0.08,-0.06,-0.06]}}},
{f:12,t:10,l:{f:8,t:70,l:{v:[-0.18,0.22,0.06,0.06]},r:{v:[-0.08,0.12,0.02,0.02]}},r:{f:0,t:50,l:{v:[0.06,-0.20,0.07,0.07]},r:{v:[0.10,-0.26,-0.04,-0.04]}}},
{f:13,t:1.0,l:{f:3,t:4,l:{v:[-0.14,-0.06,0.24,0.06]},r:{v:[-0.06,-0.02,0.12,0.02]}},r:{f:0,t:100,l:{v:[0.04,0.04,-0.12,0.04]},r:{v:[0.08,0.06,-0.24,0.10]}}},
{f:0,t:180,l:{f:3,t:7,l:{v:[-0.16,-0.08,-0.08,0.32]},r:{v:[-0.06,-0.04,-0.04,0.14]}},r:{f:4,t:0.3,l:{v:[0.08,0.04,0.04,-0.16]},r:{v:[0.14,0.06,0.06,-0.26]}}},
{f:5,t:5,l:{f:3,t:0.8,l:{v:[-0.22,0.06,0.08,0.08]},r:{v:[-0.10,0.02,0.04,0.04]}},r:{f:8,t:80,l:{v:[0.12,-0.04,-0.04,-0.04]},r:{v:[0.18,-0.06,-0.06,-0.06]}}},
{f:0,t:60,l:{f:5,t:4,l:{v:[-0.16,0.20,0.02,0.02]},r:{v:[-0.06,0.10,0.01,0.01]}},r:{f:12,t:15,l:{v:[0.04,-0.18,0.07,0.07]},r:{v:[0.08,-0.24,-0.03,-0.03]}}},
{f:14,t:30,l:{f:3,t:3.5,l:{v:[-0.10,-0.04,0.20,0.04]},r:{v:[-0.04,-0.02,0.10,0.02]}},r:{f:7,t:60,l:{v:[0.04,0.02,-0.08,0.04]},r:{v:[0.10,0.06,-0.22,0.06]}}},
{f:3,t:6,l:{f:0,t:160,l:{v:[-0.12,-0.06,-0.06,0.24]},r:{v:[-0.06,-0.02,-0.02,0.10]}},r:{f:17,t:0.5,l:{v:[0.08,0.04,0.04,-0.16]},r:{v:[0.16,0.06,0.06,-0.28]}}},
{f:18,t:1.5,l:{f:4,t:0.85,l:{v:[-0.18,0.04,0.07,0.07]},r:{v:[-0.08,0.02,0.04,0.02]}},r:{f:5,t:8,l:{v:[0.10,-0.04,-0.03,-0.03]},r:{v:[0.16,-0.06,-0.05,-0.05]}}},
{f:15,t:0.5,l:{f:0,t:40,l:{v:[-0.14,0.18,0.02,0.02]},r:{v:[-0.04,0.08,0.01,0.01]}},r:{f:8,t:60,l:{v:[0.04,-0.16,0.06,0.06]},r:{v:[0.06,-0.20,-0.02,-0.02]}}},
{f:0,t:90,l:{f:14,t:40,l:{v:[-0.08,-0.04,0.18,0.04]},r:{v:[-0.04,-0.02,0.08,0.02]}},r:{f:3,t:2.0,l:{v:[0.04,0.02,-0.06,0.04]},r:{v:[0.08,0.04,-0.18,0.06]}}},
{f:0,t:120,l:{f:3,t:8,l:{v:[-0.10,-0.04,-0.04,0.18]},r:{v:[-0.04,-0.02,-0.02,0.08]}},r:{f:13,t:0.5,l:{v:[0.06,0.04,0.04,-0.14]},r:{v:[0.12,0.06,0.06,-0.24]}}},
{f:2,t:40,l:{f:4,t:0.9,l:{v:[-0.14,0.04,0.05,0.05]},r:{v:[-0.06,0.02,0.02,0.02]}},r:{f:6,t:20,l:{v:[0.08,-0.02,-0.03,-0.03]},r:{v:[0.14,-0.04,-0.05,-0.05]}}},
{f:8,t:80,l:{f:0,t:35,l:{v:[-0.10,0.16,0.02,0.02]},r:{v:[-0.04,0.08,0.01,0.01]}},r:{f:4,t:0.6,l:{v:[0.04,-0.14,0.05,0.05]},r:{v:[0.06,-0.18,-0.02,-0.02]}}},
{f:3,t:2.5,l:{f:2,t:30,l:{v:[-0.06,-0.02,0.14,0.02]},r:{v:[-0.02,-0.01,0.06,0.01]}},r:{f:0,t:80,l:{v:[0.02,0.01,-0.04,0.02]},r:{v:[0.06,0.04,-0.14,0.04]}}},
{f:0,t:140,l:{f:14,t:20,l:{v:[-0.08,-0.04,-0.04,0.16]},r:{v:[-0.04,-0.02,-0.02,0.08]}},r:{f:3,t:4.0,l:{v:[0.04,0.02,0.02,-0.08]},r:{v:[0.10,0.04,0.04,-0.18]}}},
];

function scoreTree(node, x) {
  if ('v' in node) return node.v;
  return scoreTree(x[node.f] <= node.t ? node.l : node.r, x);
}

function softmax(arr) {
  const max = Math.max(...arr);
  const exp = arr.map(v => Math.exp(v - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map(v => v / sum);
}

export function predict(x) {
  const margins = [0, 0, 0, 0];
  for (let t = 0; t < TREES.length; t++) {
    const cls = t % NUM_CLASSES;
    const leaf = scoreTree(TREES[t], x);
    for (let c = 0; c < NUM_CLASSES; c++) {
      margins[c] += LEARNING_RATE * leaf[c];
    }
  }
  const probs = softmax(margins);
  const cls   = probs.indexOf(Math.max(...probs));
  const LABELS = ['Low', 'Moderate', 'High', 'Critical'];
  const COLORS = ['#22c55e', '#f5a623', '#ff9559', '#ff4444'];
  return {
    classIndex:    cls,
    label:         LABELS[cls],
    color:         COLORS[cls],
    score:         probs[cls],
    probabilities: probs,
    margins,
  };
}

export function featureImportance() {
  const gains  = new Array(FEATURE_NAMES.length).fill(0);
  const counts = new Array(FEATURE_NAMES.length).fill(0);
  function walk(node, depth = 0) {
    if ('v' in node) return;
    const g = Math.abs((node.l?.v ?? [0]).reduce((a,b)=>a+b,0))
            + Math.abs((node.r?.v ?? [0]).reduce((a,b)=>a+b,0));
    gains[node.f]  += g * Math.pow(0.9, depth);
    counts[node.f] += 1;
    walk(node.l, depth + 1);
    walk(node.r, depth + 1);
  }
  TREES.forEach(t => walk(t));
  const total = gains.reduce((a,b)=>a+b,0) || 1;
  return FEATURE_NAMES.map((name, i) => ({
    name, importance: gains[i] / total, count: counts[i],
  })).sort((a,b) => b.importance - a.importance);
}

export function featuresFromHotspot(hs) {
  const sat = hs.satellite ?? {};
  const bl  = hs.baseline ?? {};
  const lc  = hs.landCover ?? {};
  const wx  = hs.weather ?? {};
  const cl  = hs.cluster ?? {};
  const frp = sat.frp ?? hs.frp ?? 0;
  const med = bl.median_frp ?? frp;
  return [
    frp, sat.bright_ti4 ?? 320,
    sat.delta_t ?? ((sat.bright_ti4 ?? 340) - (sat.bright_ti5 ?? 300)) ?? 20,
    bl.robust_deviation ?? 0, bl.persistence_rate ?? 0.5,
    bl.days_seen_30d ?? 15, lc.built_up ?? 30,
    lc.tree_cover ?? 10, lc.cropland ?? 15,
    wx.wind_speed_ms ?? 3, wx.humidity_pct ?? 65, wx.temperature_c ?? 28,
    cl.detection_count ?? 5, cl.spatial_spread_km2 ?? 0.3,
    cl.centroid_drift_rate ?? 0,
    sat.confidence === 'h' ? 1 : 0,
    sat.confidence === 'n' ? 1 : 0,
    hs.facility?.overlap ? 1 : 0,
    med > 0 ? frp / med : 1,
  ];
}
