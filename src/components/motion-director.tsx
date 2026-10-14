"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** One shared motion preference, also honored by CSS and scroll/pointer effects. */
export function MotionDirector() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const enabled = !paused && !reduced;
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? "on" : "off";
    return () => { delete document.documentElement.dataset.motion; };
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const stage = document.querySelector<HTMLElement>(".hero-stage");
    if (!stage) return;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;
    const render = () => {
      frame = 0;
      stage.style.setProperty("--pointer-x", `${x}deg`);
      stage.style.setProperty("--pointer-y", `${y}deg`);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const rect = stage.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - .5) * 10;
      y = ((event.clientY - rect.top) / rect.height - .5) * -8;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const reset = () => { x = 0; y = 0; if (!frame) frame = requestAnimationFrame(render); };
    const observer = new IntersectionObserver(([entry]) => {
      stage.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(stage);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", reset);
      stage.style.removeProperty("--pointer-x");
      stage.style.removeProperty("--pointer-y");
    };
  }, [enabled, pathname]);
  return (
    <button className="motion-control" type="button" aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(!paused)}>
      <span aria-hidden="true">{enabled ? "Ⅱ" : "▷"}</span>
      {reduced ? "Reduced motion" : paused ? "Resume motion" : "Pause motion"}
    </button>
  );
}
