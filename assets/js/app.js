/* OVault frontend mockup — client-side only, hard-coded mock data.
   Routes: #/signin #/ #/pick #/repo/:id #/repo/:id/browse #/file/:id #/settings #/states
   Optional query: ?state=... drives the demo state switcher (page state matrix §91). */

"use strict";

/* ============================== mock data ============================== */

const USER = {
  name: "Miles",
  handle: "GraphicMiles",
  email: "miles@graphicmiles.dev",
  initials: "GM",
  githubUser: "GraphicMiles",
};

const STATUS = {
  not_monitored:   { chip: "chip-grey",  icon: "fa-regular fa-circle",          label: "Not monitored" },
  monitoring:      { chip: "chip-green", icon: "fa-solid fa-circle-check",      label: "Protected" },
  backing_up:      { chip: "chip-blue",  icon: "fa-solid fa-rotate",            label: "Backing up…" },
  backup_failed:   { chip: "chip-red",   icon: "fa-solid fa-triangle-exclamation", label: "Backup failed" },
  connection_issue:{ chip: "chip-amber", icon: "fa-solid fa-plug-circle-xmark", label: "Connection issue" },
  unavailable_on_github: { chip: "chip-grey", icon: "fa-solid fa-slash",        label: "Unavailable on GitHub" },
  deleting:        { chip: "chip-grey",  icon: "fa-solid fa-circle-notch",      label: "Removing…" },
};

const REPOS = {
  impose: {
    id: "impose", name: "impose", owner: "GraphicMiles", visibility: "Private", branch: "main",
    status: "monitoring", lastBackup: "2 minutes ago", sha: "566d463",
    message: "fix backup worker", files: "1,284 files", size: "48.2 MB",
    versions: [
      { label: "Current",    sha: "566d463", msg: "fix backup worker",        time: "2 min ago", current: true },
      { label: "Previous 1", sha: "91a2c11", msg: "add retry budget to queue", time: "1 hour ago" },
      { label: "Previous 2", sha: "7bc821d", msg: "stream archive to storage",  time: "Yesterday" },
      { label: "Previous 3", sha: "33fa812", msg: "tweak retention order",      time: "2 days ago" },
      { label: "Previous 4", sha: "112aa91", msg: "polish empty states",        time: "3 days ago" },
      { label: "Previous 5", sha: "98c8122", msg: "initial scaffold",           time: "4 days ago" },
    ],
  },
  nearspace: {
    id: "nearspace", name: "nearspace", owner: "GraphicMiles", visibility: "Public", branch: "main",
    status: "monitoring", lastBackup: "12 minutes ago", sha: "81ac920",
    message: "docs: refresh onboarding", files: "642 files", size: "12.9 MB",
    versions: [
      { label: "Current",    sha: "81ac920", msg: "docs: refresh onboarding",   time: "12 min ago", current: true },
      { label: "Previous 1", sha: "c4d0e2a", msg: "fix nav focus ring",         time: "5 hours ago" },
      { label: "Previous 2", sha: "5ef1b33", msg: "bump deps",                  time: "2 days ago" },
    ],
  },
  luna: {
    id: "luna", name: "luna", owner: "GraphicMiles", visibility: "Private", branch: "main",
    status: "backing_up", lastBackup: "Backing up first version…", sha: "aa81291",
    message: "wip: dark mode", files: "2,031 files", size: "96.4 MB",
    versions: [],
  },
  "orbit-api": {
    id: "orbit-api", name: "orbit-api", owner: "GraphicMiles", visibility: "Private", branch: "main",
    status: "backup_failed", lastBackup: "2 hours ago", sha: "b0c41e7",
    message: "rate-limit sweep", files: "517 files", size: "21.8 MB",
    versions: [
      { label: "Current",    sha: "b0c41e7", msg: "rate-limit sweep",  time: "2 hours ago", current: true },
      { label: "Previous 1", sha: "3ad99f0", msg: "queue metrics",      time: "Yesterday" },
    ],
  },
  papercut: {
    id: "papercut", name: "papercut", owner: "GraphicMiles", visibility: "Public", branch: "main",
    status: "not_monitored", lastBackup: "Never", sha: "e71c2d4",
    message: "first commit", files: "88 files", size: "2.1 MB", versions: [],
  },
};

const FILETREE = {
  root: [
    { name: ".github",    type: "Folder", size: "—",     icon: "fa-solid fa-folder",             folder: true },
    { name: "src",        type: "Folder", size: "—",     icon: "fa-solid fa-folder",             folder: true },
    { name: "public",     type: "Folder", size: "—",     icon: "fa-solid fa-folder",             folder: true },
    { name: ".gitignore", type: "Text",   size: "248 B", icon: "fa-solid fa-file-lines" },
    { name: "package.json", type: "JSON", size: "2 KB",  icon: "fa-solid fa-file-code" },
    { name: "README.md",  type: "Markdown", size: "8 KB", icon: "fa-solid fa-file-lines" },
    { name: "luna.png",   type: "PNG image", size: "1.8 MB", icon: "fa-solid fa-file-image", file: "image" },
    { name: ".env",       type: "Environment", size: "412 B", icon: "fa-solid fa-key", file: "secret" },
    { name: "app.js",     type: "JavaScript", size: "42 KB", icon: "fa-solid fa-file-code", file: "code" },
    { name: "logo → public/logo.svg", type: "Symlink", size: "21 B", icon: "fa-solid fa-link", file: "code" },
    { name: "vendor/ui-kit", type: "Git submodule", size: "64 B", icon: "fa-solid fa-cubes-stacked", file: "code" },
    { name: "design-specs-final-v2-handoff.zip", type: "ZIP archive", size: "7.4 MB", icon: "fa-solid fa-file-zipper", file: "binary" },
  ],
  src: [
    { name: "components", type: "Folder", size: "—", icon: "fa-solid fa-folder", folder: true },
    { name: "utils",      type: "Folder", size: "—", icon: "fa-solid fa-folder", folder: true },
    { name: "app.js",     type: "JavaScript", size: "42 KB", icon: "fa-solid fa-file-code", file: "code" },
    { name: "config.js",  type: "JavaScript", size: "4 KB",  icon: "fa-solid fa-file-code", file: "code" },
    { name: "index.css",  type: "CSS", size: "9 KB", icon: "fa-solid fa-file-code", file: "code" },
    { name: "デバイス設定.json", type: "JSON", size: "1 KB", icon: "fa-solid fa-file-code", file: "code" },
    { name: "тест драйвер.py", type: "Python", size: "12 KB", icon: "fa-solid fa-file-code", file: "code" },
    { name: "Makefile",   type: "Makefile", size: "1 KB", icon: "fa-solid fa-file", file: "code" },
    { name: "a-very-long-filename-that-should-truncate-elegantly-in-narrow-layouts.ts", type: "TypeScript", size: "6 KB", icon: "fa-solid fa-file-code", file: "code" },
  ],
  "src/components": [
    { name: "Button.jsx", type: "React JSX", size: "3 KB", icon: "fa-solid fa-file-code", file: "code" },
    { name: "Modal.jsx",  type: "React JSX", size: "5 KB", icon: "fa-solid fa-file-code", file: "code" },
  ],
};

/* ============================== helpers ============================== */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function icon(name) { return `<i class="${name}"></i>`; }

function statusChip(status, extra = "") {
  const s = STATUS[status];
  return `<span class="chip ${s.chip}">${icon(s.icon)}<span>${s.label}${extra ? " · " + esc(extra) : ""}</span></span>`;
}

function toast(msg, ico = "fa-solid fa-circle-check") {
  const root = $("#toast-root");
  root.innerHTML = `<div class="toast">${icon(ico)}<span>${esc(msg)}</span></div>`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (root.innerHTML = ""), 2800);
}

/* ============================== chrome ============================== */

function topbar({ tabs = [], active = "", title = "" }) {
  return `
  <header class="topbar">
    ${title ? `<h1 class="h2 mobile-title">${esc(title)}</h1>` : ""}
    <nav class="tabbar" aria-label="Sections">
      ${tabs.map((t) => `<a class="tab ${t.id === active ? "active" : ""}" href="${t.href}">${esc(t.label)}</a>`).join("")}
    </nav>
    <div class="grow"></div>
    <button class="icon-btn round white hide-sm" type="button" data-action="search" title="Search">${icon("fa-solid fa-magnifying-glass")}</button>
    <button class="icon-btn round white hide-sm" type="button" data-action="notifications" title="Notifications">${icon("fa-solid fa-bell")}</button>
    <a class="user-pill" href="#/settings">
      <span class="avatar">${USER.initials}</span>
      <span class="hide-sm">${USER.name}</span>
      ${icon("fa-solid fa-chevron-down chev")}
    </a>
  </header>`;
}

const TABS = [
  { id: "repositories", label: "Repositories", href: "#/" },
  { id: "pick", label: "Add repositories", href: "#/pick" },
  { id: "settings", label: "Settings", href: "#/settings" },
];

/* ============================== views ============================== */

function viewSignin() {
  return `
  <div class="split-signin">
    <section class="hero-brand hero-signin">
      <div class="rowflex gap-10">
        <span class="orb filled">${icon("fa-solid fa-vault")}</span>
        <span style="font-family:var(--font-display);font-weight:700;font-size:18px">OVault</span>
      </div>
      <div class="stack gap-16">
        <h1 class="hero-title">The backup of<br /><em>your backups.</em></h1>
        <p class="hero-sub">GitHub is where you build. OVault keeps another copy — automatically, quietly, always browsable.</p>
        <div class="plates mt-8">
          <span class="plate">${icon("fa-solid fa-shield-halved")} Monitor</span>
          <span class="plate">${icon("fa-solid fa-box-archive")} Snapshot</span>
          <span class="plate">${icon("fa-solid fa-rotate-left")} Recover</span>
        </div>
      </div>
      <p class="hero-sub mono" style="font-size:11px">latest version + 5 previous · GitHub only · 5 repositories</p>
    </section>
    <section class="card card-signin">
      <p class="eyebrow">Welcome back</p>
      <h2 class="display mt-8">Protect your<br/>repositories.</h2>
      <p class="sub mt-12">Sign in to open your vault. We never ask for personal access tokens.</p>
      <button class="btn btn-dark btn-lg mt-24" type="button" data-action="signin">
        ${icon("fa-brands fa-github")} Continue with GitHub
      </button>
      <button class="btn btn-ghost mt-8" type="button" data-action="signin">
        ${icon("fa-solid fa-envelope")} Continue with email
      </button>
      <p class="meta mt-24">By continuing you agree to keep at least one copy of everything important.</p>
    </section>
  </div>`;
}

function viewDashboard(state) {
  const connected = state !== "empty";
  const bannerHtml = state === "lost"
    ? `<div class="banner mb-16">${icon("fa-solid fa-plug-circle-xmark")}
        <div class="grow"><b>GitHub connection lost.</b> Your backups are safe and monitoring is paused.</div>
        <button class="btn btn-dark btn-sm" type="button" data-action="reconnect">${icon("fa-solid fa-rotate")} Reconnect GitHub</button>
       </div>` : "";

  const loading = state === "loading";
  const error = state === "error";

  const header = `
    <div class="rowflex wrap gap-12 mb-16">
      <div class="grow">
        <div class="rowflex gap-10">
          <p class="eyebrow">Your vault</p>
          <span class="chip chip-grey"><span class="tnum">3 / 5</span>&nbsp;repositories protected</span>
        </div>
        <h1 class="display mt-8">Repositories</h1>
      </div>
      <div class="rowflex gap-8">
        <a class="btn btn-soft" href="#/pick">${icon("fa-solid fa-plus")} Add repository</a>
        <button class="btn btn-primary" type="button" data-action="backup-all">${icon("fa-solid fa-rotate")} Back up now</button>
      </div>
    </div>`;

  const stats = `
    <div class="stats mb-12">
      <div class="card compact">
        <div class="stat-label">${icon("fa-solid fa-shield-halved")} Protected repositories</div>
        <div class="stat-value tnum">3</div>
        <div class="stat-sub">2 need attention · 1 not monitored</div>
      </div>
      <div class="card compact">
        <div class="stat-label">${icon("fa-solid fa-box-archive")} Versions kept</div>
        <div class="stat-value tnum">11</div>
        <div class="stat-sub">up to 6 per repository</div>
      </div>
      <div class="card compact">
        <div class="stat-label">${icon("fa-solid fa-hard-drive")} Storage used</div>
        <div class="stat-value tnum">181 <span style="font-size:15px;font-weight:560;color:var(--ink-2)">MB</span></div>
        <div class="stat-sub">private bucket · encrypted at rest</div>
      </div>
    </div>`;

  const repoCard = (r) => {
    const needsAttention = r.status === "backup_failed" || r.status === "connection_issue";
    return `
    <a class="row hoverable" href="#/repo/${r.id}" style="background:var(--surface);margin-bottom:8px;padding:14px 16px">
      <span class="tile-icon">
        ${icon("fa-solid fa-book-bookmark")}
      </span>
      <div class="grow">
        <div class="rowflex wrap gap-8">
          <span class="row-title" style="font-size:14.5px">${r.name}</span>
          ${statusChip(r.status)}
        </div>
        <div class="row-meta mt-4">${r.owner} / ${r.name} · ${r.visibility} · ${r.branch} · <span class="mono">${r.sha}</span></div>
      </div>
      <div class="rowflex gap-8 hide-sm">
        ${needsAttention
          ? `<button class="btn btn-sm ${r.status === "backup_failed" ? "btn-danger" : "btn-soft"}" type="button" data-action="retry">${icon("fa-solid fa-rotate")} Retry</button>`
          : `<span class="meta">${esc(r.lastBackup === "Never" ? "Not monitored yet" : r.lastBackup)}</span>`}
        <span class="icon-btn">${icon("fa-solid fa-chevron-right")}</span>
      </div>
    </a>`;
  };

  let body;
  if (loading) {
    body = `
      ${header}
      <div class="card stack gap-12">
        ${[1, 2, 3].map(() => `
          <div class="row hoverable" style="background:var(--surface-2)">
            <span class="tile-icon" style="background:var(--surface-3)"></span>
            <div class="grow stack gap-8">
              <div style="height:12px;width:38%;border-radius:99px;background:var(--surface-3)"></div>
              <div style="height:10px;width:62%;border-radius:99px;background:var(--surface-3)"></div>
            </div>
            <div style="height:26px;width:96px;border-radius:99px;background:var(--surface-3)"></div>
          </div>`).join("")}
        <p class="meta" style="text-align:center;padding:8px">Loading your vault…</p>
      </div>`;
  } else if (error) {
    body = `
      ${header}
      <div class="card" style="text-align:center;padding:48px 24px">
        <span class="tile-icon red" style="width:46px;height:46px;border-radius:14px;font-size:18px">${icon("fa-solid fa-triangle-exclamation")}</span>
        <h2 class="h2 mt-16">Couldn't load your vault</h2>
        <p class="sub mt-8">The request timed out. Your backups are safe — this is only the list.</p>
        <button class="btn btn-dark mt-20" type="button" data-action="reload">${icon("fa-solid fa-rotate")} Retry</button>
      </div>`;
  } else if (!connected) {
    body = `
      <div class="hero-brand">
        <div class="rowflex wrap gap-12">
          <div class="grow">
            <p class="eyebrow" style="color:var(--brand-mint)">Empty vault</p>
            <h1 class="hero-title mt-12">Protect your<br /><em>repositories.</em></h1>
            <p class="hero-sub mt-12">Connect GitHub and choose up to 5 repositories. OVault will automatically keep their latest version and up to 5 previous versions.</p>
            <button class="btn btn-mint btn-lg mt-24" type="button" data-action="connect">${icon("fa-brands fa-github")} Connect GitHub</button>
          </div>
          <div class="stack gap-10" style="align-items:flex-end">
            <div class="plates"><span class="plate soft">${icon("fa-solid fa-code-branch")} Push on GitHub</span></div>
            <div class="plates"><span class="plate">${icon("fa-solid fa-vault")} Protected in OVault</span></div>
            <div class="plates"><span class="plate soft">${icon("fa-solid fa-download")} Download any time</span></div>
          </div>
        </div>
      </div>
      <div class="stats mt-12">
        <div class="card compact"><div class="stat-label">${icon("fa-solid fa-bolt")} Automatic</div><div class="stat-sub" style="margin-top:2px">New commits trigger backups within moments — webhooks, not polling.</div></div>
        <div class="card compact"><div class="stat-label">${icon("fa-solid fa-clock-rotate-left")} 6 versions</div><div class="stat-sub" style="margin-top:2px">Latest plus 5 previous, always. Older versions rotate out safely.</div></div>
        <div class="card compact"><div class="stat-label">${icon("fa-solid fa-lock")} Private</div><div class="stat-sub" style="margin-top:2px">Backups are yours alone — private storage, authenticated downloads.</div></div>
      </div>`;
  } else {
    body = `
      ${header}
      ${bannerHtml}
      ${stats}
      <div class="card compact">
        <div class="card-head">
          <span class="tile-icon">${icon("fa-solid fa-folder-tree")}</span>
          <h2 class="h2 grow">Monitored repositories</h2>
          <span class="chip chip-green">${icon("fa-solid fa-shield-halved")} 3 protected</span>
        </div>
        <div class="rows">
          ${repoCard(REPOS.impose)}
          ${repoCard(REPOS.nearspace)}
          ${repoCard(REPOS.luna)}
          ${repoCard(REPOS["orbit-api"])}
          ${repoCard(REPOS.papercut)}
        </div>
      </div>`;
  }

  return topbar({ tabs: TABS, active: "repositories", title: "Repositories" }) + `<div class="page-wide">${body}</div>`;
}

function viewPick(state) {
  const full = state === "full";
  const loading = state === "loading";
  const error = state === "error";
  const empty = state === "empty";

  const repoLine = (r, checked, disabled, meta) => `
    <label class="row hoverable" style="background:var(--surface);margin-bottom:6px;cursor:${disabled ? "not-allowed" : "pointer"};opacity:${disabled ? 0.55 : 1}">
      <input class="check" type="checkbox" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
      <div class="grow">
        <div class="row-title" style="font-size:14px">${r.name}</div>
        <div class="row-meta mt-4">${meta}</div>
      </div>
      <span class="chip chip-grey">${r.visibility}</span>
    </label>`;

  let list;
  if (loading) {
    list = `<div class="card" style="text-align:center;padding:40px"><p class="sub">${icon("fa-solid fa-rotate")} Loading repositories…</p></div>`;
  } else if (error) {
    list = `
      <div class="card" style="text-align:center;padding:40px">
        <h2 class="h2">Couldn't load your repositories</h2>
        <p class="sub mt-8">The filter above stays as you typed it. Try again in a moment.</p>
        <button class="btn btn-dark mt-16" type="button" data-action="reload">${icon("fa-solid fa-rotate")} Retry</button>
      </div>`;
  } else if (empty) {
    list = `
      <div class="card" style="text-align:center;padding:40px">
        <h2 class="h2">No repositories found</h2>
        <p class="sub mt-8">OVault can only see repositories your GitHub account can access.</p>
        <div class="rowflex gap-8 mt-16" style="justify-content:center">
          <button class="btn btn-soft" type="button" data-action="reload">${icon("fa-solid fa-rotate")} Refresh</button>
          <button class="btn btn-dark" type="button">${icon("fa-brands fa-github")} Create a repository</button>
        </div>
      </div>`;
  } else {
    const limitNote = full
      ? `<div class="banner mb-12">${icon("fa-solid fa-circle-info")}
          <div class="grow"><b>You're protecting 5 of 5 repositories.</b> Stop monitoring one to add another.</div>
          <button class="btn btn-dark btn-sm" type="button" data-action="go-repos">Review</button>
         </div>` : "";
    const selected = full ? 5 : 2;
    list = `
      ${limitNote}
      <div class="card compact">
        ${repoLine(REPOS.impose, true, false, "GraphicMiles / impose · Private · main · updated 2 min ago")}
        ${repoLine(REPOS.nearspace, true, false, "GraphicMiles / nearspace · Public · main · updated 12 min ago")}
        ${repoLine(REPOS.luna, false, full, "GraphicMiles / luna · Private · main · updated 1 hour ago")}
        ${repoLine(REPOS["orbit-api"], false, full, "GraphicMiles / orbit-api · Private · main · updated 2 hours ago")}
        ${repoLine(REPOS.papercut, false, full, "GraphicMiles / papercut · Public · main · updated yesterday")}
        <div class="row hoverable" style="cursor:default;opacity:.55">
          <input class="check" type="checkbox" disabled />
          <div class="grow"><div class="row-title" style="font-size:14px">luna-design</div>
          <div class="row-meta mt-4">Not accessible — grant access in GitHub</div></div>
          <button class="btn btn-sm btn-soft" type="button">${icon("fa-solid fa-arrow-up-right-from-square")} Open GitHub</button>
        </div>
      </div>
      <div class="card compact mt-12 rowflex wrap gap-12">
        <div class="grow">
          <div class="rowflex gap-8"><b class="tnum" style="font-size:14px">${selected} / 5 selected</b>
          ${full ? `<span class="chip chip-amber">${icon("fa-solid fa-circle-info")} Limit reached</span>` : ""}</div>
          <div class="bar slim mt-8" style="max-width:220px"><span style="width:${selected * 20}%"></span></div>
        </div>
        <button class="btn btn-ghost" type="button" data-action="cancel-draft">Cancel</button>
        <button class="btn btn-primary" type="button" data-action="start-monitoring" ${full ? "disabled style=opacity:.5;cursor:not-allowed" : ""}>
          ${icon("fa-solid fa-shield-halved")} Start monitoring
        </button>
      </div>`;
  }

  return topbar({ tabs: TABS, active: "pick", title: "Add repositories" }) + `
    <div class="page">
      <div class="rowflex wrap gap-12 mb-16">
        <div class="grow">
          <p class="eyebrow">Repository picker</p>
          <h1 class="display mt-8">Select repositories</h1>
          <p class="sub mt-8">Choose up to 5. Selections are kept as a draft until you start monitoring.</p>
        </div>
      </div>
      <div class="field mb-12" style="max-width:420px">
        ${icon("fa-solid fa-magnifying-glass")}
        <input type="text" placeholder="Filter by name or owner…" />
        <span class="chip chip-grey tnum">6 found</span>
      </div>
      ${list}
    </div>`;
}

function viewRepo(id, state) {
  const r = REPOS[id] || REPOS.impose;
  const s = state || (r.status === "backup_failed" ? "failed" : r.status === "backing_up" ? "backing_up" : r.status === "not_monitored" ? "not_monitored" : "protected");

  const stateBanner = {
    backing_up: `<div class="banner blue mb-16">${icon("fa-solid fa-rotate")}
        <div class="grow"><b>Creating your first backup of ${r.name}.</b> You can leave this page — we'll keep working.</div>
        <span class="chip chip-blue">Fetching repository…</span></div>`,
    failed: `<div class="banner red mb-16">${icon("fa-solid fa-triangle-exclamation")}
        <div class="grow"><b>The latest version of ${r.name} couldn't be backed up.</b> Last successful backup: 2 hours ago.</div>
        <button class="btn btn-dark btn-sm" type="button" data-action="retry">${icon("fa-solid fa-rotate")} Retry backup</button></div>`,
    connection_issue: `<div class="banner mb-16">${icon("fa-solid fa-plug-circle-xmark")}
        <div class="grow"><b>Access lost on GitHub.</b> Backups paused. Latest backup: 3 hours ago.</div>
        <button class="btn btn-dark btn-sm" type="button" data-action="reconnect">${icon("fa-solid fa-rotate")} Re-authorize</button></div>`,
    unavailable: `<div class="banner mb-16">${icon("fa-solid fa-slash")}
        <div class="grow"><b>This repository was deleted on GitHub.</b> OVault still has your backups.</div>
        <button class="btn btn-dark btn-sm" type="button" data-action="download">${icon("fa-solid fa-download")} Download</button></div>`,
    not_monitored: `<div class="banner green mb-16">${icon("fa-regular fa-circle")}
        <div class="grow"><b>Not monitored.</b> Existing backups remain available. Resume any time.</div>
        <button class="btn btn-dark btn-sm" type="button" data-action="resume">${icon("fa-solid fa-play")} Resume monitoring</button></div>`,
  }[s] || "";

  const history = r.versions.length
    ? r.versions.map((v) => `
        <div class="version-row ${v.current ? "is-current" : ""}">
          <span class="chip ${v.current ? "chip-green" : "chip-grey"}">${v.current ? icon("fa-solid fa-star") : icon("fa-regular fa-clock")} ${v.label}</span>
          <div class="grow">
            <div class="rowflex gap-8 wrap">
              <span class="mono" style="font-weight:700">${v.sha}</span>
              <span class="meta">${esc(v.msg)}</span>
            </div>
          </div>
          <span class="meta hide-sm">${esc(v.time)}</span>
          <a class="icon-btn" href="#/repo/${r.id}/browse" title="Browse">${icon("fa-solid fa-folder-open")}</a>
          <button class="icon-btn" type="button" data-action="download" title="Download">${icon("fa-solid fa-download")}</button>
        </div>`).join("")
    : `<div class="callout amber">
        <div class="callout-head">${icon("fa-solid fa-clock")} <span class="grow">No backups yet</span></div>
        ${s === "backing_up" ? "The first snapshot is being created right now." : "Start monitoring to create the first version."}
       </div>`;

  return topbar({ tabs: TABS, active: "repositories", title: r.name }) + `
    <div class="page-wide">
      <div class="rowflex wrap gap-12 mb-20">
        <div class="grow">
          <a class="btn btn-ghost btn-sm mb-8" href="#/">${icon("fa-solid fa-arrow-left")} Repositories</a>
          <div class="rowflex gap-10 wrap">
            <h1 class="display">${r.name}</h1>
            ${statusChip(s === "protected" ? "monitoring" : s === "failed" ? "backup_failed" : s === "backing_up" ? "backing_up" : s === "connection_issue" ? "connection_issue" : s === "unavailable" ? "unavailable_on_github" : "not_monitored")}
          </div>
          <p class="sub mt-8">${r.owner} / ${r.name} · ${r.visibility} · ${r.branch} · ${r.files} · ${r.size}</p>
        </div>
        <div class="rowflex gap-8 wrap">
          <a class="btn btn-soft" href="#/repo/${r.id}/browse">${icon("fa-solid fa-folder-open")} Browse files</a>
          <button class="btn btn-primary" type="button" data-action="download">${icon("fa-solid fa-download")} Download current</button>
          <button class="icon-btn" type="button" data-action="more" title="More">${icon("fa-solid fa-ellipsis")}</button>
        </div>
      </div>

      ${stateBanner}

      <div class="split">
        <section class="card compact">
          <div class="card-head">
            <span class="tile-icon">${icon("fa-solid fa-clock-rotate-left")}</span>
            <h2 class="h2 grow">Backup history</h2>
            <span class="chip chip-grey tnum">${r.versions.length} / 6 versions</span>
          </div>
          ${history}
          <div class="bar slim mt-12"><span style="width:${Math.min(r.versions.length / 6, 1) * 100}%"></span></div>
          <p class="meta mt-8">Retention: latest version + 5 previous. Older versions rotate out after each new backup.</p>
        </section>

        <aside class="stack gap-12">
          <div class="card compact">
            <div class="card-head">
              <span class="tile-icon">${icon("fa-solid fa-shield-halved")}</span>
              <h2 class="h2 grow">Protection</h2>
            </div>
            <div class="stack gap-10">
              <div class="rowflex"><span class="meta grow">Current version</span><span class="mono" style="font-weight:700">${r.sha}</span></div>
              <div class="rowflex"><span class="meta grow">Last backup</span><span style="font-size:12.5px;font-weight:600">${esc(r.lastBackup)}</span></div>
              <div class="rowflex"><span class="meta grow">Monitoring</span>${statusChip(s === "protected" ? "monitoring" : s === "failed" ? "backup_failed" : "not_monitored")}</div>
              <div class="rowflex"><span class="meta grow">Trigger</span><span style="font-size:12.5px;font-weight:600">GitHub push events</span></div>
            </div>
          </div>
          ${s === "unavailable" ? `
          <div class="card compact" style="background:var(--surface-2)">
            <div class="card-head"><span class="tile-icon red">${icon("fa-solid fa-slash")}</span><h2 class="h2 grow">Removed from GitHub</h2></div>
            <p class="sub">Your latest OVault backup is safe: <span class="mono">${r.sha}</span>. Browse or download it like any other version.</p>
            <button class="btn btn-danger mt-12" type="button" data-action="remove">${icon("fa-solid fa-trash")} Remove from OVault</button>
          </div>` : `
          <div class="card compact">
            <div class="card-head"><span class="tile-icon">${icon("fa-solid fa-sliders")}</span><h2 class="h2 grow">Actions</h2></div>
            <div class="stack gap-8">
              <button class="btn btn-soft btn-block" type="button" data-action="download">${icon("fa-solid fa-download")} Download current snapshot</button>
              <button class="btn btn-soft btn-block" type="button" data-action="stop">${icon("fa-solid fa-pause")} Stop monitoring</button>
              <button class="btn btn-danger btn-block" type="button" data-action="remove">${icon("fa-solid fa-trash")} Remove from OVault</button>
            </div>
          </div>`}
        </aside>
      </div>
    </div>`;
}

function viewBrowse(id, path, state) {
  const r = REPOS[id] || REPOS.impose;
  const key = path && path !== "" ? (path === "src/components" ? "src/components" : path) : "root";
  const items = FILETREE[key] || FILETREE.root;

  const crumbs = ["OVault", r.name, "Current", ...(path ? path.split("/") : [])];
  const crumbHtml = crumbs.map((c, i) => {
    const last = i === crumbs.length - 1;
    return `${i ? `<span class="sep">${icon("fa-solid fa-chevron-right")}</span>` : ""}${last
      ? `<span class="current">${esc(c)}</span>`
      : `<a href="${i >= 3 ? "#/repo/" + r.id + "/browse?path=" + crumbs.slice(3, i).join("/") : "#/repo/" + r.id + "/browse"}">${esc(c)}</a>`}`;
  }).join("");

  const rows = items.map((f) => {
    const href = f.folder
      ? `#/repo/${r.id}/browse?path=${encodeURIComponent([...(path ? path.split("/") : []), f.name].join("/"))}`
      : `#/file/${f.file || "code"}`;
    return `
      <a class="file-row" href="${href}">
        <div class="name">
          <span class="tile-icon">${icon(f.icon)}</span>
          <div class="grow">
            <div class="row-title" style="font-size:13.5px">${esc(f.name)}</div>
            <div class="m-meta">${esc(f.type)} · ${esc(f.size)}</div>
          </div>
        </div>
        <div class="ftype">${esc(f.type)}</div>
        <div class="fsize">${esc(f.size)}</div>
        <span class="icon-btn" style="width:32px;height:32px">${icon("fa-solid fa-chevron-right")}</span>
      </a>`;
  }).join("");

  let list;
  if (state === "error") {
    list = `
      <div class="card" style="text-align:center;padding:40px">
        <h2 class="h2">Couldn't load this folder</h2>
        <p class="sub mt-8">The snapshot itself is safe. Try again in a moment.</p>
        <button class="btn btn-dark mt-16" type="button" data-action="reload">${icon("fa-solid fa-rotate")} Retry</button>
      </div>`;
  } else if (state === "processing") {
    list = `
      <div class="card" style="text-align:center;padding:44px">
        <span class="tile-icon blue" style="width:46px;height:46px;border-radius:14px;font-size:18px">${icon("fa-solid fa-rotate")}</span>
        <h2 class="h2 mt-16">First backup in progress</h2>
        <p class="sub mt-8">Creating your first backup of ${r.name}. This screen opens automatically when it completes.</p>
        <div class="bar slim mt-20" style="max-width:320px;margin-inline:auto"><span style="width:46%"></span></div>
      </div>`;
  } else if (state === "empty") {
    list = `
      <div class="card" style="text-align:center;padding:40px">
        <span class="tile-icon" style="width:46px;height:46px;border-radius:14px;font-size:18px">${icon("fa-regular fa-folder-open")}</span>
        <h2 class="h2 mt-16">This folder is empty</h2>
        <p class="sub mt-8">Nothing was stored here in this version.</p>
      </div>`;
  } else {
    list = `
      <div class="card compact">
        <div class="file-head">
          <div>Name</div><div>Type</div><div style="text-align:right">Size</div><div></div>
        </div>
        ${rows}
      </div>`;
  }

  return topbar({ tabs: TABS, active: "repositories", title: r.name }) + `
    <div class="page-wide">
      <div class="rowflex wrap gap-12 mb-16">
        <div class="grow">
          <a class="btn btn-ghost btn-sm mb-8" href="#/repo/${r.id}">${icon("fa-solid fa-arrow-left")} ${r.name}</a>
          <div class="crumbs">${crumbHtml}</div>
        </div>
        <div class="rowflex gap-8">
          <span class="chip chip-green hide-sm">${icon("fa-solid fa-star")} Current · <span class="mono">${r.sha}</span></span>
          <button class="btn btn-primary" type="button" data-action="download">${icon("fa-solid fa-download")} Download snapshot</button>
        </div>
      </div>
      ${state === "default" || !state ? `<div class="banner blue mb-12" style="background:var(--blue-soft)">${icon("fa-solid fa-cubes-stacked")}
        <div class="grow">This repository uses Git LFS. Large files are stored as pointer stubs in this backup.</div></div>` : ""}
      ${list}
    </div>`;
}

function viewFile(kind, state) {
  const secret = kind === "secret";
  const image = kind === "image";

  const meta = `
    <div class="card compact">
      <div class="card-head">
        <span class="tile-icon">${icon(secret ? "fa-solid fa-key" : image ? "fa-solid fa-file-image" : "fa-solid fa-file-code")}</span>
        <h2 class="h2 grow truncate">${secret ? ".env" : image ? "luna.png" : "app.js"}</h2>
        <button class="btn btn-primary btn-sm" type="button" data-action="download">${icon("fa-solid fa-download")} Download</button>
      </div>
      <div class="stack gap-10">
        <div class="rowflex"><span class="meta grow">Type</span><span style="font-size:12.5px;font-weight:600">${secret ? "Environment / configuration" : image ? "PNG image" : "JavaScript"}</span></div>
        <div class="rowflex"><span class="meta grow">Size</span><span style="font-size:12.5px;font-weight:600" class="tnum">${secret ? "412 B" : image ? "1.8 MB" : "42 KB"}</span></div>
        <div class="rowflex"><span class="meta grow">Path</span><span class="mono">${secret ? ".env" : image ? "public/luna.png" : "src/app.js"}</span></div>
        <div class="rowflex"><span class="meta grow">Snapshot</span><span style="font-size:12.5px;font-weight:600">Current · Sep 25, 2026</span></div>
      </div>
    </div>`;

  let preview;
  if (secret) {
    preview = `
      <div class="card compact">
        <div class="callout red">
          <div class="callout-head">${icon("fa-solid fa-eye-slash")} <span class="grow">Preview hidden</span><span class="chip chip-red">${icon("fa-solid fa-lock")} Secret-like file</span></div>
          This file may contain secrets, so it is never rendered on screen. You can still download it — downloads require your signed-in session.
        </div>
      </div>`;
  } else if (image) {
    preview = `
      <div class="card compact">
        <div class="card-head"><span class="tile-icon">${icon("fa-regular fa-image")}</span><h2 class="h2 grow">Preview</h2></div>
        <div style="background:var(--surface-2);border-radius:var(--r-md);padding:48px;display:grid;place-items:center;color:var(--ink-3)">
          <div style="text-align:center">
            <i class="fa-regular fa-image" style="font-size:40px"></i>
            <p class="meta mt-12">luna.png · 1.8 MB</p>
          </div>
        </div>
      </div>`;
  } else {
    preview = `
      <div class="card compact">
        <div class="card-head">
          <span class="tile-icon">${icon("fa-regular fa-eye")}</span>
          <h2 class="h2 grow">Preview</h2>
          <span class="chip chip-grey">Read-only</span>
        </div>
        <div class="preview"><span class="ln">1</span><span class="cm">// backup worker — retries with exponential backoff</span>
<span class="ln">2</span><span class="kw">export async function</span> capture(repo, sha) {
<span class="ln">3</span>  <span class="kw">const</span> archive = <span class="kw">await</span> github.archive(repo, sha);
<span class="ln">4</span>  <span class="kw">await</span> storage.put(key(repo, sha), archive);
<span class="ln">5</span>  <span class="kw">return</span> snapshot.complete(repo, sha);
<span class="ln">6</span>}
<span class="ln">7</span>
<span class="ln">8</span><span class="kw">const</span> retries = <span class="st">"3 attempts"</span>; <span class="cm">// bounded, never infinite</span></div>
      </div>`;
  }

  return topbar({ tabs: TABS, active: "repositories", title: "File" }) + `
    <div class="page">
      <a class="btn btn-ghost btn-sm mb-12" href="#/repo/impose/browse">${icon("fa-solid fa-arrow-left")} Back to browser</a>
      <div class="split">
        ${preview}
        ${meta}
      </div>
    </div>`;
}

function viewSettings(state) {
  const deleting = state === "deleting";
  return topbar({ tabs: TABS, active: "settings", title: "Settings" }) + `
    <div class="page">
      <p class="eyebrow">Account</p>
      <h1 class="display mt-8">Settings</h1>

      <div class="split mt-20">
        <div class="stack gap-12">
          <section class="card compact">
            <div class="card-head">
              <span class="tile-icon">${icon("fa-brands fa-github")}</span>
              <h2 class="h2 grow">GitHub connection</h2>
              <span class="chip chip-green">${icon("fa-solid fa-circle-check")} Connected</span>
            </div>
            <div class="rows">
              <div class="row hoverable" style="cursor:default">
                <div class="grow">
                  <div class="row-title">Connected as @${USER.githubUser}</div>
                  <div class="row-meta mt-4">GitHub App installed · contents read-only · webhooks subscribed</div>
                </div>
              </div>
            </div>
            <div class="rowflex gap-8 wrap mt-12">
              <button class="btn btn-soft" type="button" data-action="reconnect">${icon("fa-solid fa-rotate")} Reconnect</button>
              <button class="btn btn-ghost" type="button" data-action="disconnect">${icon("fa-solid fa-plug-circle-xmark")} Disconnect</button>
            </div>
          </section>

          <section class="card compact">
            <div class="card-head">
              <span class="tile-icon">${icon("fa-solid fa-user")}</span>
              <h2 class="h2 grow">Account</h2>
            </div>
            <div class="rows">
              <div class="row hoverable" style="cursor:default">
                <div class="grow">
                  <div class="row-title">${USER.email}</div>
                  <div class="row-meta mt-4">Signed in as ${USER.name} · session active</div>
                </div>
                <button class="btn btn-soft btn-sm" type="button" data-action="signout">${icon("fa-solid fa-arrow-right-from-bracket")} Sign out</button>
              </div>
            </div>
          </section>

          <section class="card compact">
            <div class="card-head">
              <span class="tile-icon red">${icon("fa-solid fa-triangle-exclamation")}</span>
              <h2 class="h2 grow">Danger zone</h2>
            </div>
            <div class="callout red">
              <div class="callout-head">${icon("fa-solid fa-skull-crossbones")} <span class="grow">Delete OVault account</span></div>
              This permanently deletes your account, all GitHub connection data, all repository backups, and all snapshots. This cannot be undone.
            </div>
            <button class="btn btn-danger mt-12" type="button" data-action="delete-account" ${deleting ? "disabled style=opacity:.5" : ""}>
              ${icon("fa-solid fa-trash")} ${deleting ? "Deletion is being finalized…" : "Delete account"}
            </button>
          </section>
        </div>

        <aside class="stack gap-12">
          <div class="card compact">
            <div class="card-head"><span class="tile-icon">${icon("fa-solid fa-shield-halved")}</span><h2 class="h2 grow">Vault health</h2></div>
            <div class="stack gap-10">
              <div class="rowflex"><span class="meta grow">Repositories</span><span style="font-size:12.5px;font-weight:600" class="tnum">5 / 5 used</span></div>
              <div class="rowflex"><span class="meta grow">Versions stored</span><span style="font-size:12.5px;font-weight:600" class="tnum">11</span></div>
              <div class="rowflex"><span class="meta grow">Retention policy</span><span style="font-size:12.5px;font-weight:600">Latest + 5 previous</span></div>
              <div class="rowflex"><span class="meta grow">Backup storage</span><span style="font-size:12.5px;font-weight:600">Private</span></div>
            </div>
          </div>
          <div class="peek">
            <div class="card-dark compact">
              <div class="rowflex gap-10">
                <span class="tile-icon mint">${icon("fa-solid fa-key")}</span>
                <div class="grow">
                  <div style="font-size:13px;font-weight:650">Your data stays yours</div>
                  <div class="meta" style="color:var(--ink-on-dark-2)">Downloads require your session. No public links, ever.</div>
                </div>
              </div>
            </div>
            <div class="peek-strip">${icon("fa-solid fa-lock")} Encrypted at rest</div>
          </div>
        </aside>
      </div>
    </div>`;
}

function viewStates() {
  const chipRow = Object.keys(STATUS).map((k) => statusChip(k)).join(" ");
  return topbar({ tabs: TABS, active: "", title: "UI states" }) + `
    <div class="page">
      <p class="eyebrow">Component sheet</p>
      <h1 class="display mt-8">UI states &amp; primitives</h1>
      <p class="sub mt-8">Every status, action, and field state used across the product.</p>

      <section class="card compact mt-20">
        <div class="card-head"><span class="tile-icon">${icon("fa-solid fa-swatchbook")}</span><h2 class="h2 grow">Status chips</h2></div>
        <div class="rowflex wrap gap-8">${chipRow}</div>
      </section>

      <section class="card compact mt-12">
        <div class="card-head"><span class="tile-icon">${icon("fa-solid fa-computer-mouse")}</span><h2 class="h2 grow">Actions</h2></div>
        <div class="rowflex wrap gap-8">
          <button class="btn btn-primary" type="button">${icon("fa-solid fa-shield-halved")} Primary</button>
          <button class="btn btn-dark" type="button">${icon("fa-brands fa-github")} Connect GitHub</button>
          <button class="btn btn-soft" type="button">${icon("fa-solid fa-folder-open")} Secondary</button>
          <button class="btn btn-ghost" type="button">Ghost</button>
          <button class="btn btn-danger" type="button">${icon("fa-solid fa-trash")} Destructive</button>
          <button class="icon-btn" type="button">${icon("fa-solid fa-download")}</button>
          <button class="icon-btn round white" type="button">${icon("fa-solid fa-bell")}</button>
        </div>
      </section>

      <div class="grid-2 mt-12">
        <section class="card compact">
          <div class="card-head"><span class="tile-icon">${icon("fa-solid fa-pen-to-square")}</span><h2 class="h2 grow">Inputs</h2></div>
          <div class="stack gap-10">
            <div class="field">${icon("fa-solid fa-magnifying-glass")}<input type="text" placeholder="Focused fields tint softly — no rings" /></div>
            <div class="field">${icon("fa-solid fa-pen")}<input type="text" value="impose" /></div>
            <div class="seg"><button class="active" type="button">7 days</button><button type="button">30 days</button><button type="button">90 days</button></div>
          </div>
        </section>
        <section class="card compact">
          <div class="card-head"><span class="tile-icon">${icon("fa-solid fa-flag")}</span><h2 class="h2 grow">Banners &amp; callouts</h2></div>
          <div class="stack gap-10">
            <div class="banner">${icon("fa-solid fa-plug-circle-xmark")}<div class="grow"><b>GitHub connection lost.</b> Backups are safe.</div></div>
            <div class="banner red">${icon("fa-solid fa-triangle-exclamation")}<div class="grow"><b>Backup failed.</b> Last success 2h ago.</div></div>
            <div class="banner green">${icon("fa-solid fa-circle-check")}<div class="grow"><b>Protected.</b> Last backup just now.</div></div>
          </div>
        </section>
      </div>

      <section class="mt-12">
        <div class="peek" style="max-width:420px">
          <div class="card-dark">
            <div class="rowflex gap-12">
              <span class="orb filled" style="width:42px;height:42px;font-size:15px">${icon("fa-solid fa-download")}</span>
              <div class="grow">
                <div style="font-weight:650">Preparing your download</div>
                <div class="meta" style="color:var(--ink-on-dark-2)">You can leave this page — it will be ready here.</div>
              </div>
            </div>
          </div>
          <div class="peek-strip">${icon("fa-solid fa-clock")} Async job survives tab close</div>
        </div>
      </section>
    </div>`;
}

/* ============================== router ============================== */

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const params = new URLSearchParams(queryPart || "");
  const segs = pathPart.split("/").filter(Boolean);
  return { segs, state: params.get("state"), path: params.get("path") };
}

function render() {
  const { segs, state, path } = parseHash();
  const app = $("#app");
  const shell = $("#shell");
  let html = "";
  let nav = "";

  if (segs[0] === "signin") {
    html = viewSignin();
    shell.style.display = "block";
    $("#rail").style.display = "none";
    $("#app").style.padding = "0";
  } else {
    shell.style.display = "flex";
    $("#rail").style.display = "";
    $("#app").style.padding = "";
    switch (segs[0] || "dashboard") {
      case undefined: case "":
        nav = "dashboard"; html = viewDashboard(state); break;
      case "pick":
        nav = "pick"; html = viewPick(state); break;
      case "repo":
        if (segs[2] === "browse") { nav = "browse"; html = viewBrowse(segs[1], path || "", state || "default"); }
        else { nav = "dashboard"; html = viewRepo(segs[1], state); }
        break;
      case "file":
        nav = "browse"; html = viewFile(segs[1] || "code", state); break;
      case "settings":
        nav = "settings"; html = viewSettings(state); break;
      case "states":
        nav = "states"; html = viewStates(); break;
      default:
        nav = "dashboard"; html = viewDashboard(state);
    }
  }

  app.innerHTML = html;
  document.querySelectorAll(".rail-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.nav === nav);
  });
  window.scrollTo(0, 0);
  renderDemo();
}

/* ============================== demo switcher ============================== */

const DEMO_STATES = {
  "": [["Default", ""], ["Not connected", "empty"], ["Loading", "loading"], ["Error", "error"], ["Connection lost", "lost"]],
  pick: [["Default", ""], ["Limit reached", "full"], ["Loading", "loading"], ["Error", "error"], ["No repos", "empty"]],
  repo: [["Protected", "protected"], ["Backing up", "backing_up"], ["Backup failed", "failed"], ["Connection issue", "connection_issue"], ["Deleted on GitHub", "unavailable"], ["Not monitored", "not_monitored"]],
  browse: [["Files", "default"], ["Empty folder", "empty"], ["Processing", "processing"], ["Error", "error"]],
  file: [["Code file", "code"], ["Secret file", "secret"], ["Image", "image"]],
  settings: [["Default", ""], ["Deleting…", "deleting"]],
  states: [],
  signin: [],
};

function renderDemo() {
  const { segs, state } = parseHash();
  const key = segs[0] === "repo" ? "repo" : segs[0] === "file" ? "file" : segs[0] === "browse" ? "browse" : segs[0] === "pick" ? "pick" : segs[0] === "settings" ? "settings" : segs[0] === "states" ? "states" : segs[0] === "signin" ? "signin" : "";
  const list = DEMO_STATES[key] || [];
  const root = $("#demo-root");
  const fab = $("#demo-fab");
  if (!list.length) {
    root.innerHTML = "";
    return;
  }
  const open = root.dataset.open === "1";
  root.innerHTML = `
    <button class="demo-fab" id="demo-fab" type="button">${icon("fa-solid fa-wand-magic-sparkles")} Demo states</button>
    ${open ? `
    <div class="demo-panel">
      <h4>Page state matrix</h4>
      <div class="demo-states">
        ${list.map(([label, v]) => {
          const active = (state || "") === v;
          return `<button type="button" class="${active ? "active" : ""}" data-demo-state="${v}">${label}</button>`;
        }).join("")}
      </div>
    </div>` : ""}`;
}

document.addEventListener("click", (e) => {
  const fab = e.target.closest("#demo-fab");
  if (fab) {
    const root = $("#demo-root");
    root.dataset.open = root.dataset.open === "1" ? "0" : "1";
    renderDemo();
    return;
  }
  const demoBtn = e.target.closest("[data-demo-state]");
  if (demoBtn) {
    const v = demoBtn.dataset.demoState;
    const [base, query] = location.hash.replace(/^#/, "").split("?");
    const params = new URLSearchParams(query || "");
    if (v) params.set("state", v); else params.delete("state");
    const q = params.toString();
    location.hash = "#" + base + (q ? "?" + q : "");
    return;
  }
});

/* ============================== actions / modals ============================== */

function openModal(type) {
  const root = $("#modal-root");
  const modals = {
    stop: `
      <div class="modal">
        <h3 class="modal-title">Stop monitoring impose?</h3>
        <p class="sub">OVault will stop creating new backups for this repository. Existing backups will remain available.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost grow" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-danger-solid" type="button" data-action="confirm-stop">${icon("fa-solid fa-pause")} Stop monitoring</button>
        </div>
      </div>`,
    stopBusy: `
      <div class="modal">
        <h3 class="modal-title">A backup is in progress</h3>
        <p class="sub">A backup is in progress for this repository. The in-progress backup can finish and be kept.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost grow" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-soft" type="button" data-action="confirm-stop">Stop now</button>
          <button class="btn btn-primary" type="button" data-action="confirm-stop">${icon("fa-solid fa-clock")} Let it finish, then stop</button>
        </div>
      </div>`,
    remove: `
      <div class="modal">
        <h3 class="modal-title">Remove repository from OVault?</h3>
        <p class="sub">This will permanently delete its stored backups. This cannot be undone.</p>
        <div class="field on-tint mt-16">${icon("fa-solid fa-pen")}<input type="text" placeholder="Type “impose” to confirm" /></div>
        <div class="modal-actions">
          <button class="btn btn-ghost grow" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-danger-solid" type="button" data-action="confirm-remove">${icon("fa-solid fa-trash")} Delete backups</button>
        </div>
      </div>`,
    disconnect: `
      <div class="modal">
        <h3 class="modal-title">Disconnect GitHub?</h3>
        <p class="sub">Monitoring will stop for all repositories. Existing backups remain.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost grow" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-danger-solid" type="button" data-action="confirm-disconnect">${icon("fa-solid fa-plug-circle-xmark")} Disconnect</button>
        </div>
      </div>`,
    delete: `
      <div class="modal">
        <h3 class="modal-title">Delete OVault account?</h3>
        <p class="sub">This permanently deletes your account, all GitHub connection data, all repository backups, and all snapshots. This cannot be undone.</p>
        <div class="field on-tint mt-16">${icon("fa-solid fa-pen")}<input type="text" placeholder="Type DELETE to confirm" /></div>
        <div class="modal-actions">
          <button class="btn btn-ghost grow" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-danger-solid" type="button" data-action="confirm-delete">${icon("fa-solid fa-trash")} Delete account</button>
        </div>
      </div>`,
  };
  root.innerHTML = `<div class="overlay" data-action="close-modal-bg">${modals[type] || ""}</div>`;
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-action]");
  if (!t) return;
  const a = t.dataset.action;

  switch (a) {
    case "close-modal-bg":
      if (e.target.classList.contains("overlay")) $("#modal-root").innerHTML = "";
      break;
    case "close-modal":
      $("#modal-root").innerHTML = "";
      break;
    case "stop": openModal("stop"); break;
    case "remove": openModal("remove"); break;
    case "disconnect": openModal("disconnect"); break;
    case "delete-account": openModal("delete"); break;
    case "confirm-stop":
      $("#modal-root").innerHTML = "";
      toast("Monitoring stopped. Existing backups kept.", "fa-solid fa-circle-check");
      break;
    case "confirm-remove":
      $("#modal-root").innerHTML = "";
      toast("Repository removed from OVault.", "fa-solid fa-trash");
      break;
    case "confirm-disconnect":
      $("#modal-root").innerHTML = "";
      toast("GitHub disconnected. Backups remain.", "fa-solid fa-plug-circle-xmark");
      location.hash = "#/";
      break;
    case "confirm-delete":
      $("#modal-root").innerHTML = "";
      toast("Account deletion started…", "fa-solid fa-circle-notch");
      break;
    case "download":
      toast("Preparing your download. You can leave this page.", "fa-solid fa-download");
      break;
    case "retry": case "reload":
      toast("Retrying…", "fa-solid fa-rotate");
      break;
    case "connect": case "reconnect": case "signin":
      toast("Redirecting to GitHub…", "fa-brands fa-github");
      setTimeout(() => (location.hash = "#/"), 500);
      break;
    case "start-monitoring":
      toast("Monitoring started. First backups are on their way.", "fa-solid fa-shield-halved");
      setTimeout(() => (location.hash = "#/"), 500);
      break;
    case "backup-all":
      toast("Backup queued for 3 repositories.", "fa-solid fa-rotate");
      break;
    case "resume":
      toast("Monitoring resumed. Catch-up sweep queued.", "fa-solid fa-play");
      break;
    case "cancel-draft":
      toast("Draft selection discarded.", "fa-solid fa-xmark");
      break;
    case "signout":
      location.hash = "#/signin";
      break;
    case "go-repos":
      location.hash = "#/";
      break;
    default:
      break;
  }
});

window.addEventListener("hashchange", render);
render();
