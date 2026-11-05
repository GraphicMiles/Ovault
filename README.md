# OVault

A backup of your backups. Connect GitHub, choose up to five repositories, and
OVault keeps the latest version of every file alongside the five versions before
it, browsable the way you browse a folder.

This repository is the frontend mockup of that product: a complete, clickable
interface with hard-coded data. It runs in a browser with no server, no GitHub
connection and no network calls.

## Why it exists

A repository can be force-pushed, a branch deleted, a laptop lost. Git protects
the history of the code but not the thing most people actually worry about: the
version of a file they shipped last week and no longer have. OVault is a design
investigation into what that safety net looks like when it is a file manager
rather than a git log.

## What you can do

- **Browse a connected repository** as a file tree, with folders, file types and
  the last time each file changed.
- **Open a file and step back** through its previous versions, with the current
  one marked.
- **Add repositories** from the picker, up to five.
- **Look at the states the product needs and not only the happy one**: empty
  account, failed connection, loading, and search with no results. The demo bar
  and the `#/states` route let you jump between them.
- **Run a design audit.** The interface is checked against its own layout rules
  by a script in `tools/`, at four viewport widths.

Routes: `#/signin`, `#/` (dashboard), `#/pick` (repository picker),
`#/repo/<name>`, `#/repo/<name>/browse`, `#/file/code`, `#/settings`,
`#/states`.

## Running it

```bash
python3 -m http.server 8765
```

Open http://localhost:8765. Any static server works; there is no build step.

## What is not here

- The GitHub connection is simulated. Every repository, file and version in the
  interface comes from the mock data in `assets/js/app.js`.
- Nothing is stored. Reloading the page resets the demo state.
- Retention is fixed at five previous versions in this mockup.
- There is no backend, no authentication and no billing.

## How it is built

| Path | Purpose |
|---|---|
| `index.html` | The app shell. One page, hash-routed. |
| `assets/css/app.css` | Design system and components. |
| `assets/js/app.js` | Views, mock data, modals, the demo state switcher. |
| `assets/fa/` | Font Awesome, bundled. |
| `assets/fonts/` | Inter and Inter Tight variable fonts, bundled. |
| `tools/serve.mjs` | Static server used by the app, the tests and CI. |
| `tools/qa.mjs` | Playwright layout and constraint audit. |
| `tools/shot.mjs` | Screenshot harness, every view at four breakpoints. |
| `tools/cmap.py` | Colour-quantised ASCII visual check. |
| `shots/` | Breakpoint captures written by `tools/shot.mjs`. |

The palette is a monochrome base arranged dark, with semantic accents used only
for status: green, red, amber, blue and a mint for positive moments. Elevation
comes from surface value and spacing rather than shadows, and separation comes
from background stepping rather than border lines.

### Checks

```bash
npm install
npm start                # static server on :4180
npm test                 # Playwright smoke suite, desktop and phone
npm run test:qa          # layout and constraint audit
npm run shots            # writes shots/ for visual review
```

`npm test` walks the journeys a person actually takes: sign in, the repository
list, a repository, its file browser, a file, the empty vault, a lost connection,
a failed backup, settings and the guard on a destructive action. It also asserts
that every route renders without a console error and that nothing scrolls
sideways on a 390 pixel wide screen. It runs twice, once at desktop size and once
as a phone.

`npm run test:qa` is the layout audit: it walks the same routes at 390, 768, 1280
and 1512 pixels wide and fails on overflow, clipped text and broken constraints.
`.github/workflows/ci.yml` runs the smoke suite on every push and pull request.

## Licence

ISC, see `LICENSE`.
