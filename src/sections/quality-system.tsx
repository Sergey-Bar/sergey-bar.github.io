import { SectionRule } from "@/components/section-rule";
import { QAFlow } from "@/components/qa-flow";

export function QualitySystem() {
  return (
    <section
      id="quality-system"
      aria-labelledby="quality-heading"
      className="border-y border-line bg-surface"
    >
      <div className="shell rhythm">
        <SectionRule />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <h2
            id="quality-heading"
            className="measure t-display-l text-ink"
          >
            The quality system is a pipeline, not a checklist.
          </h2>
          <p className="measure t-body text-muted">
            Each stage consumes the previous stage&rsquo;s output and hands
            something checkable to the next one. A release decision at the end
            is a summary of evidence gathered at every step before it, which is
            why it can be defended in a room and audited afterwards.
          </p>
        </div>

        <div className="mt-14 lg:mt-20">
          <QAFlow />
        </div>
      </div>
    </section>
  );
}