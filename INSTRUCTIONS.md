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
