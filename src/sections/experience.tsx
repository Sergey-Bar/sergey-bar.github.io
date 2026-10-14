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
          data-reveal
        >
          Experience
        </h2>
        <p className="measure mt-5 max-w-[68ch] t-body text-muted" data-reveal>
          Role, period, scope and outcomes. The full record, with references on
          request, is on LinkedIn.
        </p>

        <div className="mt-12 flex flex-col" data-reveal-stagger>
          {roles.map((role) => (
            <ExperienceRecord key={`${role.company}-${role.period}`} role={role} />
          ))}
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2" data-reveal-stagger>
          <div>
            <h3 className="data text-muted">education</h3>
            <ul className="mt-3 flex flex-col gap-1.5">
              {credentials.education.map((item) => (
                <li key={item.school} className="t-small text-ink">
                  {item.detail}
                  <span className="data ml-2 text-muted">
                    {item.school} {item.years}
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
