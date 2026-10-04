/**
 * Site-level constants. Plan §3.3 — no copy lives inside components.
 */

export const site = {
  name: "Sergey Bar",
  role: "Senior QA Engineer & QA Tech Lead",
  domain: "https://sergey-bar.github.io",
  title: "Sergey Bar — Senior QA Engineer & QA Tech Lead",
  description:
    "Senior QA Engineer focused on test architecture, automation, release confidence, CI/CD quality gates, and reliable engineering systems.",
  locale: "en_US",
  location: "Israel",
} as const;

/**
 * There is no CV page and no published email address on this site. LinkedIn is
 * the contact route; the repositories are the evidence.
 */
export const contact = {
  linkedin: "https://www.linkedin.com/in/sergeybar",
  github: "https://github.com/Sergey-Bar",
} as const;

export type NavItem = { label: string; href: string };

export const nav: readonly NavItem[] = [
  { label: "Projects", href: "/projects/" },
  { label: "Experience", href: "/#experience" },
  { label: "Toolbox", href: "/#toolbox" },
];

export const availability = {
  /**
   * Deliberately not a list of job titles. The record speaks for itself, and a
   * title list reads as a filter rather than as openness.
   */
  text: "Open to work",
} as const;