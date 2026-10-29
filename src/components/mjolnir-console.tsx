import type { CSSProperties } from "react";

import { CountUp } from "@/components/count-up";
import { mjolnir } from "@/content/mjolnir-facts";
import { mjolnirReport } from "@/content/mjolnir-report";

/**
 * The lower bound of the WORTHY band, read from the drift-locked census rather
 * than typed here, so a change to the bands moves the tick on the meter.
 */
function worthyThreshold(): number | null {
  const band = mjolnir.worthiness.find((b) => b.verdict === "WORTHY");
  if (!band) return null;
  const lower = Number(String(band.range).split("-")[0]);
  return Number.isFinite(lower) ? lower : null;
}

/**
 * The Mjolnir evidence console: one real scan, unmodified. The score, the
 * verdict, the findings and the exit code the gate actually returned, and
 * nothing else. Light surface, like every other band on the site, because the
 * evidence carries the weight here, not the panel.
 *
 * The score is the one figure that is a position on a scale, so it is also
 * drawn as one: the meter fills to the recorded value when the panel arrives,
 * with a tick at the point the verdict turns WORTHY. The figures count up on
 * arrival too; the server render holds the final values, so nothing here
 * depends on JavaScript to be true.
 */
export function MjolnirConsole() {
  const score = Number(mjolnirReport.score);
  const threshold = worthyThreshold();

  return (
    <div className="evidence-panel mt-10" data-reveal="meter">
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
            <CountUp value={String(mjolnirReport.score)} />
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
            <CountUp value={String(mjolnirReport.findingsRemaining)} />
          </dd>
        </div>
        <div>
          <dt className="data text-muted">gate exit</dt>
          <dd className="mt-1 font-mono t-title font-semibold text-ink tabular-nums">
            {mjolnirReport.exitCode}
          </dd>
        </div>
      </dl>

      <div
        className="meter"
        role="img"
        aria-label={
          threshold === null
            ? `Worthiness ${score} of 100`
            : `Worthiness ${score} of 100; WORTHY from ${threshold}`
        }
        style={{ "--score": score / 100 } as CSSProperties}
      >
        <span className="meter-fill" />
        {threshold === null ? null : (
          <span className="meter-tick" style={{ left: `${threshold}%` }} />
        )}
      </div>
      <div className="meter-scale data text-muted" aria-hidden="true">
        <span>0</span>
        {threshold === null ? null : <span>WORTHY from {threshold}</span>}
        <span>100</span>
      </div>
    </div>
  );
}
