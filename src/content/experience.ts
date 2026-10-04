/**
 * Engineering record — role, period, scope, ownership and outcomes.
 *
 * Periods are years only. Locations are omitted: every role was in Israel, so
 * repeating it on each one is noise rather than information.
 *
 * Work that an employer has not cleared for publication stays at summary level.
 * The `confidential` flag marks those entries rather than disguising them.
 */

export type Role = {
  company: string;
  role: string;
  period: string;
  scope: string;
  ownership: string[];
  impact: string[];
  /** Work that is summarised rather than described. */
  confidential?: boolean;
};

export const roles: readonly Role[] = [
  {
    company: "Israeli Air Force",
    role: "Senior QA Engineer",
    period: "2025 – Present",
    scope:
      "A full-stack data analysis platform supporting operational units, in a security-critical environment with zero pre-existing QA infrastructure. Part of the Ofek 324 unit, working with DataTeam on the Oracle estate that serves the Air Force.",
    ownership: [
      "Sole QA engineer, from process definition through to release sign-off",
      "Defined test strategy, built quality gates, established release criteria",
      "Designed the operational project-management system for cross-team visibility",
      "Serviced the Oracle environment behind the platform alongside the DataTeam, covering both the application and the database beneath it",
    ],
    impact: [
      "Found a critical data-calculation inaccuracy through AI-assisted code review, classified as a release blocker, keeping flawed operational data out of production",
      "Ran deep-dive SQL validation, cross-referencing API responses against database records to catch data-integrity issues before release",
    ],
    confidential: true,
  },
  {
    company: "Nova Ltd.",
    role: "SQA Engineer",
    period: "2024 – 2025",
    scope:
      "Semiconductor metrology and process-control software deployed to tier-1 fabs including Samsung, Intel and TSMC.",
    ownership: [
      "Managed the defect lifecycle in Azure DevOps with full traceability",
      "Drove root-cause analysis with R&D across software layers and hardware interfaces",
    ],
    impact: [
      "Verified end-to-end functionality of in-house software interfacing with fab machines across distributed measurement workflows",
      "Tested message-driven architectures over RabbitMQ in a microservices environment, protecting communication integrity",
    ],
    confidential: true,
  },
  {
    company: "Teledyne FLIR",
    role: "SQA Engineer, then SQA Technical Lead and Scrum Master",
    period: "2022 – 2025",
    scope:
      "United VMS, an enterprise video management and security platform with thousands of installations across defense, industrial and commercial sectors, at roughly $30M in annual revenue.",
    ownership: [
      "Led 4 QA engineers at 50% hands-on across software, firmware and hardware integration",
      "Drove CI/CD quality integration through Jenkins: automated gates, build stability and flakiness tracking",
      "Defined and tracked QA KPIs for risk-based prioritisation",
      "Served as Scrum Master",
    ],
    impact: [
      "4 major releases delivered with zero critical production defects",
      "Root-caused a critical memory leak with dotMemory and dotTrace, improving stability and performance by 40%",
      "Cut issue-resolution time by 20% through optimised bug-reporting pipelines and cross-team triage",
      "Ran QA across 12+ concurrent product lines spanning embedded and web components",
      "Recognised as the product Subject Matter Expert that R&D and Product relied on, and selected by Product leadership to help design the next-generation platform",
    ],
    confidential: true,
  },
  {
    company: "Enabley",
    role: "QA Engineer",
    period: "2021 – 2022",
    scope: "A high-traffic SaaS web application.",
    ownership: [
      "First and sole QA hire — built the entire QA function from zero",
      "Created test strategy, quality gates, release criteria and documentation (STP, STD)",
    ],
    impact: [
      "Validated REST APIs with Postman and tested GraphQL queries for data accuracy across the full stack",
      "Streamlined bug reporting with structured reproduction steps and severity classification, which is what made cross-team triage fast",
    ],
    confidential: true,
  },
  {
    company: "HP Indigo",
    role: "QC Analyst",
    period: "2015 – 2017",
    scope:
      "Industrial printing systems combining software with scanning and optical hardware in a high-precision manufacturing environment.",
    ownership: [
      "Led root-cause analysis for quality defects across production runs",
      "Assessed print accuracy, colour consistency and system reliability across software, optics and precision mechanics",
    ],
    impact: [
      "Where the discipline started: defect analysis on systems where a measurement error is a defective unit",
    ],
  },
];