/**
 * Career metrics. Verified only, strict: every entry carries the document it
 * came from. A number without a source does not go in this file, and a number
 * that a generated source owns is interpolated from it rather than typed twice.
 */

import { npmStats } from "@/content/npm-stats";

export type Source = "linkedin" | "npm-registry" | "mjolnir-readme";

export type Metric = {
  value: string;
  label: string;
  /** One clause. The reader should be able to check it. */
  detail: string;
  source: Source;
};

const formatted = new Intl.NumberFormat("en-US");

export const proofRow: readonly Metric[] = [
  {
    value: "5+",
    label: "years in QA",
    detail:
      "Since 2021. HP Indigo 2015-2017 was QC analysis on industrial print, not software QA.",
    source: "linkedin",
  },
  {
    value: "4",
    label: "major releases",
    detail:
      "Delivered on United VMS at Teledyne FLIR with zero critical production defects.",
    source: "linkedin",
  },
  {
    value: "40%",
    label: "stability improvement",
    detail:
      "A critical memory leak root-caused with dotMemory and dotTrace on the FLIR platform.",
    source: "linkedin",
  },
  {
    value: "20%",
    label: "faster issue resolution",
    detail:
      "Optimised bug-reporting pipelines plus cross-team triage at FLIR.",
    source: "linkedin",
  },
  {
    value: formatted.format(npmStats.downloadsLastMonth),
    label: "npm downloads in 30 days",
    detail: `I wrote Mjolnir, the verification trust engine — it scores whether a test suite can be trusted at all. It has been installed ${formatted.format(
      npmStats.downloadsLastMonth,
    )} times in the last 30 days and ${formatted.format(
      npmStats.downloadsAllTime,
    )} times in total.${
      npmStats.stale
        ? " This is the last reading the build could confirm, because the npm registry was unreachable."
        : ""
    }`,
    source: "npm-registry",
  },
];