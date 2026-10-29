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
  portrait: "/portrait.webp?v=20261029c",
  og: "/og.png?v=20261029c",
} as const;

export const hero = {
  /** The one-line promise under the name. */
  headline: "I make software releases trustworthy.",
  /** The LinkedIn summary's opening line, verbatim. */
  positioning: "Most teams test software. I make sure it deserves to ship.",
  /** The clause after the role line, in the portfolio's `//` convention. */
  roleSuffix: "// 7+ years in quality",
  /** The glass badge's caption, set statically on a ring. */
  badge: "COME ON LET'S TALK",
} as const;

/**
 * The employers under the hero, most recent first. Each carries its real logo,
 * downloaded from the company's own asset or a public brand source. `h` is the
 * rendered height. The wordmarks (Nova, FLIR, Enabley) share one height; the
 * two square emblems (IAF, HP) stand taller, because a square glyph at wordmark
 * height reads as the small one on the strip. The marks sit muted and gain
 * their colour on hover.
 */
export const employers = [
  {
    name: "Israeli Air Force",
    logo: "/logos/iaf-emblem.svg",
    iw: 519,
    ih: 546,
    h: "h-11",
  },
  { name: "Nova", logo: "/logos/nova.svg", iw: 184, ih: 31, h: "h-7" },
  {
    name: "Teledyne FLIR",
    logo: "/logos/flir.svg",
    iw: 274,
    ih: 44,
    h: "h-7",
  },
  { name: "Enabley", logo: "/logos/enabley.png", iw: 968, ih: 348, h: "h-7" },
  { name: "HP Indigo", logo: "/logos/hp.svg", iw: 100, ih: 100, h: "h-10" },
] as const;
