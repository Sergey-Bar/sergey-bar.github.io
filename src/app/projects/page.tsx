import type { Metadata } from "next";

import { BackToTop } from "@/components/back-to-top";
import { SectionRule } from "@/components/section-rule";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CTA } from "@/components/cta";
import { ProjectSections } from "@/sections/projects";

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
          <h1 className="measure mt-6 t-display-l text-ink" data-reveal>
            Projects
          </h1>
          <p className="measure mt-5 t-body text-muted" data-reveal>
            Two open-source products I built and maintain. Both are on GitHub,
            and both state their own limits. A tool that rounds itself up is not
            worth reading.
          </p>
        </section>

        <ProjectSections />

        <CTA
          heading="Want the long version?"
          body="Both repositories carry their full design argument, and I am happy to walk through either of them."
        />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
