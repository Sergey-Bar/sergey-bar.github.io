// GENERATED FILE — do not edit.
// Source: census.json (sha256 1fc200588b7a5da7)
// Regenerate: npm run content:sync    Verify: npm run content:check

export const mjolnir = {
  "package": {
    "name": "mjolnir-qa",
    "version": "6.0.0",
    "license": "MIT",
    "repo": "https://github.com/Sergey-Bar/Mjolnir",
    "docs": "https://sergey-bar.github.io/Mjolnir/"
  },
  "rules": {
    "total": 79,
    "measured": 73,
    "unmeasured": 6,
    "core": 2,
    "families": [
      "test hygiene",
      "test quality",
      "Playwright",
      "CI integrity"
    ],
    "languages": [
      "TypeScript and JavaScript",
      "Python",
      "Java",
      "C#",
      "GitHub Actions YAML"
    ],
    "frameworks": [
      "Playwright",
      "pytest",
      "JUnit",
      "TestNG",
      "NUnit",
      "xUnit",
      "MSTest",
      "Jest",
      "Vitest",
      "Mocha",
      "Cypress",
      "Selenium"
    ]
  },
  "tiers": [
    {
      "id": "core",
      "measuredFp": "<= 10%",
      "readerSees": "GATE"
    },
    {
      "id": "extended",
      "measuredFp": "<= 30%",
      "readerSees": "GATE or WARN by severity"
    },
    {
      "id": "quarantine",
      "measuredFp": "> 30% or declared",
      "readerSees": "WARN"
    },
    {
      "id": "unmeasured",
      "measuredFp": "n < 10",
      "readerSees": "cannot reach GATE"
    }
  ],
  "evidenceLevels": [
    "E0",
    "E1",
    "E2"
  ],
  "trustLevels": [
    "L0",
    "L1",
    "L2",
    "L3",
    "L4",
    "L5"
  ],
  "trustNote": "L3 and above require a real run report.",
  "worthiness": [
    {
      "range": "0-49",
      "verdict": "UNWORTHY"
    },
    {
      "range": "50-79",
      "verdict": "NEEDS WORK"
    },
    {
      "range": "80-99",
      "verdict": "WORTHY"
    },
    {
      "range": "100",
      "verdict": "FORGED"
    },
    {
      "range": "null",
      "verdict": "UNKNOWN"
    }
  ],
  "exitCodes": [
    {
      "code": 0,
      "name": "CLEAN",
      "meaning": "Clean: no findings at or above the gate"
    },
    {
      "code": 1,
      "name": "FINDINGS",
      "meaning": "Findings at or above the gate"
    },
    {
      "code": 2,
      "name": "INCONCLUSIVE",
      "meaning": "Inconclusive: partial scan. A CI step fails."
    },
    {
      "code": 10,
      "name": "USAGE",
      "meaning": "Usage error"
    },
    {
      "code": 20,
      "name": "INTERNAL",
      "meaning": "Internal error"
    }
  ],
  "trustCertification": "NOT_CERTIFIED",
  "zeroTelemetry": true
} as const;

export type Mjolnir = typeof mjolnir;
