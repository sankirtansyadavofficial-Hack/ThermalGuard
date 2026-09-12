#!/usr/bin/env python3
"""
ThermalGuard Smart Analyser — XGBoost Companion Script
=======================================================
Standalone Python script that trains a real XGBoost gradient-boosted
classifier on the ThermalGuard hotspot dataset (hotspots_data.csv).

Usage:
    pip install xgboost pandas numpy scikit-learn
    python xgboost_analyser.py [path_to_csv]

If no CSV is provided it reads hotspots_data.csv from the same directory.
An additional CSV exported from the ThermalGuard website can also be provided.

Output:
    - Feature importance table
    - Risk classification report
    - Per-hotspot predictions with confidence scores
    - District-level aggregate risk summary
"""

import sys
import os
import warnings
warnings.filterwarnings("ignore")

try:
    import numpy as np
    import pandas as pd
    from xgboost import XGBClassifier
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    from sklearn.metrics import classification_report, confusion_matrix
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Install with:  pip install xgboost pandas numpy scikit-learn")
    sys.exit(1)

# ── Configuration ─────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CSV = os.path.join(SCRIPT_DIR, "hotspots_data.csv")

FEATURE_COLS = [
    "frp", "bright_ti4", "delta_t", "robust_deviation",
    "persistence_rate", "days_seen_30d", "built_up", "tree_cover",
    "cropland", "wind_speed_ms", "humidity_pct", "temperature_c",
    "detection_count", "spatial_spread_km2", "centroid_drift_rate",
    "facility_overlap",
]

# Risk label mapping from hotspot class
CLASS_TO_RISK = {
    "Acute Industrial Fire":    "Critical",
    "Wildfire / Natural Fire":  "High",
    "Agricultural Burning":     "Moderate",
    "Routine Gas Flare":        "Moderate",
    "Persistent Industrial Heat": "Low",
    "Uncertain / Other":        "Moderate",
}

RISK_ORDER = ["Low", "Moderate", "High", "Critical"]

DIVIDER = "=" * 72

def load_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    print(f"[INFO] Loaded {len(df)} records from {os.path.basename(csv_path)}")
    print(f"       Columns: {list(df.columns)}\n")
    return df

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Confidence flag: h=high, n=nominal, else=low
    if "confidence" in df.columns:
        df["conf_h"] = (df["confidence"].astype(str).str.lower() == "h").astype(int)
        df["conf_n"] = (df["confidence"].astype(str).str.lower().isin(["n","nominal"])).astype(int)
    else:
        df["conf_h"] = 0
        df["conf_n"] = 0

    # FRP ratio to median
    if "median_frp" in df.columns:
        df["frp_ratio"] = df["frp"] / df["median_frp"].replace(0, 1)
    else:
        df["frp_ratio"] = 1.0

    # Derived: robust deviation from FRP + median if not present
    if "robust_deviation" not in df.columns and "median_frp" in df.columns and "mad_frp" in df.columns:
        df["robust_deviation"] = (df["frp"] - df["median_frp"]) / df["mad_frp"].replace(0, 1)

    # Fill missing numeric columns with sensible defaults
    defaults = {
        "bright_ti4": 320, "delta_t": 20, "robust_deviation": 0,
        "persistence_rate": 0.5, "days_seen_30d": 15, "built_up": 30,
        "tree_cover": 10, "cropland": 15, "wind_speed_ms": 3,
        "humidity_pct": 65, "temperature_c": 28, "detection_count": 5,
        "spatial_spread_km2": 0.3, "centroid_drift_rate": 0, "facility_overlap": 0,
    }
    for col, val in defaults.items():
        if col not in df.columns:
            df[col] = val
        else:
            df[col] = df[col].fillna(val)

    return df

def build_risk_label(df: pd.DataFrame) -> pd.Series:
    """Derive risk label from hotspot class column if present."""
    if "class" in df.columns:
        return df["class"].map(CLASS_TO_RISK).fillna("Moderate")
    # Heuristic from numeric features
    def heuristic(row):
        frp, rd, pr = row.get("frp", 0), row.get("robust_deviation", 0), row.get("persistence_rate", 0.5)
        if frp >= 150 and rd >= 8:
            return "Critical"
        if frp >= 60 and rd >= 4:
            return "High"
        if pr >= 0.75:
            return "Low"
        return "Moderate"
    return df.apply(heuristic, axis=1)

def train_model(X: np.ndarray, y: np.ndarray, feature_names: list):
    le = LabelEncoder()
    le.fit(RISK_ORDER)
    y_enc = le.transform(y)

    model = XGBClassifier(
        n_estimators=80,
        max_depth=3,
        learning_rate=0.3,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="multi:softprob",
        num_class=4,
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
    )

    # Cross-validation (StratifiedKFold with as many folds as smallest class count)
    min_class_count = min(np.bincount(y_enc))
    n_splits = max(2, min(5, min_class_count))
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y_enc, cv=cv, scoring="accuracy")

    # Final fit on full dataset
    model.fit(X, y_enc)

    return model, le, cv_scores

def print_results(model, le, df, X, y, feature_names, cv_scores):
    y_pred_enc = model.predict(X)
    y_pred = le.inverse_transform(y_pred_enc)
    y_enc  = le.transform(y)
    probs  = model.predict_proba(X)

    print(DIVIDER)
    print("  THERMALGUARD — XGBOOST SMART ANALYSER REPORT")
    print(DIVIDER)
    print(f"  Records analysed  : {len(df)}")
    print(f"  Features used     : {len(feature_names)}")
    print(f"  XGBoost estimators: {model.n_estimators}")
    print(f"  Cross-val accuracy : {cv_scores.mean():.1%} ± {cv_scores.std():.1%} ({len(cv_scores)}-fold CV)")
    print()

    # ── Feature Importance ────────────────────────────────────────
    print(DIVIDER)
    print("  FEATURE IMPORTANCE (by gain)")
    print(DIVIDER)
    importances = model.feature_importances_
    fi = sorted(zip(feature_names, importances), key=lambda x: -x[1])
    for name, imp in fi:
        bar = "█" * int(imp * 60)
        print(f"  {name:<28} {imp:.4f}  {bar}")
    print()

    # ── Classification Report ─────────────────────────────────────
    print(DIVIDER)
    print("  CLASSIFICATION REPORT")
    print(DIVIDER)
    labels_present = [l for l in RISK_ORDER if l in y]
    print(classification_report(y, y_pred, labels=labels_present, zero_division=0))

    # ── Confusion Matrix ──────────────────────────────────────────
    print(DIVIDER)
    print("  CONFUSION MATRIX  (rows=actual, cols=predicted)")
    print(DIVIDER)
    cm = confusion_matrix(y, y_pred, labels=RISK_ORDER)
    header = "           " + "  ".join(f"{l:>9}" for l in RISK_ORDER)
    print(header)
    for i, row_label in enumerate(RISK_ORDER):
        row_str = "  ".join(f"{v:>9}" for v in cm[i])
        print(f"  {row_label:<9}  {row_str}")
    print()

    # ── Per-hotspot Predictions ───────────────────────────────────
    print(DIVIDER)
    print("  PER-HOTSPOT PREDICTIONS  (confidence = model probability)")
    print(DIVIDER)
    id_col   = "id"       if "id"       in df.columns else df.columns[0]
    dist_col = "district" if "district" in df.columns else None

    for i, (_, row) in enumerate(df.iterrows()):
        hs_id   = row.get(id_col, f"row-{i+1}")
        dist    = row.get(dist_col, "—") if dist_col else "—"
        cls     = row.get("class", "—")
        actual  = y.iloc[i]
        pred    = y_pred[i]
        conf    = probs[i][RISK_ORDER.index(pred)] * 100
        match   = "✓" if actual == pred else "✗"
        print(f"  {match} {hs_id:<16} {dist:<12} {cls:<26} → {pred:<10} ({conf:.1f}%)")
    print()

    # ── District Summary ──────────────────────────────────────────
    if "district" in df.columns:
        print(DIVIDER)
        print("  DISTRICT RISK SUMMARY")
        print(DIVIDER)
        df_out = df.copy()
        df_out["predicted_risk"] = y_pred
        df_out["risk_score"] = [RISK_ORDER.index(r) for r in y_pred]
        by_dist = df_out.groupby("district").agg(
            hotspots=("risk_score", "count"),
            avg_frp=("frp", "mean"),
            max_frp=("frp", "max"),
            avg_risk_score=("risk_score", "mean"),
            critical_count=("predicted_risk", lambda x: (x == "Critical").sum()),
            high_count=("predicted_risk", lambda x: (x == "High").sum()),
        ).sort_values("avg_risk_score", ascending=False)

        print(f"  {'District':<14} {'Spots':>5} {'AvgFRP':>7} {'MaxFRP':>7} {'AvgRisk':>8} {'Critical':>9} {'High':>5}")
        print(f"  {'-'*14} {'-'*5} {'-'*7} {'-'*7} {'-'*8} {'-'*9} {'-'*5}")
        for dist, r in by_dist.iterrows():
            risk_label = RISK_ORDER[min(3, int(round(r.avg_risk_score)))]
            print(f"  {dist:<14} {int(r.hotspots):>5} {r.avg_frp:>7.1f} {r.max_frp:>7.1f} {risk_label:>8} {int(r.critical_count):>9} {int(r.high_count):>5}")
        print()

    # ── Disclaimer ────────────────────────────────────────────────
    print(DIVIDER)
    print("  ⚠  IMPORTANT — HUMAN APPROVAL REQUIRED")
    print(DIVIDER)
    print("  This report is produced by an automated XGBoost model and is")
    print("  intended to ASSIST district managers, not to replace them.")
    print("  All predictions must be reviewed and approved by a qualified")
    print("  analyst before any operational action is taken.")
    print("  Model uncertainty is inherent — treat confidence scores < 70%")
    print("  as indicative only and escalate for manual review.")
    print(DIVIDER)

def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSV

    if not os.path.exists(csv_path):
        print(f"[ERROR] CSV not found: {csv_path}")
        sys.exit(1)

    df  = load_data(csv_path)
    df  = engineer_features(df)
    y   = build_risk_label(df)

    feature_names = FEATURE_COLS + ["conf_h", "conf_n", "frp_ratio"]
    available = [f for f in feature_names if f in df.columns]
    X = df[available].values

    model, le, cv_scores = train_model(X, y, available)
    print_results(model, le, df, X, y, available, cv_scores)

if __name__ == "__main__":
    main()
