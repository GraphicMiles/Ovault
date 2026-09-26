/* Screenshot every view × breakpoint for visual QA.
   Asserts the rendered H1 before each shot so files can't silently mismatch routes. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://127.0.0.1:8765";
const OUT = new URL("../shots/", import.meta.url).pathname;

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 860 },
  { name: "wide", width: 1512, height: 900 },
];

/* name, hash, expected h1 fragment (mobile may use .mobile-title instead of h1.display) */
const PAGES = [
  ["signin", "#/signin", "backups"],
  ["dash", "#/", "Repositories"],
  ["dash-empty", "#/?state=empty", "Protect your"],
  ["dash-loading", "#/?state=loading", "Repositories"],
  ["dash-error", "#/?state=error", "Repositories"],
  ["dash-lost", "#/?state=lost", "Repositories"],
  ["pick", "#/pick", "Select repositories"],
  ["pick-full", "#/pick?state=full", "Select repositories"],
  ["repo", "#/repo/impose", "impose"],
  ["repo-backingup", "#/repo/luna?state=backing_up", "luna"],
  ["repo-failed", "#/repo/orbit-api?state=failed", "orbit-api"],
  ["repo-unavailable", "#/repo/impose?state=unavailable", "impose"],
  ["browse", "#/repo/impose/browse", "impose"],
  ["browse-src", "#/repo/impose/browse?path=src", "impose"],
  ["browse-processing", "#/repo/impose/browse?state=processing", "impose"],
  ["browse-empty", "#/repo/impose/browse?state=empty", "impose"],
  ["file-code", "#/file/code", "File"],
  ["file-secret", "#/file/secret", "File"],
  ["settings", "#/settings", "Settings"],
  ["states", "#/states", "UI states"],
];

const only = process.argv[2]; // optional filter, e.g. "dash"
const vps = process.argv[3] ? VIEWPORTS.filter((v) => v.name === process.argv[3]) : VIEWPORTS;

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

for (const vp of vps) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  for (const [name, hash, expect] of PAGES) {
    if (only && !name.includes(only)) continue;
    const page = await ctx.newPage(); // fresh page per shot — no same-document nav ambiguity
    await page.goto(BASE + "/" + hash, { waitUntil: "networkidle" });
    await page.waitForTimeout(200);
    const h1 = await page.evaluate(() => {
      const els = [...document.querySelectorAll("#app h1, #app .hero-title, #app .display, #app .modal-title")];
      return els.map((e) => e.textContent.trim()).join(" ~ ");
    });
    if (expect && !h1.includes(expect)) {
      console.error(`MISMATCH ${name}-${vp.name}: expected "${expect}" got "${h1}" (${hash})`);
    }
    await page.screenshot({ path: `${OUT}${name}-${vp.name}.png`, fullPage: true });
    console.log(`shot: ${name}-${vp.name}.png  [h1: ${h1.slice(0, 30)}]`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log("done");
