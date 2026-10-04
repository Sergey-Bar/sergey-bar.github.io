#!/usr/bin/env node
/**
 * The JavaScript budget from plan §11: under 150KB gzip of JavaScript for a
 * first visit. Fonts and CSS are real first-visit bytes too, so they get their
 * own enforced budgets rather than being reported and ignored — the bug this
 * replaces was a line that printed `ok` for 132KB of fonts without ever being
 * able to fail.
 */

import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const JS_BUDGET_BYTES = 150 * 1024;
const CSS_BUDGET_BYTES = 20 * 1024;
const FONT_BUDGET_BYTES = 140 * 1024;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const routes = JSON.parse(
  readFileSync(join(root, "src", "content", "routes.json"), "utf8"),
);

const failures = [];
const gzip = (path) => gzipSync(readFileSync(path)).length;

function walk(dir, match) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(path, match));
    else if (match.test(entry.name)) found.push(path);
  }
  return found;
}

/* ------------------------------------------------------------------ routes */

const built = walk(out, /\.html$/)
  .map((p) => relative(out, p).split("\\").join("/"))
  .filter((p) => p !== "404.html" && p !== "404/index.html")
  .sort();

const declared = routes.map((r) => r.file).sort();

if (built.join("|") !== declared.join("|")) {
  failures.push("route set drift");
  console.error(
    "FAIL routes — built pages do not match src/content/routes.json\n" +
      `    built:    ${built.join(", ")}\n` +
      `    declared: ${declared.join(", ")}`,
  );
} else {
  console.log(`ok    routes — ${built.length} declared, ${built.length} built`);
}

/* -------------------------------------------------------------- lighthouse */

const lhci = readFileSync(join(root, ".lighthouserc.json"), "utf8");
const audited = (lhci.match(/http:\/\/localhost\/[^"]*/g) ?? []).length;

if (audited !== routes.length) {
  failures.push("lighthouse route drift");
  console.error(
    `FAIL lighthouse — .lighthouserc.json audits ${audited} URL(s), ` +
      `src/content/routes.json declares ${routes.length}`,
  );
} else {
  console.log(`ok    lighthouse — audits all ${audited} routes`);
}

/* ----------------------------------------------------------- bytes per route */

// Next reports First Load JS as an uncompressed parse size, which is the wrong
// number to hold a budget against. This measures what crosses the wire on the
// worst route: external scripts (excluding the `polyfills` chunk a modern
// browser never fetches), inline scripts (the RSC flight payload and hydration
// bootstrap, excluding the `application/ld+json` block, which is data and not
// executed) and the render-blocking stylesheet.
//
// It also fails if the built route set or the Lighthouse URL list disagrees with
// src/content/routes.json, so a new page cannot quietly escape both gates.
let worstJs = 0;
let worstCss = 0;

for (const route of routes) {
  const html = readFileSync(join(out, route.file), "utf8");

  const external = new Set(
    [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)]
      .map((m) => m[1])
      .filter((src) => !src.includes("polyfills")),
  );

  let js = 0;
  for (const src of external) {
    js += gzip(join(out, src.replace(/^\//, "").split("?")[0]));
  }

  const inline = [
    ...html.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g),
  ]
    .filter(([, attrs]) => !/application\/ld\+json/.test(attrs))
    .map(([, , body]) => body)
    .join("\n");

  let css = 0;
  for (const href of new Set(
    [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]),
  )) {
    css += gzip(join(out, href.replace(/^\//, "").split("?")[0]));
  }

  const inlineBytes = inline ? gzipSync(Buffer.from(inline)).length : 0;
  const jsTotal = js + inlineBytes;

  worstJs = Math.max(worstJs, jsTotal);
  worstCss = Math.max(worstCss, css);

  const overJs = jsTotal > JS_BUDGET_BYTES;
  const overCss = css > CSS_BUDGET_BYTES;
  if (overJs) failures.push(`${route.file} js ${(jsTotal / 1024).toFixed(1)}KB`);
  if (overCss) failures.push(`${route.file} css ${(css / 1024).toFixed(1)}KB`);

  console.log(
    `${overJs || overCss ? "FAIL " : "ok   "} ${route.file} — ` +
      `js ${(js / 1024).toFixed(1)}KB + inline ${(inlineBytes / 1024).toFixed(1)}KB ` +
      `= ${(jsTotal / 1024).toFixed(1)}KB gzip (budget ${JS_BUDGET_BYTES / 1024}KB), ` +
      `css ${(css / 1024).toFixed(1)}KB gzip (budget ${CSS_BUDGET_BYTES / 1024}KB)`,
  );
}

/* -------------------------------------------------------------------- fonts */

// A font file only reaches the wire if some @font-face actually points its
// `src` at it, and then only if its `unicode-range` matches a character on the
// page. Both tests are applied; anything failing either is reported and left out
// rather than inflating the number.
const cssText = readdirSync(join(out, "_next", "static", "css"))
  .map((name) => readFileSync(join(out, "_next", "static", "css", name), "utf8"))
  .join("\n");

const faces = [...cssText.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
const LATIN = /U\+0[0-9A-F]{3}|U\+0000-00FF/i;

let fontBytes = 0;
let fetchable = 0;
const skipped = [];

for (const file of walk(join(out, "_next", "static", "media"), /\.woff2?$/)) {
  const name = file.split(/[\\/]/).pop();
  const block = faces.find((b) => new RegExp(`src:\\s*url\\([^)]*${name}\\)`).test(b));
  const range = block?.match(/unicode-range:\s*([^;}]+)/)?.[1];

  if (!block) {
    skipped.push(`${name} (no @font-face points at it)`);
  } else if (range && !LATIN.test(range)) {
    skipped.push(`${name} (unicode-range excludes Latin)`);
  } else {
    fontBytes += statSync(file).size;
    fetchable += 1;
  }
}

const overFonts = fontBytes > FONT_BUDGET_BYTES;
if (overFonts) failures.push(`fonts ${(fontBytes / 1024).toFixed(1)}KB`);

console.log(
  `note fonts — ${skipped.length} emitted file(s) a browser cannot request: ` +
    `${skipped.join("; ") || "none"}`,
);
console.log(
  `${overFonts ? "FAIL " : "ok   "} fonts — ${(fontBytes / 1024).toFixed(1)}KB ` +
    `across ${fetchable} fetched file(s) (budget ${FONT_BUDGET_BYTES / 1024}KB)`,
);
console.log(
  `note first visit — ${((worstJs + worstCss + fontBytes) / 1024).toFixed(1)}KB gzip total, ` +
    `of which fonts and stylesheet are self-hosted and cached across routes`,
);

if (failures.length) {
  console.error(`\n${failures.length} budget violation(s).`);
  process.exit(1);
}
