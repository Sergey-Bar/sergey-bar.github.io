import type { ReactNode } from "react";

import { TopicIcon } from "@/chat/icons";
import { topicById, type TopicId } from "@/chat/topics";
import { images } from "@/content/hero";
import { site } from "@/content/site";

/**
 * The portrait at avatar size, the same file the intro paints (a cache hit),
 * cropped to the face. It stands in the sidebar; replies carry no avatar,
 * the way a chat with a model reads.
 */
export function BotAvatar() {
  return (
    <span className="msg-avatar" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src={images.portrait} alt="" width={36} height={36} loading="lazy" decoding="async" />
    </span>
  );
}

/**
 * One reply bubble. `data-msg` marks it for the director, which reveals the
 * messages of a flow one at a time; without JavaScript every message is
 * simply present, in order.
 */
export function Bubble({ children }: { children: ReactNode }) {
  return (
    <article className="msg" data-msg>
      <div className="bubble">{children}</div>
    </article>
  );
}

/** A rich reply: a card that fills the column rather than a speech bubble. */
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
    <article className="msg msg-card" data-msg>
      <div className="bubble card">
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
        <button type="button" className="card-expand" data-expand>
          Show the whole card
        </button>
      </div>
    </article>
  );
}

/**
 * Quick replies at the end of a flow. They are plain buttons the director
 * listens to by delegation; without JavaScript they fall back to links that
 * jump to the same flow lower on the page.
 */
export function QuickReplies({ ids, lead }: { ids: readonly TopicId[]; lead?: string }) {
  return (
    <article className="msg msg-replies" data-msg>
      <div className="replies">
        {lead ? <p className="replies-lead">{lead}</p> : null}
        <ul className="replies-list">
          {ids.map((id) => (
            <li key={id}>
              <a href={`#${id}`} className="chip" data-ask={id} data-topic={id}>
                <TopicIcon id={id} size={15} />
                {topicById[id].label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** The rest of a long card, behind one line, so the conversation keeps its pace. */
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

/** The visitor's side of the conversation, used for the canned prompt and for typed questions. */
export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <article className="msg user" data-msg data-sent="">
      <div className="bubble">
        <span className="sr-only">You: </span>
        {children}
      </div>
    </article>
  );
}

export const BOT_NAME = site.name;
