import { RedButton } from "@/components/red-button";
import { contact } from "@/content/site";
import { LinkedInIcon, GitHubIcon } from "@/components/brand-icons";

export function CTA({
  heading = "Let's build confidence into your next release.",
  body = "For QA leadership, automation and the challenges that need both. Start a conversation on LinkedIn.",
}: { heading?: string; body?: string }) {
  return (
    <section id="contact" aria-labelledby="cta-heading" className="rhythm">
      <div className="shell contact-layout">
        <div>
          <h2 id="cta-heading" className="t-display-l">{heading}</h2>
          <p className="mt-6 t-body text-muted contact-description">{body}</p>
          <div className="contact-actions">
            <a href={contact.linkedin} className="contact-primary"><LinkedInIcon size={18} />Connect on LinkedIn</a>
            <a href={contact.github} className="contact-secondary"><GitHubIcon size={18} />Explore GitHub</a>
          </div>
        </div>
        <div className="playground-panel">
          <p className="t-small text-muted">A little after-hours experiment</p>
          <p className="mt-3 t-small text-muted">An interactive stress-relief toy. Press Escape to return.</p>
          <div className="mt-5"><RedButton /></div>
        </div>
      </div>
    </section>
  );
}
