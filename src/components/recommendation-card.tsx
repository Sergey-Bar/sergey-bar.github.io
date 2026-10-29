import type { Recommendation } from "@/content/recommendations";

/** One LinkedIn recommendation, transcribed. Initials are decorative. */
export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const initials = recommendation.name
    .split(" ")
    .map((part) => part[0])
    .join("");
  return (
    <figure className="recommendation-card">
      <figcaption>
        <span className="recommendation-avatar" aria-hidden="true">
          {initials}
        </span>
        <div>
          <h3>{recommendation.name}</h3>
          <p className="recommendation-role">{recommendation.role}</p>
        </div>
      </figcaption>
      <blockquote>
        {recommendation.quote.split(/\n+/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </blockquote>
      <div className="recommendation-meta">
        <p>{recommendation.relationship}</p>
        <p>{recommendation.date}</p>
      </div>
      {recommendation.excerpt && (
        <p className="recommendation-excerpt">Excerpt · Read the full recommendation on LinkedIn.</p>
      )}
    </figure>
  );
}
