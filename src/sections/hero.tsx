import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { availability, contact, site } from "@/content/site";

/**
 * Hero. The headline is visible at t=0; the two actions fade in at 350ms on a
 * 100ms stagger (plan §6.1). There is no CV — LinkedIn is the contact route and
 * GitHub is the evidence.
 *
 * The fade is a CSS keyframe rather than a library animation: `both` fill keeps
 * the copy in the DOM the whole time, so a screen reader and a reduced-motion
 * visitor get everything immediately.
 */
export function Hero() {
  return (
    <section className="shell pb-16 pt-14 lg:pb-24 lg:pt-24">
      <div className="max-w-[46rem]">
        <h1 className="t-display-xl text-ink">
          I make software releases trustworthy.
        </h1>

        <p className="measure mt-6 t-body text-muted">{site.description}</p>

        <p className="measure mt-5 t-body text-ink">
          Five years across defence platforms, semiconductor metrology and
          enterprise security — environments where a failure is not an option, and
          where quality has to be argued with evidence rather than asserted.
        </p>

        <p className="rise mt-7 flex flex-wrap items-center gap-2 t-small text-muted" style={{ animationDelay: "350ms" }}>
          <span aria-hidden="true" className="size-1.5 bg-success" />
          {availability.text}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="rise inline-flex" style={{ animationDelay: "350ms" }}>
            <Button asChild size="lg" variant="primary">
              <a href={contact.linkedin}>
                <LinkedInIcon size={17} />
                Connect on LinkedIn
              </a>
            </Button>
          </span>
          <span className="rise inline-flex" style={{ animationDelay: "450ms" }}>
            <Button asChild size="lg" variant="secondary">
              <a href={contact.github}>
                <GitHubIcon size={17} />
                Open GitHub
              </a>
            </Button>
          </span>
        </div>
      </div>
    </section>
  );
}