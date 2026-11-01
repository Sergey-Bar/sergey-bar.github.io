import { mjolnir } from "@/content/mjolnir-facts";
import { npmStats } from "@/content/npm-stats";

/**
 * Projects: two projects, each explained briefly and linked to its public
 * repository. Every claim traces to that repository's README.
 */

export type Project = {
  slug: string;
  name: string;
  kind: string;
  tagline: string;
  repo: string;
  repoLabel: string;
  /** Two or three sentences. Not a case study. */
  about: string;
  facts: { label: string; value: string }[];
};

export const projects: readonly Project[] = [
  {
    slug: "mjolnir",
    name: "Mjolnir",
    kind: "Verification trust engine",
    tagline: "Your tests are lying to you. It proves it.",
    repo: "https://github.com/Sergey-Bar/Mjolnir",
    repoLabel: "github.com/Sergey-Bar/Mjolnir",
    about:
      "An open-source static scanner that reads test suites and CI workflows, weighs every finding by the evidence behind it, and scores whether the verification can be trusted. A green checkmark is not evidence, and the failure that costs the most is a pipeline that cannot go red at all.",
    // Derived from the drift-locked census, never typed here: a census refresh
    // that changes any of these changes this page or fails CI.
    facts: [
      { label: "downloads, 30 days", value: npmStats.downloadsLastMonth.toLocaleString("en-US") },
      { label: "downloads, all time", value: npmStats.downloadsAllTime.toLocaleString("en-US") },
      { label: "rules", value: String(mjolnir.rules.total) },
      {
        label: "with measured FP rate",
        value: `${mjolnir.rules.measured} of ${mjolnir.rules.total}`,
      },
      { label: "telemetry", value: mjolnir.zeroTelemetry ? "none" : "see docs" },
    ],
  },
  {
    slug: "lupin",
    name: "Lupin",
    kind: "Self-hosted QA control plane",
    tagline: "Every test. One clear answer.",
    repo: "https://github.com/Sergey-Bar/Lupin",
    repoLabel: "github.com/Sergey-Bar/Lupin",
    about:
      "The layer between test producers and the people who have to trust them. One result model for Playwright, JUnit, k6 and OWASP ZAP, with each run, retry and artifact kept together. Quality gates answer unknown or not configured instead of quietly passing, and flaky tests go into an audited quarantine: set aside, never hidden.",
    // From the Lupin README, which names each of these.
    facts: [
      { label: "inputs", value: "Playwright · JUnit · k6 · ZAP" },
      { label: "retries", value: "recorded as flaky" },
      { label: "install", value: "Docker only" },
      { label: "licence", value: "MIT" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
