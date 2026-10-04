import { mjolnirReport } from "@/content/mjolnir-report";
import { mjolnir } from "@/content/mjolnir-facts";

/**
 * The Mjölnir evidence console. It lives only on the project page: this is
 * product output, not a personal site, so it does not belong on the front page.
 */
export function MjolnirConsole() {
  // The count is never typed here: it is the correlation the engine reported,
  // falling back to the list actually rendered just above.
  const sharedCount =
    mjolnirReport.correlation?.sourceCount ?? mjolnirReport.fixThisFirst.length;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="t-title text-dark-text">
          One real scan, unmodified
        </h3>
        <span className="data text-dark-muted">
          scan {mjolnirReport.scanIdShort} · engine {mjolnirReport.engineVersion}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
        <div>
          <dt className="data text-dark-muted">worthiness</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-dark-text tabular-nums">
            {mjolnirReport.score}
            <span className="text-dark-muted">/100</span>
          </dd>
        </div>
        <div>
          <dt className="data text-dark-muted">verdict</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-lime">
            {mjolnirReport.verdict}
          </dd>
        </div>
        <div>
          <dt className="data text-dark-muted">findings</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-dark-text tabular-nums">
            {mjolnirReport.findingsRemaining}
          </dd>
        </div>
        <div>
          <dt className="data text-dark-muted">gate exit</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-dark-text tabular-nums">
            {mjolnirReport.exitCode}
          </dd>
        </div>
      </dl>

      <div className="mt-8 border border-dark-line bg-dark-panel p-5 lg:p-6">
        <p className="data text-lime">
          fix this first — {mjolnirReport.bySeverity.error} error findings
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {mjolnirReport.fixThisFirst.map((finding, i) => (
            <li key={`${finding.ruleId}-${i}`} className="border-l-2 border-critical/60 pl-3">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="data font-medium text-critical-ink">
                  {finding.ruleId}
                </span>
                <span className="data text-dark-muted">
                  {finding.file}:{finding.line} · {finding.qaImpact} ·{" "}
                  {finding.evidenceLevel}
                </span>
              </p>
              <p className="measure mt-1.5 t-small text-dark-text">
                {finding.message}
              </p>
            </li>
          ))}
        </ul>

        <p className="measure mt-6 border-t border-dark-line pt-5 t-small text-dark-muted">
          One root cause, {sharedCount} findings: the test command&rsquo;s exit
          code never reaches the step. {mjolnir.rules.measured} of{" "}
          {mjolnir.rules.total} rules carry a measured false-positive rate, so a
          reader can tell how often the engine has been wrong before. The gate
          returned {mjolnirReport.exitCode} rather than a pass because the scope
          is {mjolnirReport.scope.verdict} — {mjolnirReport.scope.unrecognized}{" "}
          files were unrecognized. A scan that did not finish has not found
          nothing.
        </p>
      </div>
    </div>
  );
}
