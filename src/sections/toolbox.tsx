import {
  CompetencyGroup,
  ToolboxGrid,
  ToolGroup,
} from "@/components/tool-group";
import { SectionRule } from "@/components/section-rule";
import { competencies, toolbox } from "@/content/toolbox";

export function Toolbox() {
  return (
    <section id="toolbox" aria-labelledby="toolbox-heading" className="rhythm">
      <div className="shell">
        <SectionRule />
        <h2 id="toolbox-heading" className="measure mt-6 t-display-l text-ink">
          Engineering toolbox
        </h2>
        <p className="measure mt-5 t-body text-muted">
          The instruments, then the disciplines. Every entry is one I have used
          on a release that mattered — a longer list is not a better one.
        </p>

        <ToolboxGrid className="mt-12">
          {toolbox.map((group) => (
            <ToolGroup key={group.id} group={group} />
          ))}
        </ToolboxGrid>

        <div className="mt-20 border-t border-line pt-10">
          <h3 className="t-title text-ink">Core competencies</h3>
          <ToolboxGrid className="mt-8 lg:grid-cols-2">
            {competencies.map((competency) => (
              <CompetencyGroup key={competency.id} competency={competency} />
            ))}
          </ToolboxGrid>
        </div>
      </div>
    </section>
  );
}