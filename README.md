# sergey-bar.github.io

Personal site for Sergey Bar, QA Tech Lead & AI Automation Engineer.
Static export, GitHub Pages, no analytics, no CV, no published email address.

Two routes: `/` (the career site) and `/projects` (Mjolnir and Automate, each
linked to its public repository). LinkedIn is the contact route; GitHub is the
evidence. There is no contact form, no CV copy and no published email
address.

## Experience and contact

The home page opens with a cinematic hero and a naturally colored portrait,
followed by a normal-flow statement, evidence metrics and the two projects.
The profile, experience, toolbox and contact section follow. Projects share
one neutral background; the recorded scan and architecture overview make
the work easier to inspect without presenting simulated screens as products.

Experience details use native disclosures. The toolbox initially shows six
groups; search covers all eighteen and visitors can expand the complete list.
LinkedIn is available in the header, hero and closing contact section. GitHub
remains the source of project evidence. No CV, email or phone is published.
The interactive red-button game is visible after the contact links so it is easy to discover.
## Stack

Next.js 15 App Router · TypeScript · Tailwind v4 · one shadcn/ui primitive
(`button`). `output: "export"`, `images.unoptimized`, `trailingSlash`, and
`.nojekyll` emitted into `out/`.

No animation library. The hero has a short CSS entrance and portrait settle;
button arrows respond to hover. All new motion respects reduced-motion settings.
Reading progress uses scroll-driven CSS where supported. Body text stays fully visible in both motion modes. Count-up figures retain their final values in the server render.

The toolbox has a small search island, matching disciplines and tool names.
Group content is server-rendered, with a live result count and clear empty state.
The header is a client island and deliberately does not import the Button
primitive: `cn` pulls `tailwind-merge`, which measured 8.4KB gzip of the route
budget to serve a boolean that toggles one attribute. It also carries the
desktop segment control: a sliding dark pill whose position is measured from
the active link, and a scroll spy that marks the section crossing a line a
third of the way down the viewport. On a route page the pill follows the
pathname instead, and the whole indicator is hidden below `md` where the menu
sheet takes over.

`src/components/back-to-top.tsx` is the other small island: it fades in past
640px of scroll, jumps to the top, and gives a reduced-motion visitor the jump
without the smooth scroll.

The "do not press" button in the CTA section is a client island too, and it
ships on the boot path. Its game is a `next/dynamic` chunk that is never
referenced by the HTML, so the budget script never sees it: the full canvas toy
(nine tools, particles, termites) downloads only when someone actually presses
the button.

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
| JavaScript, gzip (external + inline, excluding the `noModule` polyfill chunk) | 150KB | 123.8KB |
| Stylesheet, gzip | 20KB | 9.3KB |
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
generated `mjolnir` constant instead of typing it: the `/projects` facts do
exactly that, and the proof row deliberately holds no Mjolnir number at all.

See `data/mjolnir/README.md` for provenance, the two derivations the generator
performs, and how to refresh from an upstream checkout.

### The npm download counter

`src/content/npm-stats.ts` is the one number that cannot come from a vendored
snapshot, because it moves every hour. `npm run stats:sync` reads the npm
registry API before each build and writes the value together with the exact
window it covers and when it was measured, so the page says what the figure means
rather than just showing it.

It is deliberately **not** drift-locked: the downloads number would fail
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
  cancellation disabled, because cancelling a run mid-publish leaves the already-created
  Pages deployment to finish anyway, under a cancelled run.
- The deployed artifact is built a third time and is asserted file by file
  (`.nojekyll`, both routes, `404.html`) before upload. Without `.nojekyll`,
  Jekyll strips `_next/` and the published site has no JavaScript.
- Third-party actions are pinned to a commit SHA.

**One-time prerequisite:** the GitHub Pages source for `Sergey-Bar/sergey-bar.github.io`
must be set to **GitHub Actions**. It is currently `legacy`, which means a second
Jekyll publisher builds the repository root on every push to `main` and races this
workflow.


## Cinematic motion and interaction checks

The hero now uses a dark photographic stage with moving blue/ember light,
a pointer-responsive portrait, and a floating caption. A normal-flow statement separates the hero from the profile on all screens. Motion runs continuously, with the operating system's reduced-motion preference respected for accessibility.
CSS motion and pointer effects; system reduced-motion preferences take priority.
Ambient hero motion pauses when the hero leaves the viewport.

Regression command: `node --test scripts/qa/navigation.test.mjs`.
This covers section selection before the first section, in gaps, at boundaries,
and after the final section. The game uses a native modal dialog with keyboard
cycling and focus restoration. Hidden Back to top controls are disabled and do
not intercept pointer input.

## LinkedIn recommendations

`src/content/recommendations.ts` transcribes 14 recommendations from four
user-supplied LinkedIn screenshots. Titles are the labels shown in those images.
Pavel Kagansky, Roey Alon and Omer Fefer have excerpt flags: only complete
visible sentences are included, with no reconstruction of text behind More.
The home page features three recommendations and a native disclosure for the
remaining eleven. Initials are decorative; no third-party portraits are generated.
