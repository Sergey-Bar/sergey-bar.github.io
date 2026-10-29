# Cinematic portfolio: validation notes

Validated locally on 2026-10-14 against the static production export.

## Fixed defects

- The scroll spy selected Projects in the untracked proof band and selected Profile while still in the hero. Reproduced with two failing checks against the previous selection logic. Selection now follows the last section whose start crossed the reading line; five tests exercise the extracted production function.
- Hidden Back to top remained pointer-active. Browser inspection showed aria-hidden=true with pointer-events=auto. It is now disabled and has pointer-events=none while hidden.
- Profile panel style changes lost to Tailwind utilities in a later cascade layer. Computed background and radius now match the intended transparent, flat panel.
- The game allowed keyboard focus outside the overlay and lost trigger focus on close. It now uses a native modal dialog, explicit Tab cycling, scroll restoration, and trigger focus restoration. Browser checks confirmed Shift+Tab remains inside and Escape restores focus.
- Pausing motion originally left smooth scrolling on the root. The root now switches to auto; Back to top was verified to reach scrollY=0 immediately.
- Corrected the cinematic logo treatment so raster logos retain internal contrast rather than becoming solid silhouettes.

## Validation

- Production build completed, including Next.js lint and TypeScript checks.
- node --test scripts/qa/navigation.test.mjs: 5 passed.
- Generated content check and git diff --check passed.
- Budget: home JS including inline data 125.2 KB gzip (150 KB limit); CSS 12.0 KB (20 KB limit); fonts 132.6 KB (140 KB limit).
- Browser checks: 320px and 390px mobile layouts, 768px projects route, 1440px desktop; no document horizontal overflow in inspected views.
- Mobile menu opening, Escape dismissal and focus return; toolbox Python search, empty search and clear; game interaction and keyboard dismissal; portrait hover overlay and continuous motion.
- Desktop image check: no broken images.

## Limits

This is a local change, not a public deployment. No physical-device or Safari/Firefox run, Lighthouse performance run, or OS-level reduced-motion emulation was performed. CSS guards for reduced motion are present; the explicit motion toggle was exercised. The existing career/project claims were retained rather than independently fact-checked. The optional canvas game remains a user-triggered animated experience; its reduced-effects mode follows the preference present when opened.

## Editorial and UX refinement (2026-10-14)

- Natural portrait color; direct LinkedIn action in the hero and closing section.
- Evidence and projects precede the profile and experience; the header follows that sequence.
- All body text is fully opaque in motion mode. The statement remains in normal document flow.
- Experience responsibilities/outcomes use native keyboard-operable details elements.
- Toolbox initially presents six groups; expansion shows eighteen; search includes all groups and Clear returns focus to the input.
- Projects retain one shared neutral background. A recorded scan is presented as evidence; Automate has an explicitly labeled architecture overview, not a simulated product screenshot.
- The interactive red-button game is visible after the primary contact action.
- Fixed doubled anchor offset (scroll-padding plus scroll-margin); inspected Projects landing at ~88px below the viewport top.
- Rebuilt production export with lint/type checks; 5 navigation tests, generated content and budget checks passed. Home JS plus inline data: 125.0 KB gzip; CSS: 12.4 KB.
- Checked 320px and 1440px layouts, keyboard expansion, search expansion/collapse, focus restoration, and contact destinations without submitting external actions. No horizontal overflow in inspected views.

The limitations above still apply. This is not certification by Apple or Netflix, and no unperformed usability/accessibility/device tests are implied.

## Chat redesign (2026-10-29)

The home page became a conversation in the style of a chat-portfolio template:
an intro screen with the composer fixed below it, seven server-rendered answer
flows revealed on request, a keyword router for typed questions, and a blue,
white and black palette after the LinkedIn profile. The projects route kept its
long form on the same theme.

Validated locally against the static production export, served from `out/`:

- Typecheck, lint and the static export completed; `npm run budget` passed with
  home JS 136.0KB gzip of the 150KB budget, CSS 13.1KB of 20KB, fonts unchanged
  at 132.6KB.
- Lighthouse 12, desktop preset, headless Chrome: home and projects both score
  1.00 for performance, accessibility, best practices and SEO. Home LCP 0.6s,
  CLS 0.001, TBT 0ms; projects LCP 0.5s, CLS 0.
- Browser checks at 1440×900 and 375×812: intro load sequence, both intro
  actions, every composer chip, quick replies inside a flow, a typed question
  routed to Experience, a greeting, an unknown question and its fallback,
  "Start over", `/#experience` opening the experience conversation on arrival,
  the mobile chip row scrolling, no horizontal overflow, no console errors.
- The router was exercised directly with eleven sample questions, including
  "where did you work before?" (Experience), "show me your work" (Projects)
  and "what is the meaning of life" (unknown).
- The pause-motion control was exercised: with motion off every answer is
  shown at once with no typing indicator, and the choice survives a reload.

Not performed: physical devices, Safari and Firefox, OS-level reduced-motion
emulation, and screen-reader runs. The live-region announcements and the
`interpolate-size` disclosure transitions were reasoned from the specification
rather than observed with assistive technology.

## Polish pass (2026-10-29, later)

Added the opening veil, the merged profile pill (chat corner and projects
header), streamed replies, the router preview on the chips, the "/" shortcut,
composer autofocus after the opening, "typing…" in the identity bar, a
dark-theme favicon and icon set, and the full-resolution portrait cropped in
the file. Fixed: the portrait tilt sticking when a leave event was swallowed
(pointer now tracked at window level), a hash link to an answer already on
screen producing a second "that one is above" reply, and the chat switching
state asynchronously so the first scroll measured a hidden log (state changes
now flush synchronously before measuring).

Validated locally against the static export: verify passes (home JS 137.5KB
of 150KB, CSS 13.8KB of 20KB); the veil plays to its own 2.1s lift and ends
early on a key; typed "tell me about your projects" lights the Projects chip
and streams the reply; the tilt reports -6.5° off-centre and 0° once the
pointer leaves the stage.
