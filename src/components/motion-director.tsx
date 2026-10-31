"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The motion preference is the system's: with `prefers-reduced-motion` nothing
 * moves (the stylesheet and this director both read it). There is no control
 * of the site's own.
 */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * The site's motion effects: the root flag the stylesheet reads, the scroll
 * reveals and the light that follows the pointer. It renders nothing.
 */
export function MotionDirector() {
  const pathname = usePathname();
  const enabled = !useReducedMotion();

  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? "on" : "off";
  }, [enabled]);

  /**
   * Scroll reveals. Each `[data-reveal]` element, and each `[data-reveal-stagger]`
   * group, gets `data-in` the first time it crosses into the lower 92% of the
   * viewport, and is then left alone: the reveal is a one-time arrival, not a
   * scroll-linked effect. Children of a stagger group carry their index so the
   * stylesheet can space them out. With reduced motion, or without an observer,
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
