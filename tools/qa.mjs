/* Programmatic UI/UX audit: enforces the design constraints and catches layout bugs.
   Usage: node tools/qa.mjs  → prints violations per page/viewport, exits 1 on failures. */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:8765";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 860 },
  { name: "wide", width: 1512, height: 900 },
];

const PAGES = [
  ["signin", "#/signin"],
  ["dash", "#/"],
  ["dash-empty", "#/?state=empty"],
  ["pick", "#/pick"],
  ["pick-full", "#/pick?state=full"],
  ["repo", "#/repo/impose"],
  ["repo-failed", "#/repo/orbit-api?state=failed"],
  ["browse", "#/repo/impose/browse"],
  ["file-code", "#/file/code"],
  ["file-secret", "#/file/secret"],
  ["settings", "#/settings"],
  ["states", "#/states"],
];

const problems = [];

function log(page, vp, msg) {
  problems.push(`[${vp}] ${page}: ${msg}`);
}

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  for (const [name, hash] of PAGES) {
    const page = await ctx.newPage();
    await page.goto(BASE + "/" + hash, { waitUntil: "networkidle" });
    await page.waitForTimeout(150);

    const report = await page.evaluate(() => {
      const out = { shadows: [], borders: [], overflowX: [], spills: [], tap: [], icons: [], fonts: [], focus: null, paddings: [] };
      const els = [...document.querySelectorAll("body *")].filter((e) => {
        const cs = getComputedStyle(e);
        return cs.display !== "none" && cs.visibility !== "hidden" && e.offsetParent !== null || cs.position === "fixed";
      });

      for (const el of els) {
        const cs = getComputedStyle(el);
        const tag = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");

        // 1. no shadows
        if (cs.boxShadow && cs.boxShadow !== "none") out.shadows.push(`${tag} → ${cs.boxShadow}`);
        if (cs.textShadow && cs.textShadow !== "none" && cs.textShadow !== "rgba(0, 0, 0, 0) 0px 0px 0px") out.shadows.push(`${tag} text-shadow → ${cs.textShadow}`);

        // 2. no visible borders
        for (const side of ["Top", "Right", "Bottom", "Left"]) {
          const w = parseFloat(cs[`border${side}Width`]);
          const style = cs[`border${side}Style`];
          const color = cs[`border${side}Color`];
          if (w > 0 && style !== "none" && !color.includes("rgba(0, 0, 0, 0)")) {
            out.borders.push(`${tag} border-${side.toLowerCase()} ${w}px ${style} ${color}`);
          }
        }

        // 3. text spills (overflow without ellipsis/clip)
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
          const of = cs.overflowX;
          if (of === "visible") out.spills.push(`${tag} scrollW ${el.scrollWidth} > clientW ${el.clientWidth}`);
        }
      }

      // 4. horizontal page overflow
      out.overflowX = document.documentElement.scrollWidth > window.innerWidth + 1
        ? [`page scrollWidth ${document.documentElement.scrollWidth} > innerWidth ${window.innerWidth}`] : [];

      // 5. tap targets (skip inputs whose interactive wrapper/label is tall enough)
      for (const el of document.querySelectorAll("a, button, input[type=checkbox], input[type=text], label")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || el.offsetParent === null && cs.position !== "fixed") continue;
        const host = el.closest("label, .field, .row");
        if (host && host !== el && host.getBoundingClientRect().height >= 30) continue;
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < 30) {
          const tag = el.tagName.toLowerCase() + "." + String(el.className).trim().split(/\s+/).slice(0, 2).join(".");
          out.tap.push(`${tag} height ${Math.round(r.height)}`);
        }
      }

      // 6. icon rendering (visible icons only)
      for (const el of document.querySelectorAll("i[class*='fa-']")) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el, "::before");
        const fam = cs.fontFamily || "";
        if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") continue; // hidden
        if (r.width < 6 || r.height < 6) out.icons.push(`${el.className} size ${Math.round(r.width)}x${Math.round(r.height)}`);
        else if (!fam.includes("Font Awesome")) out.icons.push(`${el.className} font-family ${fam}`);
      }

      // 7. fonts on display text
      const h1 = document.querySelector(".display, .hero-title, .modal-title");
      if (h1 && !getComputedStyle(h1).fontFamily.includes("Inter")) out.fonts.push("display font: " + getComputedStyle(h1).fontFamily);

      // 8. button padding (compact)
      for (const el of document.querySelectorAll(".btn, .card, .modal, .field")) {
        const cs = getComputedStyle(el);
        const pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
        const max = el.classList.contains("btn") ? 16 : 36;
        if (Math.max(pt, pb) > max || Math.max(pl, pr) > (el.classList.contains("btn") ? 28 : 40)) {
          out.paddings.push(`${el.className} padding ${pt}/${pr}/${pb}/${pl}`);
        }
      }

      // 9. input focus check performed outside (needs interaction)
      return out;
    });

    if (report.shadows.length) log(name, vp.name, "SHADOWS: " + report.shadows.slice(0, 3).join("; "));
    if (report.borders.length) log(name, vp.name, "BORDERS: " + report.borders.slice(0, 3).join("; "));
    if (report.overflowX.length) log(name, vp.name, "OVERFLOW-X: " + report.overflowX.join("; "));
    if (report.spills.length) log(name, vp.name, "TEXT SPILL: " + report.spills.slice(0, 3).join("; "));
    if (report.tap.length && (vp.name === "mobile" || vp.name === "tablet")) log(name, vp.name, "TAP TARGETS: " + report.tap.slice(0, 3).join("; "));
    if (report.icons.length) log(name, vp.name, "ICONS: " + report.icons.slice(0, 3).join("; "));
    if (report.fonts.length) log(name, vp.name, "FONTS: " + report.fonts.join("; "));
    if (report.paddings.length) log(name, vp.name, "PADDING: " + report.paddings.slice(0, 3).join("; "));

    // focus behavior on inputs (no outline, no border)
    const field = await page.$(".field input");
    if (field) {
      await field.focus();
      const focusState = await page.evaluate(() => {
        const input = document.querySelector(".field input");
        const wrap = input.closest(".field");
        const ics = getComputedStyle(input), wcs = getComputedStyle(wrap);
        return {
          outline: ics.outlineStyle + " " + ics.outlineWidth,
          border: ics.borderBottomWidth + " " + ics.borderBottomStyle,
          wrapBg: wcs.backgroundColor,
        };
      });
      if (!focusState.outline.startsWith("none") && !focusState.outline.startsWith("0px")) log(name, vp.name, "FOCUS OUTLINE VISIBLE: " + focusState.outline);
      if (!focusState.border.startsWith("0px") && !focusState.border.startsWith("none")) log(name, vp.name, "FOCUS BORDER VISIBLE: " + focusState.border);
    }

    await page.close();
    process.stdout.write(".");
  }
  await ctx.close();
}

await browser.close();

console.log("\n\n===== QA REPORT =====");
if (!problems.length) console.log("All checks passed.");
for (const p of problems) console.log("✗ " + p);
console.log(`\n${problems.length} issue(s)`);
process.exit(problems.length ? 1 : 0);
