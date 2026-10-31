"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** "7+" is 7 to count plus a suffix to keep; "40%" is 40 plus "%". */
function splitValue(value: string) {
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  if (!match) return null;
  return { target: Number(match[1]), suffix: match[2] };
}

/**
 * A verified figure that counts up the first time it scrolls into view. The
 * server render, a visitor without JavaScript and a visitor who asks for
 * reduced motion all get the final value; only the animation is conditional.
 * A figure already on screen when the page opens (a reload that restores the
 * scroll, an address that lands on its section) is simply shown: counting up
 * what the reader is already looking at is a flicker, not an arrival.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => splitValue(value), [value]);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!parsed || !node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start = 0;
    const duration = 1000;

    const step = (now: number) => {
      if (document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShown(value);
        return;
      }
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = parsed.target * eased;
      const text =
        parsed.target % 1 === 0
          ? String(Math.round(current))
          : current.toFixed(1);
      setShown(text + parsed.suffix);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    // The observer's first report is the page as it opened.
    let opening = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const arrived = entries.some((entry) => entry.isIntersecting);
        const onScreenAtOpen = opening;
        opening = false;
        if (!arrived) return;
        observer.disconnect();
        if (onScreenAtOpen) return;
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}

