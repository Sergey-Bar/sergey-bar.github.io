import { cn } from "@/lib/utils";

/**
 * The replacement for the all-caps tracked-out eyebrow (plan §5.2). Structure
 * comes from a hairline and whitespace; there is no decorative label unless the
 * content is genuinely a technical identifier.
 *
 * The rule is a reveal target of its own kind: it draws from the left as the
 * section arrives, a beat before the heading rises beneath it.
 */
export function SectionRule({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      aria-hidden="true"
      data-reveal="rule"
      className={cn(
        "h-px w-16",
        tone === "light" ? "bg-line-strong" : "bg-dark-line",
        className,
      )}
    />
  );
}
