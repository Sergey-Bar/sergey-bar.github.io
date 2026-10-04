#!/usr/bin/env node
/**
 * Mjölnir report and census → typed content modules.
 *
 * The site must never be able to state a number the real scan did not produce.
 * Both output files are generated, committed, and re-derived on every CI run;
 * `--check` fails the build when a committed file has drifted from its source.
 *
 * Every value the site renders is either copied from an input or derived here by
 * a rule that fails loudly when the input does not match what the rule expects.
 * A silent fallback would put a wrong number on the site *and* bless it in the
 * lock, which is the exact failure this project exists to catch.
 *
 *   node scripts/generate-mjolnir.mjs           # write
 *   node scripts/generate-mjolnir.mjs --check   # fail on drift, write nothing
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data", "mjolnir");

const report = JSON.parse(readFileSync(join(dataDir, "demo-report.json"), "utf8"));
const census = JSON.parse(readFileSync(join(dataDir, "census.json"), "utf8"));

const check = process.argv.includes("--check");
const failures = [];

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16);
}

function banner(source) {
  return `// GENERATED FILE — do not edit.
// Source: ${source} (sha256 ${sha(join(dataDir, source))})
// Regenerate: npm run content:sync    Verify: npm run content:check`;
}

const reportBanner = banner("demo-report.json");
const factsBanner = banner("census.json");

/** Worthiness bands are data, not code: they live in census.json. */
function verdictFor(score, bands) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    throw new Error(
      `demo-report.json: score must be a finite number, got ${JSON.stringify(score)}`,
    );
  }
  for (const band of bands) {
    const [lo, hi] = String(band.range).split("-").map(Number);
    // The `null` band has no numeric lower bound; a null score never gets here.
    if (Number.isNaN(lo)) continue;
    if (score >= lo && (Number.isNaN(hi) || score <= hi)) return band.verdict;
  }
  throw new Error(`no worthiness band matches score ${score}`);
}

/**
 * Exit code precedence is Mjölnir's, not ours. A partial scan is inconclusive
 * at every gate level — `src/claim-evidence.ts` in the Mjolnir repository is
 * explicit that partial rows never fall through to the findings code, because
 * "a scan that did not finish has not found nothing".
 *
 * The verdict is normalised and then checked against the known set: an
 * unrecognised spelling must fail the build, not quietly produce exit 1 for a
 * scan that is actually partial.
 */
function exitCodeFor(scope, errorCount) {
  const verdict = String(scope?.scopeVerdict ?? "")
    .trim()
    .toUpperCase();
  if (verdict !== "PARTIAL" && verdict !== "COMPLETE") {
    throw new Error(
      `demo-report.json: unknown scopeVerdict ${JSON.stringify(scope?.scopeVerdict)}`,
    );
  }
  return verdict === "PARTIAL" ? 2 : errorCount > 0 ? 1 : 0;
}

function count(entries, key) {
  const totals = {};
  for (const entry of entries) totals[entry[key]] = (totals[entry[key]] ?? 0) + 1;
  return totals;
}

if (!Array.isArray(report.findings)) {
  throw new Error("demo-report.json: findings must be an array");
}
if (!Array.isArray(report.correlationConclusions)) {
  throw new Error("demo-report.json: correlationConclusions must be an array");
}

const bySeverity = count(report.findings, "severity");
const byImpact = {};
for (const finding of report.findings) {
  if (finding.qaImpact) byImpact[finding.qaImpact] = (byImpact[finding.qaImpact] ?? 0) + 1;
}

const scope = report.scopeIntegrity;
const errorFindings = report.findings
  .filter((f) => f.severity === "error")
  .map((f) => ({
    ruleId: f.ruleId,
    file: f.file,
    line: f.line,
    message: f.message,
    evidenceLevel: f.evidenceLevel,
    measuredFpRate: f.measuredFpRate,
    measuredFpN: f.measuredFpN,
    qaImpact: f.qaImpact ?? null,
  }));

/** A shared root cause outranks a shared file. That is the product's thesis. */
const correlationRank = { CONVERGENT: 0, CORROBORATED: 1, AMPLIFIED: 2 };

const strongestCorrelation = report.correlationConclusions
  .filter((c) => c.certainty === "STRONG")
  .sort(
    (a, b) =>
      correlationRank[a.conclusionType] - correlationRank[b.conclusionType] ||
      b.sourceCount - a.sourceCount,
  )[0];

const reportModule = `${reportBanner}

export type ReportDimension = {
  category: string;
  score: number;
  errors: number;
  warnings: number;
  infos: number;
};

export type ReportFinding = {
  ruleId: string;
  file: string;
  line: number;
  message: string;
  evidenceLevel: string;
  /** Measured false-positive rate for the rule that fired. 0 means none observed. */
  measuredFpRate: number;
  measuredFpN: number;
  qaImpact: string | null;
};

export const mjolnirReport = ${JSON.stringify(
  {
    scanId: report.runIdentity.scanId,
    scanIdShort: report.runIdentity.scanId.slice(0, 12),
    inputFingerprint: report.runIdentity.inputFingerprint.slice(0, 12),
    rulesDigest: report.runIdentity.rulesDigest.slice(0, 12),
    engineVersion: report.runIdentity.engineVersion,
    frameworks: report.frameworks,
    score: report.score,
    verdict: verdictFor(report.score, census.worthiness),
    headline:
      "Held in worthy hands — the scan still names what a green build would have hidden.",
    findingsRemaining: report.findings.length,
    bySeverity,
    byImpact,
    dimensions: report.dimensions,
    fixThisFirst: errorFindings,
    correlation: strongestCorrelation
      ? {
          type: strongestCorrelation.conclusionType,
          certainty: strongestCorrelation.certainty,
          corroboration: strongestCorrelation.corroboration,
          sourceCount: strongestCorrelation.sourceCount,
        }
      : null,
    scope: {
      discovered: scope.discovered,
      analyzed: scope.analyzed,
      unrecognized: scope.unrecognized,
      ignored: scope.ignored,
      parseFailed: scope.parseFailed,
      truncated: scope.truncated,
      verdict: String(scope.scopeVerdict).toUpperCase(),
      reasons: scope.reasons ?? [],
    },
    exitCode: exitCodeFor(scope, bySeverity.error),
    testFiles: report.testFileCount,
    testDeclarations: report.testDeclarationCount,
    rawDeductions: report.rawDeductions,
    trust: {
      level: report.trustSummary.level,
      confidence: report.trustSummary.confidence,
      evidenceCoverage: report.trustSummary.evidenceCoverage,
      measuredFpOfFiredRules: report.trustSummary.measuredFpOfFiredRules,
    },
    forensics: report.forensicVerdicts.byVerdict,
    analysis: {
      discovery: report.analysisStatus.discovery,
      rules: report.analysisStatus.rules,
      rulesCrashed: report.analysisStatus.rulesCrashed,
      skippedFiles: report.analysisStatus.skippedFiles,
    },
  },
  null,
  2,
)} as const;

export type MjolnirReport = typeof mjolnirReport;
`;

const factsModule = `${factsBanner}

export const mjolnir = ${JSON.stringify(
  {
    package: census.package,
    rules: {
      total: census.totalRules,
      measured: census.measuredOfTotal,
      unmeasured: census.unmeasured,
      core: census.coreRules,
      families: census.families,
      languages: census.languages,
      frameworks: census.frameworks,
    },
    tiers: census.tiers,
    evidenceLevels: census.evidenceLevels,
    trustLevels: census.trustLevels,
    trustNote: census.trustNote,
    worthiness: census.worthiness,
    exitCodes: census.exitCodes,
    trustCertification: census.trustCertification,
    zeroTelemetry: true,
  },
  null,
  2,
)} as const;

export type Mjolnir = typeof mjolnir;
`;

const outputs = [
  ["src/content/mjolnir-report.ts", reportModule],
  ["src/content/mjolnir-facts.ts", factsModule],
];

for (const [rel, next] of outputs) {
  const path = join(root, rel);
  const current = (() => {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return null;
    }
  })();

  if (current === next) {
    console.log(`ok    ${rel}`);
    continue;
  }

  if (check) {
    failures.push(rel);
    console.error(`DRIFT ${rel}`);
  } else {
    writeFileSync(path, next, "utf8");
    console.log(`write ${rel}`);
  }
}

if (failures.length) {
  console.error(
    `\n${failures.length} generated file(s) drifted from data/mjolnir/.\n` +
      `Run \`npm run content:sync\` and commit the result.`,
  );
  process.exit(1);
}
