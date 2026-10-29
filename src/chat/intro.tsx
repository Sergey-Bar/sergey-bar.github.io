import type { CSSProperties } from "react";

import { TopicIcon } from "@/chat/icons";
import { BotAvatar } from "@/chat/message";
import { topicById } from "@/chat/topics";
import { hero, images } from "@/content/hero";
import { availability, site } from "@/content/site";

/** A delay for the page-load sequence, read by the stylesheet as `--d`. */
function at(ms: number): CSSProperties {
  return { "--d": `${ms}ms` } as CSSProperties;
}

type Word = { text: string; className?: string };

/**
 * A line of words that rise through a mask. The words are hidden from
 * assistive technology; the heading carries the sentence as its name.
 */
function MaskedLine({ words, delay }: { words: readonly Word[]; delay: number }) {
  return (
    <span className="intro-line" aria-hidden="true">
      {words.map((word, index) => (
        <span key={`${index}-${word.text}`}>
          {index > 0 ? " " : null}
          <span className="mask" style={{ "--d": `${delay}ms`, "--w": index } as CSSProperties}>
            <span className={word.className}>{word.text}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

const OPENERS = [
  { id: "about", label: "About me" },
  { id: "projects", label: "See my work" },
  { id: "cases", label: topicById.cases.label },
] as const;

/**
 * The first screen is already the conversation: the name and the role, then
 * the first message, with the ways in as quick replies beneath it. The
 * portrait sits beside it, smaller than a hero and settling after a moment,
 * so the words carry the screen. It leaves once a topic is chosen and comes
 * back with "Start over".
 */
export function Intro() {
  const titleLine1: Word[] = [{ text: "I'm" }, { text: `${site.name.split(" ")[0]},`, className: "name" }];
  const titleLine2: Word[] = [{ text: "QA" }, { text: "Tech" }, { text: "Lead" }];

  return (
    <section className="intro" aria-labelledby="intro-heading">
      <h1 id="intro-heading" className="intro-title" aria-label={`I'm ${site.name}, ${site.role}`} tabIndex={-1}>
        <MaskedLine words={titleLine1} delay={120} />
        <MaskedLine words={titleLine2} delay={260} />
      </h1>

      <p className="intro-sub" data-stage style={at(520)}>
        <span className="intro-role">AI Automation Engineer</span>
        <span className="intro-dot" aria-hidden="true">
          ·
        </span>
        <span>{hero.headline}</span>
      </p>

      <div className="intro-stage" data-stage-tilt>
        <div className="intro-chat" data-stage style={at(680)}>
          <article className="msg">
            <BotAvatar />
            <div className="bubble">
              <p>{hero.positioning}</p>
              <p>Ask me anything about my work, or start with one of these.</p>
            </div>
          </article>
          <ul className="replies-list intro-actions" aria-label="Start here">
            {OPENERS.map((opener) => (
              <li key={opener.id}>
                <a href={`#${opener.id}`} className="chip" data-ask={opener.id} data-topic={opener.id}>
                  <TopicIcon id={opener.id} size={15} />
                  {opener.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="intro-readall">
            <button type="button" className="link-underline" data-read-all>
              Or read everything as one page
            </button>
          </p>
        </div>

        <div className="intro-portrait" data-tilt-focus>
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
          <span className="portrait-badge" data-stage style={at(900)}>
            <span className="status-dot" aria-hidden="true" />
            {availability.text}
          </span>
        </div>
      </div>
    </section>
  );
}
