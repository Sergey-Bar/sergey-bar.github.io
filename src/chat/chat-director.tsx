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

import { RestartIcon, SendIcon } from "@/chat/icons";
import { BotAvatar, Bubble, QuickReplies, UserBubble } from "@/chat/message";
import {
  placeholderPrompts,
  routeInput,
  topicForHash,
  topics,
  type TopicId,
} from "@/chat/topics";
import { availability, site } from "@/content/site";

type Entry = { key: number; order: number; node: ReactNode };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
  chips,
  topbar,
}: {
  intro: ReactNode;
  flows: ReactNode;
  chips: ReactNode;
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
  const [placeholder, setPlaceholder] = useState<string>(placeholderPrompts[0]);

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
      const offset = (bar?.offsetHeight ?? 64) + 10;
      top = Math.min(max, anchor.getBoundingClientRect().top + window.scrollY - offset);
    }
    if (Math.abs(top - window.scrollY) < 2) return;
    window.scrollTo({ top, behavior: motionOff() ? "auto" : "smooth" });
  }, []);

  /** Appends a client-rendered message and resolves with its element once committed. */
  const push = useCallback(async (node: ReactNode) => {
    const key = ++keyRef.current;
    setEntries((list) => [...list, { key, order: ++orderRef.current, node }]);
    await sleep(0);
    return logRef.current?.querySelector<HTMLElement>(`[data-entry="${key}"]`) ?? null;
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
    queueRef.current = queueRef.current.then(() => (run === runRef.current ? job() : undefined));
    return queueRef.current;
  }, []);

  /* ------------------------------------------------------------- flows */

  const ask = useCallback(
    (id: TopicId, typed?: string) =>
      enqueue(async () => {
        const run = runRef.current;
        const flow = logRef.current?.querySelector<HTMLElement>(`[data-flow="${id}"]`);
        if (!flow) return;
        setStage("chat");
        followRef.current = true;

        if ("sent" in flow.dataset) {
          // Already on screen: a second question gets the visitor's own words
          // echoed and a pointer back to the answer, not a duplicate of it.
          anchorRef.current = typed ? await push(<UserBubble>{typed}</UserBubble>) : null;
          follow(true);
          await think(run, 10);
          await push(
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
          anchor = await push(<UserBubble>{typed}</UserBubble>);
        }

        flow.style.order = String(++orderRef.current);
        flow.dataset.sent = "";
        anchorRef.current = anchor;
        follow(true);

        const messages = Array.from(
          flow.querySelectorAll<HTMLElement>(":scope > [data-msg]:not(.user)"),
        );
        for (const message of messages) {
          if (run !== runRef.current) return;
          await think(run, message.textContent?.length ?? 0);
          if (run !== runRef.current) return;
          message.dataset.sent = "";
          follow();
        }
      }),
    [enqueue, follow, push, think],
  );

  const reply = useCallback(
    (typed: string, answer: ReactNode) =>
      enqueue(async () => {
        const run = runRef.current;
        setStage("chat");
        followRef.current = true;
        anchorRef.current = await push(<UserBubble>{typed}</UserBubble>);
        follow(true);
        await think(run, 40);
        if (run !== runRef.current) return;
        await push(answer);
        follow();
      }),
    [enqueue, follow, push, think],
  );

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
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, behavior: motionOff() ? "auto" : "smooth" });
  }, []);

  /* ------------------------------------------------------------ events */

  /** The opening veil ends on a click or any key; the hero then rises at once. */
  const skipBoot = useCallback(() => {
    if (document.documentElement.dataset.boot === "") {
      document.documentElement.dataset.boot = "skip";
    }
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.boot !== "") return;
    window.addEventListener("keydown", skipBoot, { once: true });
    const timer = window.setTimeout(skipBoot, 3400);
    return () => {
      window.removeEventListener("keydown", skipBoot);
      window.clearTimeout(timer);
    };
  }, [skipBoot]);

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".boot")) {
      skipBoot();
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

  const submit = () => {
    const input = inputRef.current;
    const text = input?.value.trim() ?? "";
    if (!text || !input) return;
    input.value = "";
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
      if (id) void ask(id);
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
    const stop = () => {
      followRef.current = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        stop();
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

  /** The composer types its own suggestions while it waits. */
  useEffect(() => {
    if (motionOff()) {
      setPlaceholder(placeholderPrompts[0]);
      return;
    }
    let index = 0;
    let timer = 0;
    let cancelled = false;
    const run = (text: string, length: number, deleting: boolean) => {
      if (cancelled) return;
      setPlaceholder(text.slice(0, length));
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
            <p className="identity-status">
              <span className="status-dot" aria-hidden="true" />
              {availability.text}
            </p>
          </div>
          <button type="button" className="identity-restart" onClick={restart} aria-label="Start over">
            <RestartIcon size={15} />
            <span className="identity-restart-label">Start over</span>
          </button>
        </header>

        <div ref={logRef} className="log" role="log" aria-live="polite">
          {flows}
          {entries.map((entry) => (
            <div key={entry.key} className="entry" data-entry={entry.key} style={{ order: entry.order }}>
              {entry.node}
            </div>
          ))}
          {typing ? (
            <div className="msg typing" style={{ order: 1_000_000 }} aria-label={`${site.name} is typing`}>
              <BotAvatar />
              <div className="bubble">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <div className="composer-panel">
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
              placeholder={placeholder}
              maxLength={140}
              onKeyDown={onKeyDown}
            />
            <button type="submit" className="composer-send" aria-label="Send">
              <SendIcon size={17} />
            </button>
          </div>
          {chips}
        </div>
        <p className="composer-hint">
          You can ask about: projects · experience · toolbox · recommendations · contact
        </p>
      </form>
    </div>
  );
}
