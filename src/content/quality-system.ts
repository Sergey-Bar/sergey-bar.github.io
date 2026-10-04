/**
 * The quality lifecycle, as it actually runs. A real ordered sequence, which is
 * the only reason the stage order — and the rail that connects it — means
 * anything.
 */

export type Stage = {
  id: string;
  title: string;
  /** The micro-status is text, not colour — plan §6.2. */
  status: string;
};

export const stages: readonly Stage[] = [
  { id: "requirement", title: "Requirement", status: "acceptance criteria written" },
  { id: "risk", title: "Risk model", status: "what fails, and how badly" },
  { id: "strategy", title: "Test strategy", status: "levels chosen per risk" },
  {
    id: "layers",
    title: "API, integration, end to end",
    status: "each layer earns its runtime",
  },
  { id: "execution", title: "CI execution", status: "exit codes propagate" },
  { id: "gates", title: "Quality gates", status: "thresholds block, not warn" },
  { id: "evidence", title: "Evidence", status: "a run report, not a tick" },
  { id: "release", title: "Release decision", status: "signed by QA, recorded" },
];
