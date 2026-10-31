/**
 * The conversation's vocabulary, shared by the server-rendered flows and the
 * client director. A topic is one thing a visitor can ask about: it has a chip
 * label, the sentence the chip "says" on the visitor's behalf, a colour, and
 * the words that route a typed question to it.
 */

import { mjolnir } from "@/content/mjolnir-facts";
import { toolbox } from "@/content/toolbox";

export type TopicId =
  | "about"
  | "projects"
  | "cases"
  | "experience"
  | "recommendations"
  | "toolbox"
  | "contact"
  | "fun";

export type Topic = {
  id: TopicId;
  /** The chip in the composer. */
  label: string;
  /** What the visitor's bubble says when the chip is pressed. */
  prompt: string;
  /** Accessible description of the flow. */
  description: string;
  /** Words that route a typed question here. Lower case; matched as substrings. */
  keywords: readonly string[];
  /** Names matched as whole words only, so a short one cannot catch a longer word. */
  terms?: readonly string[];
  /** Legacy in-page anchors that used to point at a section of the old site. */
  hashes: readonly string[];
};

/** Lower case, punctuation as space: a typed question and a name compare alike. */
function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[?!.,;:'"]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Tool names that are also everyday words. As a term each one would send a
 * sentence like "what did you make?" to the toolbox, so they stay out.
 */
const COMMON_WORDS = new Set(["make", "office", "monday", "rest", "clumsy", "apollo"]);

/**
 * Every name in the toolbox routes to it, so a question about a tool the
 * toolbox lists is answered by the toolbox rather than missed by a hand-kept
 * keyword list.
 */
function toolTerms(): string[] {
  const names = toolbox
    .flatMap((group) => group.items)
    .map((item) => normalize(typeof item === "string" ? item : item.label));
  return [...new Set(names)].filter((name) => name && !COMMON_WORDS.has(name));
}

/**
 * Well-known tools the toolbox does not list. Asked about one, the reply says
 * so plainly and points at what is listed, instead of not answering at all.
 */
const UNLISTED: Record<string, string> = {
  selenium: "Selenium",
  webdriver: "WebDriver",
  webdriverio: "WebdriverIO",
  cypress: "Cypress",
  puppeteer: "Puppeteer",
  testcafe: "TestCafe",
  "robot framework": "Robot Framework",
  cucumber: "Cucumber",
  jmeter: "JMeter",
  loadrunner: "LoadRunner",
  katalon: "Katalon",
  testng: "TestNG",
  junit: "JUnit",
  jest: "Jest",
  mocha: "Mocha",
  vitest: "Vitest",
};

export const topics: readonly Topic[] = [
  {
    id: "about",
    label: "About me",
    prompt: "Tell me about yourself",
    description: "About Sergey: the record at a glance and verified outcomes",
    keywords: [
      "about you", "about yourself", "yourself", "who are you", "who is", "profile",
      "background", "based", "where are you", "location", "language", "israel",
      "bio", "intro", "record", "achiev", "outcome", "result", "number", "metric",
      "years", "education", "study", "open to", "available", "availability",
      "position", "title", "introduce", "where do you live", "live in", "located",
      "relocat",
    ],
    hashes: ["profile", "about"],
  },
  {
    id: "projects",
    label: "Projects",
    prompt: "Show me your projects",
    description: "Projects: Mjolnir and Automate, both open source",
    keywords: [
      "project", "mjolnir", "automate", "open source", "open-source", "repo",
      "github", "your work", "my work", "see work", "portfolio", "built", "build",
      "scanner", "npm", "product", "show me", "what have you made", "side project",
    ],
    hashes: ["projects"],
  },
  {
    id: "cases",
    label: "Case studies",
    prompt: "Walk me through your work",
    description: "Case studies: the problem, the approach, the evidence and the outcome",
    keywords: [
      "case stud", "case-stud", "walk me", "deep dive", "example", "story", "how did you",
      "memory leak", "from zero", "green build", "evidence", "proof", "outcome", "impact",
      "problem you solved", "hardest", "proud",
    ],
    hashes: ["cases", "case-studies", "work"],
  },
  {
    id: "experience",
    label: "Experience",
    prompt: "Where have you worked?",
    description: "Experience: roles, periods, scope and outcomes",
    keywords: [
      "experience", "job", "career", "worked", "work history", "work before",
      "work at", "work for", "did you work", "have you worked", "where do you work",
      "company", "companies", "employer", "employment", "previous", "past",
      "flir", "nova", "air force", "enabley", "hp", "indigo", "teledyne", "role",
      "history", "timeline", "background",
    ],
    hashes: ["experience"],
  },
  {
    id: "recommendations",
    label: "Recommendations",
    prompt: "What do people say about you?",
    description: "Recommendations from managers and colleagues on LinkedIn",
    keywords: [
      "recommend", "review", "people say", "reference", "testimonial", "feedback",
      "colleague", "manager", "endorse", "opinion", "say about",
    ],
    hashes: ["recommendations"],
  },
  {
    id: "toolbox",
    label: "Toolbox",
    prompt: "What's in your toolbox?",
    description: "The engineering toolbox, grouped by the job each tool does",
    keywords: [
      "tool", "skill", "stack", "tech", "python", "playwright", "automation",
      "framework", "language", "ci", "pytest", "appium", "cloud", "ai", "agent",
      "mcp", "ollama", "docker", "kubernetes", "sql", "oracle", "what can you",
      "know how", "use",
    ],
    terms: toolTerms(),
    hashes: ["toolbox"],
  },
  {
    id: "contact",
    label: "Contact",
    prompt: "How do I reach you?",
    description: "How to get in touch: LinkedIn and GitHub",
    keywords: [
      "contact", "email", "mail", "reach", "linkedin", "hire", "hiring", "talk",
      "call", "phone", "message", "touch", "connect", "meet", "chat with",
      "interview", "available", "phone number", "cv", "resume",
    ],
    hashes: ["contact"],
  },
  {
    id: "fun",
    label: "Something fun",
    prompt: "Show me something fun",
    description: "An after-hours experiment: the button you are told not to press",
    keywords: ["fun", "game", "button", "play", "toy", "bored", "easter", "secret", "surprise"],
    hashes: ["fun", "play"],
  },
];

export const topicById = Object.fromEntries(topics.map((t) => [t.id, t])) as Record<
  TopicId,
  Topic
>;

const GREETINGS = [
  "hi", "hello", "hey", "yo", "shalom", "hola", "good morning", "good evening", "sup",
  "שלום", "היי", "הי", "אהלן", "בוקר טוב", "ערב טוב",
];

export type Route =
  | { kind: "topic"; id: TopicId }
  | { kind: "greeting" }
  /** `scanned`: Mjolnir reads suites written in it, which the reply says. */
  | { kind: "unlisted"; tool: string; scanned: boolean }
  | { kind: "unknown" };

const matchers = new Map<string, RegExp>();

/**
 * A keyword matches at the start of a word, so "project" catches "projects";
 * a phrase must also end on a whole word, so "about you" does not catch
 * "about your projects". A whole term must start and end on a word boundary,
 * so "java" does not catch "javascript" and "k6" stands on its own. Compiled
 * once per keyword.
 */
function matcher(keyword: string, whole = false): RegExp {
  const key = `${whole ? "=" : "~"}${keyword}`;
  let re = matchers.get(key);
  if (!re) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = whole
      ? new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "u")
      : new RegExp(keyword.includes(" ") ? `\\b${escaped}\\b` : `\\b${escaped}`);
    matchers.set(key, re);
  }
  return re;
}

/** Points for one match: a phrase outweighs a long word, a long word a short one. */
function weight(keyword: string): number {
  return keyword.includes(" ") ? 4 : keyword.length > 4 ? 2 : 1;
}

/**
 * Routes a typed question. Each topic scores per keyword found in the text, a
 * phrase outweighing a single word and a long word outweighing a short one;
 * the best score wins, and a bare greeting is answered as one. This is a
 * lookup, not a model: it never pretends to understand more than it does.
 */
export function routeInput(raw: string): Route {
  const text = ` ${normalize(raw)} `;
  if (!text.trim()) return { kind: "unknown" };
  const words = text.trim().split(" ");
  if (words.length <= 3 && GREETINGS.some((g) => text.trim() === g || text.startsWith(` ${g} `))) {
    return { kind: "greeting" };
  }
  let best: { id: TopicId; score: number; longest: number } | null = null;
  for (const topic of topics) {
    let score = 0;
    let longest = 0;
    const found = [
      ...topic.keywords.filter((keyword) => matcher(keyword).test(text)),
      ...(topic.terms ?? []).filter((term) => !topic.keywords.includes(term) && matcher(term, true).test(text)),
    ];
    for (const keyword of found) {
      score += weight(keyword);
      longest = Math.max(longest, keyword.length);
    }
    if (score === 0) continue;
    // A tie goes to the topic whose evidence is the most specific word.
    if (!best || score > best.score || (score === best.score && longest > best.longest)) {
      best = { id: topic.id, score, longest };
    }
  }
  // A tool the toolbox does not list is answered as such, unless the question
  // is plainly about something else as well ("how did you replace Selenium?").
  const unlisted = Object.keys(UNLISTED).find((name) => matcher(name, true).test(text));
  if (unlisted && (!best || best.id === "toolbox")) {
    const tool = UNLISTED[unlisted];
    return { kind: "unlisted", tool, scanned: (mjolnir.rules.frameworks as readonly string[]).includes(tool) };
  }
  return best ? { kind: "topic", id: best.id } : { kind: "unknown" };
}

/** A legacy anchor such as `#projects` resolves to the topic that replaced it. */
export function topicForHash(hash: string): TopicId | null {
  const key = hash.replace(/^#/, "").toLowerCase();
  if (!key) return null;
  return topics.find((t) => t.hashes.includes(key) || t.id === key)?.id ?? null;
}

/** Placeholder prompts the composer types out while it waits. */
export const placeholderPrompts = [
  "Ask about my projects…",
  "Walk me through your work",
  "Where have you worked?",
  "What's in your toolbox?",
  "How do I reach you?",
] as const;
