import { SectionRule } from "@/components/section-rule";
import { StepList } from "@/components/step-list";

const argument = [
  "A pipeline that runs the tests and swallows the exit code reports success while every test fails. Nothing in the suite is broken. The pipeline cannot fail, so the checkmark is not evidence of anything.",
  "A committed .only runs one test out of four hundred. The run is green. The other three hundred and ninety-nine did not happen.",
  "An assertion that checks the wrong value is green. Coverage tools count it as coverage. The number goes up and the risk stays exactly where it was.",
];

const sequence = [
  {
    title: "Understand",
    body: "Before anything runs, know what would hurt and why. Risk decides which layer gets the runtime, and a requirement that cannot fail cannot be tested.",
  },
  {
    title: "Verify",
    body: "Build the layers that can actually fail — API, integration, end to end — and make every one of them able to go red on its own.",
  },
  {
    title: "Prove",
    body: "Leave evidence a stranger can check: a run report, the artifact, the exit code, and the hash that ties them to the commit that produced them.",
  },
];

export function Philosophy() {
  return (
    <section aria-labelledby="philosophy-heading" className="rhythm">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <SectionRule />
          <h2
            id="philosophy-heading"
            className="measure mt-6 t-display-l text-ink"
          >
            Quality is not &ldquo;tests passing.&rdquo;
          </h2>
          <p className="measure mt-6 t-body text-ink">
            A suite that cannot fail is not a safety net. It is a decoration
            that costs CI minutes and buys a false green — the most expensive
            result in engineering, because it converts an unknown into a
            certainty, and everything downstream trusts it.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {argument.map((item) => (
              <li key={item} className="border-l-2 border-line-strong pl-4 t-small text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <StepList steps={sequence} />
        </div>
      </div>
    </section>
  );
}