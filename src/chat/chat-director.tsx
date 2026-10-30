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


import { CheckIcon, MailIcon, ReadIcon, RestartIcon, SendIcon, TopicIcon } from "@/chat/icons";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CloseIcon, MenuIcon, PlusIcon } from "@/components/icons";
import { BotAvatar, Bubble, QuickReplies, UserBubble } from "@/chat/message";
import {
  placeholderPrompts,
  routeInput,
  topicById,
  topicForHash,
  topics,
  type TopicId,
} from "@/chat/topics";
import { Typed } from "@/chat/typed";
import { contact, site } from "@/content/site";

type Entry = { key: number; order: number; node: ReactNode };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** What the bottom line claims to be doing, and for how long. Ten seconds in all. */
/**
 * One line per visit, shown for the whole wait, with the countdown appended
 * at the end. The line rotates: each load takes the next one, so a returning
 * visitor never reads the same joke twice in a row.
 */
const LOADER_LINES: readonly string[] = [
  "Booting the chat. No, the other chat.",
  "Negotiating with the release gate… it wants evidence.",
  "Convincing the flaky test to pass. Just once.",
  "Teaching the AI to say “I don't know”. Harder than it sounds.",
  "Counting open bugs. Lost count. Counting again.",
  "Hiding the button you are told not to press.",
  "Rehearsing the opening line in the mirror.",
  "Warming up the typing indicator. It gets nervous.",
  "Checking whether it works on my machine. It does. Suspicious.",
  "Reading the fourteen recommendations again. Still blushing.",
  "Running the scan on this page. The page is fine. The page is nervous.",
  "Asking the termites to wait outside.",
];
const LOADER_MS = 5_000;
const LOADER_TICK = 250;
const COUNTDOWN_MS = 3_000;

/** The next line in the rotation, remembered across loads. */
function nextLoaderLine(): string {
  const key = "loader-line";
  let index = 0;
  try {
    const stored = Number(localStorage.getItem(key));
    index = Number.isFinite(stored) ? (stored + 1) % LOADER_LINES.length : 0;
    localStorage.setItem(key, String(index));
  } catch {
    index = Math.floor(Math.random() * LOADER_LINES.length);
  }
  return LOADER_LINES[index];
}

/** The first thing the chat says, in the first person and a little warm. */
const OPENING: readonly string[] = [
  "Hi, and welcome. Allow me to introduce myself: I'm Sergey, a QA Tech Lead who makes sure software deserves to ship.",
  "Make yourself at home. Press any button below to start, or just ask me something.",
];

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Streams a reply the way a model would: every word of a text bubble becomes
 * a span, hidden, and they are shown one after another so the bubble grows
 * with the text instead of opening as an empty frame. Cards and quick replies
 * are left whole. The split happens once, on the server-rendered markup React
 * never reconciles again, and only when motion is on; with it off the text is
 * simply there.
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
  const words: HTMLElement[] = [];
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
      word.hidden = true;
      word.textContent = part;
      fragment.appendChild(word);
      words.push(word);
    }
    node.replaceWith(fragment);
  }
  let shown = 0;
  const tick = () => {
    const batch = shown < 6 ? 1 : 2;
    for (let i = 0; i < batch && shown < words.length; i++) words[shown++].hidden = false;
    if (shown < words.length) window.setTimeout(tick, 26);
  };
  tick();
}

/** A card taller than a phone screen opens folded; the director marks it. */
function markTall(message: HTMLElement) {
  if (!message.classList.contains("msg-card")) return;
  const bubble = message.querySelector<HTMLElement>(".bubble");
  if (bubble && window.innerWidth < 768 && bubble.scrollHeight > 360) message.dataset.tall = "";
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
  /** The opening line types out once per visit; a restart does not repeat it. */
  const introducedRef = useRef(false);
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
  const [chipsOpen, setChipsOpen] = useState(true);
  /** A short pulse on the send button after a question goes. */
  const [sent, setSent] = useState(false);
  /** The line at the bottom while the intro waits for the chat to open. */
  const [loader, setLoader] = useState<{ text: string; count: number | null; progress: number } | null>(null);
  /** Topics already answered, marked in the sidebar. */
  const [asked, setAsked] = useState<Set<TopicId>>(() => new Set());
  /** The sidebar as a drawer on narrow screens. */
  const [drawer, setDrawer] = useState(false);

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

  /** On a device with a pointer the composer takes focus, like any chat. */
  const focusComposer = useCallback(() => {
    if (finePointer()) inputRef.current?.focus({ preventScroll: true });
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

  /**
   * The intro leaves on its own: after about ten seconds, or on the first
   * scroll, it lifts and the chat opens with a greeting and every topic as a
   * quick reply. A chip pressed earlier cancels it; a hidden tab waits.
   */
  const greet = useCallback(
    () =>
      enqueue(async () => {
        const run = runRef.current;
        if (rootRef.current?.dataset.state !== "intro") return;
        const shell = rootRef.current;
        if (shell && !motionOff()) {
          shell.dataset.leaving = "";
          await sleep(520);
          delete shell.dataset.leaving;
          if (run !== runRef.current) return;
        }
        openChat();
        followRef.current = true;
        anchorRef.current = null;
        // Typed once, on the first entry of this visit; a restart shows it whole.
        const animate = !introducedRef.current && !motionOff();
        introducedRef.current = true;
        push(
          <Bubble>
            <Typed paragraphs={OPENING} animate={animate} />
          </Bubble>,
        );
        window.scrollTo({ top: 0, behavior: "auto" });
        setStatus(`${site.name}: ${OPENING.join(" ")}`);
        focusComposer();
      }),
    [enqueue, focusComposer, openChat, push],
  );

  /**
   * While the intro waits, a line at the bottom pretends to boot the chat,
   * then counts down the last three seconds and opens it. Five seconds in all.
   * A click on the line, or the first scroll, skips straight to the chat; a
   * hidden tab pauses.
   */
  useEffect(() => {
    if (stage !== "intro") {
      setLoader(null);
      return;
    }
    const booting = document.documentElement.dataset.boot === "";
    let timer = 0;
    let elapsed = 0;
    let text = "";
    const run = () => {
      if (document.visibilityState !== "visible") {
        timer = window.setTimeout(run, 1000);
        return;
      }
      if (!text) text = nextLoaderLine();
      if (elapsed >= LOADER_MS) {
        void greet();
        return;
      }
      const left = LOADER_MS - elapsed;
      setLoader({
        text,
        count: left <= COUNTDOWN_MS ? Math.ceil(left / 1000) : null,
        progress: elapsed / LOADER_MS,
      });
      elapsed += LOADER_TICK;
      timer = window.setTimeout(run, LOADER_TICK);
    };
    timer = window.setTimeout(run, booting ? 3400 : 0);
    const onScroll = () => {
      if (window.scrollY > 40) void greet();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [stage, greet]);

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
        setAsked((prev) => new Set(prev).add(id));
        setDrawer(false);
        setChipsOpen(false);
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
          markTall(message);
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
    setAsked(new Set(topics.map((t) => t.id)));
    setDrawer(false);
    setChipsOpen(false);
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
    setAsked(new Set());
    setDrawer(false);
    setChipsOpen(true);
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, behavior: motionOff() ? "auto" : "smooth" });
    setStatus("Back at the start.");
    // The button that was pressed is gone with the identity bar; focus the heading.
    requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLElement>("#intro-heading")?.focus({ preventScroll: true });
    });
  }, []);

  /* ------------------------------------------------------------ events */


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
      } else if (event.key === "Escape") {
        setDrawer(false);
        setChipsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const expand = (event.target as HTMLElement).closest<HTMLElement>("[data-expand]");
    if (expand) {
      const card = expand.closest<HTMLElement>(".msg-card");
      if (card) {
        card.dataset.open = "";
        delete card.dataset.tall;
      }
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
    <div
      ref={rootRef}
      className="chat-shell"
      data-state={stage}
      data-drawer={drawer ? "" : undefined}
      onClick={onClick}
    >
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

      {/* The sidebar: the conversation's controls, every topic, the pages,
          and the person. On a wide screen it stands beside the chat; on a
          phone it is a drawer behind the menu button. */}
      <aside className="sidebar" id="sidebar" aria-label="Conversation">
        <div className="side-head">
          <button type="button" className="side-close" onClick={() => setDrawer(false)} aria-label="Close menu">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="side-actions">
          <button type="button" className="side-item" onClick={readAll} title="Show every answer at once, in order">
            <ReadIcon size={15} />
            <span>Read everything</span>
          </button>
        </div>

        <p className="side-label" id="side-topics">
          Topics
        </p>
        <ul className="side-list" aria-labelledby="side-topics">
          {topics.map((topic) => {
            const done = asked.has(topic.id);
            return (
              <li key={topic.id}>
                <a
                  href={`#${topic.id}`}
                  className="side-item"
                  data-ask={topic.id}
                  data-topic={topic.id}
                  data-asked={done ? "" : undefined}
                  aria-current={done ? "true" : undefined}
                >
                  <TopicIcon id={topic.id} size={15} />
                  <span>{topic.label}</span>
                  {done ? <CheckIcon size={13} className="side-check" /> : null}
                </a>
              </li>
            );
          })}
        </ul>

        <p className="side-label" id="side-profiles">
          Profiles
        </p>
        <ul className="side-list" aria-labelledby="side-profiles">
          <li>
            <a href={contact.github} className="side-item side-profile">
              <GitHubIcon size={15} />
              <span>GitHub</span>
            </a>
          </li>
          <li>
            <a href={contact.linkedin} className="side-item side-profile">
              <LinkedInIcon size={15} />
              <span>LinkedIn</span>
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
          <BotAvatar />
          <span className="side-foot-name">{site.name}</span>
          {typing ? (
            <span className="side-foot-meta" data-typing="">
              · typing…
            </span>
          ) : null}
        </div>
      </aside>
      <button
        type="button"
        className="drawer-backdrop"
        hidden={!drawer}
        onClick={() => setDrawer(false)}
        aria-label="Close menu"
        tabIndex={-1}
      />

      <div className="chat-main">
        <div className="chat-column">
          <div className="intro-wrap">{intro}</div>

          <header className="identity">
            <button
              type="button"
              className="identity-menu"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              aria-controls="sidebar"
              aria-expanded={drawer}
            >
              <MenuIcon size={16} />
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
      </div>

      {stage === "chat" ? (
        <button
          type="button"
          className="ghost corner-restart"
          onClick={restart}
          aria-label="Start over"
          title="Start over"
        >
          <RestartIcon size={17} />
        </button>
      ) : null}

      {stage === "intro" ? (
        <button
          type="button"
          className="loader"
          onClick={() => void greet()}
          title="Open the chat now"
          data-loader
        >
          <span className="loader-bar" aria-hidden="true">
            <span style={{ width: `${loader ? loader.progress * 100 : 0}%` }} />
          </span>
          <span className="loader-line" aria-hidden="true">
            <span className="loader-caret">▸</span>
            <span className="loader-text">{loader?.text ?? "Booting the chat…"}</span>
            {loader?.count ? <span className="loader-count">Ready in {loader.count}</span> : null}
            <span className="loader-cursor" />
          </span>
          <span className="sr-only">The chat opens in a few seconds. Press to open it now.</span>
        </button>
      ) : null}

      <form className="composer" onSubmit={onSubmit}>
        <div className="composer-panel" data-match={match ?? undefined}>
          {/* Every topic, behind the plus, led by reading mode and followed by
              the profiles as icons, so the panel stays two rows. Pressing a
              topic asks it and closes the panel. */}
          <div className="composer-topics" id="composer-topics" hidden={!chipsOpen}>
            <ul className="chips" aria-label="Topics">
              <li className="chips-lead">
                <button type="button" className="chip chip-read" onClick={readAll}>
                  <ReadIcon size={15} />
                  Read everything
                </button>
              </li>
              {topics.map((topic) => (
                <li key={topic.id}>
                  <a href={`#${topic.id}`} className="chip" data-ask={topic.id} data-topic={topic.id}>
                    <TopicIcon id={topic.id} size={15} />
                    {topic.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="chips chips-routes" aria-label="Profiles and contact">
              <li>
                <a href={contact.github} className="chip chip-route" aria-label="GitHub" title="GitHub">
                  <GitHubIcon size={15} />
                </a>
              </li>
              <li>
                <a href={contact.linkedin} className="chip chip-route" aria-label="LinkedIn" title="LinkedIn">
                  <LinkedInIcon size={15} />
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="chip chip-route" aria-label="Email" title="Email">
                  <MailIcon size={15} />
                </a>
              </li>
            </ul>
          </div>
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
          </div>
          {/* The bar under the field, the way a chat with a model lays it out:
              the plus opens every topic, the pill names the model, the arrow
              sends. There is no microphone. */}
          <div className="composer-bar">
            <button
              type="button"
              className="composer-plus"
              aria-label={chipsOpen ? "Hide the topics" : "Show every topic"}
              aria-pressed={chipsOpen}
              aria-expanded={chipsOpen}
              aria-controls="composer-topics"
              onClick={() => setChipsOpen((v) => !v)}
            >
              <PlusIcon size={18} />
            </button>
            <span className="model-pill" title="The model is a person, at maximum effort. The answers are written, not generated.">
              <span className="model-name">{site.name}</span>
              <span className="model-effort">Ultra</span>
            </span>
            <button type="submit" className="composer-send" aria-label="Send" data-sent={sent ? "" : undefined}>
              <SendIcon size={16} />
            </button>
          </div>
        </div>
        <p className="composer-hint">
          You can ask about: projects · experience · toolbox · recommendations · contact
        </p>
      </form>
    </div>
  );
}
