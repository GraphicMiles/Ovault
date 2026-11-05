/* GMW-05 5.16 visual layout verification gate.
   Renders every view at 360, 390, 768, 1024 and 1440 px and reports measured
   defects. Usage: npm run gate   (it starts its own static server)
   Exit code 1 when a blocking defect is found. */
import { chromium } from "playwright";
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const PORT = 4181;
const BASE = arg("base", "");
let server = null;
if (!BASE) {
  server = spawn(process.execPath, ["tools/serve.mjs"], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore",
    detached: false,
  });
  await new Promise((r) => setTimeout(r, 700));
}
const ROUTES = arg(
  "routes",
  "/#/ ,/#/signin,/#/pick,/#/repo/impose,/#/repo/impose/browse,/#/file/code,/#/file/secret,/#/settings,/#/states,/#/?state=empty",
).split(",").map((r) => r.trim()).filter(Boolean);
const WIDTHS = [360, 390, 768, 1024, 1440];
const HEADLESS = ChromiumArgs();

function ChromiumArgs() {
  return process.env.CHROMIUM_ARGS ? process.env.CHROMIUM_ARGS.split(" ") : [];
}

const auditInPage = () => {
  const vw = window.innerWidth;
  const issues = [];
  const add = (check, msg) => issues.push({ check, msg });

  const sel = (el) => {
    const cls = typeof el.className === "string" && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
    const id = el.id ? `#${el.id}` : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
  const isVisible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /* 2. overflow */
  if (document.documentElement.scrollWidth > vw + 1) add("overflow", `page scrolls horizontally (${document.documentElement.scrollWidth}px > ${vw}px)`);
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1)) add("overflow", `outside viewport: ${sel(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
  });

  /* 3. gutters: siblings inside one container share one left edge */
  const parents = new Set();
  document.querySelectorAll("#app > *, main > *, main > * > *").forEach((el) => parents.add(el.parentElement));
  parents.forEach((parent) => {
    if (!parent) return;
    const kids = [...parent.children].filter((el) => {
      if (!isVisible(el)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 120 && r.height > 8;
    });
    if (kids.length < 2) return;
    const lefts = [...new Set(kids.map((k) => Math.round(k.getBoundingClientRect().left)))];
    if (lefts.length > 1 && Math.max(...lefts) - Math.min(...lefts) > 1) {
      add("gutters", `siblings in ${sel(parent)} start at ${lefts.join(", ")}px`);
    }
  });

  /* 4 and 5: text size and column width */
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el)) return;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    if (el.childNodes.length && hasText(el)) {
      const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ");
      if (size < 12) add("text-size", `under 12px: ${sel(el)} (${size}px) "${text.slice(0, 32)}"`);
      else if (vw <= 390 && size < 15 && text.length > 60 && !el.closest(".meta,.m-meta,.row-meta,.preview,.ln,.cm,.file-head,.eyebrow")) add("text-size", `mobile body under 15px: ${sel(el)} (${size}px) "${text.slice(0, 32)}"`);
      const r = el.getBoundingClientRect();
      const parent = el.parentElement;
      const inColumns = parent && getComputedStyle(parent).display.includes("grid")
        ? parent.children.length > 1
        : parent && getComputedStyle(parent).display.includes("flex")
          ? [...parent.children].filter(isVisible).length > 1
          : false;
      const rowIsFullWidth = parent && parent.getBoundingClientRect().width >= vw - 40;
      if (vw <= 390 && inColumns && !rowIsFullWidth && r.width > 0 && r.width < 240 && text.length > 40) {
        add("column-width", `${sel(el)} column ${Math.round(r.width)}px for ${text.length} chars`);
      }
    }
  });

  /* 6: card rows squeezed at phone width */
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el)) return;
    const cs = getComputedStyle(el);
    if (!cs.display.includes("flex") || cs.flexWrap === "wrap") return;
    const isCardLike = (k) => {
      const s2 = getComputedStyle(k);
      const bg2 = s2.backgroundColor.match(/rgba?\(([^)]+)\)/);
      const alpha = bg2 ? (bg2[1].split(",")[3] ? parseFloat(bg2[1].split(",")[3]) : 1) : 0;
      return parseFloat(s2.borderTopLeftRadius) >= 4 && alpha > 0.1;
    };
    const kids = [...el.children].filter(isVisible).filter(isCardLike);
    if (kids.length < 2) return;
    const widths = kids.map((k) => k.getBoundingClientRect().width);
    const textKid = kids.find((k) => k.textContent.trim().length > 30);
    if (vw <= 390 && textKid && Math.min(...widths) < 240) {
      add("card-rows", `${sel(el)} keeps ${kids.length} items in a nowrap row at ${vw}px, narrowest ${Math.round(Math.min(...widths))}px`);
    }
  });

  /* 7: clipping */
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el)) return;
    const cs = getComputedStyle(el);
    if (["auto", "scroll"].includes(cs.overflowX) || ["auto", "scroll"].includes(cs.overflowY)) return;
    if (el === document.documentElement || el === document.body) return;
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      add("clipping", `${sel(el)} content ${el.scrollWidth}px inside ${el.clientWidth}px`);
    }
  });

  /* 8: touch targets */
  if (vw <= 390) {
    document.querySelectorAll("a[href],button,input,select,textarea,[role=button]").forEach((el) => {
      if (!isVisible(el)) return;
      const r = el.getBoundingClientRect();
      if (r.height >= 44) return;
      const label = el.closest("label");
      if (label && label.getBoundingClientRect().height >= 44) return;
      if (el.closest("p,.crumbs")) return;
      add("touch", `${sel(el)} ${Math.round(r.height)}px tall`);
    });
  }

  /* 9: unicode glyphs and emoji used as icons */
  const GLYPHS = /[\u2190-\u21FF\u2300-\u23FF\u25A0-\u27BF\u2B00-\u2BFF\uFE0F]|[\u{1F300}-\u{1FAFF}]/u;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent.trim();
    if (!t || t.length > 3) continue;
    if (GLYPHS.test(t)) {
      const parent = walker.currentNode.parentElement;
      if (parent && isVisible(parent)) add("glyph-icons", `"${t}" in ${sel(parent)}`);
    }
  }

  /* 10: contrast */
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0.9) return c;
      node = node.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el) || !hasText(el)) return;
    if (el.closest("svg")) return;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) return;
    const bg = bgOf(el);
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 600;
    const large = size >= 24 || (size >= 18.66 && bold);
    const min = large ? 3 : 4.5;
    if (ratio < min) add("contrast", `${sel(el)} ${ratio.toFixed(2)}:1 at ${size}px "${el.textContent.trim().slice(0, 28)}"`);
  });

  /* 11: hue families in rendered colours */
  const hues = [];
  const toHsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return { h, s, l };
  };
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el)) return;
    const cs = getComputedStyle(el);
    [cs.color, cs.backgroundColor, cs.borderTopColor].forEach((c) => {
      const p = parse(c);
      if (!p || p.a < 0.1) return;
      const { h, s, l } = toHsl(p);
      if (s > 0.15 && l > 0.04 && l < 0.96) hues.push({ h, s, sel: sel(el), c });
    });
  });
  const families = {};
  hues.forEach((x) => {
    const band = Math.floor(x.h / 30) * 30;
    families[band] = families[band] || { n: 0, samples: new Set() };
    families[band].n += 1;
    if (families[band].samples.size < 3) families[band].samples.add(x.sel);
  });
  const kept = Object.entries(families).filter(([, v]) => v.n >= 3);
  if (kept.length > 2) {
    add("palette", `${kept.length} hue families in use: ${kept.map(([b, v]) => `${b}-${Number(b) + 30}deg x${v.n}`).join(", ")}`);
  }

  /* 12: padding and gap discipline */
  const radius = new Set();
  document.querySelectorAll("body *").forEach((el) => {
    if (!isVisible(el)) return;
    const cs = getComputedStyle(el);
    ["paddingTop", "paddingLeft", "gap", "rowGap", "marginTop"].forEach((prop) => {
      const v = parseFloat(cs[prop]);
      if (!v || prop === "marginTop") return;
      const compact = el.closest(".chip,.count,.avatar,.dot,.badge,.tag,.kbd");
      if (!compact && v % 2 !== 0) add("spacing", `${sel(el)} ${prop} ${v}px is off the spacing scale`);
    });
    const padLeft = parseFloat(cs.paddingLeft);
    if (hasText(el) && padLeft > 0 && padLeft < 12 && cs.paddingRight !== "0px" && !el.closest(".chip,.count,.avatar,.badge")) add("spacing", `${sel(el)} text ${padLeft}px from the edge`);
    const r = parseFloat(cs.borderTopLeftRadius);
    if (r) radius.add(Math.round(r));
  });
  if (radius.size > 5) add("radius", `${radius.size} distinct radii: ${[...radius].sort((a, b) => a - b).join(", ")}`);

  /* 13: section width */
  document.querySelectorAll("section,header,footer,main,.band").forEach((el) => {
    if (!isVisible(el)) return;
    if (el.classList.contains("card") || el.closest(".card,.page,.page-wide")) return;
    const own = parse(getComputedStyle(el).backgroundColor);
    if (!own || own.a < 0.1) return;
    const r = el.getBoundingClientRect();
    if (r.width < vw - 2) add("section-width", `${sel(el)} ${Math.round(r.width)}px wide at ${vw}px viewport (left ${Math.round(r.left)})`);
  });

  /* 15: nested containers */
  const looksLikeCard = (el) => {
    if (!["DIV", "SECTION", "ASIDE", "UL", "LI", "ARTICLE"].includes(el.tagName)) return false;
    const cs = getComputedStyle(el);
    const bgA = parse(cs.backgroundColor);
    const r = el.getBoundingClientRect();
    return parseFloat(cs.borderTopLeftRadius) >= 8 && bgA && bgA.a > 0.1 && r.width >= 120 && r.height >= 56;
  };
  const cards = [...document.querySelectorAll("body *")].filter((el) => isVisible(el) && looksLikeCard(el));
  cards.forEach((el) => {
    let node = el.parentElement;
    while (node && node !== document.body) {
      if (looksLikeCard(node) && parseFloat(getComputedStyle(node).paddingTop) >= 12 && node.getBoundingClientRect().width > el.getBoundingClientRect().width + 8) {
        add("containers", `card inside card: ${sel(el)} within ${sel(node)}`);
        break;
      }
      node = node.parentElement;
    }
  });

  return issues;
};

const nativeInPage = () => {
  const issues = [];
  document.querySelectorAll("input,select,textarea,button,a[href]").forEach((el) => {
    el.focus();
    const cs = getComputedStyle(el);
    const uaRing = cs.outlineStyle === "auto" || /rgb\(0, 95, 204\)|rgb\(1, 1, 1\)/.test(cs.outlineColor);
    if (cs.outlineStyle !== "none" && cs.outlineWidth !== "0px" && uaRing) {
      issues.push(`${el.tagName.toLowerCase()} shows the browser focus ring: ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`);
    }
  });
  if (!getComputedStyle(document.documentElement).webkitTapHighlightColor.includes("0, 0, 0, 0") &&
      !getComputedStyle(document.documentElement).getPropertyValue("-webkit-tap-highlight-color").includes("transparent")) {
    issues.push("no -webkit-tap-highlight-color: transparent on html");
  }
  return issues;
};

const browser = await chromium.launch({ args: HEADLESS });
const findings = [];

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    await page.goto((BASE || `http://127.0.0.1:${PORT}`) + route, { waitUntil: "load" });
    await page.waitForTimeout(320);
    const issues = await page.evaluate(auditInPage);
    const natives = width === 390 ? await page.evaluate(nativeInPage) : [];
    natives.forEach((m) => issues.push({ check: "native-defaults", msg: m }));
    issues.forEach((i) => findings.push({ width, route, ...i }));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
if (server) server.kill();

/* 14: source-level native default checks, done outside the browser */
const sources = process.env.GATE_SOURCES ? process.env.GATE_SOURCES.split(",") : ["assets/css/app.css", "assets/js/app.js"];
const fs = await import("node:fs/promises");
for (const file of sources) {
  const text = await fs.readFile(file, "utf8").catch(() => null);
  if (!text) continue;
  for (const [re, label] of [[/\balert\(/g, "alert()"], [/\bconfirm\(/g, "confirm()"], [/\bprompt\(/g, "prompt()"]]) {
    if (re.test(text)) findings.push({ width: 0, route: file, check: "native-defaults", msg: `${label} used in ${file}` });
  }
  const outlines = [...text.matchAll(/outline:\s*(none|0)/g)];
  for (const _ of outlines) findings.push({ width: 0, route: file, check: "native-defaults", msg: `outline removed in ${file}, check for a designed replacement` });
  for (const m of text.matchAll(/(?:width|max-width|min-width)\s*:\s*(?:9[0-9]%|9[0-9]vw|calc\(100%\s*-[^)]*\))/g)) {
    findings.push({ width: 0, route: file, check: "section-width", msg: `${m[0]} in ${file}` });
  }
}

const blocking = ["overflow", "clipping", "card-rows", "column-width", "text-size", "touch", "glyph-icons"];
const byCheck = {};
findings.forEach((f) => {
  byCheck[f.check] = byCheck[f.check] || [];
  byCheck[f.check].push(f);
});

console.log(`\n===== GMW-05 5.16 GATE: ${BASE || `http://127.0.0.1:${PORT}`} =====`);

console.log(`routes: ${ROUTES.length}, widths: ${WIDTHS.join(", ")}, findings: ${findings.length}`);
for (const [check, list] of Object.entries(byCheck)) {
  const tag = blocking.includes(check) ? "BLOCKING" : "review";
  console.log(`\n[${check}] ${list.length} (${tag})`);
  const seen = new Set();
  list.forEach((f) => {
    const key = `${f.width}|${f.msg}`;
    if (seen.has(key)) return;
    seen.add(key);
    console.log(`  ${f.width}px ${f.route}: ${f.msg}`);
  });
}
const blockers = findings.filter((f) => blocking.includes(f.check));
console.log(`\nblocking findings: ${blockers.length}`);
process.exit(blockers.length ? 1 : 0);
