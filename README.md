# Leon Vasari: Curved VHS Archive

An interactive 3D film archive hero and catalog for the fictional director **Leon Vasari**, built with **Angular 21 (Zoneless)**, **TypeScript**, **Tailwind CSS**, and the **Web Animations API**.

![Leon Vasari VHS Archive Banner](https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png&w=1744&q=85)

---

## 📽️ Features

- **3D Curved VHS Shelf Arc**:
  - 36 worn VHS tapes (3 infinite loops of 12 films) arranged along a receding 3D arc.
  - Geometry computed via depth-falloff scale integral $XS$, CSS perspective (1400px), and bowl curve depression.
  - Automatic depth shading (`--shade`) making distant spines darker and tightly packed.
  - Hover lift easing ($1 - e^{-12dt}$) on non-active tapes.

- **Active Cassette Cover & Tilt**:
  - The central tape is turned 90° in 3D to reveal its illustrated front cover.
  - Reactive pointer parallax tilt on both X and Y axes.
  - Soft radial floor shadow and floating play badge ring.

- **Halftone Kanji & Tactile Paper Grain**:
  - Oversized background vertical kanji (**映画** / **の記憶**) rendered with radial halftone dot screen text clipping.
  - Full-screen procedural paper grain texture using SVG `feTurbulence` fractal noise and color matrix filtering (`mix-blend-mode: multiply`).

- **Interactive Timeline Scrubber (1955–1990)**:
  - 36-tick interactive timeline with major/minor marks and year labels.
  - Smoothly gliding cobalt dot tracking the active release year with wrap handling.
  - Clickable scrubber navigating to the nearest film via the shortest circular path.

- **Mask-Slide Typography & Web Animations API**:
  - Non-opacity reveal transitions: directional vertical mask slide ($650\text{ms}$ `cubic-bezier(.2,.8,.2,1)`).
  - Custom cursor with 3 reactive states: `.open` (expanded cobalt pill), `.spine`, and `.btn`.

- **Detail Sheet with Ink Bleed Reveal**:
  - Full-screen paper sheet growing out of the active cover's projected bounding rectangle via `clip-path` ($1050\text{ms}$ `cubic-bezier(.76,0,.18,1)`).
  - Staggered mask-rise text reveals for romaji/kanji, large title, metadata, Newsreader synopsis, and credits.
  - High-fidelity SVG poster bleed driven by 7 expanding circles through `feTurbulence` and `feDisplacementMap` filters.

---

## ⌨️ Controls & Navigation

| Input | Action |
|---|---|
| **Drag / Swipe** | Scrub shelf left or right with spring physics |
| **Mouse Wheel** | Scroll along the arc with 160ms snap-to-center |
| **Arrow Keys (← / →)** | Step to previous / next film |
| **Click Tape Spine** | Center the clicked VHS tape |
| **Click Active Cover / Play Ring / Enter** | Open full-screen ink bleed detail sheet |
| **Click Close / Escape** | Close detail sheet and return to shelf |
| **Timeline Click** | Jump directly to films by release year |

---

## 📁 Film Catalog (1958 – 1989)

| # | Title | Romaji / Kanji | Year | Genre | Duration |
|---|---|---|---|---|---|
| 0 | **The Silent Valley** | SHIZUKANA TANI / 静かな谷 | 1958 | Drama | 104 min |
| 1 | **The Blue Hour** | AO NO TOKI / 青の刻 | 1962 | Romance | 97 min |
| 2 | **River of Salt** | SHIO NO KAWA / 塩の川 | 1964 | Drama | 121 min |
| 3 | **The Last Summer** | SAIGO NO NATSU / 最後の夏 | 1966 | Drama | 109 min |
| 4 | **The Green Road** | MIDORI NO MICHI / 緑の道 | 1969 | Mystery | 101 min |
| 5 | **Noon in Ashes** | HAI NO SHOGO / 灰の正午 | 1971 | Western | 112 min |
| 6 | **The Observer** | KANSATSUSHA / 観察者 | 1973 | Thriller | 96 min |
| 7 | **The Fallen Birds** | OCHITA TORI / 落ちた鳥 | 1975 | Drama | 118 min |
| 8 | **Light in the Storm** | ARASHI NO HI / 嵐の灯 | 1978 | Drama | 127 min |
| 9 | **The Long Tide** | NAGAI SHIO / 長い潮 | 1981 | Drama | 99 min |
| 10 | **A Quiet War** | SHIZUKANA SENSO / 静かな戦争 | 1985 | Comedy | 103 min |
| 11 | **Red Door** | AKAI TOBIRA / 赤い扉 | 1989 | Thriller | 114 min |

---

## 🛠️ Tech Stack

- **Framework**: [Angular 21](https://angular.dev/) (Zoneless, Standalone Components, Signals, `OnPush` Change Detection)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: Native [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) & `requestAnimationFrame`
- **Typography**: Inter Tight, Newsreader, Noto Sans JP
- **Server**: Express SSR integration

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/leon-vasari-vhs-archive.git

# Navigate to project folder
cd leon-vasari-vhs-archive

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 How to push to your GitHub repository

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# Rename branch to main if needed
git branch -M main

# Push all commits to GitHub
git push -u origin main
```
