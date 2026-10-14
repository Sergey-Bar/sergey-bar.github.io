import { TechnicalTag, type ToolItem } from "@/components/technical-tag";
import { cn } from "@/lib/utils";
import type { ToolGroup as ToolGroupData } from "@/content/toolbox";

export function ToolGroup({ group }: { group: ToolGroupData }) {
  return (
    <div className="border-t border-line pt-5">
      <h3 className="t-small font-semibold text-ink">{group.title}</h3>
      {group.note ? (
        <p className="measure mt-2 max-w-[46ch] t-small text-muted">
          {group.note}
        </p>
      ) : null}
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {group.items.map((item) => (
          <li key={typeof item === "string" ? item : item.href}>
            <TechnicalTag href={typeof item === "string" ? undefined : item.href}>
              {typeof item === "string" ? item : item.label}
            </TechnicalTag>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToolboxGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type { ToolItem };