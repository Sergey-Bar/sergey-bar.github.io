/**
 * The conversation's vocabulary, shared by the server-rendered flows and the
 * client director. A topic is one thing a visitor can ask about: it has a chip
 * label, the sentence the chip "says" on the visitor's behalf, a colour, and
 * the words that route a typed question to it.
 */

export type TopicId =
  | "about"
  | "projects"
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
  /** Legacy in-page anchors that used to point at a section of the old site. */
  hashes: readonly string[];
};

export const topics: readonly Topic[] = [
  {
    id: "about",
    label: "About me",
    prompt: "Tell me about yourself",
    description: "About Sergey: the record at a glance and verified outcomes",
    keywords: [
      "about", "who", "yourself", "profile", "background", "based", "where are you",
      "location", "language", "israel", "bio", "intro", "record", "achiev",
      "outcome", "result", "number", "metric", "years", "education", "study",
      "open to", "available", "availability", "role", "position", "title",
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
    id: "experience",
    label: "Experience",
    prompt: "Where have you worked?",
    description: "Experience: roles, periods, scope and outcomes",
    keywords: [
      "experience", "job", "career", "worked", "work history", "work before",
      "work at", "work for", "did you work", "have you worked", "where do you work",
      "company", "companies", "employer", "employment", "previous", "past",
      "flir", "nova", "air force", "enabley", "hp", "indigo", "teledyne", "role",
      "resume", "cv", "history", "timeline", "background",
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
      "interview", "available",
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

const GREETINGS = ["hi", "hello", "hey", "yo", "shalom", "hola", "good morning", "good evening", "sup"];

export type Route = { kind: "topic"; id: TopicId } | { kind: "greeting" } | { kind: "unknown" };

/**
 * Routes a typed question. Each topic scores per keyword found in the text, a
 * phrase outweighing a single word and a long word outweighing a short one;
 * the best score wins, and a bare greeting is answered as one. This is a
 * lookup, not a model: it never pretends to understand more than it does.
 */
export function routeInput(raw: string): Route {
  const text = ` ${raw.trim().toLowerCase().replace(/[?!.,;:'"]+/g, " ").replace(/\s+/g, " ")} `;
  if (!text.trim()) return { kind: "unknown" };
  const words = text.trim().split(" ");
  if (words.length <= 3 && GREETINGS.some((g) => text.trim() === g || text.startsWith(` ${g} `))) {
    return { kind: "greeting" };
  }
  let best: { id: TopicId; score: number } | null = null;
  for (const topic of topics) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (!text.includes(keyword)) continue;
      const phrase = keyword.includes(" ");
      score += phrase ? 4 : keyword.length > 4 ? 2 : 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { id: topic.id, score };
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
  "Where have you worked?",
  "What's in your toolbox?",
  "How do I reach you?",
] as const;
