import type { TopicId } from "@/home/topics";

/**
 * Topic glyphs in lucide's geometry at lucide's 1.5px stroke, so they sit with
 * the two interface icons already on the site. Each is a few paths; pulling
 * the icon package for seven glyphs would cost more than every animation here.
 */

type IconProps = { className?: string; size?: number };

function svgProps({ className, size = 16 }: IconProps) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
    className,
  };
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M10 11H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4" />
      <path d="M20 11h-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4" />
    </svg>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M14.7 6.3a4 4 0 0 0 5 5L13 18a2.1 2.1 0 0 1-3-3l6.7-6.7a4 4 0 0 0-2-2Z" />
      <path d="m3 21 4-4" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

export function RestartIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function CaseIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M6 3h8l5 5v13H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h7M9 17h7" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

export function ReadIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 5h16M4 10h16M4 15h10M4 20h7" />
    </svg>
  );
}

export function TopicIcon({ id, size }: { id: TopicId; size?: number }) {
  switch (id) {
    case "about":
      return <UserIcon size={size} />;
    case "projects":
      return <LayersIcon size={size} />;
    case "cases":
      return <CaseIcon size={size} />;
    case "experience":
      return <BriefcaseIcon size={size} />;
    case "recommendations":
      return <QuoteIcon size={size} />;
    case "toolbox":
      return <WrenchIcon size={size} />;
    case "contact":
      return <MailIcon size={size} />;
    case "fun":
      return <SparkIcon size={size} />;
  }
}
