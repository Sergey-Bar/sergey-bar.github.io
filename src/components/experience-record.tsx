import type { Role } from "@/content/experience";

export function ExperienceRecord({ role }: { role: Role }) {
  return (
    <article className="experience-entry">
      <div className="experience-identity">
        <h3 className="t-title text-ink">{role.company}</h3>
        <p className="mt-2 t-small text-ink">{role.role}</p>
        <p className="data mt-2 text-muted">{role.period}</p>
      </div>
      <div className="experience-summary">
        <p className="t-body text-ink">{role.scope}</p>
        <details className="role-details">
          <summary>Responsibilities and outcomes<span aria-hidden="true">+</span></summary>
          <div className="role-details-body">
            <div><h4>Responsibilities</h4><ul>{role.ownership.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h4>Outcomes</h4><ul>{role.impact.map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </details>
      </div>
    </article>
  );
}
