import { More } from "@/home/blocks";
import type { Recommendation } from "@/content/recommendations";

/** The first two sentences stay visible; the rest opens on request. */
function split(quote: string): { lead: string; rest: string } {
  const sentences = quote.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 2 || quote.length < 240) return { lead: quote, rest: "" };
  return { lead: sentences.slice(0, 2).join(" "), rest: sentences.slice(2).join(" ") };
}

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
        {(() => {
          const { lead, rest } = split(recommendation.quote.replace(/\n+/g, " "));
          return (
            <>
              <p>{lead}</p>
              {rest ? (
                <More label="Read the full recommendation">
                  <p>{rest}</p>
                </More>
              ) : null}
            </>
          );
        })()}
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
