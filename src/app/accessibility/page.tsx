import type { Metadata } from "next";

import { BackToTop } from "@/components/back-to-top";
import { SectionRule } from "@/components/section-rule";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "What this site does for keyboard, screen-reader and reduced-motion visitors, what is verified automatically, and what is not.",
  alternates: { canonical: "/accessibility/" },
};

/**
 * An accessibility statement in the site's own register: what it does, what
 * is checked by a machine on every deploy, and what has not been checked, so
 * nobody has to guess which is which.
 */
export default function AccessibilityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="shell pb-12 pt-12 lg:pt-16">
          <SectionRule />
          <h1 className="measure mt-6 t-display-l text-ink" data-reveal>
            Accessibility
          </h1>
          <p className="measure mt-5 t-body text-muted" data-reveal>
            The aim is WCAG 2.2 AA. This page says what the site does, what is verified on every
            deploy, and what has only been reasoned about.
          </p>
        </section>

        <section className="shell pb-16">
          <div className="colophon-grid">
            <article className="colophon-card" data-reveal>
              <h2>What the site does</h2>
              <ul className="colophon-list">
                <li>The whole record is one page, there without JavaScript: one h1, then a numbered h2 per section, in a fixed logical order.</li>
                <li>The contents mark the section in view as the current location. The ask bar announces one short status line per question, and on a touch screen moves focus to the heading of the section it opens.</li>
                <li>Animated figures are decorative, with the final value exposed alongside.</li>
                <li>All controls are reachable by keyboard: the contents, disclosures, the ask bar and its topics, the pause control. The slash key focuses the ask bar and Escape leaves it; the drawer on a phone takes focus when it opens and returns it when it closes.</li>
                <li>Focus is visible on every control and never lands under the fixed ask bar: the page&apos;s scroll padding follows the bar&apos;s height.</li>
                <li>The operating system&apos;s reduced-motion setting disables every animation; a pause control does the same by choice and is remembered.</li>
                <li>Text and controls hold at least 4.5:1 contrast on the dark ground; status is never carried by colour alone.</li>
                <li>Touch targets are 44px or larger; the ask bar stays above the virtual keyboard.</li>
              </ul>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Verified on every deploy</h2>
              <ul className="colophon-list">
                <li>Lighthouse accessibility score of 0.95 or better on every route, or the deploy fails.</li>
                <li>An axe-core audit (WCAG 2.2 A and AA rules) of the home page, of the ask bar&apos;s fallback reply, of the projects route and of this page, run by the Playwright suite.</li>
                <li>Keyboard paths through the contents, the ask bar and the drawer, and a check that no focused link hides under the ask bar.</li>
              </ul>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Not verified</h2>
              <ul className="colophon-list">
                <li>Screen-reader sessions with NVDA, JAWS or VoiceOver. The status-line design follows the specification; it has not yet been heard.</li>
                <li>Safari, Firefox and physical devices. Checks run in headless Chromium at desktop and phone sizes.</li>
                <li>The canvas toy behind the red button is a game with its own motion and is not claimed accessible beyond its keyboard dismissal.</li>
              </ul>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Found a barrier?</h2>
              <p>
                Say so on{" "}
                <a href={contact.linkedin} className="link-underline">
                  LinkedIn
                </a>{" "}
                or open a note on{" "}
                <a href={contact.questions} className="link-underline">
                  GitHub
                </a>
                . It will be fixed in the open.
              </p>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
