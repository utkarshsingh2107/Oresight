---
name: Industrial Precision
colors:
  surface: '#0f141b'
  surface-dim: '#0f141b'
  surface-bright: '#343941'
  surface-container-lowest: '#090f15'
  surface-container-low: '#171c23'
  surface-container: '#1b2027'
  surface-container-high: '#252a32'
  surface-container-highest: '#30353d'
  on-surface: '#dee2ec'
  on-surface-variant: '#dbc2b0'
  inverse-surface: '#dee2ec'
  inverse-on-surface: '#2c3138'
  outline: '#a38c7c'
  outline-variant: '#554336'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#d97707'
  on-primary-container: '#432100'
  inverse-primary: '#904d00'
  secondary: '#93ccff'
  on-secondary: '#003351'
  secondary-container: '#3198dc'
  on-secondary-container: '#002c47'
  tertiary: '#4ae176'
  on-tertiary: '#003915'
  tertiary-container: '#00a74b'
  on-tertiary-container: '#003111'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#0f141b'
  on-background: '#dee2ec'
  surface-variant: '#30353d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-metric:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an executive operational intelligence environment tailored for heavy industrial extraction, fleet routing, and geological modeling. The design language rejects decorative novelties and gaming aesthetic tropes in favor of an austere, high-clarity command posture.

### Core Tenets
- **Instrument-Grade Restraint:** Every pixel serves operational visibility. Surfaces are disciplined, visual noise is systematically stripped, and layouts favor predictable structure over expressive asymmetry.
- **Calm Authority:** High-consequence industrial decision-making demands visual stability. The interface relies on dark slate structural foundations that mitigate eye fatigue across extended 12-hour shifts.
- **Precision Data Visualization:** Information is layered mechanically using tonal containment, subtle borders, and deliberate contrast intervals rather than vivid decorative gradients.

### Style Archetype
- **Modern Minimalist Industrial:** Structured grid discipline, low-contrast ghost borders, neutral slate backdrops, and purposeful color application. Accent tones function strictly as semantic status indicators and primary task affordances.

## Colors

The color palette is built on strict utility and contrast hierarchy. The primary chromatic space is dark charcoal/slate, providing an environment where data points and telemetry read instantly.

### Palette Hierarchy
- **Canvas & Surface Base:**
  - Base Canvas (`#0D1117`): Deep structural void for the application frame.
  - Surface Tier 1 (`#161B22`): Primary card, panel, and console background.
  - Surface Tier 2 (`#21262D`): Hover states, interactive wells, table row stripes, and secondary container fills.
  - Surface Border (`#30363D`): Standard low-contrast structural separator used across all module perimeters.
  - Focus / Active Border (`#484F58`): Emphasized demarcation for active inputs and selected containers.
- **Brand Primary Accent (`#D97706` / `#E5A93C`):**
  - Warm raw-mineral amber used exclusively for primary calls to action, high-level operational recommendations, and key state transitions. Never used for passive decoration.
- **Technical Secondary Accent (`#0284C7` / `#38BDF8`):**
  - Muted cyan reserved for spatial coordinates, telemetry metrics, predictive line graphs, and machine-learning projections.
- **System Diagnostics & Feasibility:**
  - **Positive / Feasible (`#22C55E`):** Operational targets met, stable seismic thresholds, active equipment clearance.
  - **Caution / Threshold (`#F59E0B`):** Degrading haul routes, thermal variances, non-blocking telemetry anomalies.
  - **Critical Hazard (`#EF4444`):** Structural integrity faults, spatial collisions, immediate operational shutdowns.
- **Typography & Monochrome:**
  - Primary Content: `#F0F6FC`
  - Secondary / Supporting: `#8B949E`
  - Muted / Disabled: `#484F58`

## Typography

The typographic hierarchy is designed around scan-speed, uniform metrics, and technical legibility under varied industrial viewing conditions.

### Usage Standards
- **Font Selection:** `Inter` is applied across all roles. It provides neutral, open counters and distinct glyph variations that perform reliably in compact analytical dashboards.
- **Tabular Figures:** All numeric readouts, GPS metrics, grade percentages, and timestamps must activate `font-variant-numeric: tabular-nums` (OpenType feature `tnum`) to eliminate layout jitter during high-frequency live data updates.
- **Case Conventions:**
  - Micro-metadata and diagnostic indicators (`label-sm`) default to uppercase with extended tracking (`letterSpacing: 0.04em`).
  - Section titles, telemetry labels, and narrative metrics remain in natural sentence case to support swift reading.
- **Hierarchy Rules:** Restrict bold weights strictly to active values and terminal states. Informational labels, dimensional measures, and secondary descriptors leverage medium (`500`) or regular (`400`) weights in muted tones (`#8B949E`) to emphasize the data itself.

## Layout & Spacing

Layouts follow an uncompromising functional cadence. The spatial model relies on a fixed structural frame containing a multi-column analytical dashboard with dense data zones.

### Grid & Density
- **Global Structure:** A 12-column dynamic grid with a default `1rem` (16px) gutter and `1.5rem` (24px) canvas margin.
- **Rhythm Principles:** Spacing relies on a base 4px metric system. Component internals maintain a compact density (`0.25rem` to `0.5rem`) to maximize screen real estate, while module boundaries leverage `1rem` to preserve distinct contextual grouping.
- **Breakpoint Behavior:**
  - **Desktop / Workstation (≥1440px):** 12 columns, multi-pane sidebars (telemetry left, map/model center, contextual drill-down right). Fixed persistent controls.
  - **Field Tablet / Portable Rig (768px – 1439px):** 6 columns, collapsible contextual drill-down pane converted to an overlay sheet; persistent KPI bar.
  - **Compact Field Unit (<768px):** Single-column stacked flow. Data grids convert to vertically stacked structural cards with primary state indicators permanently pinned.

## Elevation & Depth

This design system avoids blurry drop-shadows, glossy skeumorphic bevels, and atmospheric glow effects. Visual hierarchy and layering are defined strictly through tonal progression and deliberate border boundaries.

### Layering Architecture
- **Base Level (Z0):** `#0D1117` — Global application shell, backdrop, and empty space.
- **Panel & Card Level (Z1):** `#161B22` with a 1px solid `#30363D` border. All standard widgets, data tables, and geographic viewers live at this tier.
- **Interactive Elevated Level (Z2):** `#21262D` with a 1px solid `#484F58` border. Applied to active popovers, dropdown options, and hovered table records.
- **Transient Modal / Critical Alert Tier (Z3):** `#161B22` perimeter-framed by `#484F58` with a subtle, non-diffuse anchoring shadow (`box-shadow: 0 8px 24px rgba(1, 4, 9, 0.85)`). Used exclusively for blocking confirmation modals, emergency overrides, and system configuration sheets.

## Shapes

The design uses a clean, disciplined edge geometry (`roundedness: 1`). Soft 4px (`0.25rem`) corners are used across standard components to ensure a compact, technical profile that aligns cleanly with dense data grids.

### Shape Application
- **Data Panels & Structural Containers:** `4px` (`0.25rem`) border radius. Maintains a tight, structured profile across dashboard modules.
- **Buttons, Inputs & Controls:** `4px` (`0.25rem`) border radius. Consistent with input perimeters.
- **Status Pills & Analytical Badges:** `4px` (`0.25rem`) or strict sharp corners depending on data density. Never use fully rounded circular pills (capsules), as they disrupt the rectangular data matrix.
- **Data Table Cells & List Rows:** `0px` radius on inline elements to preserve table edge alignment.

## Components

### Buttons
- **Primary Action (Operational Execution):** Solid `#D97706` background with `#0D1117` bold typography. Hover state transitions to `#E5A93C`. Active state presses down to `#B45309`.
- **Secondary (Technical Utility):** Background `#21262D`, 1px border `#30363D`, text `#F0F6FC`. On hover, border updates to `#8B949E` and background to `#30363D`.
- **Critical / Emergency Override:** Background `#EF4444`, text `#F0F6FC`. Strictly isolated from standard UI flows.

### Status Badges & Chips
- Designed as compact, square-edged indicators.
- **Feasible / Nominal:** Background `rgba(34, 197, 94, 0.12)`, border `1px solid rgba(34, 197, 94, 0.35)`, text `#22C55E`.
- **Telemetry Advisory:** Background `rgba(2, 132, 199, 0.12)`, border `1px solid rgba(2, 132, 199, 0.35)`, text `#38BDF8`.
- **Operational Risk / Hazard:** Background `rgba(239, 68, 68, 0.12)`, border `1px solid rgba(239, 68, 68, 0.35)`, text `#EF4444`.

### Data Tables & Lists
- Table header: `#161B22` background, uppercase `11px` typography (`#8B949E`), with a 1px solid bottom border (`#30363D`).
- Rows: Default background transparent; alternate subtle striping using `#161B22` at 50% opacity. Hover updates row to `#21262D`.
- Cell alignment: Text left-aligned; all scalar values, percentages, and timestamps right-aligned using tabular figures.

### Form Inputs & Selectors
- Container: Background `#0D1117`, 1px border `#30363D`, text `#F0F6FC`.
- Focus State: Border transitions to `#0284C7` (or `#D97706` for action forms). Glows are replaced with an unambiguous 1px contrast highlight.

### Command KPI Metric Cards
- Surface: `#161B22`, border `1px solid #30363D`, padding `1rem`.
- Layout: Top row displays micro-label (`label-sm`, `#8B949E`) with trailing status indicator; middle row features prominent numeric readout (`numeric-metric`, `#F0F6FC`); bottom row holds a concise delta indicator with micro sparkline.