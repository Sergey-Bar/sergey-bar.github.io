import { SectionRule } from "@/components/section-rule";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { contact } from "@/content/site";

/** Readable form of a contact URL, derived so the label cannot disagree with the href. */
const label = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * Final call to action. There is no CV and no published email address: the two
 * ways to reach or check the work are given equal weight, and the section is
 * built so the reader can act without choosing which one is "the" button.
 */
export function CTA({
  heading = "Building software that needs to ship with confidence?",
  body = "Two doors, and both are worth opening. LinkedIn carries the full professional record; GitHub carries the work itself, with the tests and the CI that gate it.",
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <section id="contact" aria-labelledby="cta-heading" className="rhythm">
      <div className="shell">
        <SectionRule />
        <h2 id="cta-heading" className="measure mt-6 t-display-l text-ink">
          {heading}
        </h2>
        <p className="measure mt-5 t-body text-muted">{body}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={contact.linkedin}
            className="group flex items-start gap-4 rounded-[var(--radius-card)] border border-line-strong bg-surface p-6 transition-colors duration-150 hover:border-ink"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-panel)] bg-ink text-white">
              <LinkedInIcon size={20} />
            </span>
            <span>
              <span className="block t-title text-ink">Open LinkedIn</span>
              <span className="mt-2 block t-small text-muted">
                The full record: roles, dates, scope and outcomes.
              </span>
              <span className="data mt-3 block text-ink">
                {label(contact.linkedin)}
              </span>
            </span>
          </a>

          <a
            href={contact.github}
            className="group flex items-start gap-4 rounded-[var(--radius-card)] border border-line-strong bg-surface p-6 transition-colors duration-150 hover:border-ink"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-panel)] bg-ink text-white">
              <GitHubIcon size={20} />
            </span>
            <span>
              <span className="block t-title text-ink">Open GitHub</span>
              <span className="mt-2 block t-small text-muted">
                The work itself: source, tests, and the pipeline that has to pass
                before a release is allowed out.
              </span>
              <span className="data mt-3 block text-ink">
                {label(contact.github)}
              </span>
            </span>
          </a>
        </div>

        <p className="measure mt-8 t-small text-muted">
          This site also covers the quality system I run and the engineering
          toolbox behind it.
        </p>
      </div>
    </section>
  );
}
