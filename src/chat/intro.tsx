import type { CSSProperties } from "react";

import { hero, images } from "@/content/hero";
import { site } from "@/content/site";

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

/**
 * The first screen is quiet: the name, the role and the portrait, centred.
 * After about ten seconds (or on the first scroll) the director lifts it and
 * opens the chat; any chip does the same at once. It comes back with "Start
 * over".
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

      <div className="intro-stage">
        <div className="intro-portrait">
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
        </div>
      </div>
    </section>
  );
}
