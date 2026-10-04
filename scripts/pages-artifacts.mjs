#!/usr/bin/env node
/**
 * GitHub Pages serves the exported `out/` directory with Jekyll unless it finds
 * a `.nojekyll` file. Next writes directories like `_next`, and without this
 * Jekyll would strip them and the deployed site would have no JavaScript at all.
 */

import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const marker = join(out, ".nojekyll");

if (!existsSync(out)) {
  console.error("out/ does not exist — run `next build` first.");
  process.exit(1);
}

writeFileSync(marker, "", "utf8");
console.log("write out/.nojekyll");