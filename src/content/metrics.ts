/**
 * Career metrics. Verified only, strict: every entry carries the document it
 * came from. A number without a source does not go in this file, and a number
 * that a generated source owns is interpolated from it rather than typed twice.
 */

export type Source = "linkedin";

export type Metric = {
  value: string;
  label: string;
  /** One clause. The reader should be able to check it. */
  detail: string;
  source: Source;
};

export const proofRow: readonly Metric[] = [
  {
    value: "5",
    label: "years in software QA",
    detail:
      "Since 2021, after two years of hardware quality control at HP Indigo (2015–2017).",
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
    value: "2×",
    label: "QA built from zero",
    detail:
      "First and only QA engineer twice: at Enabley, and as sole quality owner of a security-critical defense platform.",
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
];
