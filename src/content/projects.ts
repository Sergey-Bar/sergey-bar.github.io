import { mjolnir } from "@/content/mjolnir-facts";
import { npmStats } from "@/content/npm-stats";

/**
 * Projects — plan updated: two projects, each explained briefly and linked to
 * its public repository. Every claim traces to that repository's README.
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
      "An open-source static scanner that reads test suites and CI workflows, weighs every finding by the evidence behind it, and scores whether the verification can be trusted. It exists because a green checkmark is not evidence — the failure that costs the most is a pipeline that cannot go red at all.",
    // Derived from the drift-locked census, never typed here: a census refresh
    // that changes any of these changes this page or fails CI.
    facts: [
      { label: "downloads, 30 days", value: npmStats.downloadsLastMonth.toLocaleString("en-US") },
      { label: "downloads, all time", value: npmStats.downloadsAllTime.toLocaleString("en-US") },
      { label: "rules", value: String(mjolnir.rules.total) },
      {
        label: "measured FP",
        value: `${mjolnir.rules.measured} of ${mjolnir.rules.total}`,
      },
      { label: "telemetry", value: mjolnir.zeroTelemetry ? "none" : "see docs" },
    ],
  },
  {
    slug: "automate",
    name: "Automate",
    kind: "Local-first QA control plane",
    tagline: "A run is a chain, not a green tick.",
    repo: "https://github.com/Sergey-Bar/AutoMate",
    repoLabel: "github.com/Sergey-Bar/AutoMate",
    about:
      "The layer between test producers and the people who have to trust them. One canonical result model for Playwright, JUnit and legacy reporters, persisted run evidence, live run updates and quality-gate policies — with a capability register that marks most of its own rows explicitly not real, so a summary table cannot round itself up.",
    // From the Automate README's own summary table, which names each of these.
    facts: [
      { label: "register", value: "42 rows" },
      { label: "marked not real", value: "26" },
      { label: "Node", value: "24.21" },
      { label: "pnpm", value: "10.30.2" },
      { label: "licence", value: "MIT" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
