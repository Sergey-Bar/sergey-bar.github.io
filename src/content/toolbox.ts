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
    items: [
      "Playwright",
      "Playwright CLI",
      "pytest",
      "Python",
      "Ranorex",
      "SoapUI",
      "Appium",
    ],
  },
  {
    id: "agents",
    title: "AI coding agents",
    note: "Used to build and to review, with the same rule applied to generated code as to any other.",
    items: [
      "OpenCode",
      "Claude Code",
      "Codex",
      "Hermes",
      "Kiro",
      "Kilo Code",
      "Google Antigravity",
    ],
  },
  {
    id: "ai",
    title: "AI engineering",
    items: ["AI Engineering", "RAG", "MCP", "Playwright MCP", "Ollama"],
  },
  {
    id: "mobile",
    title: "Mobile",
    items: ["Android", "iOS", "Android Studio", "Maestro", "Genymotion"],
  },
  {
    id: "editors",
    title: "Editors and IDEs",
    items: ["Visual Studio Code", "IntelliJ IDEA"],
  },
  {
    id: "frontend",
    title: "Front-end and browser",
    items: ["HTML", "CSS", "Chrome DevTools", "Figma"],
  },
  {
    id: "api",
    title: "API and integration",
    items: [
      "REST",
      "GraphQL",
      "Swagger",
      "Postman",
      "Bruno",
      "RabbitMQ",
      "JSON",
      "XML",
    ],
  },
  {
    id: "windows",
    title: "Windows diagnostics",
    items: [
      "Windows Event Viewer",
      "Windows Performance Monitor",
      "dotMemory",
      "dotTrace",
      "Process Explorer",
      "WMI",
      "ETW",
    ],
  },
  {
    id: "network",
    title: "Network diagnostics",
    items: [
      "Wireshark",
      { label: "Clumsy", href: "https://github.com/jagt/clumsy" },
      {
        label: "Tiger Bridge",
        href: "https://www.tiger-technology.com/tiger-bridge/",
      },
      "HTTP tunnel",
      "VPN",
    ],
  },
  {
    id: "video",
    title: "Video and analytics",
    items: ["Camera Analytics", "FFmpeg", "ffprobe", "VLC"],
  },
  {
    id: "infra",
    title: "Cloud and infrastructure",
    items: [
      "Jenkins",
      "GitHub Actions",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "Windows Server",
      "Linux",
    ],
  },
  {
    id: "protocols",
    title: "Protocols",
    items: ["TCP/IP", "UDP", "RTP", "RTSP", "ONVIF", "DNS", "SSL/TLS", "Ethernet"],
  },
  {
    id: "data",
    title: "Data and databases",
    items: ["DBeaver", "Oracle", "PostgreSQL", "SQL"],
  },
  {
    id: "performance",
    title: "Performance and observability",
    items: ["k6", "Stryker", "Apollo", "Sentry"],
  },
  {
    id: "quality",
    title: "Quality management",
    items: [
      "Azure DevOps",
      "Jira",
      "Confluence",
      "TestRail",
      "Zephyr",
      "SonarQube",
    ],
  },
  {
    id: "delivery",
    title: "Product and delivery",
    items: ["Trello", "Monday", "Make", "Office"],
  },
  {
    id: "support",
    title: "Hardware and support",
    items: ["PC technician", "Computer Guru"],
  },
  {
    id: "languages",
    title: "Languages",
    items: ["TypeScript", "Python", "SQL", "Java", "Bash", "PowerShell"],
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