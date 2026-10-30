import { cn } from "@/lib/utils";

export type ToolItem = string | { label: string; href: string };

/**
 * A tool, sector or skill as a small tag, in the text face like every other
 * label. An item with an `href` renders as a link, because some of these are
 * tools you are meant to go and look at.
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
    "data inline-flex items-center rounded-full border px-2.5 py-0.5",
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