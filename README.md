# sergey-bar.github.io

Personal site for Sergey Bar, QA Tech Lead & AI Automation Engineer.
Static export, GitHub Pages, no analytics, no CV, no published email address.

Two routes: `/` (the site as a conversation) and `/projects` (Mjolnir and
Automate in long form, each linked to its public repository). LinkedIn is the
contact route; GitHub is the evidence. There is no contact form, no CV copy and
no published email address.

## The conversation

The home page is a chat. It opens on an intro screen (greeting, name, role,
portrait, one line of proof, two ways in) with a composer fixed to the bottom
of the viewport: a text field plus one chip per topic. Pressing a chip, or
typing a question, sends a bubble on the visitor's behalf and the answer
arrives as a sequence of replies: short bubbles for sentences, full-width cards
for the record at a glance, the verified outcomes, the two projects with the
recorded Mjolnir scan and its worthiness meter, the five roles with their
native disclosures, the fourteen recommendations, the searchable toolbox, and
the contact routes. Every answer ends with quick replies to the next topics.

The answers are not fetched and not generated. `src/chat/flows.tsx` renders
all seven of them on the server from the content modules, in a fixed logical
order, so a crawler or a visitor without JavaScript reads the intro followed by
every answer. `src/chat/chat-director.tsx` is the client island that turns
that document into a chat: it hides unsent answers (only once an inline flag in
the layout has set `data-js`, so nothing is ever hidden without the script to
show it), reveals a flow one message at a time behind a typing indicator, and
reorders flows visually with flex `order` so the conversation reads in the
order the visitor asked. The log is `role="log" aria-live="polite"`, so each
reply is announced as it lands.

Typed questions are routed by `routeInput` in `src/chat/topics.ts`: a keyword
and phrase lookup, phrases outweighing words. A greeting gets a greeting; a
question it cannot place gets an honest "I don't have an answer for that one"
and the full list of topics. It is a lookup, not a model, and the reply says
so. Legacy anchors (`/#projects`, `/#experience`, …) and `?topic=` open the
matching conversation on arrival, so links to the old sections still land.

The view follows the conversation the way a reader would: the question is
pinned under the identity bar and replies fill the screen beneath it; once they
overflow the view stops moving, and any wheel, swipe or arrow key stops it for
good. "Start over" returns to the intro and clears the log.

## Palette

Blue, white and black, after the LinkedIn profile. Near-black ground, a dark
grey panel, LinkedIn blue for fills, a brighter blue for text and glows on
black, and white type. Every status mark is a blue; there is no second hue.
The ambient light is three pre-blurred radial gradients moved on the
compositor, placed to echo the profile banner's glow.

## Stack

Next.js 15 App Router · TypeScript · Tailwind v4 · one shadcn/ui primitive
(`button`). `output: "export"`, `images.unoptimized`, `trailingSlash`, and
`.nojekyll` emitted into `out/`.

No animation library. Motion is one vocabulary in `globals.css`: `--ease-out`
for anything entering, `--ease-in-out` for anything moving on screen, never
ease-in on a control, interaction feedback under 300ms, and the longer
durations reserved for the page-load sequence (the name and role rise word by
word through a mask; the portrait, quote and actions follow) and for message
arrivals, which are CSS animations and run off the main thread. The portrait
tilts a few degrees toward a fine pointer, with its glow following, written as
custom properties in one animation frame per move. Looping ambience (the
portrait ring, the status pulse, the background light) pauses off screen and
stops entirely under `prefers-reduced-motion` or the visitor's own "Pause
motion" control, which persists in localStorage and is applied before first
paint. With motion off the chat still works; replies simply appear at once.

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


## Interaction checks

Regression command: `node --test scripts/qa/navigation.test.mjs`.
This covers section selection before the first section, in gaps, at boundaries,
and after the final section, which the projects route's header still uses.
The game uses a native modal dialog with keyboard cycling and focus
restoration. Hidden Back to top controls are disabled and do not intercept
pointer input.

See `docs/cinematic-validation.md` for the dated validation log, including the
chat redesign.

## LinkedIn recommendations

`src/content/recommendations.ts` transcribes 14 recommendations from four
user-supplied LinkedIn screenshots. Titles are the labels shown in those images.
Pavel Kagansky, Roey Alon and Omer Fefer have excerpt flags: only complete
visible sentences are included, with no reconstruction of text behind More.
The home page features three recommendations and a native disclosure for the
remaining eleven. Initials are decorative; no third-party portraits are generated.
