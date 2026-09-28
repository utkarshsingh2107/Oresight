"""OreSight — Remote Sensing Surface Indicator Module.

Generates surface indicators from satellite-derived spectral features and
integrates them with the geological spatial context (borehole / block model).

PURPOSE
-------
Satellite imagery provides *surface-level spatial context*:
  - Vegetation anomalies  (NDVI depressions over mineralised zones)
  - Iron-oxide signatures (SWIR / red-edge ratios)
  - Clay / alteration     (SWIR clay index)
  - Soil moisture         (NDWI / moisture index)
  - Terrain               (slope, aspect from DEM)

These surface indicators do NOT directly detect subsurface manganese ore.
They provide spatial evidence that *complements* borehole / assay data during
reserve identification.  Subsurface reserve estimation remains grounded in
borehole composites and Ordinary Kriging (PRISM module).

PROTOTYPE STATUS
----------------
This module generates *synthetic, calibrated* surface indicator layers for
DEMO-01.  The spatial patterns are seeded from the known borehole grade
distribution so the indicators are correlated with geology — as they would be
in a real remote-sensing workflow — but they are NOT derived from actual
satellite imagery.

Real-world integration path:
  - ISRO Bhuvan / Resourcesat-2A LISS-IV  (2.5 m, 4-band)
  - ESA Copernicus Sentinel-2 MSI          (10-20 m, 13-band)
  - USGS Landsat-8/9 OLI                   (30 m, 11-band)
  Preprocessing: GDAL / Rasterio — marked "Integration Ready" in TECH.md.

OUTPUTS (written to models/output/)
-------------------------------------
  satellite_indicators.json   — mine-level summary + layer statistics
  satellite_grid.csv          — spatial grid with per-cell indicator values

Run:
    python models/remote_sensing.py
"""

from __future__ import annotations

import json
import math
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_ROOT   = Path(__file__).resolve().parent.parent
_OUT    = _ROOT / "models" / "output"
_RAW    = _ROOT / "data" / "raw"
_OUT.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
RNG_SEED        = 42
MN_CUTOFF       = 20.0        # ore/waste cutoff (%)
GRID_RESOLUTION = 50          # metres per cell — synthetic spatial grid
N_SURFACE_ANOMALY_TARGETS = 5 # how many high-prospectivity surface targets to flag

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_boreholes() -> pd.DataFrame:
    return pd.read_csv(_RAW / "boreholes.csv")

def _load_blocks() -> pd.DataFrame:
    return pd.read_csv(_RAW / "blocks.csv")

def _load_reserve_summary() -> dict:
    p = _OUT / "reserve_summary.json"
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return {}


# ---------------------------------------------------------------------------
# Core: generate spatial surface-indicator grid
# ---------------------------------------------------------------------------

def generate_surface_indicators(rng: np.random.Generator) -> pd.DataFrame:
    """
    Build a 2-D spatial grid covering the mine area and assign synthetic
    surface indicator values to each cell.

    Indicator design rationale
    --------------------------
    The synthetic patterns are deliberately correlated with the underlying
    grade field (interpolated from boreholes) to mimic real remote-sensing
    relationships:

      NDVI (Normalised Difference Vegetation Index)
        Real: vegetation stress / suppression over mineralised / altered zones.
        Synthetic: negatively correlated with Mn grade proxy.

      Iron Oxide Index (IOI)
        Real: Fe-rich surface soils / gossans associated with Mn mineralisation.
        Synthetic: positively correlated with Mn grade proxy.

      Clay / Alteration Index (CAI)
        Real: clay minerals in weathered profile above ore zones.
        Synthetic: moderately correlated with Mn grade proxy.

      NDWI (Normalised Difference Water Index / moisture)
        Real: soil moisture anomalies over buried ore may be measurable.
        Synthetic: weakly anti-correlated (ore zones are well-drained).

      Prospectivity Score
        Composite surface indicator: weighted combination of IOI + CAI − NDVI.
        Ranges 0–1. Does not prove ore — it flags areas warranting ground-truth.

    DISCLAIMER: These relationships are simplified and synthetic. In a real
    deployment, spectral indices would be computed from calibrated satellite
    radiance data using validated band-ratio formulas.
    """
    bh = _load_boreholes()
    bl = _load_blocks()

    x_min, x_max = bl["x"].min(), bl["x"].max()
    y_min, y_max = bl["y"].min(), bl["y"].max()

    xs = np.arange(x_min, x_max + GRID_RESOLUTION, GRID_RESOLUTION)
    ys = np.arange(y_min, y_max + GRID_RESOLUTION, GRID_RESOLUTION)

    rows = []
    for xi in xs:
        for yi in ys:
            rows.append({"grid_x": xi, "grid_y": yi})
    grid = pd.DataFrame(rows)

    # Build a simple grade proxy for each cell using inverse-distance to boreholes
    ore_bh = bh[bh["Mn_pct"] >= MN_CUTOFF]
    all_bh = bh.copy()
    all_bh["mid_z"] = all_bh["collar_z"] - all_bh["depth"] / 2.0

    def _idw_mn(gx: float, gy: float, power: float = 2.0) -> float:
        dists = np.sqrt((all_bh["x"] - gx) ** 2 + (all_bh["y"] - gy) ** 2) + 1.0
        weights = 1.0 / (dists ** power)
        return float(np.dot(weights, all_bh["Mn_pct"]) / weights.sum())

    grade_proxy = np.array([_idw_mn(r.grid_x, r.grid_y) for r in grid.itertuples()])

    # Normalise grade proxy to [0,1]
    gp_min, gp_max = grade_proxy.min(), grade_proxy.max()
    gp_norm = (grade_proxy - gp_min) / (gp_max - gp_min + 1e-9)

    # ── Generate spectral indices with controlled noise ───────────────────
    noise = rng.normal(0, 0.04, size=len(grid))

    # NDVI: high over vegetation, depressed over mineralised/bare zones
    # Inverted relationship with grade proxy
    ndvi_base = 0.55 - 0.30 * gp_norm
    ndvi = np.clip(ndvi_base + noise * 1.2, 0.05, 0.90)

    # Iron Oxide Index: elevated over Fe-Mn gossans
    ioi_base = 0.25 + 0.50 * gp_norm
    ioi = np.clip(ioi_base + noise * 0.8, 0.05, 0.95)

    # Clay / Alteration Index: moderate correlation with mineralisation
    cai_base = 0.30 + 0.35 * gp_norm
    cai = np.clip(cai_base + noise * 0.9, 0.05, 0.85)

    # Soil Moisture (NDWI proxy): slight negative correlation
    ndwi_base = 0.45 - 0.20 * gp_norm
    ndwi = np.clip(ndwi_base + noise * 1.0, 0.05, 0.80)

    # Composite prospectivity score (0-1): surface evidence strength
    prosp = np.clip(0.40 * ioi + 0.35 * cai + 0.25 * (1 - ndvi), 0, 1)

    grid["ndvi"]           = np.round(ndvi, 4)
    grid["iron_oxide_idx"] = np.round(ioi,  4)
    grid["clay_alter_idx"] = np.round(cai,  4)
    grid["soil_moisture"]  = np.round(ndwi, 4)
    grid["prosp_score"]    = np.round(prosp, 4)
    grid["grade_proxy_mn"] = np.round(grade_proxy, 2)

    # Flag top-N surface anomaly targets
    top_idx = np.argsort(prosp)[::-1][:N_SURFACE_ANOMALY_TARGETS]
    grid["surface_target"] = False
    grid.loc[top_idx, "surface_target"] = True

    return grid


# ---------------------------------------------------------------------------
# Core: build summary JSON
# ---------------------------------------------------------------------------

def build_summary(grid: pd.DataFrame) -> dict:
    targets = grid[grid["surface_target"]].copy()
    target_list = []
    for rank, (_, row) in enumerate(
        targets.sort_values("prosp_score", ascending=False).iterrows(), start=1
    ):
        target_list.append({
            "rank":            rank,
            "grid_x":          float(row["grid_x"]),
            "grid_y":          float(row["grid_y"]),
            "prosp_score":     float(row["prosp_score"]),
            "iron_oxide_idx":  float(row["iron_oxide_idx"]),
            "clay_alter_idx":  float(row["clay_alter_idx"]),
            "ndvi":            float(row["ndvi"]),
            "soil_moisture":   float(row["soil_moisture"]),
            "grade_proxy_mn":  float(row["grade_proxy_mn"]),
        })

    reserve = _load_reserve_summary()

    summary = {
        "module":   "remote_sensing",
        "mine_id":  "DEMO-01",
        "provenance": (
            "Synthetic calibrated surface indicators for DEMO-01. "
            "Spatial patterns derived from borehole grade distribution via IDW. "
            "NOT derived from real satellite imagery. "
            "Architecture is integration-ready for Sentinel-2 / ISRO Bhuvan / Landsat."
        ),
        "status": "prototype_synthetic",
        "integration_ready": ["Sentinel-2 MSI (ESA Copernicus)", "ISRO Bhuvan Resourcesat-2A", "Landsat-8/9 OLI (USGS)"],
        "grid_resolution_m": GRID_RESOLUTION,
        "grid_cells": int(len(grid)),
        "surface_targets_flagged": int(N_SURFACE_ANOMALY_TARGETS),
        "layer_statistics": {
            "ndvi":           {"mean": round(float(grid["ndvi"].mean()), 3),
                               "std":  round(float(grid["ndvi"].std()),  3),
                               "description": "Normalised Difference Vegetation Index — depressed over mineralised zones"},
            "iron_oxide_idx": {"mean": round(float(grid["iron_oxide_idx"].mean()), 3),
                               "std":  round(float(grid["iron_oxide_idx"].std()),  3),
                               "description": "Iron oxide spectral index — elevated over Fe-Mn gossans and altered soils"},
            "clay_alter_idx": {"mean": round(float(grid["clay_alter_idx"].mean()), 3),
                               "std":  round(float(grid["clay_alter_idx"].std()),  3),
                               "description": "Clay / alteration index — hydroxyl absorption in SWIR bands"},
            "soil_moisture":  {"mean": round(float(grid["soil_moisture"].mean()), 3),
                               "std":  round(float(grid["soil_moisture"].std()),  3),
                               "description": "Soil moisture proxy — NDWI-derived surface water content"},
            "prosp_score":    {"mean": round(float(grid["prosp_score"].mean()), 3),
                               "std":  round(float(grid["prosp_score"].std()),  3),
                               "description": "Composite surface prospectivity score (0–1); higher = stronger surface anomaly"},
        },
        "top_surface_targets": target_list,
        "key_disclaimer": (
            "Surface indicators provide spatial context and surface evidence only. "
            "They do NOT directly detect subsurface manganese ore. "
            "Subsurface reserve estimation is based on borehole composites and "
            "Ordinary Kriging (PRISM module). These two evidence streams are "
            "complementary, not substitutes."
        ),
        "data_sources_implemented": ["Synthetic borehole-calibrated surface indicators"],
        "data_sources_integration_ready": [
            "ESA Copernicus Sentinel-2 Level-2A (10–20 m multispectral)",
            "ISRO Bhuvan Resourcesat-2A LISS-IV (2.5 m)",
            "USGS Landsat-8/9 OLI (30 m)",
            "SRTM / ALOS DEM (30 m terrain)",
        ],
        "processing_stack_implemented": ["NumPy", "Pandas"],
        "processing_stack_integration_ready": ["GDAL", "Rasterio", "GeoPandas", "Google Earth Engine Python API"],
        "geological_integration": {
            "borehole_count":  int(len(pd.read_csv(_RAW / "boreholes.csv"))),
            "ore_boreholes":   int((pd.read_csv(_RAW / "boreholes.csv")["Mn_pct"] >= MN_CUTOFF).sum()),
            "declared_reserve_t": reserve.get("declared_reserve_t"),
        },
    }
    return summary


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run_remote_sensing():
    print("=" * 60)
    print("OreSight — Remote Sensing Surface Indicator Module")
    print("=" * 60)
    rng = np.random.default_rng(RNG_SEED)

    print("Generating surface indicator grid …")
    grid = generate_surface_indicators(rng)
    print(f"  Grid cells: {len(grid)}")
    print(f"  Surface targets flagged: {grid['surface_target'].sum()}")
    print(f"  Mean prospectivity score: {grid['prosp_score'].mean():.3f}")

    print("\nBuilding summary …")
    summary = build_summary(grid)

    # Write outputs
    grid_path    = _OUT / "satellite_grid.csv"
    summary_path = _OUT / "satellite_indicators.json"

    grid.to_csv(grid_path, index=False)
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  Written: {grid_path.name}")
    print(f"  Written: {summary_path.name}")

    print("\nTop surface anomaly targets:")
    for t in summary["top_surface_targets"]:
        print(f"  #{t['rank']}  ({t['grid_x']:.0f}, {t['grid_y']:.0f})  "
              f"prosp={t['prosp_score']:.3f}  IOI={t['iron_oxide_idx']:.3f}")

    print("\n" + "=" * 60)
    print("DISCLAIMER: Synthetic prototype. Not real satellite data.")
    print("Integration-ready for Sentinel-2 / ISRO Bhuvan / Landsat.")
    print("=" * 60)
    return grid, summary


if __name__ == "__main__":
    run_remote_sensing()
