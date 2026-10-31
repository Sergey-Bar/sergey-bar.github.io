import type { Metadata } from "next";
import Link from "next/link";

import { BackToTop } from "@/components/back-to-top";
import { SectionRule } from "@/components/section-rule";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Colophon",
  description:
    "How this site is built: a static export, one document rendered on the server, budgets and gates that fail closed, and a Playwright suite that tests every section on each deploy.",
  alternates: { canonical: "/colophon/" },
};

const REPO = "https://github.com/Sergey-Bar/sergey-bar.github.io";

/**
 * The site described with the same standard it applies to the work: what it
 * is, how it is gated, and where the evidence is. The QA report link points at
 * the Playwright HTML report the deploy job publishes alongside the pages.
 */
export default function ColophonPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="shell pb-12 pt-12 lg:pt-16">
          <SectionRule />
          <h1 className="measure mt-6 t-display-l text-ink" data-reveal>
            How this site is built
          </h1>
          <p className="measure mt-5 t-body text-muted" data-reveal>
            A personal site should meet the bar it claims for other people&apos;s software. This
            one is a static export with no server, no analytics and no third-party script, and it
            is gated the way a release should be.
          </p>
        </section>

        <section className="shell pb-16">
          <div className="colophon-grid">
            <article className="colophon-card" data-reveal>
              <h2>One document</h2>
              <p>
                The home page is the whole record, rendered on the server from typed content
                modules in the order a reader takes it in, so a crawler, a visitor without
                JavaScript and a recruiter with thirty seconds all see the same page on the first
                frame. A small client island adds the contents, which mark the section in view,
                and an ask bar that routes a typed question to the section that answers it. It
                is a lookup, not a model, and it says so when it does not know.
              </p>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Numbers that cannot drift</h2>
              <p>
                The Mjolnir figures are generated from the recorded scan and census, and CI fails
                if the generated modules differ from their sources. The case studies read their
                figures from the experience and metrics modules rather than restating them. The
                one live number, npm downloads, is refreshed before each build and marked stale if
                the registry is unreachable.
              </p>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Gates that fail closed</h2>
              <p>
                Each push runs the content drift lock, types, lint, the build, and a byte budget
                measured on what actually crosses the wire: 150KB of JavaScript, 20KB of
                stylesheet, 140KB of fonts, gzip. Lighthouse must score 0.95 or better on every
                route for performance, accessibility, best practices and SEO, and the deploy
                asserts the artifact file by file before publishing.
              </p>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Tested like a product</h2>
              <p>
                A Playwright suite runs against the built export on every deploy: the first
                screen, the heading outline, the contents and Back, the ask bar with typed
                questions and its fallback, old links, the page without JavaScript, the phone
                layout down to 320px, and an axe accessibility audit of each state. The HTML report from the latest deploy is published next to the pages.
              </p>
              <p className="mt-4">
                <a href="/qa/report/" className="action action-primary">
                  Latest Playwright report
                </a>
              </p>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>Motion with a stop control</h2>
              <p>
                One motion vocabulary: ease-out for anything entering, feedback under 300ms,
                transform and opacity only, and the long durations reserved for the opening and
                for replies arriving. The operating system&apos;s reduced-motion setting wins, and
                the visitor&apos;s own pause control persists across visits.
              </p>
            </article>
            <article className="colophon-card" data-reveal>
              <h2>The source</h2>
              <p>
                Next.js 15 App Router, TypeScript, Tailwind v4. Type is Apple&apos;s SF Pro and
                SF Mono on Apple devices, from the system, and self-hosted Geist and JetBrains
                Mono everywhere else. The repository carries the full argument in its README, and the{" "}
                <Link href="/accessibility/" className="link-underline">
                  accessibility statement
                </Link>{" "}
                says what was and was not verified.
              </p>
              <p className="mt-4">
                <a href={REPO} className="action action-secondary">
                  Read the source on GitHub
                </a>
              </p>
            </article>
          </div>
          <p className="mt-10 t-small text-muted">
            Something wrong on this page? Say so on{" "}
            <a href={contact.linkedin} className="link-underline">
              LinkedIn
            </a>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
