"use client";

import { useEffect, useState } from "react";

import { ArrowUpIcon } from "@/components/icons";

/**
 * Back to top. It appears once the page is genuinely scrolled, and it never
 * covers content that is still being read: it fades in over the last stretch
 * of the page rather than pushing anything around.
 *
 * A reduced-motion visitor gets the jump without the smooth scroll, which is
 * the part of this that would bother them.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      aria-hidden={!show}
      disabled={!show}
      tabIndex={show ? undefined : -1}
      className={`fixed right-5 bottom-5 z-40 grid size-11 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-[0_10px_28px_rgba(16,17,20,0.12)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-ink active:scale-[0.96] ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUpIcon size={18} />
    </button>
  );
}


