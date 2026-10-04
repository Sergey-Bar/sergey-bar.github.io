import { cn } from "@/lib/utils";

export type ToolItem = string | { label: string; href: string };

/**
 * Mono is restricted to genuine technical data (plan §5.2). A tool name is
 * technical data; a sentence is not. An item with an `href` renders as a link,
 * because some of these are tools you are meant to go and look at.
 */
export function TechnicalTag({
  children,
  href,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  href?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const shell = cn(
    "data inline-flex items-center rounded-[3px] border px-1.5 py-0.5",
    href && "transition-colors duration-150",
    tone === "light"
      ? "border-line-strong bg-surface text-muted hover:text-ink"
      : "border-dark-line bg-dark-panel text-dark-muted hover:text-dark-text",
    className,
  );

  return href ? (
    <a href={href} className={shell}>
      {children}
    </a>
  ) : (
    <span className={shell}>{children}</span>
  );
}