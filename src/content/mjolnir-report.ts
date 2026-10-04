// GENERATED FILE — do not edit.
// Source: demo-report.json (sha256 64d8b9072675378a)
// Regenerate: npm run content:sync    Verify: npm run content:check

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

export const mjolnirReport = {
  "scanId": "5c84d9acfe120338549a2c08d79a022f49b856a1b57cf589f5a43f96311136bb",
  "scanIdShort": "5c84d9acfe12",
  "inputFingerprint": "36b59bf50fd2",
  "rulesDigest": "be8f71ffd3fa",
  "engineVersion": "2.0.0",
  "frameworks": [
    "playwright"
  ],
  "score": 80,
  "verdict": "WORTHY",
  "headline": "Held in worthy hands — the scan still names what a green build would have hidden.",
  "findingsRemaining": 18,
  "bySeverity": {
    "error": 3,
    "info": 12,
    "warning": 3
  },
  "byImpact": {
    "FALSE-GREEN": 10,
    "HYGIENE": 7,
    "FLAKY-RISK": 1
  },
  "dimensions": [
    {
      "category": "QA-CI",
      "score": 76,
      "errors": 3,
      "warnings": 0,
      "infos": 2
    },
    {
      "category": "QA-PW",
      "score": 95,
      "errors": 0,
      "warnings": 2,
      "infos": 7
    },
    {
      "category": "QA-TEST",
      "score": 97,
      "errors": 0,
      "warnings": 1,
      "infos": 3
    }
  ],
  "fixThisFirst": [
    {
      "ruleId": "QA-CI-009",
      "file": ".github/workflows/ci.yml",
      "line": 10,
      "message": "Job `test` pipes the test command into another tool without `set -o pipefail`.",
      "evidenceLevel": "E2",
      "measuredFpRate": 0,
      "measuredFpN": 10,
      "qaImpact": "FALSE-GREEN"
    },
    {
      "ruleId": "QA-CI-009",
      "file": ".github/workflows/ci.yml",
      "line": 10,
      "message": "Job `deploy-smoke` sequences commands with `; ` after the test command — the test result does not fail the step.",
      "evidenceLevel": "E2",
      "measuredFpRate": 0,
      "measuredFpN": 10,
      "qaImpact": "FALSE-GREEN"
    },
    {
      "ruleId": "QA-CI-009",
      "file": ".github/workflows/ci.yml",
      "line": 26,
      "message": "Job `deploy-smoke` pipes the test command into another tool without `set -o pipefail`.",
      "evidenceLevel": "E2",
      "measuredFpRate": 0,
      "measuredFpN": 10,
      "qaImpact": "FALSE-GREEN"
    }
  ],
  "correlation": {
    "type": "CONVERGENT",
    "certainty": "STRONG",
    "corroboration": "3 findings share root cause QA-CI-009",
    "sourceCount": 3
  },
  "scope": {
    "discovered": 5,
    "analyzed": 5,
    "unrecognized": 2,
    "ignored": 0,
    "parseFailed": 0,
    "truncated": 0,
    "verdict": "PARTIAL",
    "reasons": [
      "unrecognized:2"
    ]
  },
  "exitCode": 2,
  "testFiles": 4,
  "testDeclarations": 7,
  "rawDeductions": 32,
  "trust": {
    "level": "L3",
    "confidence": 0.32,
    "evidenceCoverage": 0.29,
    "measuredFpOfFiredRules": 0.046
  },
  "forensics": {
    "flaky": 1,
    "inconclusive": 2
  },
  "analysis": {
    "discovery": "complete",
    "rules": "complete",
    "rulesCrashed": 0,
    "skippedFiles": 0
  }
} as const;

export type MjolnirReport = typeof mjolnirReport;
