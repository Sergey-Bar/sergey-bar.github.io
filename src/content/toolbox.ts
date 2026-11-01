import type { ToolItem } from "@/components/technical-tag";

/**
 * Engineering toolbox: the instruments, and the credentials.
 *
 * `toolbox` is the instrument list: names you can check, grouped by the job
 * they do.
 */

export type ToolGroup = {
  id: string;
  title: string;
  /** Why this group reads the way it does. Set only where it is true. */
  note?: string;
  items: readonly ToolItem[];
};

export const toolbox: readonly ToolGroup[] = [
  {
    id: "automation",
    title: "Test automation",
    items: ["Playwright", "Playwright CLI", "pytest", "Stryker", "Appium", "Maestro", "Ranorex", "SoapUI"],
  },
  {
    id: "languages",
    title: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "SQL", "Java", "Bash", "PowerShell", "Node.js", "HTML", "CSS"],
  },
  {
    id: "ai",
    title: "AI engineering and coding agents",
    items: [
      "AI Engineering",
      "MCP",
      "Playwright MCP",
      "RAG",
      "Ollama",
      "Claude Code",
      "Codex",
      "OpenCode",
      "Kiro",
      "Kilo Code",
      "Hermes",
      "Google Antigravity",
    ],
  },
  {
    id: "api",
    title: "API, data and messaging",
    items: [
      "REST",
      "GraphQL",
      "Postman",
      "Bruno",
      "Swagger",
      "RabbitMQ",
      "PostgreSQL",
      "Oracle",
      "DBeaver",
      "JSON",
      "XML",
    ],
  },
  {
    id: "cicd",
    title: "CI/CD, cloud and dev tooling",
    items: [
      "GitHub Actions",
      "Jenkins",
      "Git",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "Visual Studio Code",
      "IntelliJ IDEA",
    ],
  },
  {
    id: "performance",
    title: "Performance, debugging and observability",
    items: [
      "k6",
      "dotMemory",
      "dotTrace",
      "Process Explorer",
      "Windows Performance Monitor",
      "Chrome DevTools",
      "Sentry",
      "Apollo",
    ],
  },
  {
    id: "systems",
    title: "Operating systems and environments",
    items: [
      "Linux",
      "Windows Server",
      "Hyper-V",
      "Windows Services",
      "Windows Registry",
      "Windows Event Viewer",
      "WMI",
      "ETW",
      "Android",
      "iOS",
      "Android Studio",
      "Genymotion",
    ],
  },
  {
    id: "network",
    title: "Network and protocols",
    items: [
      "Wireshark",
      { label: "Clumsy", href: "https://github.com/jagt/clumsy" },
      {
        label: "Tiger Bridge",
        href: "https://www.tiger-technology.com/tiger-bridge/",
      },
      "TCP/IP",
      "UDP",
      "DNS",
      "SSL/TLS",
      "Ethernet",
      "HTTP tunnel",
      "VPN",
    ],
  },
  {
    id: "video",
    title: "Video and analytics",
    items: ["Camera Analytics", "RTSP", "RTP", "ONVIF", "FFmpeg", "ffprobe", "VLC"],
  },
  {
    id: "quality",
    title: "Quality and test management",
    items: ["Jira", "Azure DevOps", "TestRail", "Zephyr", "Confluence", "SonarQube"],
  },
  {
    id: "delivery",
    title: "Product and delivery",
    items: ["Scrum", "Agile", "Figma", "Trello", "Monday", "Make", "Office"],
  },
  {
    id: "support",
    title: "Hardware and support",
    items: ["PC technician", "Computer Guru"],
  },
];

/** General testing practice: how the work is done, independent of the product. */
export const credentials = {
  education: [
    { school: "SVCollege", detail: "QA Engineer", years: "2020–2021" },
    { school: "Elevation", detail: "Project Management", years: "2026" },
  ],
  certifications: [
    "QA Engineer",
    "Test Automation Foundations",
    "Getting Started with DevOps on AWS",
    "Introduction to Generative AI",
  ],
  languages: [
    { name: "Hebrew", level: "Native" },
    { name: "English", level: "Fluent" },
    { name: "Russian", level: "Conversational" },
  ],
} as const;