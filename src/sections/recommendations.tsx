import { recommendations, type Recommendation } from "@/content/recommendations";
import { contact } from "@/content/site";
import { LinkedInIcon } from "@/components/brand-icons";

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const initials = recommendation.name.split(" ").map(part => part[0]).join("");
  return (
    <figure className="recommendation-card">
      <figcaption>
        <span className="recommendation-avatar" aria-hidden="true">{initials}</span>
        <div><h3>{recommendation.name}</h3><p className="recommendation-role">{recommendation.role}</p></div>
      </figcaption>
      <blockquote>{recommendation.quote.split(/\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</blockquote>
      <div className="recommendation-meta"><p>{recommendation.relationship}</p><p>{recommendation.date}</p></div>
      {recommendation.excerpt && <p className="recommendation-excerpt">Excerpt · Read the full recommendation on LinkedIn.</p>}
    </figure>
  );
}

export function Recommendations() {
  return (
    <section id="recommendations" aria-labelledby="recommendations-heading" className="rhythm recommendations-section">
      <div className="shell">
        <div className="recommendations-heading">
          <div><h2 id="recommendations-heading" className="t-display-l">The people behind the work.</h2><p className="mt-5 t-body text-muted">14 LinkedIn recommendations from managers and colleagues.</p></div>
          <a className="recommendations-source" href={contact.linkedin}><LinkedInIcon size={18} />View on LinkedIn</a>
        </div>
        <div className="recommendations-grid">{recommendations.slice(0, 3).map(recommendation => <RecommendationCard key={recommendation.name} recommendation={recommendation} />)}</div>
        <details className="recommendations-more">
          <summary><span className="recommendations-show">Read all 14 recommendations</span><span className="recommendations-hide">Show featured recommendations</span><span className="recommendations-toggle" aria-hidden="true">+</span></summary>
          <div className="recommendations-grid">{recommendations.slice(3).map(recommendation => <RecommendationCard key={recommendation.name} recommendation={recommendation} />)}</div>
        </details>
      </div>
    </section>
  );
}
