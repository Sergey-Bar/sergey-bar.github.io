import type { ToolItem } from "@/components/technical-tag";

/**
 * Engineering toolbox — the instruments, and the disciplines.
 *
 * `toolbox` is the instrument list: names you can check.
 * `competencies` is the practice: what testing is done, and how.
 */

export type ToolGroup = {
  id: string;
  title: string;
  /** Why this group reads the way it does. Set only where it is true. */
  note?: string;
  items: readonly ToolItem[];
};

export type Competency = {
  id: string;
  title: string;
  body: string;
};

export const toolbox: readonly ToolGroup[] = [
  {
    id: "automation",
    title: "Test automation in production",
    items: [
      "Playwright",
      "Maestro",
      "Genymotion",
      "pytest",
      "Python",
      "Bruno",
      "Postman",
    ],
  },
  {
    id: "agents",
    title: "AI coding agents",
    note: "Used to build and to review, with the same rule applied to generated code as to any other.",
    items: ["OpenCode", "Claude Code", "Codex", "Hermes", "Kiro", "Kilo Code"],
  },
  {
    id: "editors",
    title: "Editors and IDEs",
    items: ["Visual Studio Code", "IntelliJ IDEA", "Android Studio"],
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
    id: "api",
    title: "API and integration",
    items: ["REST", "GraphQL", "RabbitMQ", "JSON", "XML"],
  },
  {
    id: "infra",
    title: "CI and infrastructure",
    items: [
      "Jenkins",
      "Azure DevOps",
      "GitHub Actions",
      "Docker",
      "Kubernetes",
      "AWS",
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
    title: "Performance and mutation",
    items: ["k6", "Stryker", "Apollo"],
  },
  {
    id: "quality",
    title: "Quality management",
    items: ["Jira", "Confluence", "TestRail", "Zephyr", "SonarQube"],
  },
  {
    id: "languages",
    title: "Languages",
    items: ["TypeScript", "Python", "SQL", "Java", "Bash", "PowerShell"],
  },
];

/** General testing practice: how the work is done, independent of the product. */
export const competencies: readonly Competency[] = [
  {
    id: "firmware",
    title: "Firmware QA and test design",
    body:
      "Firmware validation · hardware, software and firmware integration testing · architecture and specification review · QA methodologies and risk-based testing · test plan and test case design · functional, regression and integration testing · firmware release and GA sign-off",
  },
  {
    id: "protocol",
    title: "Protocol and low-level debugging",
    body:
      "Wireshark packet analysis · TCP/IP, UDP, HTTP/HTTPS, SSL/TLS, DNS · Ethernet interface bring-up and troubleshooting · switch and server configuration · memory profiling with dotMemory and dotTrace · root cause analysis",
  },
  {
    id: "networks",
    title: "Networks and security",
    body:
      "Configure LAN and WAN · VPNs · firewalls · manage cybersecurity threats",
  },
  {
    id: "automation-scripts",
    title: "Automation and scripting",
    body:
      "Python and Bash · test automation framework development · automated test suite design · test data and fixture management · CI integration with Jenkins, GitHub Actions and Azure DevOps · custom test reporting · JSON, XML and Git",
  },
  {
    id: "defect-release",
    title: "Defect and release management",
    body:
      "Defect lifecycle management · bug reporting with reproduction steps · debugging alongside R&D · fix verification · release readiness and sign-off · quality gates · quality metrics and KPIs",
  },
  {
    id: "environments",
    title: "Test environments and lab setups",
    body:
      "Test setup and topology design · lab environment build · Windows and Linux environments · virtualisation with Hyper-V, KVM and vSphere · Docker · Kubernetes",
  },
  {
    id: "domain",
    title: "Domain and collaboration",
    body:
      "Semiconductor metrology and process control · cross-functional work with R&D, Product and field teams · customer feedback handling · Agile and Scrum",
  },
];

export const credentials = {
  certifications: [
    { name: "Project Management", issuer: "Elevation", year: "2026" },
    { name: "QA Engineer (ISTQB-based)", issuer: "SVCollege", year: "2020" },
    { name: "Generative AI in Testing", issuer: "Online", year: "" },
    { name: "Introduction to Generative AI", issuer: "Online", year: "" },
    { name: "Python Programming Bootcamp", issuer: "Online", year: "" },
  ],
  languages: [
    { name: "Hebrew", level: "Native" },
    { name: "English", level: "Full professional proficiency" },
    { name: "Russian", level: "Limited working proficiency" },
  ],
} as const;