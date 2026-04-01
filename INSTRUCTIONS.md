# Portfolio Page Design Instructions

## Goal
Create a visually impactful and well-organized portfolio page that presents each project clearly and professionally.

## Per-Project Section Layout (100vh per section)

Each section represents one career project and is split into three vertical zones:

### Zone 1 — Overview (top 20%)
Display all high-level project information in a structured, visually striking header:
- **Title**: Project name (large, bold)
- **Description**: One-line summary
- **Info table** (right-aligned panel):
  | Field       | Value                     |
  |-------------|--------------------------|
  | Affiliation | linked organization name  |
  | Category    | tag badges                |
  | Keywords    | tag badges                |
  | Period      | startDate ~ endDate       |

Use shadcn `Badge` for category and keyword tags. Apply per-project theme colors from `resumeTheme` in the JSON data.

### Zone 2 — My Contributions (middle 40%)
List what I specifically contributed to this project:
- Use bullet points or card items
- Data sourced from `resume.contributions` in JSON
- Section heading: **"My Contributions"**

### Zone 3 — My Competencies (bottom 40%)
List the skills and abilities I demonstrated through this project:
- Use bullet points or card items
- Data sourced from `resume.competencies` in JSON
- Section heading: **"Competencies Demonstrated"**

---

## Data Sources
All text content (except section headings like "My Contributions", "Competencies Demonstrated") must be loaded from:
- `src/data/career-en.json` (English)
- `src/data/career-ko.json` (Korean)

Each `resume` object inside a career entry must include:
- `shortName`
- `category` (array)
- `description`
- `contributions` (array)
- `competencies` (array) — **new field**
- `skills` (array)
- `affiliation` (object: `name`, `link`)
- `keywords` (array)
- `startDate`
- `endDate`

---

## Tech Stack
- **UI Kit**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS (alongside existing Bootstrap for non-Section components)
- **Framework**: React 19 + TypeScript + Vite
- **Per-section theming**: Inline styles from `resumeTheme` JSON (background gradient, font colors)

---

## Design Principles
- Visual impact: bold typography, clean table layout in the Overview
- Well-organized: clear separation between the three zones
- Color-adaptive: each project has its own color theme applied to text and borders
- Consistent structure across all projects

---

## Interactive Hero Components

Each project section features an interactive, mouse-responsive hero visualization in the `overview-hero-image` area. The component to render is specified by the `resumeTheme.figure` field in the JSON data, using the format `"iil-career.ComponentName"`.

### Component Registry

| Project | `figure` Value | Component | Interaction |
|---------|---------------|-----------|-------------|
| Ch@tSea | `iil-career.SeaWaveChat` | SVG ocean waves + chat bubbles | Mouse X: wave phase, Mouse Y: amplitude |
| MCP | `iil-career.IdentityConstellation` | SVG identity node constellation | Mouse attracts nodes, hover highlights |
| MMS | `iil-career.NetworkGraph` | Canvas elastic network graph | Mouse repels nodes, hover spawns packets |
| Tasc | `iil-career.ScriptFlowEngine` | SVG script block pipeline | Mouse X: scrub playback, Mouse Y: 3D tilt |
| AR for Safety | `iil-career.ParallaxDepthLayers` | DOM three-layer parallax | Mouse X/Y: depth-based layer shift |
| MLVT | `iil-career.FeatureTracker` | Canvas 6DOF feature tracking | Mouse = camera pan, parallax by depth |
| iil | `iil-career.StateMachineOrbit` | SVG 7-state orbital diagram | Mouse X: orbit speed, hover: state highlight |

### Resolution Flow
- Components are registered in `src/component/hero/registry.ts`
- `Overview.tsx` resolves the component via `resolveHeroComponent(theme.figure)`
- If `figure` is empty or unrecognized, the static `<img>` fallback is used

### Shared Interface (`src/component/hero/types.ts`)
All hero components implement `HeroComponentProps`:
- `contentColor`, `secondaryColor`, `titleColor` — theme colors from `resumeTheme`
- `progress` — scroll progress (0 = hero visible, 1 = compact mode)
- `width`, `height` — measured container dimensions via `ResizeObserver`

### Adding a New Hero Component
1. Create the component file in `src/component/hero/`
2. Implement the `HeroComponentProps` interface
3. Register it in `registry.ts` with the key matching the JSON `figure` value
4. Set the `figure` field in both `career-en.json` and `career-ko.json`

### Shared Hooks
- `useMousePosition` (`src/component/hero/useMousePosition.ts`) — normalized 0..1 mouse coordinates scoped to the hero container
- `useScrollProgress` (`src/hooks/useScrollProgress.ts`) — reads CSS `--p` variable from the sticky parent

### Performance Guidelines
- Stop RAF loops when `progress > 0.9` (component is nearly invisible)
- Canvas components handle `devicePixelRatio` for HiDPI displays
- `pointer-events: none` applied when `progress > 0.8`
