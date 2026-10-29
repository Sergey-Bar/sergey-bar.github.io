"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { activeSection } from "@/lib/active-section";
import { usePathname } from "next/navigation";

import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { contact, nav } from "@/content/site";

/**
 * This is a client island, and it exists for the mobile menu and the segment
 * indicator. So it deliberately does not import the Button primitive: Button
 * pulls `cn`, and `cn` pulls tailwind-merge, which measured 8.4KB gzip of the
 * route budget to serve a boolean that toggles one attribute. These two class
 * strings are written out instead, at the same values the primitive uses.
 */
function actionClass(tone: "primary" | "secondary", iconOnly = false) {
  return [
    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-panel)] t-small font-medium",
    iconOnly ? "w-11 px-0" : "px-3.5",
    "transition-[background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
    "active:scale-[0.96] motion-reduce:active:scale-100",
    tone === "primary"
      ? "border border-transparent bg-ink text-paper hover:bg-[#fff]"
      : "border border-line-strong bg-surface text-ink hover:border-ink",
  ].join(" ");
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [current, setCurrent] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isHome =
    pathname === "/" || pathname === "/index.html" || pathname === "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /**
   * Scroll spy: the section crossing a line a third of the way down the
   * viewport is the current one, and the first section carries the home page's
   * opening, where the hero owns the screen. Route items are tracked too, by
   * the band on this page that belongs to them, so the last stretch of the
   * page lights Projects rather than falling back to the first item.
   */
  useEffect(() => {
    if (!isHome) return;

    const tracked = nav
      .map((item) => ({
        href: item.href,
        id: item.href.includes("#")
          ? item.href.split("#")[1]
          : item.href.replace(/^\/+|\/+$/g, ""),
      }))
      .map((entry) => ({ ...entry, node: document.getElementById(entry.id) }))
      .filter(
        (entry): entry is { href: string; id: string; node: HTMLElement } =>
          Boolean(entry.node),
      )
      .sort((a, b) =>
        a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );
    if (!tracked.length) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = window.innerHeight * 0.32;
      setCurrent(activeSection(tracked.map(({ href, node }) => ({
        href, top: node.getBoundingClientRect().top,
      })), line));    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  /** Route items are current by pathname; the home page uses the scroll spy. */
  useEffect(() => {
    if (isHome) return;
    const match = nav.find(
      (item) =>
        !item.href.includes("#") &&
        item.href.replace(/\/+$/, "") === pathname.replace(/\/+$/, ""),
    );
    setCurrent(match?.href ?? null);
  }, [isHome, pathname]);

  const measure = useCallback(() => {
    const list = listRef.current;
    const node = current ? linkRefs.current.get(current) : undefined;
    if (!list || !node) {
      setPill(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const linkRect = node.getBoundingClientRect();
    setPill({ x: linkRect.left - listRect.left, w: linkRect.width });
  }, [current]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, open]);

  return (
    <header className="header-elevate sticky top-0 z-40 border-b border-line bg-paper">
      <div className="shell flex h-16 items-center">
        <Link href="/" className="flex shrink-0 items-center">
          <span className="vt-wordmark t-body font-semibold tracking-[-0.02em] text-ink">
            Sergey Bar
          </span>
        </Link>

        <nav aria-label="Sections" className="mx-auto hidden lg:block">
          <ul
            ref={listRef}
            className="relative flex items-center gap-0.5 rounded-full bg-ink/[0.04] p-1"
          >
            {pill ? (
              <li
                aria-hidden="true"
                className="nav-pill pointer-events-none absolute inset-y-1 left-0 rounded-full bg-ink"
                style={{
                  width: `${pill.w}px`,
                  transform: `translateX(${pill.x}px)`,
                }}
              />
            ) : null}
            {nav.map((item) => {
              const active = current === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={isHome && item.href === "/projects/" ? "/#projects" : item.href}
                    ref={(node) => {
                      if (node) linkRefs.current.set(item.href, node);
                      else linkRefs.current.delete(item.href);
                    }}
                    aria-current={active ? (isHome ? "location" : "page") : undefined}
                    className={`relative z-10 block rounded-full px-3.5 py-1.5 t-small transition-colors duration-150 ${
                      active ? "text-paper" : "text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* The two routes are icons only: the glyph is the label. GitHub
              drops out below md — the mobile menu carries it, and the wordmark
              needs the room more than a second square does. */}
          <a
            href={contact.github}
            aria-label="GitHub"
            title="GitHub"
            className={`${actionClass("secondary", true)} max-lg:hidden`}
          >
            <GitHubIcon size={16} />
          </a>
          <a
            href={contact.linkedin}
            aria-label="LinkedIn"
            title="LinkedIn"
            className={actionClass("primary", true)}
          >
            <LinkedInIcon size={16} />
          </a>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-chip)] border border-line-strong text-ink transition-colors duration-150 hover:border-ink active:scale-[0.96] lg:hidden"
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

      <div id={menuId} hidden={!open} className="menu-sheet border-t border-line lg:hidden">
        <nav aria-label="Sections" className="shell flex flex-col py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={isHome && item.href === "/projects/" ? "/#projects" : item.href}
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
