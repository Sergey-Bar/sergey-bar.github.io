import report from "../../data/mjolnir/demo-report.json";
import { mjolnirReport } from "@/content/mjolnir-report";

type Finding = {
  severity: string;
  confidence: string;
  file: string;
  line: number;
  message: string;
  ruleId?: string;
};

/**
 * The recorded scan as a transcript: every finding the gate returned, with
 * its rule, file and line, rendered from the same report the console above
 * it summarises. Nothing is simulated; the JSON is the source of both. The
 * order is the report's own, so an error that a green build would have hidden
 * reads first.
 */
export function ScanTranscript() {
  const findings = (report.findings as Finding[]).map((f) => ({
    ...f,
    ruleId: f.ruleId ?? "",
  }));
  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <figure className="transcript" aria-label="Recorded Mjolnir scan transcript">
      <figcaption className="transcript-head">
        <span className="transcript-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="data">
          mjolnir scan · {mjolnirReport.scanIdShort} · engine {mjolnirReport.engineVersion}
        </span>
      </figcaption>
      {/* A scrolling region must be reachable by keyboard; the label says what scrolls. */}
      <pre className="transcript-body" tabIndex={0} role="region" aria-label="Scan output">
        <code>
          <span className="t-muted">$ </span>
          <span className="t-ink">npx mjolnir-qa scan .</span>
          {"\n"}
          <span className="t-muted">frameworks  </span>
          {report.frameworks.join(", ")}
          {"\n"}
          <span className="t-muted">scope       </span>
          {report.scopeIntegrity.analyzed} of {report.scopeIntegrity.discovered} analyzed ·{" "}
          {report.scopeIntegrity.unrecognized} unrecognized ·{" "}
          <span className="t-warn">{report.scopeIntegrity.scopeVerdict}</span>
          {"\n\n"}
          {findings.map((f, i) => (
            <span key={`${f.ruleId}-${f.file}-${f.line}-${i}`} className="t-line">
              <span className={`t-sev t-sev-${f.severity}`}>{f.severity.padEnd(7)}</span>
              <span className="t-rule">{f.ruleId.padEnd(11)}</span>
              <span className="t-loc">
                {f.file}:{f.line}
              </span>
              {"\n"}
              <span className="t-msg">{"         "}{f.message}</span>
              {"\n"}
            </span>
          ))}
          {"\n"}
          <span className="t-muted">findings    </span>
          {findings.length} · {counts.error ?? 0} error · {counts.warning ?? 0} warning ·{" "}
          {counts.info ?? 0} info
          {"\n"}
          <span className="t-muted">worthiness  </span>
          <span className="t-ink">{report.score}/100</span> ·{" "}
          <span className="t-ok">{mjolnirReport.verdict}</span>
          {"\n"}
          <span className="t-muted">exit        </span>
          <span className="t-ink">{mjolnirReport.exitCode}</span>
          <span className="t-muted"> (inconclusive: partial scan; the CI step fails)</span>
        </code>
      </pre>
    </figure>
  );
}
