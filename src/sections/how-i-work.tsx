import { SectionRule } from "@/components/section-rule";
import { StepList } from "@/components/step-list";

/** A real operating sequence, which is the only reason the numerals are here. */
const operatingModel = [
  {
    title: "Start from the risk, not the test case",
    body: "Before writing anything: what fails, who it hurts, and how badly. That ordering decides which layer gets a runtime and which one gets a checklist.",
  },
  {
    title: "Decide what a green result has to mean",
    body: "A passing suite is a claim. Define up front what the gate is allowed to conclude from it, so nobody has to interpret a checkmark later.",
  },
  {
    title: "Make every layer able to go red",
    body: "A test that cannot fail and a step that cannot fail are the same defect at different scales. Both are found statically.",
  },
  {
    title: "Treat evidence as an artefact, not a log line",
    body: "A report, an artifact and the commit hash that produced them. Anything a stranger cannot check in a minute was not evidence.",
  },
  {
    title: "Put the gate where it costs the least to fail",
    body: "Fail fast and fail loudly in the cheapest place, so the expensive signal is only spent on a change that was always going to ship.",
  },
  {
    title: "Measure the thing that ships",
    body: "Escaped defects, time to resolution, flake rate, and how long a pipeline takes to tell the truth. Not test count. Test count is a vanity metric I have no patience for.",
  },
  {
    title: "Leave the system more honest than you found it",
    body: "Every claim gets a source, every capability gets a status, every unmeasured thing says it is unmeasured.",
  },
];

export function HowIWork() {
  return (
    <section
      id="how-i-work"
      aria-labelledby="how-heading"
      className="border-y border-line bg-surface"
    >
      <div className="shell rhythm">
        <SectionRule />
        <h2 id="how-heading" className="measure mt-6 t-display-l text-ink">
          How I work
        </h2>
        <p className="measure mt-5 t-body text-muted">
          Seven moves, in the order they happen. It is a sequence rather than a
          list of virtues because the order is the part that matters.
        </p>

        <div className="mt-12 grid gap-x-12 lg:grid-cols-2">
          <StepList steps={operatingModel.slice(0, 4)} />
          <StepList steps={operatingModel.slice(4)} start={5} />
        </div>
      </div>
    </section>
  );
}