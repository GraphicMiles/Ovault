# OVault — Frontend Mockup

> **The backup of your backups.** Connect GitHub, pick up to 5 repositories, and OVault keeps the latest version plus 5 previous ones — browseable like a file manager.

This repository contains the **frontend mockup** for OVault: a fully client-side HTML/CSS/JS build with hard-coded mock data. No backend required to run it.

## Run

Serve the folder with any static server:

```bash
python3 -m http.server 8765
```

Open http://localhost:8765 — the app is hash-routed (`#/`, `#/pick`, `#/repo/impose`, `#/repo/impose/browse`, `#/file/code`, `#/settings`, `#/states`, `#/signin`).

## Structure

| Path | Purpose |
|---|---|
| `index.html` | App shell (hash-routed SPA) |
| `assets/css/app.css` | Design system + components |
| `assets/js/app.js` | Views, mock data, modals, demo state switcher |
| `assets/fa/` | FontAwesome icon font (bundled, no CDN) |
| `assets/fonts/` | Inter / Inter Tight variable fonts (bundled) |
| `tools/qa.mjs` | Playwright UI/UX audit (constraints + layout) |
| `tools/shot.mjs` | Screenshot harness — 20 pages × 4 breakpoints |
| `tools/cmap.py` | Color-quantized ASCII visual audit |
| `shots/` | Breakpoint screenshots (mobile / tablet / desktop / wide) |

## Design system — monochrome base (dark arrangement), semantic accents

The locked 4-tone palette governs the base UI; this build arranges it **dark** — app
background dark, elevated surfaces lighter dark. Semantic accents are reserved for special UI.

| Role | Token | Hex | Use |
|---|---|---|---|
| App background | `--bg` | `#050505` (Black) | canvas, recessed code preview |
| Surfaces | `--surface` | `#212529` (Eerie Black) | cards, rail, topbar chrome, modal, toast, hero, demo bar |
| Surface insets | `--surface-2` / `--surface-3` | `#2b3036` / `#363c43` (derived) | fields, soft pills, unchecked checks, hover states |
| Text | `--ink` / `--ink-2` | `#fafafa` (Seasalt) / `#a3a5a9` (Cadet Grey) | headings / secondary |
| Text meta | `--ink-3` / `--ink-4` | `#8b9096` / `#767c82` (derived) | labels, placeholders, disabled |
| Inverted pills | `--contrast` / `--contrast-ink` | `#fafafa` + `#050505` | primary CTAs, active tabs, checked boxes, chip-dark, avatar, segmented active, white icon buttons |

Semantic accents (green/red/amber/blue/neutral soft pairs + mint `#7cefb0`): status chips,
banners, progress, destructive actions, brand moments only. No shadows anywhere; elevation
is surface value + spacing. No grey border lines; separation is background stepping. No
outlined inputs — focus is a soft tint (`--surface-2/3`), never a ring. Icons are Font
Awesome + Lucide glyphs (no hand-drawn SVG); the favicon is a PNG data URI.

## Screens & states

Sign-in · Dashboard (populated, empty, loading, error, connection lost) · Repo picker (draft selections, 5/5 limit) · Repository detail (protected, backing up, failed, connection issue, deleted on GitHub, not monitored) · File browser (files, empty, processing, error) · File detail (code preview, secret-file preview blocklist, image) · Settings (with danger zone) · UI state gallery.

Use the floating **“Demo states”** pill (bottom-right) to walk every page-state-matrix row.

## QA

```bash
npm install            # installs playwright (dev tooling)
node tools/qa.mjs      # 0-issue gate: shadows, borders, outlines, overflow, tap targets, icons, fonts, padding
node tools/shot.mjs    # regenerates shots/
python3 tools/cmap.py shots/dash-desktop.png
```

## Product notes

Built against the OVault PRD v3: 5-repo server-side limit, retention of latest + 5 previous snapshots (commit-SHA identity), "previous versions" — never git history, GitHub App architecture, and a full page state matrix (§91). Backend wiring comes next.
