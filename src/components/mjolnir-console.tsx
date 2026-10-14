import { mjolnirReport } from "@/content/mjolnir-report";

/**
 * The Mjolnir evidence console: one real scan, unmodified. The score, the
 * verdict, the findings and the exit code the gate actually returned, and
 * nothing else. Light surface, like every other band on the site, because the
 * evidence carries the weight here, not the panel.
 */
export function MjolnirConsole() {
  return (
    <div className="evidence-panel mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="t-title text-ink">Inside a recorded scan</h3>
        <span className="data text-muted">
          scan {mjolnirReport.scanIdShort} · engine {mjolnirReport.engineVersion}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
        <div>
          <dt className="data text-muted">worthiness</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-ink tabular-nums">
            {mjolnirReport.score}
            <span className="text-muted">/100</span>
          </dd>
        </div>
        <div>
          <dt className="data text-muted">verdict</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-success-ink tabular-nums">
            {mjolnirReport.verdict}
          </dd>
        </div>
        <div>
          <dt className="data text-muted">findings</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-ink tabular-nums">
            {mjolnirReport.findingsRemaining}
          </dd>
        </div>
        <div>
          <dt className="data text-muted">gate exit</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-ink tabular-nums">
            {mjolnirReport.exitCode}
          </dd>
        </div>
      </dl>
    </div>
  );
}
