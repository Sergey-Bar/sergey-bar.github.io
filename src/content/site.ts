/**
 * Site-level constants. Plan §3.3 — no copy lives inside components.
 *
 * The record itself lives on LinkedIn and the work lives on GitHub: this site
 * publishes neither a CV copy nor a direct email or phone number. Aligned with
 * the published LinkedIn profile and CV (October 2026).
 */

export const site = {
  name: "Sergey Bar",
  role: "QA Tech Lead & AI Automation Engineer",
  domain: "https://sergey-bar.github.io",
  title: "Sergey Bar · QA Tech Lead & AI Automation Engineer",
  description:
    "QA Tech Lead & AI Automation Engineer with 7+ years across defence platforms, semiconductor metrology and enterprise security. Test strategy from zero, Playwright and Python automation as release gates, and evidence a stranger can check.",
  locale: "en_US",
  location: "Israel",
} as const;

/**
 * There is no CV page and no published email address or phone number on this
 * site. LinkedIn is the contact route; the repositories are the evidence.
 */
export const contact = {
  linkedin: "https://www.linkedin.com/in/sergeybar",
  github: "https://github.com/Sergey-Bar",
} as const;

export type NavItem = { label: string; href: string };

export const nav: readonly NavItem[] = [
  { label: "Chat", href: "/" },
  { label: "Projects", href: "/projects/" },
  { label: "Experience", href: "/#experience" },
  { label: "Recommendations", href: "/#recommendations" },
  { label: "Toolbox", href: "/#toolbox" },
];
export const availability = {
  /**
   * Two lanes, stated plainly: the QA track and the management track the CV
   * and the profile are both open to.
   */
  text: "Open to work",
  roles: ["QA Roles", "Product Management", "Project Management"],
} as const;
