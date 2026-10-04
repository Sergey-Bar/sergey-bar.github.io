import type { Role } from "@/content/experience";

export function ExperienceRecord({ role }: { role: Role }) {
  return (
    <article className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <div className="grid gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,17rem)_1fr]">
        <div>
          <h3 className="t-title text-ink">{role.company}</h3>
          <p className="mt-1 t-small text-ink">{role.role}</p>
          <p className="data mt-2 text-muted">{role.period}</p>
        </div>

        <div>
          <p className="measure t-small text-ink">{role.scope}</p>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="data text-muted">ownership</h4>
              <ul className="mt-2.5 flex flex-col gap-2">
                {role.ownership.map((item) => (
                  <li key={item} className="t-small text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="data text-muted">outcome</h4>
              <ul className="mt-2.5 flex flex-col gap-2">
                {role.impact.map((item) => (
                  <li key={item} className="t-small text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {role.confidential ? (
            <p className="mt-5 t-small text-muted">Summarised, not described.</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}