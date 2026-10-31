# sergey-bar.github.io

Personal site for Sergey Bar, QA Tech Lead & AI Automation Engineer.
Static export, GitHub Pages, no analytics, no CV file; the CV is sent on request by email or on LinkedIn.

Four routes: `/` (the site as a conversation), `/projects` (Mjolnir and
Automate in long form, each linked to its public repository), plus `/colophon`
(how the site is built and tested) and `/accessibility`. LinkedIn is the
contact route; GitHub is the evidence. There is no contact form and no CV file:
the CV is sent on request, by email or on LinkedIn.

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
so. Every tool name in the toolbox routes to it as a whole word, so "Java" or
"Postman" is answered without a hand-kept keyword; a well-known tool the
toolbox does not list ("Selenium") is answered as not listed, and where Mjolnir
reads suites in it the reply says that too. Legacy anchors (`/#projects`,
`/#experience`, …) and `?topic=` open the matching conversation on arrival, so
links to the old sections still land.

Each answer has an address: asking a topic sets `#<topic>`, so the address bar
can be shared, and Back and Forward walk the answers already given (to the top
of the chat past the first) before Back leaves the site.

The view follows the conversation the way a reader would: the question is
pinned under the identity bar and replies fill the screen beneath it; once they
overflow the view stops moving, and any wheel, swipe or arrow key stops it for
good. "Start over" returns to the intro and clears the log.

Replies stream. When a text bubble is revealed the director splits its words
into spans, once, and the stylesheet fades them in one after another at the
pace of a model's output; cards and quick replies arrive whole, and with motion
off the text is simply there. While the visitor types, the chip the router
would answer with lights up, so the lookup shows its intent before it is
asked; the identity bar reads "typing…" while a reply is composed. On a device
with a pointer the composer takes focus after the opening, "/" focuses it from
anywhere and Escape hands focus back to the page.

The first screen is quiet: the name, the role and the portrait, with a line
at the bottom that pretends to boot the chat (negotiating with the release
gate, convincing the flaky test, counting bugs): one line per visit, kept for
the whole wait, with "Ready in 2…1" appended for the last two seconds. The
line rotates through twelve, so the next load reads a different one.
After those three seconds, or on a click or tap on the line ("tap to skip" is
written on touch screens, which have no hover), or on the first scroll, the
intro lifts and the chat opens with one greeting; the topics live only in the
composer. A hidden tab pauses the countdown. "Read all" in the identity bar shows
every answer at once in the record's order, with no pacing. Long cards keep their
rhythm: a recommendation shows two sentences and opens the rest on request, a
case study shows the problem, the outcome and one figure, with the approach and
the evidence behind one line. Every card leads with one figure under its title.

Once the chat is open, a sidebar stands beside it on a wide screen, the way a
coding agent lays out its session: "Read everything", every topic with a check
once it has been asked, GitHub, LinkedIn and email, and the person at the bottom
with the typing state. The long pages (projects in full, how the site is built,
accessibility) are not in the sidebar; they stay reachable by their address and
from one another's footers. On narrower screens the same sidebar is a
drawer behind the menu button in the identity bar, with a backdrop and Escape
to close. Under the text field the bar reads like a chat with a model: a plus
that holds every topic as chips above the field. The panel leads with "Read
everything", set apart as a blue-lit chip and a rule, then the topics, then
GitHub, LinkedIn and email as icon-only chips at the end of the row (named for
assistive technology and in a tooltip). The lists flow as one row, so a wide
screen fits the panel in two rows; a phone keeps two rows and scrolls them
sideways, faded at the edge. Labels stay on the topics: icons that only open on
hover would hide them from touch screens and leave visitors guessing. The panel
is open when the chat opens and stays open: asking, reading mode, the game and
Escape leave it as it is, so every topic is always one press away. Only the
button beside the field closes it, and it stays closed until that button
reopens it. Beside the plus a pill
names the model, "Sergey Bar" at "Ultra" effort (the one place the palette
bends: the word shimmers pink to purple), and the send button ends the row: a
small filled rounded square with an up arrow, the way a coding agent draws it,
dimmed while the field is empty. There is no microphone. Replies carry no
avatar, and the chat has no header beyond the menu button on a phone; the
portrait and the name stand once, in the sidebar's foot, beside the motion
control. The corner holds two round buttons in one style: "Start over", one
press and no confirmation, and the ghost, which opens the demolition run directly, without the conversation. The loading
screen shows none of this: no corner buttons and no motion control, only the
name, the role, the portrait and the loading line. GitHub, LinkedIn and email
live in the sidebar's "Profiles" list and behind the plus. The chat's first
message is personal ("Allow me to introduce myself…") and is typed out letter
by letter, once per visit, with the whole text laid out from the first frame so
nothing re-wraps; a restart, or motion off, shows it whole. Text bubbles grow
as their words arrive, a card
taller than a phone screen opens folded with a "Show the whole card" button,
and "Start over" clears the conversation with a single press.

There is no opening veil: the intro is the first thing on screen, and the
chat opens about three seconds after load. A recruiter with half a minute reads
the record, not the wait.

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
card, the composer) catches light on its top edge (`--edge`), carries a faint
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
page shows terminal output: the scan transcript, the loading line and the "/"
key hint.

## Stack

Next.js 15 App Router · TypeScript · Tailwind v4 · one shadcn/ui primitive
(`button`). `output: "export"`, `images.unoptimized`, `trailingSlash`, and
`.nojekyll` emitted into `out/`.

No animation library. Motion is one vocabulary in `globals.css`: `--ease-out`
for anything entering, `--ease-in-out` for anything moving on screen,
`--ease-spring` (a damped spring sampled into `linear()`, under 4% overshoot)
for what lands (message arrivals, the topic chips), never
ease-in on a control, interaction feedback under 300ms, and the longer
durations reserved for the page-load sequence (the name and role rise word by
word through a mask; the portrait, quote and actions follow) and for message
arrivals, which are CSS animations and run off the main thread. The portrait
itself does not move: it arrives once and settles after a few seconds, and
only the thin ring around it turns. A soft light follows a fine pointer across
the page, moved on the compositor from window-level events so it can never be
left behind; it fades when the pointer leaves the document and does not exist
on touch screens. Looping ambience (the ring, the status
pulse, the background light) stops entirely under `prefers-reduced-motion` or
the visitor's own "Pause motion" control, which persists in localStorage and
is applied before first paint. With motion off the chat still works; replies
simply appear at once.

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

The game opens three ways: the "Something fun" chip (in the panel, the sidebar
or a quick reply), which goes straight to it rather than to an answer about it;
the ghost in the corner; and the "do not press" button in the after-hours
answer. It is a `next/dynamic` chunk that is never referenced by the HTML, so
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
necessity; `python scripts/og-image.py` regenerates it on the site's theme from
the portrait and the content modules (Pillow, Windows system fonts).
`public/portrait.webp` is the LinkedIn profile photo, cropped to the face and resized to 900×900 from the 1254×1254 original, with a natural finish applied in the file (the upscaler's skin texture filtered, colour eased, fine grain); the crop lives in the file, not in CSS, so nothing is scaled up on screen. `public/favicon.svg` is the vector form of the same mark.

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
GitHub Pages serves it: every conversation to its last message, quick replies,
ordering, the already-answered path, restart, legacy anchors, typed routing,
the chip preview, greeting and fallback, the keyboard shortcuts, the three
route pages and the 404, at desktop and phone sizes, with an axe-core audit
(WCAG 2.2 A and AA) of each state. CI runs it on every push; the deploy job
downloads the HTML report and publishes it at `/qa/report/`, which the colophon
links. Traces, screenshots and video are kept on failure. `npm run verify`
ends with it.

## Case studies

`src/content/case-studies.ts` tells three pieces of work as problem, approach,
evidence and outcome. It imports the experience, metrics and project modules
and reads its figures from them rather than restating them, and throws at
build time if a referenced record is missing. The Mjolnir case renders the
recorded scan as a transcript, finding by finding, from `data/mjolnir/demo-report.json`.

## Interaction checks

The game uses a native modal dialog with keyboard cycling and focus
restoration. Hidden Back to top controls are disabled and do not intercept
pointer input. The chat announces one short status line per answer to
assistive technology rather than exposing the whole log as a live region, moves
the reading cursor to each answer as it arrives, and keeps the count-up figures
decorative with the final value exposed alongside.

See `docs/cinematic-validation.md` for the dated validation log, including the
chat redesign.

## LinkedIn recommendations

`src/content/recommendations.ts` transcribes 14 recommendations from four
user-supplied LinkedIn screenshots. Titles are the labels shown in those images.
Pavel Kagansky, Roey Alon and Omer Fefer have excerpt flags: only complete
visible sentences are included, with no reconstruction of text behind More.
The home page features three recommendations and a native disclosure for the
remaining eleven. Initials are decorative; no third-party portraits are generated.
