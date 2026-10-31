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
          {/* Three plain ways to reach the person, nothing louder than the name. */}
          <ul className="hero-links" aria-label="Contact">
            <li>
              <a href={contact.linkedin} className="hero-link">
                <LinkedInIcon size={16} />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hero-link">
                <MailIcon size={16} />
                Email
              </a>
            </li>
            <li>
              <a href={contact.github} className="hero-link">
                <GitHubIcon size={16} />
                GitHub
              </a>
            </li>
          </ul>
        </div>
        <div className="hero-portrait">
          <span className="portrait-glow" aria-hidden="true" />
          <span className="portrait-ring" aria-hidden="true" />
          <span className="portrait-disc">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img
              src={images.portrait}
              alt={site.name}
              width={480}
              height={480}
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
            <li key={employer.name} title={employer.name}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, brand assets */}
              <img
                src={employer.logo}
                alt={employer.name}
                width={employer.iw}
                height={employer.ih}
                style={{ height: employer.h, width: "auto" }}
              />
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
