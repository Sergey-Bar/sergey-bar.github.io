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
