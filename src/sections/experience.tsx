import { SectionRule } from "@/components/section-rule";
import { ExperienceRecord } from "@/components/experience-record";
import { credentials } from "@/content/toolbox";
import { roles } from "@/content/experience";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="rhythm"
    >
      <div className="shell">
        <SectionRule />
        <h2
          id="experience-heading"
          className="measure mt-6 t-display-l text-ink"
        >
          Experience
        </h2>
        <p className="measure mt-5 max-w-[68ch] t-body text-muted">
          Role, period, scope and outcomes. Employer work is summarised rather
          than described — the detail behind it stays with the employer.
        </p>

        <div className="mt-12 flex flex-col">
          {roles.map((role) => (
            <ExperienceRecord key={`${role.company}-${role.period}`} role={role} />
          ))}
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <h3 className="data text-muted">certifications</h3>
            <ul className="mt-3 flex flex-col gap-1.5">
              {credentials.certifications.map((item) => (
                <li key={item.name} className="t-small text-ink">
                  {item.name}
                  <span className="data ml-2 text-muted">
                    {item.issuer}
                    {item.year ? ` ${item.year}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="data text-muted">languages</h3>
            <ul className="mt-3 flex flex-col gap-1.5">
              {credentials.languages.map((item) => (
                <li key={item.name} className="t-small text-ink">
                  {item.name}
                  <span className="ml-2 text-muted">{item.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}