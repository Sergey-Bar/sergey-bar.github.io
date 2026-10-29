"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "motion";

/**
 * One shared motion preference, plus the one thing on this site that needs
 * JavaScript to happen at all: the scroll reveals. Everything else is CSS.
 *
 * The preference is three-way. The OS can ask for reduced motion, in which
 * case the control is disabled and says so. Otherwise the visitor can pause
 * motion, and the choice persists in localStorage so the next page load
 * honours it before the first paint: the inline flag in layout.tsx reads the
 * same key and sets `data-motion="off"` on the root before the body parses.
 */
export function MotionDirector() {
  const pathname = usePathname();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      setPaused(localStorage.getItem(STORAGE_KEY) === "off");
    } catch {
      /* Private mode or storage disabled: motion simply does not persist. */
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const enabled = !paused && !reduced;

  const wasOffRef = useRef(false);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = enabled ? "on" : "off";
    // Turning motion back on must not replay the page-load sequence.
    if (enabled && wasOffRef.current) root.dataset.resumed = "";
    if (!enabled) wasOffRef.current = true;
  }, [enabled]);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, "off");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* See above. */
    }
  };

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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          observer.unobserve(entry.target);
        }
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

  const label = reduced ? "Reduced motion" : paused ? "Resume motion" : "Pause motion";

  return (
    <button
      className="motion-control"
      type="button"
      aria-pressed={!enabled}
      title={label}
      disabled={reduced}
      onClick={toggle}
    >
      {enabled ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
        </svg>
      )}
      <span className="motion-label">{label}</span>
    </button>
  );
}
