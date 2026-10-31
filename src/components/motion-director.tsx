"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "motion";
/** Fired on the window when the visitor pauses or resumes, so every control and effect agrees. */
const CHANGE_EVENT = "motion-change";
/** The choice for this page view, kept here too in case storage is unavailable. */
let pausedNow: boolean | null = null;

function readPaused(): boolean {
  if (pausedNow !== null) return pausedNow;
  try {
    pausedNow = localStorage.getItem(STORAGE_KEY) === "off";
  } catch {
    /* Private mode or storage disabled: motion simply does not persist. */
    pausedNow = false;
  }
  return pausedNow;
}

/**
 * The shared motion preference. The OS can ask for reduced motion, in which
 * case nothing moves and the control says so. Otherwise the visitor can pause
 * motion, and the choice persists in localStorage so the next page load
 * honours it before the first paint: the inline flag in layout.tsx reads the
 * same key and sets `data-motion="off"` on the root before the body parses.
 */
export function useMotion() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setPaused(readPaused());
    const onChange = () => setPaused(readPaused());
    window.addEventListener(CHANGE_EVENT, onChange);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      media.removeEventListener("change", update);
    };
  }, []);

  const toggle = useCallback(() => {
    pausedNow = !readPaused();
    try {
      if (pausedNow) localStorage.setItem(STORAGE_KEY, "off");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* See readPaused. */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { paused, reduced, enabled: !paused && !reduced, toggle };
}

/**
 * The visitor's pause control, a labelled row rather than a floating button:
 * it lives in the place the page gives it (the sidebar's foot on the home
 * page), so it can never sit on top of anything.
 */
export function MotionToggle({ className = "" }: { className?: string }) {
  const { reduced, enabled, toggle } = useMotion();
  const label = reduced ? "Motion reduced by your system" : enabled ? "Pause motion" : "Resume motion";
  return (
    <button
      className={`motion-toggle ${className}`}
      type="button"
      aria-pressed={!enabled}
      disabled={reduced}
      onClick={toggle}
    >
      {enabled ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}

/**
 * The site's motion effects: the root flag the stylesheet reads, the scroll
 * reveals and the light that follows the pointer. It renders nothing; the
 * control that pauses it is `MotionToggle`, placed by the page.
 */
export function MotionDirector() {
  const pathname = usePathname();
  const { enabled } = useMotion();

  const wasOffRef = useRef(false);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = enabled ? "on" : "off";
    // Turning motion back on must not replay the page-load sequence.
    if (enabled && wasOffRef.current) root.dataset.resumed = "";
    if (!enabled) wasOffRef.current = true;
  }, [enabled]);

  /**
   * Scroll reveals. Each `[data-reveal]` element, and each `[data-reveal-stagger]`
   * group, gets `data-in` the first time it crosses into the lower 92% of the
   * viewport, and is then left alone: the reveal is a one-time arrival, not a
   * scroll-linked effect. Children of a stagger group carry their index so the
   * stylesheet can space them out. With motion paused, or without an observer,
   * everything is simply shown.
   */
  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>("[data-reveal-stagger]")
      .forEach((group) => {
        Array.from(group.children).forEach((child, index) => {
          (child as HTMLElement).style.setProperty(
            "--reveal-i",
            String(Math.min(index, 8)),
          );
        });
      });

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]"),
    ).filter((node) => !("in" in node.dataset));
    if (!targets.length) return;

    if (!enabled || !("IntersectionObserver" in window)) {
      targets.forEach((node) => {
        node.dataset.in = "";
      });
      return;
    }

    // Nothing is hidden until this decides. The observer's first report is
    // the page as it opened: whatever is on screen then (a reload that
    // restores the scroll, an address that lands on a section) is left as it
    // is, and only what is off screen is armed, hidden where no one sees it,
    // to arrive when it scrolls in.
    let opening = true;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (opening && !entry.isIntersecting) {
            node.dataset.armed = "";
            continue;
          }
          if (!entry.isIntersecting) continue;
          node.dataset.in = "";
          observer.unobserve(node);
        }
        opening = false;
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [enabled, pathname]);

  /**
   * A soft light that follows a fine pointer across the page. It is one
   * pre-painted radial inside the fixed background, moved on the compositor
   * from window-level pointer events, so it cannot be left behind by a
   * swallowed leave event: it fades the moment the pointer leaves the document
   * or the window loses focus, and it does not exist on touch screens.
   */
  useEffect(() => {
    if (!enabled) return;
    const glow = document.querySelector<HTMLElement>("[data-cursor-glow]");
    if (!glow || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let x = -1;
    let y = -1;
    let shown = false;
    const render = () => {
      frame = 0;
      if (x < 0) {
        glow.style.opacity = "0";
        shown = false;
        return;
      }
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!shown) {
        glow.style.opacity = "1";
        shown = true;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      schedule();
    };
    const gone = () => {
      x = -1;
      y = -1;
      schedule();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointercancel", gone);
    window.addEventListener("blur", gone);
    document.addEventListener("pointerleave", gone);
    document.addEventListener("visibilitychange", gone);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointercancel", gone);
      window.removeEventListener("blur", gone);
      document.removeEventListener("pointerleave", gone);
      document.removeEventListener("visibilitychange", gone);
      glow.style.opacity = "";
      glow.style.transform = "";
    };
  }, [enabled, pathname]);

  return null;
}
