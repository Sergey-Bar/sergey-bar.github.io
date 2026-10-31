import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { MailIcon } from "@/home/icons";
import { employers, hero, images } from "@/content/hero";
import { contact, site } from "@/content/site";

/**
 * The top of the page: who, what, and the two ways to act on it, beside the
 * portrait, with the employers underneath. Everything is on the first frame:
 * no entrance holds the name or the photo back, so the page's largest paint
 * is the real content.
 */
export function Hero() {
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-text">
          <h1 id="hero-heading" className="hero-name" tabIndex={-1}>
            {site.name}
          </h1>
          <p className="hero-role">{site.role}</p>
          <p className="hero-pitch">{hero.positioning}</p>
          <div className="hero-actions">
            <a href={contact.linkedin} className="action action-primary action-lg">
              <LinkedInIcon size={17} />
              Connect on LinkedIn
            </a>
            <a href={`mailto:${contact.email}?subject=CV%20request`} className="action action-secondary action-lg">
              <MailIcon size={17} />
              Request my CV
            </a>
            <a href={contact.github} className="action action-secondary action-lg action-icon" aria-label="GitHub">
              <GitHubIcon size={18} />
            </a>
          </div>
        </div>
        <div className="hero-portrait">
          <span className="portrait-glow" aria-hidden="true" />
          <span className="portrait-ring" aria-hidden="true" />
          <span className="portrait-disc">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img
              src={images.portrait}
              alt={site.name}
              width={900}
              height={900}
              fetchPriority="high"
              className="portrait-img"
            />
          </span>
        </div>
      </div>

      <div className="hero-employers">
        <p className="data">Experience across teams at</p>
        <ul className="employers" aria-label="Employers">
          {employers.map((employer) => (
            <li key={employer.name} title={employer.name} data-tone={employer.tone}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, brand assets */}
              <img
                src={employer.logo}
                alt={employer.name}
                width={employer.iw}
                height={employer.ih}
                className={`${employer.h} w-auto`}
              />
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
