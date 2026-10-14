import { ToolboxExplorer } from "@/components/toolbox-explorer";
import { ToolGroup } from "@/components/tool-group";
import { SectionRule } from "@/components/section-rule";
import { toolbox } from "@/content/toolbox";

export function Toolbox() {
  return (
    <section id="toolbox" aria-labelledby="toolbox-heading" className="rhythm">
      <div className="shell">
        <SectionRule />
        <h2
          id="toolbox-heading"
          className="measure mt-6 t-display-l text-ink"
          data-reveal
        >
          Engineering toolbox
        </h2>
        <p className="measure mt-5 t-body text-muted" data-reveal>
          Grouped by the job they do. Everything here is something I have
          actually used.
        </p>

        <ToolboxExplorer groups={toolbox.map((group) => ({
          id: group.id,
          search: [group.title, ...group.items.map((item) => typeof item === "string" ? item : item.label)].join(" ").toLowerCase(),
          content: <ToolGroup group={group} />,
        }))} />
      </div>
    </section>
  );
}
