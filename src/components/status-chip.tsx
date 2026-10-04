import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "accent"
  | "success"
  | "warn"
  | "critical";

const markTone: Record<StatusTone, string> = {
  neutral: "bg-muted",
  accent: "bg-accent",
  success: "bg-success",
  warn: "bg-warn",
  critical: "bg-critical",
};

const textTone: Record<StatusTone, string> = {
  neutral: "text-muted",
  accent: "text-accent-ink",
  success: "text-success-ink",
  warn: "text-warn-ink",
  critical: "text-critical-ink",
};

const borderTone: Record<StatusTone, string> = {
  neutral: "border-line-strong",
  accent: "border-accent/35",
  success: "border-success/40",
  warn: "border-warn/45",
  critical: "border-critical/40",
};

/**
 * A status is a mark plus a word. The tone never carries the meaning alone —
 * colour-blind visitors and screen readers get the same information.
 */
export function StatusChip({
  tone = "neutral",
  label,
  mark = true,
  className,
}: {
  tone?: StatusTone;
  label: string;
  mark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] border bg-surface px-1.5 py-0.5 t-data font-medium",
        borderTone[tone],
        textTone[tone],
        className,
      )}
    >
      {mark ? (
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0", markTone[tone])}
        />
      ) : null}
      {label}
    </span>
  );
}