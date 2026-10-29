import type { CSSProperties } from "react";

import { ArrowRightIcon, ChatIcon, LayersIcon, UserIcon } from "@/chat/icons";
import { hero } from "@/content/hero";
import { recommendations } from "@/content/recommendations";
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

/** The short sentence that opens the second recommendation, used as the pull quote. */
function pullQuote() {
  const source = recommendations[1];
  const sentence = source.quote.split(/(?<=\.)\s+/)[1] ?? source.quote;
  return { sentence, name: source.name, role: source.role.split("|")[0].trim() };
}

/**
 * The first screen: a greeting, the name, the role, the portrait, one line of
 * proof and two ways in. It is the only part of the page that leaves once the
 * conversation starts, and it comes back with "Start over".
 */
export function Intro() {
  const quote = pullQuote();
  const titleLine1: Word[] = [{ text: "I'm" }, { text: `${site.name.split(" ")[0]},`, className: "name" }];
  const titleLine2: Word[] = [{ text: "QA" }, { text: "Tech" }, { text: "Lead" }];

  return (
    <section className="intro" aria-labelledby="intro-heading">
      <p className="hello" data-stage style={at(0)}>
        <span className="wave" aria-hidden="true">
          <ChatIcon size={12} />
        </span>
        Hello!
      </p>

      <h1 id="intro-heading" className="intro-title" aria-label={`I'm ${site.name}, ${site.role}`}>
        <MaskedLine words={titleLine1} delay={120} />
        <MaskedLine words={titleLine2} delay={260} />
      </h1>

      <p className="intro-sub" data-stage style={at(520)}>
        <span className="intro-role">&amp; AI Automation Engineer</span>
        <span className="intro-dot" aria-hidden="true">
          ·
        </span>
        <span>{hero.headline}</span>
      </p>

      <div className="intro-stage">
        <figure className="intro-quote" data-stage style={at(760)}>
          <span className="intro-quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          <blockquote>
            <p>{quote.sentence}</p>
          </blockquote>
          <figcaption>
            <strong>{quote.name}</strong> · {quote.role}
          </figcaption>
        </figure>

        <div className="intro-portrait" data-stage-tilt>
          <span className="portrait-glow" aria-hidden="true" />
          <span className="portrait-ring" aria-hidden="true" />
          <span className="portrait-disc">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img
              src="/portrait.webp"
              alt={site.name}
              width={800}
              height={800}
              fetchPriority="high"
              className="portrait-img"
            />
          </span>
          <span className="portrait-badge" data-stage style={at(900)}>
            <span className="status-dot" aria-hidden="true" />
            {availability.text}
          </span>
        </div>

        <div className="intro-actions" data-stage style={at(820)}>
          <a href="#about" className="action action-primary action-lg" data-ask="about">
            <UserIcon size={16} />
            About me
          </a>
          <a href="#projects" className="action action-secondary action-lg" data-ask="projects">
            <LayersIcon size={16} />
            See my work
            <ArrowRightIcon size={15} className="action-arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
