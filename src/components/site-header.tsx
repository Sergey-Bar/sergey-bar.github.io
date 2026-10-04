"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { availability, contact, nav } from "@/content/site";

/**
 * This is the site's only client island, and it exists for the mobile menu. So it
 * deliberately does not import the Button primitive: Button pulls `cn`, and `cn`
 * pulls tailwind-merge, which measured 8.4KB gzip of the route budget to serve a
 * boolean that toggles one attribute. These two class strings are written out
 * instead, at the same values the primitive uses.
 */
function actionClass(tone: "primary" | "secondary") {
  return [
    "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-panel)] px-3.5 t-small font-medium",
    "transition-[background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
    "active:scale-[0.96] motion-reduce:active:scale-100",
    tone === "primary"
      ? "border border-transparent bg-ink text-white hover:bg-[#000]"
      : "border border-line-strong bg-surface text-ink hover:border-ink",
  ].join(" ");
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="shell flex h-16 items-center gap-6">
        <Link
          href="/"
          className="vt-wordmark shrink-0 t-body font-semibold tracking-[-0.02em] text-ink"
        >
          Sergey Bar
        </Link>

        <span
          className="data hidden truncate border-l border-line pl-4 text-muted lg:block"
          title={availability.text}
        >
          {availability.text}
        </span>

        <nav aria-label="Sections" className="ml-auto hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="t-small text-muted transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <a href={contact.github} className={actionClass("secondary")}>
            <GitHubIcon size={15} />
            GitHub
          </a>
          <a href={contact.linkedin} className={actionClass("primary")}>
            <LinkedInIcon size={15} />
            LinkedIn
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-[var(--radius-chip)] border border-line-strong text-ink transition-colors duration-150 hover:border-ink active:scale-[0.96] md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <CloseIcon size={16} />
            ) : (
              <MenuIcon size={16} />
            )}
          </button>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="border-t border-line md:hidden">
        <nav aria-label="Sections" className="shell flex flex-col py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3 t-body text-ink"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={contact.github}
            className="flex items-center gap-2 py-3 t-body text-ink"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={contact.linkedin}
            className="flex items-center gap-2 py-3 t-body text-ink"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
        </nav>
      </div>
    </header>
  );
}