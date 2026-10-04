import { SectionRule } from "@/components/section-rule";
import { proofRow } from "@/content/metrics";

/**
 * Five verified cells and nothing else. No entrance animation — sections simply
 * exist when you reach them (plan §6.0).
 *
 * The band is inset from the page gutter and the cells are separated by
 * hairlines, so a five-digit figure never sits against the edge of the viewport.
 */
export function ProofRow() {
  return (
    <section aria-labelledby="proof-heading" className="border-y border-line">
      <div className="shell py-12 lg:py-14">
        <h2 id="proof-heading" className="sr-only">
          Verified outcomes
        </h2>
        <SectionRule />
        <dl className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-10">
          {proofRow.map((metric, i) => (
            <div
              key={metric.label}
              className={
                i < proofRow.length - 1
                  ? "lg:border-r lg:border-line lg:pr-8"
                  : undefined
              }
            >
              <dt className="sr-only">{metric.label}</dt>
              <dd className="flex flex-col">
                <span className="t-display-l font-semibold tracking-[-0.03em] text-ink tabular-nums">
                  {metric.value}
                </span>
                <span className="mt-2 t-small font-medium text-ink">
                  {metric.label}
                </span>
                <span className="mt-2.5 max-w-[32ch] t-small text-muted">
                  {metric.detail}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}