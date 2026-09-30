# OreSight — UI/UX Design Specification

**Design system:** Stitch "Industrial Precision"
**Frontend stack:** React 18 · Vite 5 · Inter font · CSS custom properties
**Status:** Active — migrated to Stitch tokens as of commit `5a4b2cf`

This file is the authoritative design reference for all future UI development.
Stitch defines the visual language. Existing OreSight defines the functionality, data, API contracts and business logic.

---

## 1. Product Identity & Brand Voice

**Product name:** OreSight
**Tagline:** Space-Enabled Mine Intelligence
**Logo:** SVG — satellite orbital trajectory (blue dashed ellipse) around a 3D ore block (amber isometric cube) with a precision crosshair. Source in `stitch_oresight_ui_redesign/code.html`.

**Brand voice:**
- Technical, precise, instrument-grade.
- No decorative language. No marketing hyperbole.
- Every label serves operational visibility.
- Numbers are the primary content. Text is contextual support.
- Treat the user as a mine engineer or decision-maker under operational pressure.

**What OreSight is NOT:**
- Not a consumer dashboard.
- Not a geospatial exploration tool.
- Not a satellite imagery viewer.
- Not a general analytics platform.

---

## 2. Visual Design Principles (Stitch "Industrial Precision")

1. **Instrument-grade restraint.** Every element earns its place. Remove decoration before adding it.
2. **Calm authority.** Dark slate base minimises eye fatigue. High-consequence decisions require visual stability.
3. **Precision data layering.** Use tonal containment, subtle borders and deliberate contrast intervals — not vivid gradients.
4. **Functional colour semantics.** Amber = primary action / recommendation. Blue = spatial / EO / forecast data. Green = feasible / positive. Yellow = caution. Red = critical / hazard.
5. **Typography first.** Numbers are the product. Make them instantly readable.

---

## 3. Colour Palette

All tokens are defined as CSS custom properties in `frontend/src/styles/global.css`.

### Canvas & Surface

| Token | HEX | Purpose |
|---|---|---|
| `--bg-page` | `#0f141b` | Application background / base canvas |
| `--bg-card` | `#171c23` | Primary card / panel background (Z1) |
| `--bg-card-alt` | `#1b2027` | Secondary container / hover wells / table stripes |

### Borders

| Token | HEX | Purpose |
|---|---|---|
| `--border` | `#30353d` | Standard structural separator |
| `--border-light` | `#252a32` | Subtle interior dividers |
| `--border-active` | `#484f58` | Focus / active input / selected container |

### Text

| Token | HEX | Purpose |
|---|---|---|
| `--text-primary` | `#dee2ec` | Primary content |
| `--text-secondary` | `#8b949e` | Supporting labels, sub-values |
| `--text-muted` | `#484f58` | Disabled / ghost / inactive |

### Brand Primary — Amber

| Token | HEX | Purpose |
|---|---|---|
| `--primary` | `#ffb77d` | Primary accent — CTAs, recommended actions, tab active |
| `--primary-dim` | `#d97707` | Primary container — button backgrounds, card borders |
| `--primary-dark` | `#b45309` | Active / pressed state |

> **DESIGN RULE:** Amber is used exclusively for primary calls to action, key operational recommendations, and active state transitions. Never use amber for passive decoration.

### Technical Secondary — Blue

| Token | HEX | Purpose |
|---|---|---|
| `--accent` | `#93ccff` | Spatial / EO / forecast data, telemetry metrics, charts |
| `--accent-dim` | `#3198dc` | Secondary container |

> **DESIGN RULE:** Blue is reserved for spatial coordinates, EO indicators, forecast lines, and ML projections. It is the data colour, not the action colour.

### Semantic Colours

| Token | HEX | Purpose |
|---|---|---|
| `--green` | `#4ae176` | Feasible / accessible / positive delta |
| `--green-dim` | `#00a74b` | Green card border |
| `--yellow` | `#f59e0b` | Caution / threshold / non-blocking advisory |
| `--red` | `#ef4444` | Critical hazard / shortfall risk / immediate alert |
| `--purple` | `#bc8cff` | EO / Space Intelligence indicators (retained, not in Stitch core palette) |

### Risk Level Colours

| Token | Level | HEX |
|---|---|---|
| `--risk-low` | LOW | `#4ae176` |
| `--risk-medium` | MEDIUM | `#f59e0b` |
| `--risk-high` | HIGH | `#ffb77d` |
| `--risk-critical` | CRITICAL | `#ef4444` |

---

## 4. Typography

**Font:** Inter (Google Fonts, loaded via CDN in `index.html`)
**Fallback stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
**Global rule:** `font-variant-numeric: tabular-nums` on `body` — all numbers use fixed-width figures.

### Type Scale

| Element | Size | Weight | Letter-spacing | Notes |
|---|---|---|---|---|
| `h1` | 1.6rem | 700 | −0.02em | Page/section hero title |
| `h2` | 1.25rem | 600 | −0.015em | Section heading |
| `h3` | 1.05rem | 600 | −0.01em | Card heading |
| `h4` | 0.9rem | 600 | +0.04em, UPPERCASE | Sub-section label |
| `.section-label` | 0.68rem | 600 | +0.06em, UPPERCASE | Micro-metadata, card labels |
| Body | 0.875rem (14px base) | 400 | — | Narrative/descriptive text |
| Secondary text | 0.8rem | 400 | — | Supporting descriptions |
| Muted text | 0.75rem | 400 | — | Notes, caveats, tooltips |
| `.big-number` | 2rem | 700 | −0.02em | Primary KPI metric display |

### Typography Rules

- **DESIGN RULE:** All numeric KPI values, percentages and timestamps must use `font-variant-numeric: tabular-nums` to prevent layout jitter.
- **DESIGN RULE:** Restrict bold (700) to active values, primary metrics and terminal states. Labels and descriptions use 500 or 400.
- **DESIGN RULE:** Uppercase with tracking is reserved for `.section-label` and status chips only. Narrative text stays in sentence case.
- **UX RULE:** Never truncate a KPI value. Size the container to fit the number.

---

## 5. Spacing System

4px base unit. All spacing tokens are multiples.

| Token | Value | Usage |
|---|---|---|
| `--gap-xs` | 4px | Internal component micro-spacing |
| `--gap-sm` | 8px | Between label and value, icon and text |
| `--gap-md` | 16px | Card internal padding, grid gap |
| `--gap-lg` | 24px | Between sections, card-to-card gap |
| `--gap-xl` | 40px | Major section separators |

**UX RULE:** Use compact density (`--gap-xs` to `--gap-sm`) inside components to maximise data density. Use `--gap-md` and above for structural separation between modules.

---

## 6. Border Radius

Stitch uses disciplined, square-edged geometry. No fully rounded pills.

| Token | Value | Applied to |
|---|---|---|
| `--radius-sm` | 4px | Buttons, badges, pills, chips, inputs |
| `--radius-md` | 4px | Cards, panels, progress bars |
| `--radius-lg` | 6px | Modals, large containers, hero cards |

**DESIGN RULE:** Never use `border-radius: 9999px` (full pill). Square-edged components preserve the technical, instrument-grade identity and maintain alignment with dense data grids.

---

## 7. Button Styles

### Secondary (default — Stitch slate utility)
```
background:   #1b2027  (--bg-card-alt)
border:       1px solid #30353d  (--border)
color:        #dee2ec
border-radius: 4px
padding:      6px 14px
font-weight:  500
font-size:    0.85rem
hover:        background #252a32, border #484f58
active:       opacity 0.85
disabled:     opacity 0.45, cursor not-allowed
```

### Primary (amber — Stitch operational execution)
```css
.btn-primary {
  background:   #d97707  (--primary-dim)
  border:       1px solid #ffb77d  (--primary)
  color:        #0f141b  (dark text on amber)
  font-weight:  700
  hover:        background #ffb77d
}
```

**DESIGN RULE:** Use `.btn-primary` (amber) only for the highest-priority operational action in the current context — typically the NUDGE recommendation CTA and the Refresh header button. All other buttons use the secondary slate style.

---

## 8. Badge Styles

Stitch status chips: square-edged (4px), 1px tinted border, tinted background, coloured text.

```
padding:       2px 7px
border-radius: 4px  (--radius-sm)
font-size:     0.72rem
font-weight:   600
letter-spacing: 0.03em
```

| Class | Background | Border | Text |
|---|---|---|---|
| `.badge--low` | `rgba(74,225,118,.12)` | `rgba(74,225,118,.35)` | `#4ae176` |
| `.badge--medium` | `rgba(245,158,11,.12)` | `rgba(245,158,11,.35)` | `#f59e0b` |
| `.badge--high` | `rgba(255,183,125,.12)` | `rgba(255,183,125,.35)` | `#ffb77d` |
| `.badge--critical` | `rgba(239,68,68,.12)` | `rgba(239,68,68,.35)` | `#ef4444` |
| `.badge--action` | `rgba(147,204,255,.12)` | `rgba(147,204,255,.35)` | `#93ccff` |
| `.badge--context` | `rgba(188,140,255,.12)` | `rgba(188,140,255,.25)` | `#bc8cff` |
| `.badge--feasible` | `rgba(74,225,118,.12)` | `rgba(74,225,118,.35)` | `#4ae176` |

**DESIGN RULE:** Never use pills (full-radius) for status indicators. Square edges preserve alignment with data tables.

**UX RULE:** Risk badges (`LOW/MEDIUM/HIGH/CRITICAL`) must always appear adjacent to their numeric probability value, never as a standalone label.

---

## 9. Card Styles

### Standard card (`.card`) — Stitch Z1 panel tier
```
background:    #171c23  (--bg-card)
border:        1px solid #30353d  (--border)
border-radius: 4px  (--radius-md)
padding:       16px  (--gap-md)
```

### Modifier classes
```
.card--highlight   border-color: #d97707  (amber — primary action focus)
.card--critical    border-color: #ef4444  (risk critical alert)
.card--success     border-color: #00a74b  (accessible / positive)
```

### Elevated interactive state (Z2)
When a card is clickable, apply on hover:
```
border-color: <relevant accent colour>
transition:   border-color 0.15s
```

**DESIGN RULE:** Cards never use drop shadows or blur. Hierarchy is defined by border contrast alone.

**UX RULE:** Clickable cards must have `role="button"` and a visible hover state (border colour change). They must not look identical to non-interactive cards.

---

## 10. Navigation / Pipeline Strip

The pipeline strip is the primary navigation. It reflects the intelligence pipeline order and must not be reordered.

### Six stages (in order)

| Stage ID | Label | Sub-question |
|---|---|---|
| `overview` | Mission Overview | What does the system know? |
| `satellite` | 🛰 Space Intelligence | What does EO reveal? |
| `prism` | Resource Mapping | Where are the mineralised zones? |
| `ear` | Accessibility | What can be accessed? |
| `pulse` | Production Forecast | What can we produce? |
| `nudge` | Decision Engine | What should we do? |

### Tab styling
```
background:        transparent (inactive) / rgba(217,119,6,.07) (active amber) / rgba(147,204,255,.07) (active blue for satellite)
border-bottom:     2px solid <activeColor> (active) / 2px solid transparent (inactive)
font-weight:       600
font-size:         0.8rem
hover:             rgba(255,255,255,.03) background
overflow/ellipsis: applied on label text
```

**Active colour rules:**
- `satellite` stage active: `--accent` blue (`#93ccff`) — EO is a spatial/data context
- All other stages active: `--primary` amber (`#ffb77d`) — operational pipeline stages
- `nudge` (Decision Engine): `--primary` amber — the terminal decision action

**DESIGN RULE:** The pipeline strip communicates the flow OBSERVE → INTERPRET → ASSESS → PREDICT → DECIDE. Do not add, remove or reorder stages without updating the intelligence flow.

**UX RULE:** The active stage must be immediately identifiable. The bottom border is the primary indicator; background tint is the secondary indicator.

---

## 11. KPI / Data Display Styles

### Command KPI Metric Card (Stitch pattern)

Structure:
```
Top row:    micro-label (section-label style) | source chip (right-aligned)
Middle:     large metric value (.big-number or 1.5rem 700)
Bottom:     sub-label / delta (0.7rem, --text-muted)
```

Source chip style:
```
font-size:     0.58–0.62rem
font-weight:   700
text-transform: uppercase
letter-spacing: 0.05em
background:    <colour>15  (15% opacity tint)
border:        1px solid <colour>30
border-radius: 4px
```

Source chip colours by data type:
- Borehole + Kriging → `--accent` blue
- EAR Analysis → `--green`
- Forecast Model → `--yellow`
- SHAP Attribution → risk colour
- Synthetic EO → `--purple`
- Spatial Model → `--purple`

### Progress bar
```
.progress-bar-track:  background #252a32, border-radius 2px, height 8px
.progress-bar-fill:   border-radius 2px, transition width 0.6s ease
```

### Numeric display rules
- All KPI numbers: `font-variant-numeric: tabular-nums`
- Large metrics: `font-size: 1.5–2rem, font-weight: 700, letter-spacing: -0.02em`
- Units (Mt, t, %): displayed inline, same weight as the number
- Negative values: prefix `−` (minus), colour `--risk-high` or `--red` depending on severity
- Positive deltas: prefix `+`, colour `--green`

---

## 12. Icons and Icon Usage

**Approach:** Emoji icons used as contextual visual anchors, not decorative elements.

| Icon | Context |
|---|---|
| 🛰 | Space Intelligence, EO data, satellite context |
| ⛏ | Borehole / geological evidence |
| 🗺 | Resource Mapping / spatial model |
| 📍 | Accessibility / EAR analysis |
| 📈 | Production forecast / trend data |
| ⚡ | Decision Engine / NUDGE recommendation |
| 📦 | Resource Intelligence / output |
| 📐 | Spatial interpolation / Kriging |
| ⛰ | Terrain / slope / DEM |
| 🌧 | Weather / rainfall constraint |
| 🚜 | Equipment / fleet |
| ★ | EO anomaly target (on map cells) |

**DESIGN RULE:** Icons must appear only in section headers, evidence flow panels and the pipeline strip. Do not scatter icons throughout body text or data tables.

**DESIGN RULE:** The OreSight logo SVG (satellite orbit + ore block + crosshair) is only used in the header. Never repeat it within content.

---

## 13. Charts and Visualisation Styling

### Recharts (2D — production forecast, SHAP bars)

- Background: transparent (inherits `--bg-page`)
- Grid lines: `--border-light` (`#252a32`), `strokeDasharray: "3 3"`
- Axis text: `--text-secondary` (`#8b949e`), 10–11px
- Axis lines: none (`axisLine={false}`, `tickLine={false}`)
- Tooltip: `.card` style background (`#171c23`), 1px `--border`, 0.8rem font

**Forecast fan chart colours:**
- P90 band fill: `rgba(147,204,255,.1)`
- P10 band fill: `#0f141b` (page background — creates the fan cutout)
- P50 line: `--accent` blue, strokeWidth 2.5
- P10 line: `--accent` blue, opacity 0.35, strokeWidth 1
- P90 line: `--green`, opacity 0.4, strokeWidth 1
- Planned target: `--yellow`, strokeDasharray "6 3", strokeWidth 1.5

**SHAP bar chart colours:**
- Actionable driver: `--accent` blue
- Contextual driver: `--purple`

### Plotly.js (3D — block model, accessibility scatter)

- `paper_bgcolor`: `#161b22`
- `plot_bgcolor`: `#161b22`
- Scene background (`bgcolor`): `#0d1117`
- Axis colour: `#6e7681`
- Grid colour: `#21262d`
- Legend: `rgba(22,27,34,0.9)` background, `#30363d` border

**Block model colour scale (PRISM):**
- Low Mn → `#1f6feb` (blue)
- Mid Mn → `#3fb950` (green)
- High Mn → `#f0883e` (orange)

**Accessibility scatter (EAR):**
- Accessible ore: `#3fb950` green
- Dev-blocked: `#f0883e` orange, `symbol: 'x'`
- Weather-blocked: `#d29922` yellow, `symbol: 'cross'`

**DATA RULE:** Chart data always comes from API responses. Never hardcode chart values. Never interpolate or smooth data beyond what the API provides.

---

## 14. Header Design

**File:** `frontend/src/components/Header.jsx`

### Layout
```
sticky top-0, z-index 100
background: --bg-card
border-bottom: 1px solid --border
padding: 12px --gap-lg
max-width: 1400px (page-wrapper)
flex: space-between
```

### Left — Brand
- SVG logo (34px) + text group
- "OreSight" — 1.15rem, weight 700, `--primary` amber, letter-spacing −0.01em
- "MVP" badge — amber Stitch chip (0.62rem, uppercase, `rgba(217,119,6,.15)` bg, `rgba(217,119,6,.35)` border)
- Subtitle — "Space-Enabled Mine Intelligence" — 0.72rem, `--text-secondary`

### Right — Refresh button
- Stitch secondary slate button style
- Shows "↻ Refresh" idle / "Refreshing…" loading
- Disabled + opacity 0.45 while loading

**DESIGN RULE:** The header is always visible (sticky). It does not contain navigation. It does not show data metrics. It is identity + single utility action only.

---

## 15. Mission Overview

**Stage ID:** `overview` | **File:** `OverviewPanel.jsx`

**Purpose:** Executive command summary. Answer four questions within 10 seconds:
1. What does the system do?
2. What resource was identified?
3. What can realistically be produced?
4. What action is recommended?

**UX RULE:** The Overview is a command centre, not a technical architecture page. Do not show detailed module explanations here. Those belong in their own stages.

### Structure

**Hero:**
- 🛰 icon + h1 "Space-Enabled Mine Intelligence"
- One-sentence description (max 120 chars)

**Evidence chain card** (compact, single card):
- Three blocks: 🛰 SPACE INTELLIGENCE · ⛏ GEOLOGICAL VALIDATION · 📦 RESOURCE INTELLIGENCE
- Separated by `+` and `→` operators
- Each block: uppercase label (colour-coded) + 0.75rem description + italic note
- Footer disclaimer: "Satellite observations provide surface indicators and spatial context only…"

**6 KPI cards** (3-column grid, each clickable → navigates to relevant stage):
1. Geological Resource → navigates to `prism`
2. Accessible Resource → navigates to `ear`
3. Shortfall Risk → navigates to `pulse`
4. P50 Production Forecast → navigates to `pulse`
5. Expected Shortfall → navigates to `pulse`
6. Space Intelligence summary → navigates to `satellite`

**NUDGE recommendation CTA** (full-width, amber border):
- "⚡ Decision Engine — Recommended Action" label
- Action name (1.05rem, 700 weight)
- Current value → Recommended value + production gain + shortfall reduction
- Amber hover state
- Navigates to `nudge`

**DATA RULE:** All six KPI values come from `/api/overview`. Never hardcode. The NUDGE CTA values come from `overview.nudge`. The 48.27 Mt, 32.74 Mt, 88.4%, +606.6 t numbers are examples — always render from API response.

**DATA RULE:** The Space Intelligence KPI card shows `summary.mean_mineralisation` and `summary.surface_targets` from `/api/satellite`. If the satellite endpoint is unavailable, the card shows `—`.

---

## 16. Space Intelligence

**Stage ID:** `satellite` | **File:** `SatelliteView.jsx`

**Purpose:** Show what EO surface signals reveal about potential mineralisation targets. Explicitly NOT claiming satellite detects subsurface ore.

**What the user should understand:**
- EO identifies surface anomalies
- These anomalies prioritise investigation targets
- Geological validation (boreholes) is required before drawing resource conclusions

### Structure

**Header:** 🛰 SPACE INTELLIGENCE · "Where are the surface signals associated with mineralisation?"

**Demo status bar** (amber dot + label):
```
DEMO EO DATA — DEMO-01 | 208 cells · 50 m grid · 5 anomaly targets | Integration-ready: Sentinel-2 · ISRO Bhuvan · Sentinel-1 · SRTM/ALOS DEM
```

**Two-column layout:**

Left column:
- **EO Anomaly Map** card — SVG choropleth grid, layer toggle buttons (6 layers), legend, hover tooltips
- **Top EO Anomaly Targets** card — ranked target cards with lat/lon, EO signal %, IOI/Clay/NDVI/Conf values

Right column:
- **EO Indicators** card — 2×4 grid of indicator cards, each showing: label / value / bar / What / Use / source band
- **EO Coverage** stats card
- **NEXT → Resource Mapping** transition card (blue border)
- **Integration-Ready EO Sources** card (purple border)

**Bottom — OBSERVE → DETECT → PRIORITISE → VALIDATE → MODEL** flow strip

**Layer toggle active style:** `--accent` blue border + `rgba(147,204,255,.14)` background

**DESIGN RULE:** EO anomaly targets show "X% EO signal" — never "ore probability", "mineralisation probability" or "reserve confidence".

**DESIGN RULE:** The disclaimer "EO anomalies indicate surface signals and require geological validation" must appear in at least two places on the page.

**DATA RULE:** All indicator values come from `/api/satellite` `layer_statistics`. Grid cells come from `/api/satellite/grid`. Never hardcode 0.411, 0.412 etc. — these are API-driven.

---

## 17. Resource Mapping

**Stage ID:** `prism` | **File:** `PrismView.jsx`

**Purpose:** Show how the 3D spatially modelled mineral resource is built from borehole assays and Kriging. Connect EO surface evidence to geological subsurface evidence.

**What the user should understand in 10 seconds:**
- Satellite → surface anomaly context (WHERE to investigate)
- Boreholes → what Mn grade is present (WHAT is below)
- Kriging → spatial interpolation to estimate grade in unsampled blocks (3D resource model)
- This passes to Accessibility

### Structure

**Header:** 🗺 INTERPRET — Resource Mapping · "Where are the mineralised zones?"

**Evidence flow panel** (horizontal, 4 columns + arrows):
```
🛰 Earth Observation   →   ⛏ Borehole + Assay   →   📐 Ordinary Kriging   →   🗺 Resource Model
"Surface spatial context"  "Subsurface grade evidence"  "Spatial interpolation"  "Modelled mineral resource"
```
- Each column: icon + label + italic role description + bullet items + source tag
- Arrow labels: "informs" / "input to" / "produces"
- Resource Model column: highlighted amber background

Footer disclaimer: "EO provides independent surface evidence; resource estimation is derived from borehole assays and spatial interpolation."

**Two-column layout:**

Left — **3D Resource Block Model** (Plotly, lazy-loaded):
- Colour scale: blue → green → orange (increasing Mn%)
- Mineralised ≥ 20% Mn / Sub-cutoff grey
- Rotate / Zoom / Hover interactions
- Footer: block count + mineralised count

Right column:
- **Modelled Mineral Resource** card: 48.27 Mt big-number + "not a reserve statement"
- Stats grid: total blocks / mineralised / sub-cutoff / avg Mn / Mn cutoff
- **Kriging Model Parameters** card: nugget / sill / range / partial (all from API `variogram` object — omit any field not present in API response)
- **4-story connection card**: WHERE (EO) / WHAT (Boreholes) / Kriging / Accessibility

**TECHNICAL CONSTRAINT:** Do not display "Z-anisotropy ×5" — this field is not returned by `/api/prism`. Only render variogram fields that exist in the API response.

**DATA RULE:** 48.27 Mt is labelled "Modelled Mineral Resource" — never "reserve", never "ore reserve". Reserve/accessibility language belongs in the Accessibility stage.

**DATA RULE:** `max_estimated_mn_pct` is present in `/api/prism` but may not be in the overview response. Render it only if non-null.

---

## 18. Accessibility

**Stage ID:** `ear` | **File:** `EarView.jsx`

**Purpose:** Convert the spatially modelled resource into operationally accessible resource. Show which blocks are inaccessible and why.

**What the user should understand:**
- Not all modelled resource can be mined today
- Three constraints gate accessibility: terrain depth, equipment, weather
- Terrain constraint is the largest blocker (141 of 159 blocked blocks)

### Structure

**Header:** 📍 ASSESS — Accessibility Analysis · "What can actually be accessed?"

**Three context cards** (3-column grid, coloured borders):
1. 🛰 Terrain Intelligence (purple) — DEM/satellite-derived elevation depth threshold (z ≤ 192 m)
2. 🚜 Equipment Availability (green) — fleet threshold ≥ 85%, source: Operational History
3. 🌧 Weather Feasibility (blue) — rainfall ≤ 30 mm/day, source: Weather / EO

Each context card has a `SOURCE:` tag.

**Transformation card** (horizontal flow):
```
Spatially Modelled Resource   →   [3 constraints]   →   Accessible Resource
48.27 Mt                          terrain / equipment / weather    32.74 Mt
```
Includes accessibility progress bar (green fill, 67.8%).

**Two-column layout:**

Left — **3D Spatial Accessibility Map** (Plotly, lazy-loaded):
- Green = accessible / Orange ✗ = dev-blocked / Yellow + = weather-blocked

Right — stats cards:
- Resource Accessibility Breakdown (3 bar rows)
- Why Is Resource Inaccessible (constraint rows with counts and explanations)
- Inaccessible Resource summary card (red border, 15.53 Mt)

**DATA RULE:** `devBlocked = 141`, `wxBlocked = 22`, `totalBlocked = ear.inaccessible_blocks` — the first two are known from dataset analysis; the third from the API.

**DATA RULE:** Language: "Accessible Resource" not "Accessible Reserve". Reserve language is explicitly avoided until the EAR stage introduces the accessibility concept.

---

## 19. Production Forecast

**Stage ID:** `pulse` | **File:** `PulseView.jsx`

**Purpose:** Probabilistic 30-day production forecast with shortfall risk quantification and root-cause attribution.

**What the user should understand:**
- What the mine is expected to produce (P10/P50/P90)
- Whether it will hit the planned target
- Which spatial and operational factors drive the risk

### Structure

**Header:** 📈 PREDICT — Production Forecast · "What can we realistically produce?"

**Data Fusion card** (5-column):
```
📦 Spatial Accessibility  +  📋 Production History  +  🔧 Equipment Telemetry  +  🌧 Weather/Rainfall  +  👷 Manpower & Development
→ LightGBM Quantile Regression · 38 features · 30-day horizon · P10 / P50 / P90
```

**Forecast chart (Recharts ComposedChart):**
- P90 area fill: `rgba(147,204,255,.1)`
- P50 line: `--accent` blue, 2.5px
- P10 line: `--accent` blue, 0.35 opacity
- Planned: `--yellow` dashed
- Legend: dots/lines above chart

**Scenario cards** (P10 / P50 / P90) — below chart.

**Production vs Target card + Shortfall Risk card** — 2-column grid.

**SHAP risk attribution:**
- Title: "What spatial and operational factors influence production uncertainty?"
- Bars: blue = Actionable, purple = Contextual
- Pills: `.pill--actionable` / `.pill--contextual`
- Footer note: "Model attribution signals — not proof of causality"

**DATA RULE:** All forecast values from `/api/pulse`. Shortfall probability from `forecast_summary.overall_shortfall_probability`. SHAP from `/api/shap`. Do not calculate or derive these values in the frontend.

**DESIGN RULE:** P50 is always emphasised (bold / larger). P10 and P90 are contextual bounds.

---

## 20. Decision Engine

**Stage ID:** `nudge` | **File:** `NudgeView.jsx`

**Purpose:** Final prescriptive recommendation from the intelligence pipeline. Shows the single best feasible operational action and all evaluated alternatives.

**What the user should understand:**
- The system evaluated N feasible interventions
- The best action is ranked by expected shortfall reduction
- Before/after impact is modelled, not observed
- Final decision remains with the mine manager

### Structure

**Header:** ⚡ DECIDE — Decision Engine · "What should we do?"

**Intelligence pipeline flow card** (4 columns, amber bg on DECIDE):
```
OBSERVE 🛰 Earth Observation  →  INTERPRET ⛏ Resource Mapping  →  PREDICT 📈 Production Forecast  →  DECIDE ⚡ Decision Engine
```

**Before / after comparison** (`.before-after` 3-column grid):
- Left: "Current forecast" — production / shortfall / probability (red values)
- Centre: ↓ arrow (green)
- Right: "After intervention" — improved values (green)
- Footer: `+X t production gain · −X t shortfall reduction`
- Italic disclaimer: "Modelled counterfactual impact — not an observed real-world result"

**Best action hero card** (amber border, `rgba(217,119,6,.06)` background):
- "★ Recommended action" label — amber, uppercase, 0.65rem
- Action name — h2, white
- Rationale text
- Current value → Recommended value (with `→` amber arrow)
- `InterventionStat` components for current / recommended / target unit

**All evaluated interventions** (ranked list of `.candidate-card`):
- Best card: `.candidate-card--best` (amber border, amber bg tint)
- RECOMMENDED badge: amber on dark, 4px radius
- Progress bar: amber for best, green for others
- Rank badge: circle, amber fill for #1

**Decision support disclaimer** (card, blue border):
"Decision derived from integrated spatial, geological and operational intelligence. Final operational decisions remain with the mine manager."

**DATA RULE:** Intervention candidates from `/api/nudge/candidates`. Best action from `/api/nudge` `best_action`. Impact values are model outputs — never present them as guaranteed outcomes.

**DATA RULE:** There are always exactly 4 intervention levers: fleet_availability / fleet_downtime_h / development_m / available_workers. Do not add or invent additional levers.

---

## 21. Responsive / Mobile Behaviour

| Breakpoint | Behaviour |
|---|---|
| ≥ 1440px | Full 12-col dashboard, all columns visible |
| 768px – 1439px | `.grid-2` retained; `.grid-4` collapses to 2 columns |
| < 768px | All grids collapse to single column; `.before-after` stacks vertically with rotated arrow; page-wrapper padding reduces to `--gap-md` |

**UX RULE:** The pipeline strip must scroll horizontally on mobile. Tab labels must not wrap or truncate to the point of losing meaning.

**UX RULE:** The 3D Plotly charts (PrismView, EarView) are `height: 420px` fixed. On mobile they remain full-width but users should understand pan/zoom is touch-supported.

**UX RULE:** The NUDGE before/after grid switches from horizontal to vertical stack on mobile (`< 768px`). The `→` arrow rotates 90° to point downward.

---

## 22. UX Interaction Rules

- **Stage transitions:** 0.15s fade-in (`@keyframes fadeIn`, `translateY(4px) → 0`). No slide or scale.
- **Clickable cards:** Amber or accent colour border on hover. Cursor pointer. `role="button"` on div elements.
- **Progress bars:** 0.6s ease width transition. Never animate on initial load to avoid layout shift.
- **Navigation:** Clicking a pipeline stage replaces the content area. No nested routing.
- **Refresh:** Header refresh button reloads all API data simultaneously (single `Promise.all`). Loading spinner shown only if no prior data exists. Error banner with retry shown on failure.
- **Lazy Plotly:** 3D charts lazy-import Plotly (`import('plotly.js-basic-dist-min')`). Content area shows "Loading spatial model…" until resolved.
- **Tooltips:** SVG map cells use `<title>` elements for browser native tooltips. No custom tooltip library.

---

## 23. Accessibility / Readability Rules

- **Minimum contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text).
- **`role="button"`** on interactive `<div>` elements. Corresponding `aria-label` required.
- **`aria-pressed`** on pipeline strip buttons.
- **`aria-label`** on SVG logo (`aria-hidden="true"` since it is decorative).
- **`role="note"`** on the demo disclaimer banner.
- **`role="alert"`** on the error banner.
- **`role="img"` + `aria-label`** on SVG choropleth maps.
- Do not rely on colour alone to convey information — always pair colour with a label, icon or text.
- Numeric values shown in both the big metric and a text description (e.g. "67.8% accessible" + the progress bar).

---

## 24. Data Presentation Rules

1. **API is the source of truth.** Never hardcode a data value that comes from an API endpoint.
2. **Null-safety.** All API-driven values must be null-guarded. Use `value?.toFixed(2) ?? '—'` pattern. Never `.toFixed()` on null/undefined.
3. **Number formatting:** Tonnes with thousands separator (`toLocaleString()`). Percentages to 1 decimal (`(v * 100).toFixed(1) + '%'`). Mt to 2 decimal places. All numbers use tabular figures.
4. **Synthetic data labels.** Every section that renders DEMO-01 data must have a visible provenance indicator (source chip, demo badge, or disclaimer line). Never remove these.
5. **EO anomaly scores** are always labelled "EO signal" or "EO anomaly score" — never "ore probability", "mineralisation grade" or "reserve confidence".
6. **48.27 Mt** is labelled "Modelled Mineral Resource" — never "reserve" or "ore reserve".
7. **SHAP values** are always accompanied by the caveat "model attribution signals — not proof of causality".
8. **Counterfactual NUDGE results** are always labelled "modelled impact" — never "guaranteed outcome".

---

## 25. API Integration Rules

### Existing endpoints (do not modify)

| Endpoint | Used by | Key data |
|---|---|---|
| `GET /api/overview` | Overview, all stages via initial load | Prism metrics, EAR metrics, Pulse metrics, risk level, NUDGE summary |
| `GET /api/satellite` | SatelliteView | EO indicator stats, top targets, integration info |
| `GET /api/satellite/grid` | SatelliteView | 208-cell spatial grid for choropleth |
| `GET /api/satellite/observations` | Available, unused in UI currently |
| `GET /api/prism` | Not used directly (prism data comes via overview) |
| `GET /api/prism/blocks` | PrismView (lazy, on stage mount) | 2,240 blocks for 3D scatter |
| `GET /api/ear` | Not used directly (EAR data comes via overview) |
| `GET /api/ear/blocks` | EarView (lazy, on stage mount) | 498 ore blocks for 3D scatter |
| `GET /api/pulse` | PulseView (loaded on Dashboard mount) | 30-day forecast array + summary |
| `GET /api/risk` | PulseView | Risk level + SHAP top drivers |
| `GET /api/shap` | PulseView | All 38 features sorted by SHAP |
| `GET /api/nudge` | NudgeView | Best action + baseline |
| `GET /api/nudge/candidates` | NudgeView | All 4 ranked candidates |
| `GET /api/health` | Not currently used in UI — available for status indicators |

### Loading strategy
- Dashboard mounts and fires 6 parallel `Promise.all` calls: `getOverview`, `getPulse`, `getRisk`, `getShap`, `getNudge`, `getNudgeCandidates`.
- Satellite and block data are lazy-loaded on first navigation to their respective stages.
- **TECHNICAL CONSTRAINT:** Do not add synchronous data loading to `global.css` or layout files. Keep API calls inside component `useEffect` hooks.
- **TECHNICAL CONSTRAINT:** Base URL from `import.meta.env.VITE_API_BASE_URL`, defaulting to `http://127.0.0.1:8000`. Never hardcode the base URL in components.

### Frontend service layer
All fetch calls go through `frontend/src/services/api.js`. No component imports `fetch` directly. New API calls must be added as named exports to `api.js`.

---

## Appendix — CSS Class Quick Reference

| Class | Purpose |
|---|---|
| `.page-wrapper` | Max 1400px centred container |
| `.card` | Standard Z1 panel |
| `.card--highlight` | Amber border emphasis |
| `.card--critical` | Red border emergency |
| `.card--success` | Green border positive |
| `.badge--{level}` | Risk/status chip (square-edged) |
| `.badge--action` | Blue actionable tag |
| `.badge--context` | Purple contextual tag |
| `.badge--feasible` | Green feasibility chip |
| `.section-label` | Uppercase micro-metadata label |
| `.big-number` | Large KPI metric value |
| `.grid-2/3/4/auto` | Responsive CSS grid layouts |
| `.progress-bar-track` | Progress bar container |
| `.progress-bar-fill` | Progress bar fill (animated) |
| `.pill--actionable` | SHAP actionable driver tag |
| `.pill--contextual` | SHAP contextual driver tag |
| `.candidate-card` | NUDGE intervention card |
| `.candidate-card--best` | Amber highlight for best candidate |
| `.before-after` | 3-column before/after grid |
| `.stage-view` | Animated stage content wrapper |
| `.flex-row` | Horizontal flex with gap |
| `.flex-between` | Space-between flex |
| `.section-label` | Uppercase 0.68rem label |
| `.text-muted` | Secondary text colour |
| `.text-small` | 0.8rem text |
| `.divider` | 1px horizontal rule |
