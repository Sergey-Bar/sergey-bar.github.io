import { proofRow } from "@/content/metrics";
import { mjolnirReport } from "@/content/mjolnir-report";
import { projects } from "@/content/projects";
import { roles } from "@/content/experience";

/**
 * Three pieces of work told as cases: the problem, the approach, the evidence
 * behind it, and the outcome. Every sentence here restates a fact
 * already published in the experience, metrics or project modules, and the
 * figures are read from them rather than typed again, so a case cannot drift
 * from the record it summarises.
 */

export type CaseStudy = {
  slug: string;
  title: string;
  context: string;
  problem: string;
  approach: readonly string[];
  /** Where the evidence lives and what it shows. */
  evidence: { label: string; detail: string; href?: string }[];
  outcome: string;
  /** The one figure the card leads with. */
  stat: { value: string; label: string };
  /** Which artifact the card renders beneath the text, if any. */
  artifact?: "scan" | "automate";
};

const airForce = roles.find((r) => r.company.startsWith("Israeli Air Force"));
const flir = roles.find((r) => r.company === "Teledyne FLIR");
const mjolnir = projects.find((p) => p.slug === "mjolnir");
const stability = proofRow.find((m) => m.label === "stability improvement");
const releases = proofRow.find((m) => m.label === "major releases");

if (!airForce || !flir || !mjolnir || !stability || !releases) {
  throw new Error("case-studies: a referenced record is missing from the content modules");
}

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "quality-from-zero",
    title: "Quality from zero on a security-critical platform",
    context: airForce.scope,
    problem:
      "A security-critical platform with zero pre-existing QA infrastructure, one quality owner, and a release-critical calculation defect on its way to rollout.",
    approach: [
      airForce.ownership[1],
      airForce.ownership[2],
      airForce.ownership[3],
      airForce.impact[1],
    ],
    evidence: [
      {
        label: "The defect that was blocked",
        detail: airForce.impact[0],
      },
      {
        label: "The standards that remain",
        detail: airForce.impact[2],
      },
    ],
    outcome:
      "A three-tier pyramid with full backend and frontend suites, a nightly regression pass in the pipeline, and one quality point of contact for release readiness.",
    stat: { value: "0 → 3", label: "tiers of tests, built from no QA infrastructure" },
  },
  {
    slug: "memory-leak",
    title: "A memory leak root-caused on a $30M video platform",
    context: flir.scope,
    problem:
      "A critical memory leak on an enterprise video platform with thousands of installations, found while leading QA across software, firmware and hardware integration.",
    approach: [
      flir.impact[1],
      flir.ownership[1],
      flir.impact[2],
    ],
    evidence: [
      {
        label: `${stability.value} ${stability.label}`,
        detail: stability.detail,
      },
      {
        label: `${releases.value} ${releases.label}`,
        detail: releases.detail,
      },
    ],
    outcome: `${releases.value} major releases delivered with zero critical production defects, and a ${stability.value} stability improvement from one root cause found with the right instruments.`,
    stat: { value: stability.value, label: stability.label },
  },
  {
    slug: "mjolnir",
    title: "Mjolnir: proving whether a green build means anything",
    context: mjolnir.about,
    problem:
      "A test suite can be green and still prove nothing: hard sleeps, skipped tests without a reason, assertions that never run, and pipelines that cannot fail. Nothing in a normal CI run says which of these is true.",
    approach: [
      "Static analysis of test suites and CI workflows, each rule carrying a measured false-positive rate so a finding comes with its own uncertainty.",
      "A worthiness score with published bands, and an exit code the pipeline can gate on.",
      "Every scan records its scope, its rules digest and its input fingerprint, so a result can be reproduced and a partial scan says so.",
    ],
    evidence: [
      {
        label: "The recorded scan below",
        detail: "Rendered from the report the gate actually returned, finding by finding, with the rule, the file and the line.",
      },
      {
        label: "The repository",
        detail: "The rules, the measured rates and the limits are all stated there.",
        href: mjolnir.repo,
      },
    ],
    outcome: mjolnir.tagline,
    stat: { value: `${mjolnirReport.score}/100`, label: `worthiness on the recorded scan, verdict ${mjolnirReport.verdict}` },
    artifact: "scan",
  },
];
