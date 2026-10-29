"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? "on" : "off";
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

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let tiltX = 0;
    let tiltY = 0;
    let spotX = 0;
    let spotY = 0;

    const render = () => {
      frame = 0;
      stage.style.setProperty("--pointer-x", `${tiltX}deg`);
      stage.style.setProperty("--pointer-y", `${tiltY}deg`);
      stage.style.setProperty("--mx", `${spotX}px`);
      stage.style.setProperty("--my", `${spotY}px`);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const rect = stage.getBoundingClientRect();
      spotX = event.clientX - rect.left;
      spotY = event.clientY - rect.top;
      tiltX = (spotX / rect.width - 0.5) * 10;
      tiltY = (spotY / rect.height - 0.5) * -8;
      stage.dataset.spot = "on";
      if (!frame) frame = requestAnimationFrame(render);
    };
    const leave = () => {
      tiltX = 0;
      tiltY = 0;
      stage.dataset.spot = "off";
      if (!frame) frame = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(([entry]) => {
      stage.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(stage);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
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
      disabled={reduced}
      onClick={toggle}
    >
      <span aria-hidden="true">{enabled ? "Ⅱ" : "▷"}</span>
      <span className="motion-label">{label}</span>
    </button>
  );
}
