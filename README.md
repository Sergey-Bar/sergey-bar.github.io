# sergey-bar.github.io

Personal site for Sergey Bar, QA Tech Lead & AI Automation Engineer.
Static export, GitHub Pages, no analytics, no CV file; the CV is sent on request by email or on LinkedIn.

One page: `/`, the whole record as one document, plus the 404. LinkedIn is the
contact route; GitHub is the evidence. There is no contact form and no CV file:
the CV is sent on request, by email or on LinkedIn.

## The page

The home page is one document: everything the old chat answered, shown at
once, in the order a reader takes it in. A recruiter with thirty seconds gets
the record at once; nothing on the page waits for anything.

The first visit of a browser session opens on a short screen: the name rising
in like a heading, the role, and one line that pretends to boot the page
("Negotiating with the release gate…"), a different one each time and each
short enough to stay on one line on a phone. After a little over a second, or at once on a tap, a key, a wheel
or a swipe, it hands over to the hero: the name and the role glide from the
centre into their places in the hero (measured from the text boxes, scaled by
the font sizes) while the screen's ground fades round them, and the hero's own
heading takes over in the same spot. With the hero out of view (an address
that opened on a section) the screen simply fades. The page is already
rendered underneath, so nothing waits for it. The layout's inline script
decides before first paint (and marks the session); the stylesheet keeps a
late fade of its own and shows the hero's name regardless, so a script that
never arrives cannot leave the screen up; and it never shows with motion
under `prefers-reduced-motion`, or without JavaScript.

The page opens on the hero: the name as the page's only `h1`, the role, the
one-line pitch, three actions (LinkedIn, "Request my CV" by email, GitHub) and
the portrait, with the employers underneath on one line. The IAF emblem is
the official one as drawn, white with navy line work. The wordmarks are white
versions of each company's own logo, made for the dark ground and kept next
to their sources in `public/logos/` (`*-on-dark`): FLIR without its tagline,
Nova without the small print that turned to dots, Enabley without the outline
and shadow baked into its PNG, HP in white. Then eight
numbered sections, each an `h2` with a lead paragraph and its cards: About me,
Experience, Toolbox, Recommendations, Projects, Case studies, Contact,
Something fun. Long cards keep progressive disclosure: a project shows its
figure, its one-line pitch and the repository, with how it works and its
numbers behind one line; a case study shows the problem, the outcome and one
figure, with the approach and evidence behind one line; a role shows its scope
with the responsibilities and outcomes behind one line; three recommendations
lead and the other eleven open on request. The foot repeats the three ways to
reach Sergey.

All of it is rendered on the server (`src/home/sections.tsx`,
`src/home/hero.tsx`), so a crawler or a visitor without JavaScript reads the
same page and every contents link still jumps. `src/home/home-director.tsx` is
the one client island, and it only adds reading aids around the document:

- **Contents.** On a wide screen a sidebar stands beside the page: the eight
  sections numbered 01 to 08, the profiles (LinkedIn, GitHub, email) and, at
  its foot, the person the way Claude Code keeps the account: the avatar, the
  first name and "Ultra" as plain muted text after a dot, the way Claude Code
  writes the plan beside the name. The name and the title are in the
  hero, so the menu carries only the first name. The section in view is marked
  (`aria-current="location"`, a lit number and an edge bar), measured as the
  last section whose top has passed a third of the screen. On a narrow screen
  the contents are a drawer, and its button is on the left of a slim top bar
  (which also names the section in view), on the side the drawer opens from;
  the drawer takes focus when it opens, and Escape or a jump closes it and
  hands focus back. On a short screen the menu tightens (34px, then 32px
  rows) and, when it still cannot fit, scrolls beneath its pinned foot. In
  landscape on a phone the ask bar keeps to the field and drops its status
  line. A sweep at 17 sizes from 320x568 to 2560x1440 (phones, a phone on its
  side, tablets, the 1023/1024 boundary, desktops) checks horizontal overflow
  at every section, the hamburger's side, the drawer's edge, the foot, the plus
  panel and the ask bar's share of the height.
- **The ask bar.** Fixed under the page, on one row: a plus (every topic), the
  field, and a return-arrow send (quiet until there is something to send).
  Under the box a status line the way Claude Code draws one: "Auto" where the
  mode would be, and "Opus 5.5" with "Max" where the model and its effort
  would be, the effort in the one pink-to-purple shimmer on the page. The
  answers are written, not generated: the line is the joke, hidden from
  assistive technology and replaced by one plain sentence. The ring at its end
  is real: a context meter that fills with the share of the page read, empty
  at the top. It owns its own listeners and writes straight to its element, so
  reading the page never re-renders the page, and it follows the page's height
  (a row that opens, a toolbox search) as well as the scroll. It is
  `aria-hidden`: a progress bar that changes with every wheel tick is noise to
  a screen reader. The buttons are 36px, 44px on a touch screen, and the
  plus is one "Topics" button with `aria-expanded`.
  The plus holds every section as a chip (one row of short names
  on a phone, which pulls in as the page is read: a chip whose section has been
  passed folds away, width, gap and fade, so the section in view leads the row
  and what is ahead follows; it comes back on a scroll up, folded chips leave
  the tab order, and the contents drawer still reaches every section) and the
  profiles as icons. Until the visitor
  chooses, the panel follows the layout: open on a narrow screen, where it is
  the way round the page, and put away beside the sidebar, which already lists
  every section; the stylesheet applies that default before any script runs.
  Once the visitor uses the plus, the choice holds and nothing else opens
  or closes it. The chip for the section in view is marked, and while the
  visitor types, the chip the router would answer with lights up. A question
  is routed by `routeInput` in `src/home/topics.ts` and answered by the page
  itself: the reader is taken to the section, under its own address, and a
  short reply above the bar says where ("Showing Toolbox, searched for
  “java”."); a tool's name is handed to the toolbox's own search. A greeting
  gets a greeting, a well-known tool the toolbox does not list gets an honest
  "not in my toolbox" (and, where Mjolnir reads suites in it, says so), and a
  question no section answers gets "no section answers that one yet" with the
  likeliest sections. It is a lookup, not a model, and the reply says so.
  "/" focuses the field from anywhere and Escape leaves it.

Typed questions are routed by keywords and phrases, phrases outweighing words.
Every tool name in the toolbox routes to it as a whole word, so "Java" or
"Postman" is answered without a hand-kept keyword. Each section has an address
(`#projects`, `#experience`, …): the contents, the chips and the ask bar all
use it, so the address bar can be shared and Back walks the sections visited
before it leaves the site. Old anchors (`#case-studies`, `#work`, `#profile`,
`#play`) and `?topic=` land on their section under its own address. The page's
scroll padding follows the ask bar's measured height, so a link reached by Tab
never focuses beneath it, and a jump lands a section's heading near the top
rather than a gap's height below it.

## Palette

Blue, white and black, after the LinkedIn profile. Near-black ground, a dark
grey panel, LinkedIn blue for fills, a brighter blue for text and glows on
black, and white type. Every status mark is a blue; there is no second hue.
The ambient light is three pre-blurred radial gradients moved on the
compositor, placed to echo the profile banner's glow.

The tokens are written in OKLCH, and the greys sit on the blues' own hue, so
every neutral is a very dark blue rather than a grey. A wide-gamut (P3) screen
gets more saturated blues than sRGB can show; the gradients interpolate in
OKLCH. Surfaces have depth from three tokens: a raised surface (a bubble, a
card, the ask bar) catches light on its top edge (`--edge`), carries a faint
sheen down its face (`--sheen`) and casts a short contact shadow plus a long
soft one (`--elev-1`, `--elev-2`); a well set into a card (the evidence panel,
the scan transcript, a recommendation) is shaded at its top edge instead
(`--well`). Where the browser supports `corner-shape: squircle` the large
surfaces get superellipse corners at a larger radius; elsewhere they stay round.

## Type

On an Apple device the site reads in Apple's own faces, SF Pro for text and
SF Mono for terminal output, taken from the system (`-apple-system`, `BlinkMacSystemFont`,
`ui-monospace`, `SF Mono`). They are named, never shipped: Apple's licence
allows neither self-hosting them nor using them off Apple platforms. Every other
device reads the self-hosted Geist and JetBrains Mono, which sit close to them,
so the font budget is unchanged. The demolition run's canvas follows the same
order.

Labels, card eyebrows, tags, sidebar headings and figures are set in the text
face, with tabular figures so numbers still align. Mono appears only where the
page shows terminal output: the opening screen's line.

## Stack

Next.js 15 App Router · TypeScript · Tailwind v4 · one shadcn/ui primitive
(`button`). `output: "export"`, `images.unoptimized`, `trailingSlash`, and
`.nojekyll` emitted into `out/`.

No animation library. Motion is one vocabulary in `globals.css`: `--ease-out`
for anything entering, `--ease-in-out` for anything moving on screen,
`--ease-spring` (a damped spring sampled into `linear()`, under 4% overshoot)
for what lands, never ease-in on a control, interaction feedback under 300ms,
and the longer durations reserved for the opening screen and for content that
scrolls into view. Nothing is hidden for an entrance until the motion director
has looked: its observer's first report is the page as it opened, and only
what is off screen then is armed (`data-armed`) to fade in and count up when
it arrives. A reload that restores the scroll, or an address that lands on a
section, shows what is in view as it is, with the final figures, so a refresh
never blinks. A reload (or a return through history) with a section's hash in
the URL used to restore the scroll and then glide to the heading, because the
browser applies the fragment too and `scroll-behavior: smooth` animated it:
the layout's inline script now sets the hash aside before the page loads, so
the browser restores where the reader was, and the director puts the hash back
in the address once the page has settled. The root only turns smooth then
(`data-settled`), so whatever the browser does while loading is instant, and
the ring waits for the first measure rather than showing
an empty state. The portrait does not move; only the thin ring around it turns. A soft light follows a fine pointer across
the page, moved on the compositor from window-level events so it can never be
left behind; it fades when the pointer leaves the document and does not exist
on touch screens. Looping ambience (the ring, the shimmer, the
background light) stops entirely under `prefers-reduced-motion`. There is no
control of the site's own: the system's setting is the preference (an old
stored "pause" from an earlier version is cleared by the layout's script, so
nobody is left stuck with no way back). Nothing on the page waits for an
animation to be read, so reduced motion changes only the light.

The toolbox has a small search island, matching disciplines and tool names.
Group content is server-rendered, with a live result count and clear empty state.
The game opens from the "Play" button in the "Something fun" section. It is a `next/dynamic` chunk that is never referenced by the HTML, so
the budget script never sees it: the full canvas toy (nine tools, particles,
termites, its sound) downloads only when someone opens it.

It plays like a shooter. There is no start card: the game is live the moment it
opens, and the clock starts on the first hit. The HUD carries the run's level
and rank with an XP bar (ten levels, Intern to Legend, by score), the clock
and the best time, the target's integrity as a segmented health bar with the
bugs squashed, a combo counter, and a weapon hotbar on keys 1 to 9 with a
sound toggle (M). Rapid hits build a combo that multiplies the score; combos
of 5, 10, 20 and 35 are announced (Smoke test, Regression run, Load test,
Chaos monkey), and so is every level. Impacts float their points, growing and
warming with the combo, and draw a hit marker; the hammer and the stamp hold
the world still for a few frames. The shake is a fraction of what it was and
capped low: the weight comes from a short zoom towards the impact instead. Bugs
crawl the screen and are worth a second each when squashed, and the screen
talks back as its integrity drops. The result card gives the time, a rank
(Ship it, Hotfix, Rollback), the score, level, bugs and best combo, and banks
the score as career XP on that device, with the best time, in localStorage.
The target is a desktop with nothing open on it: an original painting in the
spirit of the early-2000s wallpaper (a rolling green hill under a deep blue sky
with soft clouds, drawn in canvas, not a copy of any photograph), its icons and
a taskbar. Integrity is measured on the desktop above the taskbar and reaches
zero when 60% of it is wrecked, so a run still ends in under a minute. A touch
screen gets a short haptic tick on the blunt tools.

The sound is synthesised in the browser with the Web Audio API
(`src/components/destruction-audio.ts`): no audio files and nothing licensed
from anyone. Each tool has its own voice from oscillators and filtered noise;
the held tools (chain-saw, flame-thrower, phaser, washing) run a loop while
pressed, and the chain-saw revs as it cuts. The context is created on the first
press, everything passes through one compressor, and the choice to mute is
remembered.

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
| JavaScript, gzip (external + inline, excluding the `noModule` polyfill chunk) | 150KB | 141.8KB |
| Stylesheet, gzip | 20KB | 17.7KB |
| Self-hosted fonts | 140KB | 107.5KB |

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
generated `mjolnir` constant instead of typing it: the project facts do
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
necessity; `python scripts/og-image.py` regenerates it on the site's theme from
the portrait and the content modules (Pillow, Windows system fonts).
`public/portrait-480.webp` (13KB) is what the page shows: the hero draws the
portrait at most 232px wide, 464 on a 2x screen. `public/portrait.webp` (900px)
is its source and what the social preview generator reads. It is the LinkedIn profile photo, cropped to the face and resized to 900×900 from the 1254×1254 original, with a natural finish applied in the file (the upscaler's skin texture filtered, colour eased, fine grain); the crop lives in the file, not in CSS, so nothing is scaled up on screen. `public/favicon.svg` is the vector form of the same mark.

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


## Tested like a product

`npm run test:e2e` runs a Playwright suite against the built export, served as
GitHub Pages serves it: the first screen with nothing to wait for, the heading
outline, every section, the page without JavaScript, no horizontal overflow
down to 320px, the contents and the phone's drawer, Back through visited
sections, old anchors, the ask bar's topics panel, typed routing and the
toolbox search hand-off, the unlisted-tool, greeting and fallback replies, the
keyboard shortcuts, focus never hidden under the ask bar, the opening screen
(once a session, lifted by a key, never under reduced motion), projects folded
behind one line, the pause control overlapping nothing, the game, and the 404
(with the old long pages gone), at desktop and phone sizes, with an axe-core audit
(WCAG 2.2 A and AA) of each state. CI runs it on every push; the deploy job
downloads the HTML report and publishes it at `/qa/report/`, which the case
studies section links. Traces, screenshots and video are kept on failure. `npm run verify`
ends with it.

## Case studies

`src/content/case-studies.ts` tells two pieces of work as problem, approach,
evidence and outcome. It imports the experience and metrics modules and reads
its figures from them rather than restating them, and throws at build time if
a referenced record is missing. Mjolnir is told once, under Projects.

## Something fun

The last section introduces the game from its own facts: a mock early-2000s
desktop (`bugs.exe` and `release-gate.yml` included) to take down to zero
integrity, the nine tools as the game draws them (read from `TOOLS` in
`src/components/destruction-tools.tsx`, so the list cannot drift), streaks
named the way QA names them and ranks from Intern to Legend. The "Play" button
(`PlayButton`, a plain pill with no pulse) sits in its own striped well with
the two keys that matter.

## Readability

Every text on the page is at least 13px, except the uppercase labels (12px,
tracked) and keyboard keys, and holds at least 4.5:1 against what it sits on.
Small accent text (eyebrows, section numbers, the case labels) and the focus
ring (at least 7:1 on every surface, where the brand blue fell under 3:1 on
the raised ones) use the lighter `--color-accent-ink` rather than the brighter sky blue, which stays
for marks, bars and icons. The game's HUD labels are 11.5px at 70% white,
up from 10px at 50%. A Playwright spec measures size and contrast on every
visible text node, on desktop and phone.

## Interaction checks

The game uses a native modal dialog with keyboard cycling and focus
restoration. Hidden Back to top controls are disabled and do not intercept
pointer input. The ask bar announces one short status line per question to
assistive technology, moves focus to the heading of the section it opens on a
touch screen, and the count-up figures stay decorative with the final value
exposed alongside.

See `docs/cinematic-validation.md` for the dated validation log, including the
earlier chat design that this page replaced.

## LinkedIn recommendations

`src/content/recommendations.ts` transcribes 14 recommendations from four
user-supplied LinkedIn screenshots. Titles are the labels shown in those images.
Pavel Kagansky, Roey Alon and Omer Fefer have excerpt flags: only complete
visible sentences are included, with no reconstruction of text behind More.
The home page features three recommendations and a native disclosure for the
remaining eleven. Initials are decorative; no third-party portraits are generated.
