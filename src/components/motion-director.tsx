"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "motion";

/**
 * One shared motion preference, plus the two things on this site that need
 * JavaScript to happen at all: the scroll reveals and the hero's pointer
 * response. Everything else is CSS.
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
   * The intro portrait answers a fine pointer by tilting a few degrees toward
   * it, with its glow following. Both are written in one animation frame per
   * pointer move, as custom properties the stylesheet turns into transforms,
   * so nothing here forces a layout or a repaint. Its looping ring is paused
   * while the portrait is off screen.
   */
  useEffect(() => {
    if (!enabled) return;
    const stage = document.querySelector<HTMLElement>("[data-stage-tilt]");
    if (!stage) return;
    const focus = stage.querySelector<HTMLElement>("[data-tilt-focus]") ?? stage;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let clientX = -1;
    let clientY = -1;
    let inside = false;

    /* The pointer is tracked on the window, and the geometry is read once per
       frame: whether the pointer is over the stage is decided from its
       position, never from a leave event that a repaint or a layer change can
       swallow. The tilt is relative to the portrait, so it looks at the hand. */
    const render = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const over =
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      if (over) {
        const target = focus.getBoundingClientRect();
        const dx = (clientX - target.left) / target.width - 0.5;
        const dy = (clientY - target.top) / target.height - 0.5;
        const clamp = (v: number) => Math.max(-0.8, Math.min(0.8, v));
        stage.style.setProperty("--pointer-x", `${clamp(dx) * 14}deg`);
        stage.style.setProperty("--pointer-y", `${clamp(dy) * -11}deg`);
        stage.style.setProperty("--mx", `${clientX - target.left}px`);
        stage.style.setProperty("--my", `${clientY - target.top}px`);
        stage.dataset.spot = "on";
        inside = true;
      } else if (inside) {
        stage.style.setProperty("--pointer-x", "0deg");
        stage.style.setProperty("--pointer-y", "0deg");
        stage.dataset.spot = "off";
        inside = false;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      clientX = event.clientX;
      clientY = event.clientY;
      schedule();
    };
    const gone = () => {
      clientX = -1;
      clientY = -1;
      schedule();
    };

    const observer = new IntersectionObserver(([entry]) => {
      stage.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(stage);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointercancel", gone);
    window.addEventListener("blur", gone);
    document.addEventListener("pointerleave", gone);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointercancel", gone);
      window.removeEventListener("blur", gone);
      document.removeEventListener("pointerleave", gone);
      window.removeEventListener("scroll", schedule);
      for (const name of ["--pointer-x", "--pointer-y", "--mx", "--my"]) {
        stage.style.removeProperty(name);
      }
      delete stage.dataset.spot;
      delete stage.dataset.visible;
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
