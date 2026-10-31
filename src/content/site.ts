/**
 * Site-level constants. Plan §3.3 — no copy lives inside components.
 *
 * The record itself lives on LinkedIn and the work lives on GitHub: this site
 * publishes no CV copy and no phone number; the email is the one direct route. Aligned with
 * the published LinkedIn profile and CV (October 2026).
 */

export const site = {
  name: "Sergey Bar",
  role: "QA Tech Lead & AI Automation Engineer",
  domain: "https://sergey-bar.github.io",
  title: "Sergey Bar · QA Tech Lead & AI Automation Engineer",
  description:
    "QA Tech Lead & AI Automation Engineer with 5 years in software QA across defence platforms, semiconductor metrology and enterprise security. Test strategy from zero, Playwright and Python automation as release gates, and open-source tools that publish their own limits.",
  locale: "en_US",
  location: "Israel",
} as const;

/**
 * There is no CV page on this site. LinkedIn is the contact route and the
 * repositories are the evidence; the CV is sent on request, by email or on
 * LinkedIn, so it is never a file a crawler can lift.
 */
export const contact = {
  linkedin: "https://www.linkedin.com/in/sergeybar",
  github: "https://github.com/Sergey-Bar",
  email: "Sergeybaris@gmail.com",
  /** Where a barrier or a mistake on the site can be reported in the open. */
  questions: "https://github.com/Sergey-Bar/sergey-bar.github.io/issues/new",
} as const;

export const availability = {
  /**
   * Two lanes, stated plainly: the QA track and the management track the CV
   * and the profile are both open to.
   */
  roles: ["QA Roles", "Product Management", "Project Management"],
} as const;
