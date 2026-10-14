import { SectionRule } from "@/components/section-rule";
import { TechnicalTag } from "@/components/technical-tag";
import { profile } from "@/content/profile";
import { availability, site } from "@/content/site";
import { credentials } from "@/content/toolbox";

/** A spec-sheet row: one label, one value, hairline-separated. */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8 sm:px-7">
      <dt className="data pt-1 text-muted">{label}</dt>
      <dd className="flex flex-wrap items-center gap-1.5 t-small text-ink">
        {children}
      </dd>
    </div>
  );
}

/**
 * The CV header, restated. This is the section a recruiter reads first, so it
 * is a spec sheet rather than prose: one fact per row, each row expanded by a
 * section later on the page. No email, no phone, no CV copy: the record lives
 * on LinkedIn and the work lives on GitHub, and the hero above says so.
 */
export function Profile() {
  return (
    <section
      id="profile"
      aria-labelledby="profile-heading"
      className="border-y border-line bg-surface"
    >
      <div className="shell rhythm">
        <SectionRule />
        <h2
          id="profile-heading"
          className="measure mt-6 t-display-l text-ink"
          data-reveal
        >
          The record at a glance
        </h2>

        <dl
          className="mt-12 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-paper"

        >
          <Row label="Position">
            <span className="font-medium">{profile.headline}</span>
          </Row>
          <Row label="Based">{site.location}</Row>
          <Row label="Sectors">
            {profile.sectors.map((sector) => (
              <TechnicalTag key={sector}>{sector}</TechnicalTag>
            ))}
          </Row>
          <Row label="Top Skills">
            {profile.topSkills.map((skill) => (
              <TechnicalTag key={skill}>{skill}</TechnicalTag>
            ))}
          </Row>
          <Row label="Instruments">
            {profile.instruments.map((instrument) => (
              <TechnicalTag key={instrument}>{instrument}</TechnicalTag>
            ))}
          </Row>
          <Row label="Languages">
            {credentials.languages.map((language) => (
              <TechnicalTag key={language.name}>
                {language.name} · {language.level}
              </TechnicalTag>
            ))}
          </Row>
          <Row label="Open To">
            {availability.roles.map((role) => (
              <TechnicalTag key={role}>{role}</TechnicalTag>
            ))}
          </Row>
        </dl>

        <p className="measure mt-10 t-body text-ink" data-reveal>
          {profile.distinction}
        </p>
      </div>
    </section>
  );
}
