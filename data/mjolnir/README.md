# Where the Mjölnir numbers on this site come from

The site states numbers about Mjölnir: 79 rules, 73 with a measured
false-positive rate, and the output of one real scan. None of them are typed
into a component. They are generated.

## Inputs (vendored, committed)

| File | What it is | Where it came from |
|---|---|---|
| `demo-report.json` | The canonical machine-readable result of a real Mjölnir scan of the demo repository | `Sergey-Bar/Mjolnir` → `assets/readme/demo-report.json`, copied verbatim |
| `census.json` | Rule counts, tiers, evidence levels, exit codes, package metadata | `Sergey-Bar/Mjolnir` → `README.md` census markers, copied verbatim, with the line numbers recorded in `_provenance` |

Each input is a snapshot, not a live link, so a build never depends on another
repository being reachable. The SHA-256 of both is written into the header of
every generated file.

## Outputs (generated, committed)

| File | Derived from |
|---|---|
| `src/content/mjolnir-report.ts` | `demo-report.json` |
| `src/content/mjolnir-facts.ts` | `census.json` |

```bash
npm run content:sync    # rewrite them
npm run content:check   # fail if the committed files differ
```

`content:check` runs first in CI, before types, before lint, before build. A
number on this site cannot drift from the scan that produced it without the
build going red.

## Two derivations worth knowing about

**The verdict is derived, not stored.** `WORTHY` is computed from `score` using
the published bands (`0–49 UNWORTHY`, `50–79 NEEDS WORK`, `80–99 WORTHY`,
`100 FORGED`, `null UNKNOWN`). The report file contains only the score.

**The exit code is derived, not stored.** The report file has no exit code —
exit codes belong to a gate run, not to a report. The generator reproduces
Mjölnir's own precedence from `src/claim-evidence.ts`: a scan whose
`scopeIntegrity.scopeVerdict` is `PARTIAL` is `INCONCLUSIVE` at every gate
level, so it returns `2`, not `1`, and never `0`. A scan that did not finish has
not found nothing.

The demo report is worth reading once: it scores 80/100 `WORTHY` and still
returns `2`, because two files in scope were unrecognized. That is the product's
own thesis, so the site shows it rather than hiding it.

## Refreshing

1. In a local `Mjolnir` checkout, run `npm run docs:readme-brand` so the README
   census markers are current.
2. Copy `assets/readme/demo-report.json` over `data/mjolnir/demo-report.json`.
3. Update the census values and `_provenance` in `data/mjolnir/census.json` from
   the markers between `<!-- census:KEY -->` and `<!-- /census:KEY -->`.
4. `npm run content:sync`, then read the diff before committing it. The diff is
   the record of what the product actually changed.
