import type { Metadata } from "next";

import { GitHubIcon } from "@/components/brand-icons";
import { MjolnirConsole } from "@/components/mjolnir-console";
import { SectionRule } from "@/components/section-rule";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusChip } from "@/components/status-chip";
import { TechnicalTag } from "@/components/technical-tag";
import { CTA } from "@/components/cta";
import { mjolnir } from "@/content/mjolnir-facts";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Mjolnir, a verification trust engine, and Automate, a local-first QA control plane. Both open source, both linked to their repositories.",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="shell pb-12 pt-12 lg:pt-16">
          <SectionRule />
          <h1 className="measure mt-6 t-display-l text-ink">Projects</h1>
          <p className="measure mt-5 t-body text-muted">
            Two open-source products I built and maintain. Both are on GitHub, and
            both state their own limits — a tool that rounds itself up is not
            worth reading.
          </p>
        </section>

        {projects.map((project) => (
          <section
            key={project.slug}
            aria-labelledby={`${project.slug}-heading`}
            className={project.slug === "mjolnir" ? "bg-dark-bg text-dark-text" : "border-t border-line"}
          >
            <div className="shell py-12 lg:py-16">
              <div className="flex flex-wrap items-center gap-3">
                <h2
                  id={`${project.slug}-heading`}
                  className={`t-display-l ${
                    project.slug === "mjolnir" ? "text-dark-text" : "text-ink"
                  }`}
                >
                  {project.name}
                </h2>
                {project.slug === "mjolnir" ? (
                  <StatusChip
                    tone="success"
                    label={`v${mjolnir.package.version} published`}
                    className="border-dark-line bg-dark-panel text-dark-muted"
                  />
                ) : null}
              </div>

              <p
                className={`data mt-2 ${
                  project.slug === "mjolnir" ? "text-dark-muted" : "text-muted"
                }`}
              >
                {project.kind}
              </p>

              <p
                className={`measure mt-5 t-body ${
                  project.slug === "mjolnir" ? "text-dark-text" : "text-ink"
                }`}
              >
                {project.tagline}
              </p>
              <p
                className={`measure mt-4 t-body ${
                  project.slug === "mjolnir" ? "text-dark-muted" : "text-muted"
                }`}
              >
                {project.about}
              </p>

              <ul className="mt-6 flex flex-wrap gap-1.5">
                {project.facts.map((fact) => (
                  <li key={fact.label}>
                    <TechnicalTag tone={project.slug === "mjolnir" ? "dark" : "light"}>
                      {fact.label} {fact.value}
                    </TechnicalTag>
                  </li>
                ))}
              </ul>

              <a
                href={project.repo}
                className={`link-underline mt-6 inline-flex items-center gap-2 t-small ${
                  project.slug === "mjolnir" ? "text-dark-text" : "text-ink"
                }`}
              >
                <GitHubIcon size={15} />
                {project.repoLabel}
              </a>

              {project.slug === "mjolnir" ? <MjolnirConsole /> : null}
            </div>
          </section>
        ))}

        <CTA
          heading="Want the long version?"
          body="Both repositories carry their full design argument, and I am happy to walk through either of them."
        />
      </main>
      <SiteFooter />
    </>
  );
}