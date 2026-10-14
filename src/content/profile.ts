/**
 * The record at a glance, restated as a spec sheet.
 *
 * Every row is a fact the published CV or LinkedIn profile states directly:
 * the headline, the sectors, the top skills and the languages. Nothing here is
 * a claim; the sections behind each row carry the evidence.
 */

export const profile = {
  /** The LinkedIn headline, verbatim in substance. */
  headline: "QA Tech Lead & AI Automation Engineer",
  sectors: [
    "Defense",
    "Semiconductor Metrology",
    "Enterprise Security",
    "SaaS",
  ],
  /** LinkedIn top skills, in the order the profile lists them. */
  topSkills: ["Team Leadership", "Quality Assurance", "Test Automation"],
  /** The headline's instruments. */
  instruments: ["Embedded · HW/SW", "Python", "Playwright", "CI/CD"],
  /** The one-line distinction both the CV and the profile lead with. */
  distinction:
    "I was the first and only QA engineer on a product twice, and built the quality function from zero both times: strategy, gates, release criteria, documentation, automation.",
} as const;
