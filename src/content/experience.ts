/**
 * Engineering record — role, period, scope, ownership and outcomes.
 *
 * Periods are years only. Locations are omitted: every role was in Israel, so
 * repeating it on each one is noise rather than information.
 *
 * Everything here is already published on the LinkedIn profile and the CV —
 * employer work is written at that same level of detail and not beyond it.
 */

export type Role = {
  company: string;
  role: string;
  period: string;
  scope: string;
  ownership: string[];
  impact: string[];
};

export const roles: readonly Role[] = [
  {
    company: "Israeli Air Force · Ofek 324",
    role: "Senior QA Engineer",
    period: "2025–Present",
    scope:
      "A full-stack data analysis platform supporting operational units, in a security-critical environment with zero pre-existing QA infrastructure. Working with DataTeam on the Oracle estate that serves the Air Force.",
    ownership: [
      "Sole quality owner, from requirements intake through to release sign-off",
      "Built the complete quality lifecycle from zero: test strategy, quality requirements, coverage planning, quality gates and release criteria",
      "Designed the platform's three-tier test pyramid from scratch (unit, integration and end to end) with full backend and frontend suites",
      "Wired Playwright UI automation and API tests in Python and TypeScript into the pipeline as the scheduled nightly regression pass",
      "Designed the operational project-management system for cross-team visibility",
      "Serviced the Oracle environment behind the platform alongside the DataTeam, covering both the application and the database beneath it",
    ],
    impact: [
      "Blocked a release-critical scoring and data-calculation defect through AI-assisted code review and deep SQL validation, cross-referencing API responses against database records before rollout",
      "Reviewed requirements and architecture docs with developers and project leads before implementation, converting ambiguity into quality requirements and prioritised coverage",
      "Set the team's standards for test design, defect reporting and severity, and served as the single quality point of contact on release readiness and triage",
    ],
  },
  {
    company: "Nova Ltd.",
    role: "QA Engineer",
    period: "2025–2025",
    scope:
      "Semiconductor metrology and process-control software deployed to tier-1 fabs including Samsung, Intel and TSMC. A maternity-cover role.",
    ownership: [
      "Managed the defect lifecycle in Azure DevOps with full traceability",
      "Drove root-cause analysis with R&D across software layers and hardware interfaces",
    ],
    impact: [
      "Verified end-to-end measurement and process-control workflows on software interfacing directly with fab machines in production-equivalent environments",
      "Tested message-driven architectures over RabbitMQ across microservices, protecting communication integrity",
      "Reproduced failures on demand across distributed client-server components (Linux/Windows), isolated them to the responsible layer, and drove them through to resolution",
    ],
  },
  {
    company: "Teledyne FLIR",
    role: "QA Engineer, then QA Technical Lead and Scrum Master",
    period: "2022–2025",
    scope:
      "United VMS (Latitude, Horizon and Meridian), an enterprise video management and security platform with thousands of installations across defense, industrial and commercial sectors, at roughly $30M in annual revenue.",
    ownership: [
      "Led 4 QA engineers at 50% hands-on across software, firmware and hardware integration",
      "Ran CI/CD quality integration through Jenkins: automated gates, build stability and flakiness tracking",
      "Defined and tracked QA KPIs for risk-based prioritisation",
      "Served as Scrum Master",
    ],
    impact: [
      "4 major releases delivered with zero critical production defects",
      "Root-caused a critical memory leak with dotMemory and dotTrace, improving stability and performance by 40%",
      "Cut issue-resolution time by 20% through optimised bug-reporting pipelines and cross-team triage",
      "Ran QA across 12+ concurrent product lines spanning embedded and web components",
      "Validated computer-vision and ML algorithms, from video analytics to motion detection, across distributed camera and sensor deployments",
      "Recognised as the product Subject Matter Expert that R&D and Product relied on; ran developer knowledge-sharing sessions and represented QA in client-facing sales events",
      "Selected by Product leadership to help design the next-generation security platform",
    ],
  },
  {
    company: "Enabley",
    role: "QA Engineer",
    period: "2021–2022",
    scope:
      "An enterprise mobile-first training and knowledge platform with 1M+ active users across 25 languages, built on a microservices architecture.",
    ownership: [
      "First and sole QA hire. Built the entire QA function from zero",
      "Created test strategy, quality gates, release criteria and documentation (STP, STD)",
    ],
    impact: [
      "Validated REST APIs with Postman and tested GraphQL queries for data accuracy across the full stack",
      "Executed manual functional, regression and exploratory testing to full requirement coverage across web and mobile-first clients",
      "Bug reporting carried structured reproduction steps and severity classification, which is what made cross-team triage fast",
    ],
  },
  {
    company: "HP Indigo",
    role: "QC Analyst",
    period: "2015–2017",
    scope:
      "Industrial printing systems combining software with scanning and optical hardware in a high-precision manufacturing environment.",
    ownership: [
      "Led root-cause analysis for quality defects across production runs",
      "Assessed print accuracy, colour consistency and system reliability across software, optics and precision mechanics",
    ],
    impact: [
      "Measured printed output with X-Rite colour instruments and generated the measurement reports the release decision rested on",
      "Where the discipline started: defect analysis on systems where a measurement error is a defective unit",
    ],
  },
];
