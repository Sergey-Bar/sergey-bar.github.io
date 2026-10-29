"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { contact, nav } from "@/content/site";

/**
 * This is a client island, and it exists for the mobile menu and the segment
 * indicator. It deliberately does not import the Button primitive: Button
 * pulls `cn`, and `cn` pulls tailwind-merge, which measured 8.4KB gzip of the
 * route budget to serve a boolean that toggles one attribute.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [current, setCurrent] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

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
   * This header renders on the route pages only (the chat page has its own
   * corner); a route item is current by pathname, and the hash items simply
   * open their conversation on the chat page.
   */
  useEffect(() => {
    const match = nav.find(
      (item) =>
        !item.href.includes("#") &&
        item.href.replace(/\/+$/, "") === pathname.replace(/\/+$/, ""),
    );
    setCurrent(match?.href ?? null);
  }, [pathname]);

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
                    href={item.href}
                    ref={(node) => {
                      if (node) linkRefs.current.set(item.href, node);
                      else linkRefs.current.delete(item.href);
                    }}
                    aria-current={active ? "page" : undefined}
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
          {/* The same profile pill as the chat page: one control, two routes,
              the highlight following the pointer and resting on LinkedIn. */}
          <div className="social">
            <a href={contact.github} className="social-link" aria-label="GitHub" title="GitHub">
              <GitHubIcon size={16} />
            </a>
            <a href={contact.linkedin} className="social-link" aria-label="LinkedIn" title="LinkedIn">
              <LinkedInIcon size={16} />
            </a>
          </div>
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
