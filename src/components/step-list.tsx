import { cn } from "@/lib/utils";

/**
 * A numbered list for genuine sequences only. The plan bans numerals on content
 * that is not a real order, so every caller passes an ordered process.
 */
export function StepList({
  steps,
  numbered = true,
  start = 1,
  tone = "light",
  className,
}: {
  steps: readonly { title: string; body: string }[];
  numbered?: boolean;
  /** Lets one sequence be laid out in two columns without renumbering. */
  start?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <ol
      start={numbered ? start : undefined}
      className={cn(
        "grid gap-px border",
        tone === "light" ? "border-line" : "border-dark-line",
        className,
      )}
    >
      {steps.map((step, i) => (
        <li
          key={step.title}
          className={cn(
            "grid gap-1 bg-paper sm:grid-cols-[3.5rem_1fr] sm:gap-5",
            tone === "dark" && "bg-dark-panel",
          )}
        >
          {numbered ? (
            <span
              aria-hidden="true"
              className={cn(
                "data pt-0.5",
                tone === "light" ? "text-muted" : "text-dark-muted",
              )}
            >
              {String(start + i).padStart(2, "0")}
            </span>
          ) : null}
          <div className="pb-6">
            <h3
              className={cn(
                "t-title",
                tone === "light" ? "text-ink" : "text-dark-text",
              )}
            >
              {step.title}
            </h3>
            <p
              className={cn(
                "measure mt-2 t-small",
                tone === "light" ? "text-muted" : "text-dark-muted",
              )}
            >
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}