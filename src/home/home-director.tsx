"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { Avatar } from "@/home/blocks";
import { MailIcon, SendIcon, TopicIcon } from "@/home/icons";
import { routeInput, topicById, topicForHash, topics, type TopicId } from "@/home/topics";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CloseIcon, MenuIcon, PlusIcon } from "@/components/icons";
import { availability, contact, site } from "@/content/site";

/** Names short enough for a phone's row of chips; the full label stays the accessible name. */
const SHORT: Record<TopicId, string> = {
  about: "About",
  projects: "Projects",
  cases: "Cases",
  experience: "Career",
  recommendations: "Reviews",
  toolbox: "Toolbox",
  contact: "Contact",
  fun: "Play",
};

/** What the ask bar says back. A topic is answered by the page itself; the rest by a line. */
type Reply =
  | { key: number; question: string; kind: "topic"; id: TopicId; term?: string }
  | { key: number; question: string; kind: "greeting" }
  | { key: number; question: string; kind: "unlisted"; tool: string; scanned: boolean }
  | { key: number; question: string; kind: "unknown" };

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** True when the visitor, or the OS, has asked this site not to move. */
function motionOff() {
  return (
    document.documentElement.dataset.motion === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Hands a tool's name to the toolbox's own search, so the group that lists it
 * is what the reader lands on. The field is React's, so the value goes in
 * through the native setter and an input event, the way typing would.
 */
function searchToolbox(term: string) {
  const field = document.querySelector<HTMLInputElement>('#toolbox input[type="search"]');
  if (!field) return;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(field, term);
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * The home page's one client island. The page itself, the hero and every
 * section, is server-rendered and arrives as children; this adds the reading
 * aids around it: the contents in the sidebar (a drawer on narrow screens)
 * marking the section in view, and the ask bar, which routes a typed question
 * to the section that answers it. Without JavaScript the page is complete and
 * every contents link still jumps.
 */
export function HomeDirector({ hero, sections, footer }: { hero: ReactNode; sections: ReactNode; footer: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const replyKey = useRef(0);

  /** The section in view, marked in the contents; null while the hero is. */
  const [current, setCurrent] = useState<TopicId | null>(null);
  /** The sidebar as a drawer on narrow screens. */
  const [drawer, setDrawer] = useState(false);
  /**
   * The topics panel above the field. Open from the start and never closed on
   * the visitor's behalf: only the button beside the field closes and reopens it.
   */
  const [chipsOpen, setChipsOpen] = useState(true);
  /** The topic the router would answer with, previewed on the chips as the visitor types. */
  const [match, setMatch] = useState<TopicId | null>(null);
  const [reply, setReply] = useState<Reply | null>(null);
  /** One short line for assistive technology. */
  const [status, setStatus] = useState("");

  /* ---------------------------------------------------------- navigation */

  /** Marks a section for a moment, so the eye finds where a jump landed. */
  const flash = useCallback((section: HTMLElement) => {
    delete section.dataset.flash;
    void section.offsetWidth;
    section.dataset.flash = "";
    window.setTimeout(() => delete section.dataset.flash, 1600);
  }, []);

  /**
   * Takes the reader to a section the way its anchor does, so the address
   * names it, Back returns from it and the scroll padding keeps its heading
   * clear of the top. A touch screen moves focus to the heading as well; with
   * a pointer, focus stays in the field for the next question.
   */
  const goTo = useCallback(
    (id: TopicId) => {
      const section = document.getElementById(id);
      if (!section) return;
      if (location.hash === `#${id}`) {
        section.scrollIntoView({ block: "start", behavior: motionOff() ? "auto" : "smooth" });
      } else {
        location.hash = id;
      }
      if (!finePointer()) section.querySelector<HTMLElement>(".section-title")?.focus({ preventScroll: true });
      flash(section);
    },
    [flash],
  );

  /** A legacy anchor (`#case-studies`) or `?topic=` lands on its section under the topic's own address. */
  useEffect(() => {
    const settle = () => {
      const id = topicForHash(location.hash) ?? topicForHash(new URLSearchParams(location.search).get("topic") ?? "");
      if (!id || (location.hash === `#${id}` && !location.search)) return;
      history.replaceState(null, "", `${location.pathname}#${id}`);
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    };
    settle();
    window.addEventListener("hashchange", settle);
    return () => window.removeEventListener("hashchange", settle);
  }, []);

  /**
   * The section in view: the last one whose top has passed a line a third of
   * the way down the screen, or the last of all once the page is at its end.
   */
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      let found: TopicId | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) found = section.dataset.section as TopicId;
      }
      if (atEnd && sections.length) found = sections[sections.length - 1].dataset.section as TopicId;
      setCurrent(found);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /**
   * The ask bar's height, kept on the root as `--composer-h` for the page's
   * scroll padding: a link reached by Tab scrolls clear of the bar instead of
   * focusing beneath it, and the padding follows the topics panel as it opens.
   */
  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--composer-h", `${Math.ceil(composer.offsetHeight)}px`);
    });
    observer.observe(composer);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--composer-h");
    };
  }, []);

  /* -------------------------------------------------------------- drawer */

  const closeDrawer = useCallback(() => {
    setDrawer(false);
    if (rootRef.current?.querySelector(".sidebar")?.contains(document.activeElement)) {
      menuRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (drawer) closeRef.current?.focus({ preventScroll: true });
  }, [drawer]);

  /* ------------------------------------------------------------ keyboard */

  /** "/" focuses the field from anywhere; Escape closes what is open, then leaves the field. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input) return;
      const target = event.target as HTMLElement | null;
      const editing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        input.focus();
      } else if (event.key === "Escape") {
        if (document.querySelector('[role="dialog"]')) return;
        if (rootRef.current?.dataset.drawer !== undefined) closeDrawer();
        else if (document.activeElement === input) input.blur();
        else setReply(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  /* ------------------------------------------------------------- the ask */

  /** A topic's confirmation goes by itself; a reply that says something stays until closed. */
  useEffect(() => {
    if (reply?.kind !== "topic") return;
    const timer = window.setTimeout(() => setReply((r) => (r?.key === reply.key ? null : r)), 5000);
    return () => window.clearTimeout(timer);
  }, [reply]);

  const submit = () => {
    const input = inputRef.current;
    const question = input?.value.trim() ?? "";
    if (!question || !input) return;
    input.value = "";
    setMatch(null);
    const key = ++replyKey.current;
    const route = routeInput(question);
    if (route.kind === "topic") {
      setReply({ key, question, kind: "topic", id: route.id, term: route.term });
      setStatus(
        route.term
          ? `Showing ${topicById[route.id].label}, searched for ${route.term}.`
          : `Showing ${topicById[route.id].label}.`,
      );
      if (route.term) searchToolbox(route.term);
      goTo(route.id);
    } else if (route.kind === "greeting") {
      setReply({ key, question, kind: "greeting" });
      setStatus(`Hi! I'm ${site.name}. Ask about my work, or pick a topic.`);
    } else if (route.kind === "unlisted") {
      setReply({ key, question, kind: "unlisted", tool: route.tool, scanned: route.scanned });
      setStatus(`${route.tool} is not in my toolbox.`);
    } else {
      setReply({ key, question, kind: "unknown" });
      setStatus("No section answers that one. Pick a topic, or ask on LinkedIn.");
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const onInput = () => {
    const route = routeInput(inputRef.current?.value ?? "");
    setMatch(route.kind === "topic" ? route.id : null);
  };

  /** Any link to a section, anywhere in the shell: the drawer closes and the reply goes. */
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = topicForHash(link.hash);
    if (!id) return;
    setDrawer(false);
    if (link.closest(".ask-reply")) setReply(null);
    const section = document.getElementById(id);
    if (section) flash(section);
  };

  /* -------------------------------------------------------------- render */

  const topicChips = (ids: readonly TopicId[]) =>
    ids.map((id) => (
      <li key={id}>
        <a href={`#${id}`} className="chip" data-topic={id}>
          <TopicIcon id={id} size={14} />
          {topicById[id].label}
        </a>
      </li>
    ));

  return (
    <div ref={rootRef} className="home" data-drawer={drawer ? "" : undefined} onClick={onClick}>
      <div className="page-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="cursor-glow" data-cursor-glow />
        <span className="grain page-grain" />
      </div>

      {/* The phone's bar: who, where in the page, and the contents. */}
      <div className="topline">
        <a href="#main" className="topline-person" onClick={() => window.scrollTo({ top: 0 })}>
          <Avatar size={28} />
          <span className="topline-name">{site.name}</span>
          {current ? (
            <span className="topline-section" aria-hidden="true">
              {topicById[current].label}
            </span>
          ) : null}
        </a>
        <button
          ref={menuRef}
          type="button"
          className="topline-menu"
          onClick={() => setDrawer(true)}
          aria-label="Contents"
          aria-controls="sidebar"
          aria-expanded={drawer}
        >
          <MenuIcon size={17} />
        </button>
      </div>

      {/* The contents. Beside the page on a wide screen; a drawer on a phone. */}
      <aside className="sidebar" id="sidebar" aria-label="Contents and profiles">
        <div className="side-head">
          <span className="side-person">
            <Avatar size={40} />
            <span>
              <span className="side-name">{site.name}</span>
              <span className="side-role">{site.role}</span>
            </span>
          </span>
          <button ref={closeRef} type="button" className="side-close" onClick={closeDrawer} aria-label="Close contents">
            <CloseIcon size={16} />
          </button>
        </div>

        <nav aria-labelledby="side-contents">
          <p className="side-label" id="side-contents">
            Contents
          </p>
          <ol className="side-list">
            {topics.map((topic, index) => (
              <li key={topic.id}>
                <a
                  href={`#${topic.id}`}
                  className="side-item"
                  data-topic={topic.id}
                  aria-current={current === topic.id ? "location" : undefined}
                >
                  <span className="side-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{topic.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <p className="side-label" id="side-profiles">
          Profiles
        </p>
        <ul className="side-list" aria-labelledby="side-profiles">
          <li>
            <a href={contact.linkedin} className="side-item side-profile">
              <LinkedInIcon size={15} />
              <span>LinkedIn</span>
            </a>
          </li>
          <li>
            <a href={contact.github} className="side-item side-profile">
              <GitHubIcon size={15} />
              <span>GitHub</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`} className="side-item side-profile">
              <MailIcon size={15} />
              <span>Email</span>
            </a>
          </li>
        </ul>

        <div className="side-foot">
          <span className="status-dot" aria-hidden="true" />
          <span>{availability.text}</span>
        </div>
      </aside>
      <button
        type="button"
        className="drawer-backdrop"
        hidden={!drawer}
        onClick={closeDrawer}
        aria-label="Close contents"
        tabIndex={-1}
      />

      <main id="main" className="home-main" tabIndex={-1}>
        <div className="home-column">
          {hero}
          {sections}
          {footer}
        </div>
      </main>

      <form ref={composerRef} className="composer" onSubmit={onSubmit} aria-label="Ask about my work">
        <div className="ask-reply">
          {reply ? (
            <div className="ask-reply-card" key={reply.key} data-kind={reply.kind}>
              <p className="ask-question">
                <span className="sr-only">You asked: </span>
                {reply.question}
              </p>
              {reply.kind === "topic" ? (
                <p className="ask-answer">
                  Showing <a href={`#${reply.id}`}>{topicById[reply.id].label}</a>
                  {reply.term ? <>, searched for &ldquo;{reply.term}&rdquo;</> : null}.
                </p>
              ) : reply.kind === "greeting" ? (
                <>
                  <p className="ask-answer">Hi! I&apos;m {site.name}. Ask about my work, or start with one of these:</p>
                  <ul className="replies-list">{topicChips(["about", "projects", "experience"])}</ul>
                </>
              ) : reply.kind === "unlisted" ? (
                <>
                  <p className="ask-answer">
                    {reply.tool} is not in my toolbox. It lists only the tools I have actually used, grouped by the
                    job each one does.
                    {reply.scanned ? ` Mjolnir, my open-source scanner, does read ${reply.tool} suites.` : null}
                  </p>
                  <ul className="replies-list">
                    {topicChips(reply.scanned ? ["projects", "toolbox"] : ["toolbox", "contact"])}
                  </ul>
                </>
              ) : (
                <>
                  <p className="ask-answer">
                    No section answers that one yet. This is a lookup, not a model, so it only knows the topics on
                    this page. If it matters, ask me on{" "}
                    <a href={contact.linkedin} className="link-underline">
                      LinkedIn
                    </a>
                    .
                  </p>
                  <ul className="replies-list">{topicChips(["about", "experience", "toolbox", "contact"])}</ul>
                </>
              )}
              <button type="button" className="ask-close" onClick={() => setReply(null)} aria-label="Close the reply">
                <CloseIcon size={14} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="composer-panel" data-match={match ?? undefined}>
          {/* Every topic, a jump away, then the profiles as icons. Open from
              the start; only the plus closes it. */}
          <div className="composer-topics" id="composer-topics" hidden={!chipsOpen}>
            <ul className="chips" aria-label="Jump to a section">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <a
                    href={`#${topic.id}`}
                    className="chip"
                    data-topic={topic.id}
                    data-current={current === topic.id ? "" : undefined}
                  >
                    <TopicIcon id={topic.id} size={14} />
                    <span className="chip-label">{topic.label}</span>
                    <span className="chip-short" aria-hidden="true">
                      {SHORT[topic.id]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <ul className="chips chips-routes" aria-label="Profiles and contact">
              <li>
                <a href={contact.linkedin} className="chip chip-route" aria-label="LinkedIn" title="LinkedIn">
                  <LinkedInIcon size={14} />
                </a>
              </li>
              <li>
                <a href={contact.github} className="chip chip-route" aria-label="GitHub" title="GitHub">
                  <GitHubIcon size={14} />
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="chip chip-route" aria-label="Email" title="Email">
                  <MailIcon size={14} />
                </a>
              </li>
            </ul>
          </div>
          <div className="composer-row">
            <button
              type="button"
              className="composer-plus"
              aria-label={chipsOpen ? "Hide the topics" : "Show every topic"}
              aria-pressed={chipsOpen}
              aria-expanded={chipsOpen}
              aria-controls="composer-topics"
              onClick={() => setChipsOpen((v) => !v)}
            >
              <PlusIcon size={17} />
            </button>
            <label htmlFor="ask" className="sr-only">
              Ask about my work
            </label>
            <input
              ref={inputRef}
              id="ask"
              name="ask"
              type="text"
              autoComplete="off"
              enterKeyHint="go"
              placeholder="Ask about my work, e.g. “Playwright”"
              maxLength={140}
              onInput={onInput}
            />
            <kbd className="composer-kbd" aria-hidden="true">
              /
            </kbd>
            <button type="submit" className="composer-send" aria-label="Ask">
              <SendIcon size={16} />
            </button>
          </div>
        </div>
      </form>
      <p className="sr-only" role="status">
        {status}
      </p>
    </div>
  );
}
