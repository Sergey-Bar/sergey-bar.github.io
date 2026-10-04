# sergey-bar.github.io

Personal site for Sergey Bar — Senior QA Engineer & QA Tech Lead.
Static export, GitHub Pages, no analytics, no CV, no published email address.

Two routes: `/` (the career site) and `/projects` (Mjolnir and Automate, each
linked to its public repository). LinkedIn is the contact route; GitHub is the
evidence.

## Stack

Next.js 15 App Router · TypeScript · Tailwind v4 · one shadcn/ui primitive
(`button`). `output: "export"`, `images.unoptimized`, `trailingSlash`, and
`.nojekyll` emitted into `out/`.

No animation library. The staged moments the design calls for are CSS: the hero
entrance is a keyframe with a `both` fill, and the quality pipeline is
scroll-driven (`animation-timeline: view()`) behind an `@supports` guard. Where
scroll-driven CSS is unsupported the section is simply already finished, which is
what a reduced-motion visitor sees anyway.

The header is the only client island, and it deliberately does not import the
Button primitive: `cn` pulls `tailwind-merge`, which measured 8.4KB gzip of the
route budget to serve a boolean that toggles one attribute.

## Commands

```bash
npm run dev            # local dev server
npm run build          # refresh npm stats, static export into out/ + .nojekyll
npm run content:sync   # regenerate src/content/mjolnir-*.ts from data/mjolnir/
npm run content:check  # fail if those generated files have drifted
npm run stats:sync     # refresh src/content/npm-stats.ts from the npm registry
npm run typecheck
npm run lint
npm run budget         # assert the JS, CSS and font budgets against out/
npm run verify         # all of the above, in the order CI runs them
```

## Budgets

`npm run budget` measures what actually crosses the wire, on every route declared
in `src/content/routes.json`, and fails closed:

| Budget | Limit | Current |
|---|---|---|
| JavaScript, gzip (external + inline, excluding the `noModule` polyfill chunk) | 150KB | 117.2KB |
| Stylesheet, gzip | 20KB | 6.2KB |
| Self-hosted fonts | 140KB | 132.6KB |

It also fails if the built page set or the Lighthouse URL list disagrees with
`src/content/routes.json`, so a new page cannot quietly escape the sitemap, the
bundle gate or the Lighthouse set. Add a route in exactly one place:
`src/content/routes.json` plus the `url` array in `.lighthouserc.json`.

## The generated content layer

`src/content/mjolnir-report.ts` and `src/content/mjolnir-facts.ts` are written by
`scripts/generate-mjolnir.mjs` from the snapshots in `data/mjolnir/`. **Do not
edit them.** CI re-derives them and fails the build on any difference, so the
Mjolnir numbers on this site cannot drift from the scan that produced them.

The generator fails closed rather than guessing. An unrecognised
`scopeIntegrity.scopeVerdict` or a non-numeric `score` throws instead of emitting
a plausible-looking value, and worthiness bands are read from `census.json`
rather than hardcoded, so the bands exist in exactly one place.

Hand-written content modules that state a Mjolnir figure interpolate it from the
generated `mjolnir` constant instead of typing it — including the proof row, the
`/projects` facts and the toolbox framework list.

See `data/mjolnir/README.md` for provenance, the two derivations the generator
performs, and how to refresh from an upstream checkout.

### The npm download counter

`src/content/npm-stats.ts` is the one number that cannot come from a vendored
snapshot, because it moves every hour. `npm run stats:sync` reads the npm
registry API before each build and writes the value together with the exact
window it covers and when it was measured, so the page says what the figure means
rather than just showing it.

It is deliberately **not** drift-locked — the downloads number would fail
`content:check` on every run. If the registry is unreachable the script keeps the
previous reading and marks it `stale`, and the page says so. It never fails a
deploy over a third-party API.

## Static assets

`public/og.png`, `public/icon-512.png`, `public/apple-icon.png` and
`public/favicon-32.png` are committed binaries. GitHub Pages has no image
optimisation or generation runtime, so the OG image is a static 1200×630 PNG by
necessity. `public/favicon.svg` is the vector form of the same mark.

There is deliberately no `src/app/favicon.ico`: Next emits that convention file
ahead of the explicit `metadata.icons` list, so a leftover one silently wins the
icon race.

## CI

`.github/workflows/verify.yml` runs content drift → types → lint → build, then a
Lighthouse gate, then deploys `out/` to GitHub Pages.

- The Lighthouse gate asserts that `assertion-results.json` exists, so a config
  that aborts before asserting fails closed instead of passing silently.
- `deploy` runs only on `push`, serialised by its own concurrency group with
  cancellation disabled — cancelling a run mid-publish leaves the already-created
  Pages deployment to finish anyway, under a cancelled run.
- The deployed artifact is built a third time and is asserted file by file
  (`.nojekyll`, both routes, `404.html`) before upload. Without `.nojekyll`,
  Jekyll strips `_next/` and the published site has no JavaScript.
- Third-party actions are pinned to a commit SHA.

**One-time prerequisite:** the GitHub Pages source for `Sergey-Bar/sergey-bar.github.io`
must be set to **GitHub Actions**. It is currently `legacy`, which means a second
Jekyll publisher builds the repository root on every push to `main` and races this
workflow.
