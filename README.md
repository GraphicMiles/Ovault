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

## Design system — monochrome base, semantic accents

- **Canvas** Cadet Grey `#A3A5A9` · **Surfaces** Seasalt `#FAFAFA` · **Ink** Black `#050505` / Eerie Black `#212529`
- **No shadows, no borders, no focus outlines** — elevation comes from surface contrast only
- Pill geometry, compact padding, icon-font icons (FontAwesome), soft-filled inputs
- Accents (green / amber / red / blue) are reserved for **special UI only**: status chips, banners, progress, destructive actions, and brand moments

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
