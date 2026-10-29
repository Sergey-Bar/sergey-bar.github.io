import type { ReactNode } from "react";

import { TopicIcon } from "@/chat/icons";
import { topicById, type TopicId } from "@/chat/topics";
import { site } from "@/content/site";

/**
 * The avatar beside a reply. The portrait is the same file the intro paints,
 * so this is a cache hit, cropped to the face.
 */
export function BotAvatar() {
  return (
    <span className="msg-avatar" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src="/portrait.webp" alt="" width={36} height={36} loading="lazy" decoding="async" />
    </span>
  );
}

/**
 * One reply bubble. `data-msg` marks it for the director, which reveals the
 * messages of a flow one at a time; without JavaScript every message is
 * simply present, in order.
 */
export function Bubble({ children, first = true }: { children: ReactNode; first?: boolean }) {
  return (
    <article className="msg" data-msg>
      {first ? <BotAvatar /> : <span className="msg-avatar msg-avatar-gap" aria-hidden="true" />}
      <div className="bubble">{children}</div>
    </article>
  );
}

/** A rich reply: a card that fills the column rather than a speech bubble. */
export function Card({
  title,
  eyebrow,
  children,
  first = false,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <article className="msg msg-card" data-msg>
      {first ? <BotAvatar /> : <span className="msg-avatar msg-avatar-gap" aria-hidden="true" />}
      <div className="bubble card">
        {eyebrow || title ? (
          <header className="card-head">
            {eyebrow ? <p className="data card-eyebrow">{eyebrow}</p> : null}
            {title ? <h3 className="card-title">{title}</h3> : null}
          </header>
        ) : null}
        {children}
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
      <span className="msg-avatar msg-avatar-gap" aria-hidden="true" />
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
