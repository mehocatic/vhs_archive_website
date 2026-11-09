# Full-Screen Archival Navigation Menu for Leon Vasari

An editorial, full-screen navigation overlay that seamlessly extends the Leon Vasari visual identity when clicking the top bar's hamburger button, pairing massive cobalt display typography with tactile paper textures, halftone kanji, and curatorial metadata.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and functional specifications were confirmed through the interactive discovery interview:
> - **Primary Navigation Sections**: `Archive` (01), `Films` (02), `Biography` (03), `Journal` (04), `Contact` (05).
> - **Hero Aesthetic Continuity**: Warm paper background (`--paper: #ECE8E0`), oversized halftone dot-screen kanji (`映画` / `の記憶`), paper grain overlay (`feTurbulence`), and curatorial film catalog counters.
> - **Motion Choreography**: Full-screen paper `clip-path` expansion emerging directly from the hamburger button origin, followed by staggered vertical mask-rising text animations for navigation lines and auxiliary metadata.
> - **Active Link Behavior**: Clicking "Archive" returns directly to the 3D shelf, clicking "Films" opens the catalog filter/shelf focus, and other links display elegant editorial preview sheets/drawers with back-to-archive breadcrumbs.

---

## 1. Overview & Core Concept

- **What It Does**: Clicking the two-line hamburger button in the top bar triggers an animated paper expansion that transforms the viewport into a full-screen curatorial directory. Visitors can navigate the complete directorial universe—exploring the filmography, biographical vision, journal entries, and studio contact information without breaking the mid-century Japanese/Italian cinema aesthetic.
- **Target Audience / Persona**: Film historians, festival programmers, cinephiles, and admirers of experimental mid-century cinema seeking a tactile, atmospheric digital experience.
- **Key Value**: Replaces a dead burger icon with an immersive, museum-grade navigation portal that maintains the physical archival metaphor of the 3D VHS hero.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Opening the Menu**:
   - The user clicks the top-right hamburger icon (or presses `M` on the keyboard).
   - The hamburger button lines cross into a clean close indicator (`×` / `閉じる`).
   - The full-screen canvas expands via `clip-path` from the top-right button coordinates to fill the screen over 750ms with a `cubic-bezier(.76,0,.18,1)` easing.
   - Halftone kanji watermarks fade in behind the typography.
   - Five primary navigation links rise from overflow-hidden masks with staggered delays ($120\text{ms} + i \times 60\text{ms}$).

2. **Interacting with Links**:
   - Hovering over a link highlights it in deep cobalt with an animated hairline underline and displays contextual preview metadata on the right rail (e.g. active film stills, release era, director quotes).
   - Custom cursor smoothly transitions into `.btn` or link focus state.

3. **Closing the Menu**:
   - Clicking `CLOSE / 閉じる`, clicking outside, or pressing `Escape` triggers the reverse `clip-path` contract back into the hamburger button, restoring the active 3D VHS shelf seamlessly.

### Visual Identity & Theme

- **Palette**:
  - Canvas: Warm paper (`--paper: #ECE8E0`), inner card surfaces (`--sheet: #F3F0EA`).
  - Text & Accents: Deep archival cobalt (`#1F3FB0`), deep ink black (`#141414`), muted charcoal (`#6D6A63`).
  - Hairlines: Subtle rules (`rgba(20, 20, 20, 0.15)` and `rgba(31, 63, 176, 0.35)`).
- **Typography & Scale**:
  - Nav Item Headings: `Inter Tight` 600, `clamp(36px, 5.5vw, 68px)`, letter-spacing `-0.025em`, all cobalt.
  - Romaji & Japanese Sub-kicker: `Inter Tight` 600 + `Noto Sans JP` 500, `10.5px`, uppercase, letter-spacing `0.18em`.
  - Curatorial Notes: `Newsreader` italic, `16px / 1.55`.
- **Layout Rhythm**:
  - Two-column asymmetric layout (65% navigation index / 35% archival dossier rail).
  - Left column: Chaptered list with editorial numbers (`01`, `02`, `03`, `04`, `05`) and bilingual headers.
  - Right column: Accession dossier displaying total catalog statistics (12 films, 1958–1989 span, Milan/Kyoto production offices, current exhibition notice).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-screen overlay vs. drawer sidebar**
  - *Chosen Approach*: Full-screen paper canvas with clip-path mask.
  - *Why*: Maintains the museum broadsheet aesthetic of the project; side drawers feel like standard SaaS dashboards and break the cinematic immersion.
  - *Alternative Considered*: Side-sliding panel was rejected as too generic.

- **Decision 2: Web Animations API vs. CSS class toggling**
  - *Chosen Approach*: Web Animations API synchronized with requestAnimationFrame state.
  - *Why*: Allows coordinate-accurate clip-path origin calculations directly from the clicked hamburger bounding box, perfectly matching the existing detail sheet physics.

- **Decision 3: Keyboard accessibility and screen reader support**
  - *Chosen Approach*: Full modal trap with `role="dialog"`, `aria-modal="true"`, autofocus on close button, `Escape` key capture, and smooth keyboard navigation between links.

---

## 4. Technical Architecture & Data Strategy

### System Component & State Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App Component                            │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │     Top Bar Header    │             │       3D Shelf (RAF)       │  │
│  │                       │             │                            │  │
│  │   [Brand]   [Burger] ─── (click) ──►│   Pauses hover tilt when   │  │
│  └───────────────────────┘             │   menu is active           │  │
│              │                         └────────────────────────────┘  │
│              ▼                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Full-Screen Menu Overlay (.menu-sheet)          │  │
│  │                                                                  │  │
│  │  ┌───────────────────────────┐   ┌────────────────────────────┐  │  │
│  │  │ Primary Nav Column (65%)  │   │ Curatorial Rail (35%)      │  │  │
│  │  │                           │   │                            │  │  │
│  │  │ 01 ARCHIVE / 資料保管庫   │   │ Director Accession Dossier │  │  │
│  │  │ 02 FILMS / 作品一覧       │   │ 12 Master Repertoire Works │  │  │
│  │  │ 03 BIOGRAPHY / 略歴と理念 │   │ Studio Notes & Production  │  │  │
│  │  │ 04 JOURNAL / 制作日誌     │   │ Kyoto / Milan Monograph    │  │  │
│  │  │ 05 CONTACT / お問合せ     │   │ Rights & Licensing Desk    │  │  │
│  │  └───────────────────────────┘   └────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  Halftone Kanji: 映画の記憶  │  Paper Grain: SVG feTurbulence   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Interactive State Mapping

- `menuOpen`: Boolean signal governing overlay visibility and inert state of the background shelf.
- `menuItems`: Array of navigation items with title, romaji, kanji, route code, and preview summary.
- `hoveredMenuItem`: Tracks the active link to dynamically update the curatorial dossier and cursor status.
- `openMenu()`: Computes hamburger bounding rect, sets `menuOpen = true`, animates clip-path from `inset(top right bottom left round 3px)` to `inset(0 round 0)`, and staggers text-mask rise.
- `closeMenu()`: Animates reverse clip-path, restores shelf interaction, and resets focus.
