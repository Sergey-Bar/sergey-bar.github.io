import type { ReactNode } from "react";

import { TopicIcon } from "@/home/icons";
import { topicById, topics, type TopicId } from "@/home/topics";
import { images } from "@/content/hero";

/**
 * The portrait at avatar size, the same file the hero paints (a cache hit),
 * cropped to the face. It stands in the sidebar and in the phone's top bar.
 */
export function Avatar({ size = 36 }: { size?: number }) {
  return (
    <span className="avatar" aria-hidden="true" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src={images.portrait} alt="" width={size} height={size} decoding="async" />
    </span>
  );
}

/**
 * One section of the page: a number, the topic's name as its heading and a
 * lead paragraph, then the cards. The section is the target of its topic's
 * anchor, and its heading takes focus when the ask bar jumps to it.
 */
export function Section({
  id,
  lead,
  children,
}: {
  id: TopicId;
  lead: ReactNode;
  children: ReactNode;
}) {
  const topic = topicById[id];
  const number = String(topics.findIndex((t) => t.id === id) + 1).padStart(2, "0");
  return (
    <section className="doc-section" id={id} data-section={id} aria-labelledby={`${id}-heading`}>
      <header className="section-head">
        <p className="section-number" aria-hidden="true">
          <TopicIcon id={id} size={15} />
          {number}
        </p>
        <h2 id={`${id}-heading`} className="section-title" tabIndex={-1}>
          {topic.label}
        </h2>
        <div className="section-lead">{lead}</div>
      </header>
      <div className="section-body">{children}</div>
    </section>
  );
}

/** A card: an optional eyebrow, title and one figure it leads with, then the detail. */
export function Card({
  title,
  eyebrow,
  stat,
  children,
}: {
  title?: string;
  eyebrow?: string;
  /** One figure the card leads with: the hierarchy is title, number, detail. */
  stat?: { value: string; label: string };
  children: ReactNode;
}) {
  return (
    <article className="card">
      {eyebrow || title ? (
        <header className="card-head">
          {eyebrow ? <p className="data card-eyebrow">{eyebrow}</p> : null}
          {title ? <h3 className="card-title">{title}</h3> : null}
          {stat ? (
            <p className="card-stat">
              <span className="card-stat-value">{stat.value}</span>
              <span className="card-stat-label">{stat.label}</span>
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </article>
  );
}

/** A closing line under a section's cards: where the long version lives. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="section-note">{children}</p>;
}

/** The rest of a long card behind one line, so a section can be scanned first. */
export function More({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="more">
      <summary>
        <span className="more-show">{label}</span>
        <span className="more-hide">Show less</span>
        <span className="more-toggle" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="more-body">{children}</div>
    </details>
  );
}
