import { CTA } from "@/components/cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Experience } from "@/sections/experience";
import { Hero } from "@/sections/hero";
import { HowIWork } from "@/sections/how-i-work";
import { Philosophy } from "@/sections/philosophy";
import { ProofRow } from "@/sections/proof-row";
import { QualitySystem } from "@/sections/quality-system";
import { Toolbox } from "@/sections/toolbox";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ProofRow />
        <Philosophy />
        <QualitySystem />
        <HowIWork />
        <Experience />
        <Toolbox />
        <CTA />
      </main>
      <SiteFooter />
    </>
  );
}