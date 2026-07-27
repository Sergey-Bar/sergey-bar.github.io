# Sergey Bar — QA Engineer

Personal CV and portfolio site for **Sergey Bar**, a QA Engineer working across embedded, web, and mobile testing with a focus on AI-driven quality. It is a single-page site built with plain HTML, CSS, and vanilla JavaScript — no build step, no frameworks, no dependencies — so GitHub Pages can serve it directly.

## Live site

This repository is named `sergeybar.github.io` but it lives under the **`Sergey-Bar`** GitHub account. GitHub Pages builds the site's address from the account name, so the account's Pages domain is `https://sergey-bar.github.io/`.

- As things stand (repo name ≠ account name), Pages publishes this as a **project site** at:
  `https://sergey-bar.github.io/sergeybar.github.io/`
- For the clean root URL `https://sergey-bar.github.io/`, **rename the repository to `sergey-bar.github.io`** (Settings → General → Repository name). The site's internal links are all relative, so it works either way; only the canonical/social URLs assume the clean root.

## Features

- Light and dark themes with a toggle (remembers your choice, follows system preference, no flash on load)
- Animated aurora + grid background, gradient headline, and glassmorphic cards with a cursor-follow spotlight
- Count-up hero stats, 3D tilt on the impact cards, a scroll-progress bar, and gradient section accents
- Steady company logos in the "Where I have worked" strip (gray by default, full color on hover)
- Fully responsive with a mobile menu; all motion respects `prefers-reduced-motion`
- Content stays visible even if JavaScript fails to load (reveal effects are gated behind a `js` class)
- "Download CV (PDF)" button that prints a clean, print-optimized version of the page
- SEO ready: meta description, Open Graph + Twitter cards, canonical URL, `og-image.png`, and Person JSON-LD
- Accessibility: skip link, keyboard focus styles, ARIA labels, semantic HTML
- GitHub Pages extras: custom `404.html`, `robots.txt`, and `sitemap.xml`

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `styles.css` | Design system, light/dark themes, animations, responsive + print styles |
| `script.js` | Theme toggle, mobile menu, reveal/stagger, active nav, scroll progress, count-up, spotlight, tilt |
| `404.html` | Themed "page not found" page |
| `robots.txt` | Crawl rules + sitemap pointer |
| `sitemap.xml` | Sitemap for search engines |
| `og-image.png` | 1200x630 social share image |
| `assets/logos/` | Company brand marks (`iaf`, `nova`, `flir`, `enabley`) |

## Editing your content

All content lives in `index.html`, grouped by section:

- **Hero** — headline, summary, and the four stat cards (`.hero-stats`, with `data-count` for the count-up).
- **About** — bio paragraphs and the Quick info card (location, email, LinkedIn, languages).
- **Impact** — the four highlight cards (`#impact`).
- **Experience** — role cards in the `.timeline`, each with its company logo from `assets/logos/`.
- **Skills** — chips grouped by category.
- **Certifications & Education** — the two lists under `#credentials`.
- **Contact** — email, LinkedIn, and GitHub links.

To swap a logo, replace the matching file in `assets/logos/` (`iaf.png`, `nova.png`, `flir.png`, `enabley.png`) with a square PNG or SVG; the tile keeps a white background so marks stay visible in dark mode.

## Local preview

Open `index.html` in a browser, or run a static server from the project folder:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000/.

## Deploy to GitHub Pages

1. Commit and push to the `main` branch.
2. In the repository on GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: `main` / `(root)`**, and save.
4. The site is live within a minute or two at the URL described in **Live site** above.

## Notes

- Personal source material (the `ME/` folder and any `*.pdf`) is excluded from the repository via `.gitignore` and is not published.
- Phone number is intentionally not included on the public site.
- The social share image was pre-generated. To change it, drop in a new 1200x630 `og-image.png`.
