import Link from "next/link";
import { HeroPortrait } from "@/components/hero-portrait";
import { EmployerStrip } from "@/sections/employer-strip";
import { site, availability, contact } from "@/content/site";

export const HERO_HEADLINE = "I make software releases trustworthy.";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="portfolio-hero">
      <div className="shell">
        <div className="hero-stage">
          <div className="cinema-light cinema-light-blue" aria-hidden="true" />
          <div className="cinema-light cinema-light-warm" aria-hidden="true" />
          <span className="hero-watermark" aria-hidden="true">SB</span>
          <div className="hero-copy">
            <p className="hero-in hero-d1 hero-intro"><span aria-hidden="true" className="availability-dot" />{availability.text}</p>
            <h1 id="hero-heading" className="hero-in hero-d2 hero-name">{site.name}</h1>
            <p className="hero-in hero-d3 hero-statement">{HERO_HEADLINE}</p>
            <p className="hero-in hero-d4 hero-role">{site.role}</p>
            <p className="hero-in hero-d4 hero-summary">From the first test strategy to the final release gate. 7+ years across defence, semiconductor metrology and enterprise security.</p>
            <div className="hero-in hero-d5 hero-actions">
              <Link href="/#projects" className="hero-primary">Explore my work <span aria-hidden="true">↗</span></Link>
              <a href={contact.linkedin} className="hero-secondary">Connect on LinkedIn <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="hero-visual hero-in hero-d3">
            <div className="portrait-orbit" aria-hidden="true" />
            <HeroPortrait />
            <div className="portrait-caption"><span>Quality is a decision.</span><span>Make it with evidence.</span></div>
          </div>
        </div>
        <div className="hero-employers"><p>Experience across teams at</p><EmployerStrip /></div>
      </div>
    </section>
  );
}
