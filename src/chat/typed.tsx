"use client";

import { useEffect, useState } from "react";

/**
 * The opening message, typed letter by letter the way a person would write it.
 * The full text is laid out from the first frame, the untyped part invisible,
 * so the bubble never resizes and no line re-wraps while it is written. A
 * screen reader gets the whole message at once, not a stream of letters.
 * With `animate` off the text is simply there.
 */
export function Typed({ paragraphs, animate }: { paragraphs: readonly string[]; animate: boolean }) {
  const total = paragraphs.reduce((sum, p) => sum + p.length, 0);
  const [count, setCount] = useState(animate ? 0 : total);

  useEffect(() => {
    if (!animate) return;
    let n = 0;
    let timer = 0;
    const flat = paragraphs.join("");
    const step = () => {
      n += 1;
      setCount(n);
      if (n >= total) return;
      const last = flat[n - 1];
      // A breath at the end of a phrase, a beat at the end of a sentence.
      const base = 24 + Math.random() * 22;
      const pause = last === "." || last === "!" || last === "?" ? 380 : last === "," || last === ":" ? 170 : 0;
      timer = window.setTimeout(step, base + pause);
    };
    timer = window.setTimeout(step, 450);
    return () => window.clearTimeout(timer);
  }, [animate, paragraphs, total]);

  let used = 0;
  return (
    <>
      <span className="sr-only">{paragraphs.join(" ")}</span>
      <span aria-hidden="true">
        {paragraphs.map((text, index) => {
          const typed = Math.max(0, Math.min(text.length, count - used));
          const active = count < total && count >= used && count < used + text.length + (index === paragraphs.length - 1 ? 1 : 0);
          used += text.length;
          return (
            <p key={text} className="typed-line">
              <span>{text.slice(0, typed)}</span>
              {active ? <span className="typed-caret" /> : null}
              <span className="typed-rest">{text.slice(typed)}</span>
            </p>
          );
        })}
      </span>
    </>
  );
}
