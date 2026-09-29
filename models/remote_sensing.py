"""OreSight — Remote Sensing / Space Intelligence Module.

Generates synthetic Earth-observation surface indicators that feed the
Space Intelligence layer — the PRIMARY evidence layer in OreSight.

ROLE IN THE PIPELINE
--------------------
  EARTH OBSERVATION  ←── this module
         ↓
  SPATIAL INTELLIGENCE
         ↓
  GEOLOGICAL FUSION  (PRISM: Ordinary Kriging)
         ↓
  RESOURCE INTELLIGENCE  (PRISM output)
         ↓
  OPERATIONAL INTELLIGENCE  (EAR)
         ↓
  PREDICTIVE INTELLIGENCE  (PULSE)
         ↓
  DECISION INTELLIGENCE  (NUDGE)

SURFACE INDICATORS PRODUCED
----------------------------
  NDVI                  Vegetation anomaly (stress over mineralised zones)
  Iron Oxide Index      Fe-rich gossans / altered soils above Mn deposits
  Clay / Alteration     Hydroxyl SWIR absorption — weathered profile
  NDWI / Soil Moisture  Drainage anomaly over buried ore zones
  Surface Reflectance   Broadband albedo proxy
  Slope (°)             DEM-derived terrain steepness
  Aspect (°)            DEM-derived slope orientation
  Spectral Anomaly      Multiband deviation from background
  Mineralisation Score  Composite EO-derived prospectivity (0–1)

IMPORTANT DISCLAIMER
--------------------
All layers are SYNTHETIC, calibrated from the borehole grade distribution
via IDW interpolation to simulate real spectral-geology correlations.
NOT derived from real Sentinel-2 / ISRO Bhuvan imagery.
Architecture is integration-ready for real EO feeds.

OUTPUTS
-------
  satellite_indicators.json   mine-level EO summary + layer stats + targets
  satellite_grid.csv          spatial grid (208 cells, 50 m resolution)
  satellite_observations.json structured EO observation records for the API
"""

from __future__ import annotations
import json, math
from pathlib import Path
import numpy as np
import pandas as pd

_ROOT = Path(__file__).resolve().parent.parent
_OUT  = _ROOT / "models" / "output"
_RAW  = _ROOT / "data" / "raw"
_OUT.mkdir(parents=True, exist_ok=True)

RNG_SEED        = 42
MN_CUTOFF       = 20.0
GRID_RESOLUTION = 50   # metres
N_TARGETS       = 5


# ── helpers ──────────────────────────────────────────────────────────────────

def _load_boreholes() -> pd.DataFrame:
    return pd.read_csv(_RAW / "boreholes.csv")

def _load_blocks() -> pd.DataFrame:
    return pd.read_csv(_RAW / "blocks.csv")

def _load_reserve_summary() -> dict:
    p = _OUT / "reserve_summary.json"
    return json.loads(p.read_text()) if p.exists() else {}


# ── spatial grid generation ───────────────────────────────────────────────────

def generate_eo_grid(rng: np.random.Generator) -> pd.DataFrame:
    """Build a 50 m spatial grid and assign synthetic EO indicator values."""
    bh = _load_boreholes()
    bl = _load_blocks()

    x_min, x_max = bl["x"].min(), bl["x"].max()
    y_min, y_max = bl["y"].min(), bl["y"].max()

    xs = np.arange(x_min, x_max + GRID_RESOLUTION, GRID_RESOLUTION)
    ys = np.arange(y_min, y_max + GRID_RESOLUTION, GRID_RESOLUTION)
    grid = pd.DataFrame([(xi, yi) for xi in xs for yi in ys], columns=["grid_x", "grid_y"])

    # IDW grade proxy — higher grade proxy → stronger mineralisation signal
    def idw(gx, gy, power=2.0):
        d = np.sqrt((bh["x"] - gx)**2 + (bh["y"] - gy)**2) + 1.0
        w = 1.0 / d**power
        return float(np.dot(w, bh["Mn_pct"]) / w.sum())

    grade_proxy = np.array([idw(r.grid_x, r.grid_y) for r in grid.itertuples()])
    gp_norm = (grade_proxy - grade_proxy.min()) / (grade_proxy.max() - grade_proxy.min() + 1e-9)

    # Terrain proxy: elevation varies with spatial position
    z_vals = bl["z"].values
    z_mean, z_std = z_vals.mean(), z_vals.std()

    noise = rng.normal(0, 0.04, len(grid))

    # Spectral bands ─────────────────────────────────────────────────────────
    ndvi             = np.clip(0.55 - 0.30 * gp_norm + noise * 1.2, 0.05, 0.90)
    iron_oxide_idx   = np.clip(0.25 + 0.50 * gp_norm + noise * 0.8, 0.05, 0.95)
    clay_alter_idx   = np.clip(0.30 + 0.35 * gp_norm + noise * 0.9, 0.05, 0.85)
    soil_moisture    = np.clip(0.45 - 0.20 * gp_norm + noise * 1.0, 0.05, 0.80)
    surface_refl     = np.clip(0.18 + 0.22 * gp_norm + noise * 0.5, 0.05, 0.65)

    # Terrain (DEM proxy) ────────────────────────────────────────────────────
    # Synthetic slope: higher near mineralised zones (rougher terrain)
    slope_deg  = np.clip(8  + 18 * gp_norm + rng.normal(0, 2, len(grid)), 1, 45)
    aspect_deg = np.mod(rng.uniform(0, 360, len(grid)), 360)

    # Spectral anomaly: deviation from scene background (normalised)
    spectral_anom = np.clip(np.abs(iron_oxide_idx - iron_oxide_idx.mean()) +
                            np.abs(clay_alter_idx  - clay_alter_idx.mean()), 0, 1)
    spectral_anom = (spectral_anom - spectral_anom.min()) / (spectral_anom.max() - spectral_anom.min() + 1e-9)

    # Composite mineralisation score ─────────────────────────────────────────
    mineralisation_score = np.clip(0.40 * iron_oxide_idx +
                                   0.35 * clay_alter_idx +
                                   0.25 * (1 - ndvi), 0, 1)

    # Cloud cover (synthetic — mostly clear, occasional partial cover)
    cloud_cover = np.clip(rng.beta(1.5, 8, len(grid)), 0, 0.4)

    # Satellite confidence: higher confidence where cloud_cover is low
    sat_confidence = np.clip(1 - cloud_cover * 2 + rng.normal(0, 0.05, len(grid)), 0.3, 1.0)

    # Approx lat/lon for DEMO-01 (Balaghat region, synthetic offset)
    lat_base, lon_base = 21.83, 80.35
    grid["latitude"]  = lat_base  + (grid["grid_y"] - grid["grid_y"].mean()) / 111000
    grid["longitude"] = lon_base  + (grid["grid_x"] - grid["grid_x"].mean()) / (111000 * math.cos(math.radians(lat_base)))
    grid["elevation_m"]         = np.round(z_mean + z_std * gp_norm + rng.normal(0, 5, len(grid)), 1)
    grid["ndvi"]                = np.round(ndvi,             4)
    grid["iron_oxide_idx"]      = np.round(iron_oxide_idx,   4)
    grid["clay_alter_idx"]      = np.round(clay_alter_idx,   4)
    grid["soil_moisture"]       = np.round(soil_moisture,    4)
    grid["surface_reflectance"] = np.round(surface_refl,     4)
    grid["slope_deg"]           = np.round(slope_deg,        2)
    grid["aspect_deg"]          = np.round(aspect_deg,       1)
    grid["spectral_anomaly"]    = np.round(spectral_anom,    4)
    grid["mineralisation_score"]= np.round(mineralisation_score, 4)
    grid["cloud_cover"]         = np.round(cloud_cover,      3)
    grid["satellite_confidence"]= np.round(sat_confidence,   3)
    grid["grade_proxy_mn"]      = np.round(grade_proxy,      2)

    top_idx = np.argsort(mineralisation_score)[::-1][:N_TARGETS]
    grid["surface_target"] = False
    grid.loc[top_idx, "surface_target"] = True

    return grid


# ── summary JSON ─────────────────────────────────────────────────────────────

def build_summary(grid: pd.DataFrame) -> dict:
    targets = (grid[grid["surface_target"]]
               .sort_values("mineralisation_score", ascending=False)
               .head(N_TARGETS))

    target_list = [
        {
            "rank":                  int(i + 1),
            "latitude":              round(float(r.latitude), 6),
            "longitude":             round(float(r.longitude), 6),
            "grid_x":                float(r.grid_x),
            "grid_y":                float(r.grid_y),
            "elevation_m":           float(r.elevation_m),
            "mineralisation_score":  round(float(r.mineralisation_score), 4),
            "iron_oxide_idx":        round(float(r.iron_oxide_idx), 4),
            "clay_alter_idx":        round(float(r.clay_alter_idx), 4),
            "ndvi":                  round(float(r.ndvi), 4),
            "spectral_anomaly":      round(float(r.spectral_anomaly), 4),
            "slope_deg":             round(float(r.slope_deg), 2),
            "satellite_confidence":  round(float(r.satellite_confidence), 3),
            "grade_proxy_mn":        round(float(r.grade_proxy_mn), 2),
        }
        for i, (_, r) in enumerate(targets.iterrows())
    ]

    reserve = _load_reserve_summary()

    def layer_stat(col, desc):
        return {
            "mean": round(float(grid[col].mean()), 4),
            "std":  round(float(grid[col].std()),  4),
            "min":  round(float(grid[col].min()),  4),
            "max":  round(float(grid[col].max()),  4),
            "description": desc,
        }

    return {
        "module":   "space_intelligence",
        "mine_id":  "DEMO-01",
        "eo_platform": "Simulated Earth Observation — DEMO-01",
        "provenance": (
            "Synthetic calibrated EO indicators. Spatial patterns derived from "
            "borehole grade distribution via IDW. NOT real satellite imagery. "
            "Integration-ready for Sentinel-2 / ISRO Bhuvan / Landsat-8 / SRTM DEM."
        ),
        "status":             "prototype_synthetic",
        "grid_resolution_m":  GRID_RESOLUTION,
        "grid_cells":         int(len(grid)),
        "surface_targets":    int(N_TARGETS),
        "mean_mineralisation":round(float(grid["mineralisation_score"].mean()), 4),
        "mean_confidence":    round(float(grid["satellite_confidence"].mean()), 4),
        "integration_ready":  [
            "ESA Copernicus Sentinel-2 MSI (10–20 m, 13 bands)",
            "ISRO Bhuvan Resourcesat-2A LISS-IV (2.5 m, 4 bands)",
            "USGS Landsat-8/9 OLI (30 m, 11 bands)",
            "SRTM / ALOS Digital Elevation Model (30 m)",
            "Sentinel-1 SAR (10 m, C-band, all-weather)",
        ],
        "layer_statistics": {
            "ndvi":               layer_stat("ndvi",             "Vegetation anomaly — depressed over mineralised/altered zones"),
            "iron_oxide_idx":     layer_stat("iron_oxide_idx",   "Iron oxide spectral index — elevated over Fe-Mn gossans"),
            "clay_alter_idx":     layer_stat("clay_alter_idx",   "Clay/alteration index — hydroxyl absorption in SWIR"),
            "soil_moisture":      layer_stat("soil_moisture",    "NDWI-derived soil moisture — drainage anomaly proxy"),
            "surface_reflectance":layer_stat("surface_reflectance","Broadband surface albedo — bare soil / rock exposure"),
            "slope_deg":          layer_stat("slope_deg",        "DEM-derived slope (degrees) — terrain steepness"),
            "spectral_anomaly":   layer_stat("spectral_anomaly", "Multiband deviation from scene background"),
            "mineralisation_score":layer_stat("mineralisation_score","Composite EO mineralisation score (0–1)"),
            "satellite_confidence":layer_stat("satellite_confidence","Observation confidence (1 = cloud-free, high quality)"),
        },
        "top_eo_targets": target_list,
        "geological_integration": {
            "borehole_count":   int(len(_load_boreholes())),
            "ore_boreholes":    int((_load_boreholes()["Mn_pct"] >= MN_CUTOFF).sum()),
            "declared_reserve_t": reserve.get("declared_reserve_t"),
        },
        "key_disclaimer": (
            "EO surface indicators provide spatial and spectral intelligence only. "
            "They do NOT directly detect subsurface manganese ore. "
            "Subsurface evidence is provided by borehole assays and Ordinary Kriging. "
            "Both evidence streams are fused in the Resource Mapping stage."
        ),
        "processing_stack_implemented":     ["NumPy", "Pandas"],
        "processing_stack_integration_ready": ["GDAL", "Rasterio", "GeoPandas", "Google Earth Engine Python API"],
    }


# ── satellite_observations.json ───────────────────────────────────────────────
# Structured per-cell observation records — richer than the grid CSV,
# matches the satellite_observations.csv column schema.

def build_observations(grid: pd.DataFrame) -> list[dict]:
    """Return a list of structured EO observation dicts, one per grid cell."""
    obs = []
    for _, r in grid.iterrows():
        obs.append({
            "cell_id":              f"OBS-{int(r.grid_x):04d}-{int(r.grid_y):04d}",
            "latitude":             round(float(r.latitude),  6),
            "longitude":            round(float(r.longitude), 6),
            "elevation_m":          round(float(r.elevation_m), 1),
            "iron_oxide_idx":       round(float(r.iron_oxide_idx), 4),
            "clay_alter_idx":       round(float(r.clay_alter_idx), 4),
            "ndvi":                 round(float(r.ndvi), 4),
            "surface_reflectance":  round(float(r.surface_reflectance), 4),
            "slope_deg":            round(float(r.slope_deg), 2),
            "aspect_deg":           round(float(r.aspect_deg), 1),
            "spectral_anomaly":     round(float(r.spectral_anomaly), 4),
            "mineralisation_score": round(float(r.mineralisation_score), 4),
            "cloud_cover":          round(float(r.cloud_cover), 3),
            "satellite_confidence": round(float(r.satellite_confidence), 3),
            "is_target":            bool(r.surface_target),
        })
    return obs


# ── entry point ───────────────────────────────────────────────────────────────

def run_remote_sensing():
    print("=" * 60)
    print("OreSight — Space Intelligence / Remote Sensing Module")
    print("=" * 60)
    rng = np.random.default_rng(RNG_SEED)

    print("Generating Earth-observation indicator grid …")
    grid = generate_eo_grid(rng)
    print(f"  Grid cells:        {len(grid)}")
    print(f"  Surface targets:   {grid['surface_target'].sum()}")
    print(f"  Mean mineralisation score: {grid['mineralisation_score'].mean():.3f}")
    print(f"  Mean confidence:   {grid['satellite_confidence'].mean():.3f}")

    print("\nBuilding summary …")
    summary = build_summary(grid)

    print("Building observation records …")
    observations = build_observations(grid)

    # ── write outputs ─────────────────────────────────────────────────────────
    grid_path  = _OUT / "satellite_grid.csv"
    summ_path  = _OUT / "satellite_indicators.json"
    obs_path   = _OUT / "satellite_observations.json"

    grid.to_csv(grid_path, index=False)

    with open(summ_path, "w") as f:
        json.dump(summary, f, indent=2)

    with open(obs_path, "w") as f:
        json.dump({"observations": observations, "count": len(observations),
                   "provenance": summary["provenance"]}, f, indent=2)

    # Also write satellite_observations.csv (matches the column schema)
    obs_df = pd.DataFrame(observations)
    obs_df.to_csv(_OUT / "satellite_observations.csv", index=False)

    print(f"\n  Written: {grid_path.name}")
    print(f"  Written: {summ_path.name}")
    print(f"  Written: {obs_path.name}")
    print(f"  Written: satellite_observations.csv")

    print("\nTop EO anomaly targets:")
    for t in summary["top_eo_targets"]:
        print(f"  #{t['rank']}  ({t['latitude']:.4f}°N, {t['longitude']:.4f}°E)"
              f"  score={t['mineralisation_score']:.3f}"
              f"  IOI={t['iron_oxide_idx']:.3f}"
              f"  conf={t['satellite_confidence']:.3f}")

    print("\n" + "=" * 60)
    print("DISCLAIMER: Synthetic EO data. NOT real satellite imagery.")
    print("Integration-ready for Sentinel-2 / ISRO Bhuvan / Landsat.")
    print("=" * 60)
    return grid, summary


if __name__ == "__main__":
    run_remote_sensing()
