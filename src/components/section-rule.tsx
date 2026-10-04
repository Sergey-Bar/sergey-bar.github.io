import { cn } from "@/lib/utils";

/**
 * The replacement for the all-caps tracked-out eyebrow (plan §5.2). Structure
 * comes from a hairline and whitespace; there is no decorative label unless the
 * content is genuinely a technical identifier.
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
      className={cn(
        "h-px w-16",
        tone === "light" ? "bg-line-strong" : "bg-dark-line",
        className,
      )}
    />
  );
}