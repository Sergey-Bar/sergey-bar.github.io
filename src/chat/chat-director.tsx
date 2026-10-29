"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

import { RestartIcon, SendIcon, TopicIcon } from "@/chat/icons";
import { BotAvatar, Bubble, QuickReplies, UserBubble } from "@/chat/message";
import {
  placeholderPrompts,
  routeInput,
  topicById,
  topicForHash,
  topics,
  type TopicId,
} from "@/chat/topics";
import { availability, contact, site } from "@/content/site";

type Entry = { key: number; order: number; node: ReactNode };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Streams a reply the way a model would: every word of a text bubble becomes
 * a span with its index, and the stylesheet fades them in one after another.
 * Cards and quick replies are left whole. The split happens once, on the
 * server-rendered markup React never reconciles again, and only when motion
 * is on; with it off the text is simply there.
 */
function streamWords(message: HTMLElement) {
  if ("streamed" in message.dataset || motionOff()) return;
  if (!message.classList.contains("msg") || message.classList.contains("msg-card")) return;
  const bubble = message.querySelector<HTMLElement>(".bubble");
  if (!bubble) return;
  message.dataset.streamed = "";
  const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  let index = 0;
  for (const node of nodes) {
    if (!node.data.trim()) continue;
    const fragment = document.createDocumentFragment();
    for (const part of node.data.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        continue;
      }
      const word = document.createElement("span");
      word.className = "w";
      word.style.setProperty("--i", String(Math.min(index++, 70)));
      word.textContent = part;
      fragment.appendChild(word);
    }
    node.replaceWith(fragment);
  }
}

/** True when the visitor, or the OS, has asked this site not to move. */
function motionOff() {
  return (
    document.documentElement.dataset.motion === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The conversation. The answers themselves are server-rendered and arrive as
 * `flows`; this component decides when each one is shown, in what order, and
 * with what pacing, and it owns the visitor's side: the composer, the typed
 * questions, and the two replies it can give on its own (a greeting and an
 * honest "I don't know that one").
 *
 * Nothing here is required for the content to exist. Without JavaScript the
 * page is the intro followed by every answer in order; with it, the page
 * becomes a chat.
 */
export function ChatDirector({
  intro,
  flows,
  topbar,
}: {
  intro: ReactNode;
  flows: ReactNode;
  topbar: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef(0);
  const keyRef = useRef(0);
  const runRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  /** The question the view is currently pinned under; null means "the end". */
  const anchorRef = useRef<HTMLElement | null>(null);
  /** Cleared the moment the visitor scrolls on their own. */
  const followRef = useRef(true);

  const [stage, setStage] = useState<"intro" | "chat">("intro");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState(false);
  /** One short line for assistive technology, instead of a live region over the whole log. */
  const [status, setStatus] = useState("");
  /** The topic the router would answer with, previewed on the chips as the visitor types. */
  const [match, setMatch] = useState<TopicId | null>(null);
  /** On a phone the chip row shows three and folds the rest behind a count. */
  const [chipsOpen, setChipsOpen] = useState(false);
  /** A short pulse on the send button after a question goes. */
  const [sent, setSent] = useState(false);

  /* ----------------------------------------------------------- helpers */

  /**
   * Follows the conversation the way a reader would: the question is pinned
   * just under the identity bar and replies fill the screen beneath it. Once
   * they overflow, the view stops moving so nothing is pulled away mid-read,
   * and a visitor who scrolls on their own is never fought.
   */
  const follow = useCallback((force = false) => {
    if (!force && !followRef.current) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    let top = max;
    const anchor = anchorRef.current;
    if (anchor) {
      const bar = rootRef.current?.querySelector<HTMLElement>(".identity");
      const offset = (bar?.offsetHeight || 64) + 10;
      top = Math.min(max, anchor.getBoundingClientRect().top + window.scrollY - offset);
    }
    if (Math.abs(top - window.scrollY) < 2) return;
    window.scrollTo({ top, behavior: motionOff() ? "auto" : "smooth" });
  }, []);

  /** Appends a client-rendered message and returns its element, committed synchronously. */
  const push = useCallback((node: ReactNode) => {
    const key = ++keyRef.current;
    flushSync(() => setEntries((list) => [...list, { key, order: ++orderRef.current, node }]));
    return logRef.current?.querySelector<HTMLElement>(`[data-entry="${key}"]`) ?? null;
  }, []);

  /** Switches to the chat synchronously, so the log is laid out before anything measures it. */
  const openChat = useCallback(() => {
    flushSync(() => setStage("chat"));
  }, []);

  /** Shows the typing indicator for about as long as the reply takes to read. */
  const think = useCallback(
    async (run: number, weight: number) => {
      if (motionOff()) return;
      setTyping(true);
      await sleep(Math.min(1100, Math.max(420, 260 + weight * 4)));
      if (run === runRef.current) setTyping(false);
    },
    [],
  );

  /** Serialises conversations so two chips pressed in a row play in order. */
  const enqueue = useCallback((job: () => Promise<void>) => {
    const run = runRef.current;
    queueRef.current = queueRef.current
      .then(() => (run === runRef.current ? job() : undefined))
      .catch((error: unknown) => {
        // One failed answer must not silence every later one.
        console.error(error);
      });
    return queueRef.current;
  }, []);

  /* ------------------------------------------------------------- flows */

  const ask = useCallback(
    (id: TopicId, typed?: string) =>
      enqueue(async () => {
        const run = runRef.current;
        const flow = logRef.current?.querySelector<HTMLElement>(`[data-flow="${id}"]`);
        if (!flow) return;
        openChat();
        followRef.current = true;

        if ("sent" in flow.dataset) {
          // Already on screen: a second question gets the visitor's own words
          // echoed and a pointer back to the answer, not a duplicate of it.
          anchorRef.current = typed ? push(<UserBubble>{typed}</UserBubble>) : null;
          follow(true);
          await think(run, 10);
          if (run !== runRef.current) return;
          setStatus(`${site.name}: that answer is already above.`);
          push(
            <Bubble>
              <p>
                That one is above.{" "}
                <a href={`#${id}`} className="link-underline">
                  Jump to it
                </a>
                , or ask about something else.
              </p>
            </Bubble>,
          );
          follow();
          return;
        }

        const canned = flow.querySelector<HTMLElement>(":scope > .msg.user");
        let anchor: HTMLElement | null = canned;
        if (typed) {
          if (canned) canned.hidden = true;
          anchor = push(<UserBubble>{typed}</UserBubble>);
        }

        flow.style.order = String(++orderRef.current);
        flow.dataset.sent = "";
        anchorRef.current = anchor;
        follow(true);
        setStatus(`${site.name} is answering: ${topicById[id].description}.`);

        const messages = Array.from(
          flow.querySelectorAll<HTMLElement>(":scope > [data-msg]:not(.user)"),
        );
        for (const [index, message] of messages.entries()) {
          if (run !== runRef.current) return;
          await think(run, message.textContent?.length ?? 0);
          if (run !== runRef.current) return;
          streamWords(message);
          message.dataset.sent = "";
          follow();
          // The reading cursor lands on the answer as its first message arrives.
          if (index === 0 && !finePointer()) flow.focus({ preventScroll: true });
          else if (index === 0 && document.activeElement === document.body) flow.focus({ preventScroll: true });
        }
        if (run === runRef.current) setStatus(`${site.name} finished answering about ${topicById[id].label.toLowerCase()}.`);
      }),
    [enqueue, follow, openChat, push, think],
  );

  const reply = useCallback(
    (typed: string, answer: ReactNode) =>
      enqueue(async () => {
        const run = runRef.current;
        openChat();
        followRef.current = true;
        anchorRef.current = push(<UserBubble>{typed}</UserBubble>);
        follow(true);
        await think(run, 40);
        if (run !== runRef.current) return;
        const node = push(answer);
        follow();
        setStatus(`${site.name}: ${node?.textContent?.slice(0, 160) ?? "replied"}`);
      }),
    [enqueue, follow, openChat, push, think],
  );

  /**
   * Reading mode: every answer, in the record's own order, shown at once with
   * no pacing. For the visitor who would rather scan than converse.
   */
  const readAll = useCallback(() => {
    runRef.current += 1;
    queueRef.current = Promise.resolve();
    anchorRef.current = null;
    followRef.current = false;
    setTyping(false);
    setEntries([]);
    openChat();
    const log = logRef.current;
    if (!log) return;
    log.querySelectorAll<HTMLElement>("[data-flow]").forEach((flow, index) => {
      flow.style.order = String(index + 1);
      flow.dataset.sent = "";
      flow.querySelectorAll<HTMLElement>(":scope > [data-msg]").forEach((m) => {
        m.dataset.sent = "";
      });
      const canned = flow.querySelector<HTMLElement>(":scope > .msg.user");
      if (canned) canned.hidden = false;
    });
    orderRef.current = log.querySelectorAll("[data-flow]").length + 1;
    rootRef.current?.setAttribute("data-mode", "read");
    window.scrollTo({ top: 0, behavior: "auto" });
    setStatus("Everything, in order.");
    requestAnimationFrame(() => {
      log.querySelector<HTMLElement>("[data-flow]")?.focus({ preventScroll: true });
    });
  }, [openChat]);

  const restart = useCallback(() => {
    runRef.current += 1;
    queueRef.current = Promise.resolve();
    anchorRef.current = null;
    setTyping(false);
    setEntries([]);
    setStage("intro");
    orderRef.current = 0;
    const log = logRef.current;
    if (log) {
      log.querySelectorAll<HTMLElement>("[data-flow]").forEach((flow) => {
        delete flow.dataset.sent;
        flow.style.removeProperty("order");
        flow.querySelectorAll<HTMLElement>(":scope > [data-msg]:not(.user)").forEach((m) => {
          delete m.dataset.sent;
        });
        const canned = flow.querySelector<HTMLElement>(":scope > .msg.user");
        if (canned) canned.hidden = false;
      });
    }
    rootRef.current?.removeAttribute("data-mode");
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, behavior: motionOff() ? "auto" : "smooth" });
    setStatus("Back at the start.");
    // The button that was pressed is gone with the identity bar; focus the heading.
    requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLElement>("#intro-heading")?.focus({ preventScroll: true });
    });
  }, []);

  /* ------------------------------------------------------------ events */

  /** On a device with a pointer the composer takes focus, like any chat. */
  const focusComposer = useCallback(() => {
    if (finePointer()) inputRef.current?.focus({ preventScroll: true });
  }, []);

  /** The opening veil ends on a click or any key; the hero then rises at once. */
  const skipBoot = useCallback(() => {
    if (document.documentElement.dataset.boot === "") {
      document.documentElement.dataset.boot = "skip";
    }
    focusComposer();
  }, [focusComposer]);

  useEffect(() => {
    if (document.documentElement.dataset.boot !== "") {
      focusComposer();
      return;
    }
    window.addEventListener("keydown", skipBoot, { once: true });
    window.addEventListener("pointerdown", skipBoot, { once: true });
    const timer = window.setTimeout(skipBoot, 3400);
    return () => {
      window.removeEventListener("keydown", skipBoot);
      window.removeEventListener("pointerdown", skipBoot);
      window.clearTimeout(timer);
    };
  }, [focusComposer, skipBoot]);

  /** "/" focuses the composer from anywhere; Escape hands focus back to the page. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input) return;
      const target = event.target as HTMLElement | null;
      const editing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        input.focus();
      } else if (event.key === "Escape" && document.activeElement === input) {
        input.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-read-all]")) {
      event.preventDefault();
      readAll();
      return;
    }
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-ask]");
    if (!target) return;
    event.preventDefault();
    const id = target.dataset.ask as TopicId;
    if (topics.some((t) => t.id === id)) void ask(id);
  };

  /** Enter sends; the explicit handler covers inputs that skip implicit submission. */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const onInput = () => {
    const route = routeInput(inputRef.current?.value ?? "");
    setMatch(route.kind === "topic" ? route.id : null);
  };

  const submit = () => {
    const input = inputRef.current;
    const text = input?.value.trim() ?? "";
    if (!text || !input) return;
    input.value = "";
    setMatch(null);
    setSent(true);
    window.setTimeout(() => setSent(false), 650);
    const route = routeInput(text);
    if (route.kind === "topic") {
      void ask(route.id, text);
    } else if (route.kind === "greeting") {
      void reply(
        text,
        <>
          <Bubble>
            <p>Hi! I&apos;m {site.name}. Ask me anything about my work, or pick a topic below.</p>
          </Bubble>
          <QuickReplies ids={["about", "projects", "experience"]} />
        </>,
      );
    } else {
      void reply(
        text,
        <>
          <Bubble>
            <p>
              I don&apos;t have an answer for that one yet. This is a lookup, not a model, so
              it only knows the topics below.
            </p>
            <p>
              If it matters, ask me on{" "}
              <a href={contact.linkedin} className="link-underline">
                LinkedIn
              </a>
              .
            </p>
          </Bubble>
          <QuickReplies ids={topics.map((t) => t.id)} />
        </>,
      );
    }
  };

  /* ----------------------------------------------------------- effects */

  /** A legacy anchor or `?topic=` opens that conversation on arrival. */
  useEffect(() => {
    const fromUrl = () =>
      topicForHash(location.hash) ??
      topicForHash(new URLSearchParams(location.search).get("topic") ?? "");
    const initial = fromUrl();
    if (initial) void ask(initial);
    const onHash = () => {
      const id = fromUrl();
      if (!id) return;
      const flow = logRef.current?.querySelector<HTMLElement>(`[data-flow="${id}"]`);
      // An answer already on screen: the browser's own jump to it is the whole response.
      if (flow && "sent" in flow.dataset) return;
      void ask(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [ask]);

  /** The typing indicator counts as a message for the view to follow. */
  useEffect(() => {
    if (typing) follow();
  }, [typing, follow]);

  /** A wheel, a swipe or an arrow key means the visitor is reading: stop following. */
  useEffect(() => {
    const inComposer = (event: Event) =>
      (event.target as HTMLElement | null)?.closest?.(".composer") != null;
    const stop = (event: Event) => {
      if (inComposer(event)) return;
      followRef.current = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (inComposer(event)) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        followRef.current = false;
      }
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /**
   * The composer types its own suggestions while it waits. It writes the
   * placeholder attribute directly (React's prop never changes, so it never
   * fights it): no re-render per character. It stops the moment motion is
   * turned off, and resumes when it is turned back on.
   */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    let index = 0;
    let timer = 0;
    let cancelled = false;
    const run = (text: string, length: number, deleting: boolean) => {
      if (cancelled) return;
      if (motionOff()) {
        input.placeholder = placeholderPrompts[0];
        timer = window.setTimeout(() => run(placeholderPrompts[index], placeholderPrompts[index].length, false), 1500);
        return;
      }
      input.placeholder = text.slice(0, length);
      if (!deleting && length < text.length) {
        timer = window.setTimeout(() => run(text, length + 1, false), 42);
      } else if (!deleting) {
        timer = window.setTimeout(() => run(text, length, true), 2200);
      } else if (length > 0) {
        timer = window.setTimeout(() => run(text, length - 1, true), 18);
      } else {
        index = (index + 1) % placeholderPrompts.length;
        timer = window.setTimeout(() => run(placeholderPrompts[index], 1, false), 500);
      }
    };
    run(placeholderPrompts[0], placeholderPrompts[0].length, false);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  /* ------------------------------------------------------------ render */

  return (
    <div ref={rootRef} className="chat-shell" data-state={stage} onClick={onClick}>
      <div className="boot" aria-hidden="true">
        <p className="boot-line">
          {["Hello,", "I'm", site.name.split(" ")[0]].map((word, index) => (
            <span key={word} className="mask" style={{ "--w": index } as CSSProperties}>
              <span className={index === 2 ? "name" : undefined}>{word}</span>
            </span>
          ))}
        </p>
        <p className="boot-line boot-line-2">
          <span className="mask" style={{ "--w": 0 } as CSSProperties}>
            <span>Welcome</span>
          </span>
        </p>
        <span className="boot-rule" />
      </div>
      <div className="chat-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="cursor-glow" data-cursor-glow />
        <span className="grain chat-grain" />
      </div>
      <span className="watermark watermark-l" aria-hidden="true">
        {site.name}
      </span>
      <span className="watermark watermark-r" aria-hidden="true">
        QA Tech Lead
      </span>

      {topbar}

      <div className="chat-column">
        <div className="intro-wrap">{intro}</div>

        <header className="identity">
          <BotAvatar />
          <div className="identity-text">
            <p className="identity-name">{site.name}</p>
            <p className="identity-status" data-typing={typing ? "" : undefined}>
              <span className="status-dot" aria-hidden="true" />
              {typing ? "typing…" : availability.text}
            </p>
          </div>
          <button
            type="button"
            className="identity-restart"
            onClick={readAll}
            aria-label="Read all"
            title="Show every answer at once, in order"
          >
            <span className="identity-restart-label">Read all</span>
          </button>
          <button
            type="button"
            className="identity-restart"
            onClick={restart}
            aria-label="Start over"
            title="Back to the intro; the conversation is cleared"
          >
            <RestartIcon size={15} />
            <span className="identity-restart-label">Start over</span>
          </button>
        </header>

        <div ref={logRef} className="log">
          {flows}
          {entries.map((entry) => (
            <div key={entry.key} className="entry" data-entry={entry.key} style={{ order: entry.order }}>
              {entry.node}
            </div>
          ))}
          {typing ? (
            <div className="msg typing" style={{ order: 1_000_000 }} role="status">
              <BotAvatar />
              <div className="bubble" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="sr-only">{site.name} is typing</span>
            </div>
          ) : null}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <div className="composer-panel" data-match={match ?? undefined}>
          <div className="composer-row">
            <label htmlFor="ask" className="sr-only">
              Ask about my work
            </label>
            <input
              ref={inputRef}
              id="ask"
              name="ask"
              type="text"
              autoComplete="off"
              enterKeyHint="send"
              placeholder={placeholderPrompts[0]}
              maxLength={140}
              onKeyDown={onKeyDown}
              onInput={onInput}
            />
            <kbd className="composer-kbd" aria-hidden="true">/</kbd>
            <button type="submit" className="composer-send" aria-label="Send" data-sent={sent ? "" : undefined}>
              <SendIcon size={17} />
            </button>
          </div>
          <ul className="chips" aria-label="Topics" data-collapsed={chipsOpen ? undefined : ""}>
            {topics.map((topic) => (
              <li key={topic.id}>
                <a href={`#${topic.id}`} className="chip" data-ask={topic.id} data-topic={topic.id}>
                  <TopicIcon id={topic.id} size={15} />
                  {topic.label}
                </a>
              </li>
            ))}
            <li className="chips-more-item">
              <button
                type="button"
                className="chip chips-more"
                aria-expanded={chipsOpen}
                onClick={() => setChipsOpen((v) => !v)}
              >
                {chipsOpen ? "Fewer" : `+${topics.length - 3}`}
              </button>
            </li>
          </ul>
        </div>
        <p className="composer-hint">
          You can ask about: projects · experience · toolbox · recommendations · contact
        </p>
      </form>
    </div>
  );
}
