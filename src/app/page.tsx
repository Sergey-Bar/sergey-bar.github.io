import { Recommendations } from "@/sections/recommendations";
import { QualityStory } from "@/sections/quality-story";
import { CTA } from "@/components/cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Experience } from "@/sections/experience";
import { Hero } from "@/sections/hero";
import { Profile } from "@/sections/profile";
import { Projects } from "@/sections/projects";
import { ProofRow } from "@/sections/proof-row";
import { Toolbox } from "@/sections/toolbox";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <QualityStory />
        <ProofRow />
        <Projects />
        <Profile />
        <Experience />
        <Recommendations />
        <Toolbox />
        <CTA />
      </main>
      <SiteFooter />
    </>
  );
}
