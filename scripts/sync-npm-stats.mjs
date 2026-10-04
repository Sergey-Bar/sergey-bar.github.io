#!/usr/bin/env node
/**
 * npm download counts for mjolnir-qa.
 *
 * This is the one number on the site that cannot come from a vendored snapshot,
 * because it changes every hour. It is refreshed from the npm registry API and
 * written into src/content/npm-stats.ts with the exact window it covers and the
 * moment it was measured, so the page can say what the figure actually means.
 *
 * It is deliberately NOT drift-locked: the downloads number would fail
 * `content:check` every single run. Instead this script runs before the build,
 * and if the registry is unreachable it keeps the previously measured value and
 * marks it stale rather than failing a deploy over a third-party API.
 *
 *   node scripts/sync-npm-stats.mjs          # refresh, or keep the old value
 *   node scripts/sync-npm-stats.mjs --force  # fail instead of keeping the old
 */

import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE = "mjolnir-qa";
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "content",
  "npm-stats.ts",
);
const force = process.argv.includes("--force");

const previous = (() => {
  try {
    return JSON.parse(readFileSync(OUT, "utf8").match(/= (\{[\s\S]*?\});\n$/)?.[1] ?? "{}");
  } catch {
    return {};
  }
})();

async function point(from, to) {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/${from}:${to}/${PACKAGE}`,
    { headers: { accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`npm registry returned ${res.status}`);
  return res.json();
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const [lastMonth, total] = await Promise.all([
    point(monthAgo, today),
    point("2000-01-01", today),
  ]);

  const stats = {
    package: PACKAGE,
    downloadsLastMonth: lastMonth.downloads,
    downloadsAllTime: total.downloads,
    windowStart: lastMonth.start,
    windowEnd: lastWindowEnd(lastMonth.end, today),
    measuredAt: new Date().toISOString(),
    stale: false,
  };

  write(stats, false);
  console.log(
    `write src/content/npm-stats.ts — ${stats.downloadsLastMonth} downloads ` +
      `${stats.windowStart} to ${stats.windowEnd}, ` +
      `${stats.downloadsAllTime} all time`,
  );
}

/** The registry caps `point` ranges, so its `end` is not always today. */
function lastWindowEnd(reported, requested) {
  return new Date(reported) <= new Date(requested) ? requested : reported;
}

function write(stats, stale) {
  const body = `// GENERATED FILE — do not edit.
// Source: https://api.npmjs.org/downloads/point (npm registry API, ${PACKAGE})
// Refresh: npm run stats:sync    Regenerated on every build, not drift-locked,
// because the number moves continuously.

export const npmStats = ${JSON.stringify({ ...stats, stale }, null, 2)} as const;

export type NpmStats = typeof npmStats;
`;
  writeFileSync(OUT, body, "utf8");
}

try {
  await main();
} catch (error) {
  if (force) throw error;
  if (previous.downloadsLastMonth === undefined) {
    console.error(
      `npm registry unreachable and no previous reading exists: ${error.message}`,
    );
    process.exit(1);
  }
  write({ ...previous, stale: true }, true);
  console.warn(
    `keep  src/content/npm-stats.ts — npm registry unreachable (${error.message}); ` +
      `keeping ${previous.downloadsLastMonth} downloads measured ${previous.measuredAt}, marked stale`,
  );
}