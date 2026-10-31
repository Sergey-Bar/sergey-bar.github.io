/**
 * Hero copy and the employer strip.
 *
 * The role line is `site.role` — typed once there and reused, so the header,
 * the hero, the footer and the JSON-LD cannot disagree with each other.
 * Everything here is a fact the published profile or CV states directly.
 */

/**
 * Image URLs carry a version so a replaced file is fetched at once: the name
 * stays stable for the budget script and the generator, the query string
 * defeats the browser cache and the social-preview caches, which key on the URL.
 */
export const images = {
  portrait: "/portrait.webp?v=20261029d",
  og: "/og.png?v=20261029d",
} as const;

export const hero = {
  /** The one-line promise under the name. */
  headline: "I make software releases trustworthy.",
  /** The LinkedIn summary's opening line, verbatim. */
  positioning: "Most teams test software. I make sure it deserves to ship.",
  /** The clause after the role line, in the portfolio's `//` convention. */
  roleSuffix: "// 5 years in software QA",
  /** The glass badge's caption, set statically on a ring. */
  badge: "COME ON LET'S TALK",
} as const;

/**
 * The employers under the hero, most recent first. The IAF emblem is the
 * official one as drawn, white with navy line work, which already reads on a
 * dark ground. The wordmarks are white versions of each company's own logo,
 * kept next to their source files in `public/logos/`: FLIR without its
 * tagline and with the wordmark centred on the icon; Nova's four letters
 * without the small "PROCESS INSIGHT" and registered mark, which turn to dots
 * at this size; Enabley's letters without the white outline and grey shadow
 * baked into its PNG; HP's disc in white.
 *
 * `h` is the rendered height in pixels, set by eye so the five read at one
 * weight: the square emblems stand taller than the wordmarks.
 */
export const employers = [
  { name: "Israeli Air Force", logo: "/logos/iaf-emblem.svg", iw: 519, ih: 546, h: 58 },
  { name: "Nova", logo: "/logos/nova-on-dark.svg", iw: 136, ih: 31, h: 24 },
  { name: "Teledyne FLIR", logo: "/logos/flir-on-dark.svg", iw: 247, ih: 44, h: 30 },
  { name: "Enabley", logo: "/logos/enabley-on-dark.png", iw: 890, ih: 297, h: 28 },
  { name: "HP Indigo", logo: "/logos/hp-on-dark.svg", iw: 100, ih: 100, h: 40 },
] as const;
