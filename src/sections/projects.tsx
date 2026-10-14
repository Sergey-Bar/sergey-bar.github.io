import { GitHubIcon } from "@/components/brand-icons";
import { MjolnirConsole } from "@/components/mjolnir-console";
import { SectionRule } from "@/components/section-rule";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { mjolnir } from "@/content/mjolnir-facts";
import { projects } from "@/content/projects";

/** One fact cell: label above, value below. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="data text-muted">{label}</dt>
      <dd className="mt-1 t-small font-medium text-ink tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * The per-project bands, shared by the home page and the projects route. Both
 * are light: identity on the left (name, kind, the repository button), the
 * substance on the right (tagline, what it is, the facts, and for Mjolnir the
 * evidence console itself).
 */
export function ProjectSections() {
  return (
    <>
      {projects.map((project) => (
        <section
          key={project.slug}
          aria-labelledby={`${project.slug}-heading`}
          className={`project-feature project-feature-${project.slug} border-t border-line`}
          data-reveal
        >
          <div className="shell grid gap-10 py-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16 lg:py-16">
            <div>
              <h2
                id={`${project.slug}-heading`}
                className="t-display-l text-ink"
              >
                {project.name}
              </h2>
              <p className="data mt-2 text-muted">{project.kind}</p>

              {project.slug === "mjolnir" ? (
                <div className="mt-3">
                  <StatusChip
                    tone="success"
                    label={`v${mjolnir.package.version} published`}
                  />
                </div>
              ) : null}

              <div className="mt-6">
                <Button asChild variant="primary">
                  <a href={project.repo}>
                    <GitHubIcon size={15} />
                    Open on GitHub
                  </a>
                </Button>
              </div>
              <p className="data mt-3 text-muted">{project.repoLabel}</p>
            </div>

            <div>
              <p className="t-title text-ink">{project.tagline}</p>
              <p className="measure mt-4 t-body text-muted">{project.about}</p>

              <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
                {project.facts.map((fact) => (
                  <Fact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </dl>

              {project.slug === "mjolnir" ? <MjolnirConsole /> : (
                <figure className="evidence-panel mt-10">
                  <figcaption className="t-title">How evidence moves through Automate</figcaption>
                  <ol className="evidence-flow">
                    <li><strong>Test producers</strong><span>Playwright · JUnit · legacy reporters</span></li>
                    <li><strong>Shared result model</strong><span>Results and persisted run evidence</span></li>
                    <li><strong>Quality gates</strong><span>Policies that inform release decisions</span></li>
                  </ol>
                  <p className="t-small text-muted mt-5">Architecture overview. Capability limits are listed above and in the repository.</p>
                </figure>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/**
 * The projects band on the home page: the same two open-source products the
 * /projects route carries in full, reached by scrolling instead of by
 * navigating away.
 */
export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-heading">
      <div className="shell rhythm">
        <SectionRule />
        <h2
          id="projects-heading"
          className="measure mt-6 t-display-l text-ink"
          data-reveal
        >
          Projects
        </h2>
        <p className="measure mt-5 max-w-[68ch] t-body text-muted" data-reveal>
          Two open-source products I built and maintain. Both are on GitHub, and
          both state their own limits.
        </p>
      </div>

      <ProjectSections />
    </section>
  );
}
