import { Card, More, Note, Section } from "@/home/blocks";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CountUp } from "@/components/count-up";
import { ExperienceRecord } from "@/components/experience-record";
import { MjolnirConsole } from "@/components/mjolnir-console";
import { RecommendationCard } from "@/components/recommendation-card";
import { TOOLS } from "@/components/destruction-tools";
import { PlayButton } from "@/components/play-button";
import { StatusChip } from "@/components/status-chip";
import { TechnicalTag } from "@/components/technical-tag";
import { ToolGroup } from "@/components/tool-group";
import { ToolboxExplorer } from "@/components/toolbox-explorer";
import { caseStudies } from "@/content/case-studies";
import { roles } from "@/content/experience";
import { proofRow } from "@/content/metrics";
import { mjolnir } from "@/content/mjolnir-facts";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { recommendations } from "@/content/recommendations";
import { availability, contact, site } from "@/content/site";
import { credentials, toolbox } from "@/content/toolbox";

/**
 * The whole record, rendered on the server in the order a reader takes it in.
 * Nothing below is copy that lives only in a component: every figure, role and
 * quote comes from the content modules.
 */

/** A spec-sheet row inside the at-a-glance card. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="spec-row">
      <dt className="data text-muted">{label}</dt>
      <dd className="flex flex-wrap items-center gap-1.5 t-small text-ink">{children}</dd>
    </div>
  );
}

function AboutSection() {
  return (
    <Section id="about" lead={<p>{profile.distinction}</p>}>
      <Card eyebrow="the record at a glance">
        <dl className="spec">
          <Row label="Position">
            <span className="font-medium">{profile.headline}</span>
          </Row>
          <Row label="Based">{site.location}</Row>
          <Row label="Sectors">
            {profile.sectors.map((sector) => (
              <TechnicalTag key={sector}>{sector}</TechnicalTag>
            ))}
          </Row>
          <Row label="Top skills">
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
          <Row label="Open to">
            {availability.roles.map((role) => (
              <TechnicalTag key={role}>{role}</TechnicalTag>
            ))}
          </Row>
        </dl>
      </Card>
      <Card eyebrow="the record in numbers" title="Five figures from the record">
        <dl className="metrics" data-reveal-stagger>
          {proofRow.map((metric) => (
            <div key={metric.label} className="metric">
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <span className="metric-value">
                  <CountUp value={metric.value} />
                </span>
                <span className="metric-label">{metric.label}</span>
                <span className="metric-detail">{metric.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </Section>
  );
}

function ProjectsSection() {
  return (
    <Section
      id="projects"
      lead={
        <p>
          Two open-source products I built and maintain. Both are on GitHub, and both state their
          own limits. A tool that rounds itself up is not worth reading.
        </p>
      }
    >
      {projects.map((project) => (
        <Card
          key={project.slug}
          eyebrow={project.kind}
          title={project.name}
          stat={
            project.slug === "mjolnir"
              ? { value: `${mjolnir.rules.total} rules`, label: `${mjolnir.rules.measured} of them carry a measured false-positive rate` }
              : { value: "3 → 1", label: "test reporters (Playwright, JUnit, legacy) into one result model" }
          }
        >
          {project.slug === "mjolnir" ? (
            <div className="mb-4">
              <StatusChip tone="success" label={`v${mjolnir.package.version} published`} />
            </div>
          ) : null}
          <p className="t-title text-ink">{project.tagline}</p>
          <More label="How it works, and the numbers">
            <p className="t-body text-muted">{project.about}</p>
            <dl className="facts">
              {project.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="data text-muted">{fact.label}</dt>
                  <dd className="mt-1 t-small font-medium text-ink tabular-nums">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {project.slug === "mjolnir" ? (
              <MjolnirConsole />
            ) : (
              <figure className="evidence-panel mt-8">
                <figcaption className="t-title">How evidence moves through Automate</figcaption>
                <ol className="evidence-flow">
                  <li>
                    <strong>Test producers</strong>
                    <span>Playwright · JUnit · legacy reporters</span>
                  </li>
                  <li>
                    <strong>Shared result model</strong>
                    <span>Results and persisted run evidence</span>
                  </li>
                  <li>
                    <strong>Quality gates</strong>
                    <span>Policies that inform release decisions</span>
                  </li>
                </ol>
                <p className="mt-5 t-small text-muted">
                  Architecture overview. Capability limits are listed above and in the repository.
                </p>
              </figure>
            )}
          </More>
          <div className="card-actions">
            <a href={project.repo} className="action action-primary">
              <GitHubIcon size={15} />
              Open on GitHub
            </a>
            <span className="data text-muted">{project.repoLabel}</span>
          </div>
        </Card>
      ))}
    </Section>
  );
}

function CasesSection() {
  return (
    <Section
      id="cases"
      lead={
        <p>
          Two pieces of work, each told the same way: the problem, what I did, the evidence
          behind it, and the outcome. Every figure is read from the record, not retyped.
        </p>
      }
    >
      {caseStudies.map((study, index) => (
        <Card
          key={study.slug}
          eyebrow={`case ${index + 1} of ${caseStudies.length}`}
          title={study.title}
          stat={study.stat}
        >
          <dl className="case">
            <div>
              <dt>Problem</dt>
              <dd>{study.problem}</dd>
            </div>
            <div>
              <dt>Outcome</dt>
              <dd className="case-outcome">{study.outcome}</dd>
            </div>
          </dl>
          <More label="How, and the evidence">
            <p className="case-context">{study.context}</p>
            <dl className="case">
              <div>
                <dt>Approach</dt>
                <dd>
                  <ul>
                    {study.approach.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>
                  <ul className="case-evidence">
                    {study.evidence.map((item) => (
                      <li key={item.label}>
                        <strong>
                          {item.href ? (
                            <a href={item.href} className="link-underline">
                              {item.label}
                            </a>
                          ) : (
                            item.label
                          )}
                        </strong>
                        <span>{item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </More>
        </Card>
      ))}
      <Note>
        This site is tested the same way: a Playwright suite runs every section, the ask bar and
        an accessibility audit on each deploy, and publishes{" "}
        <a href="/qa/report/" className="link-underline">
          the latest report
        </a>
        .
      </Note>
    </Section>
  );
}

function ExperienceSection() {
  return (
    <Section
      id="experience"
      lead={
        <p>
          Five roles, most recent first: role, period, scope and outcomes. The full record, with
          references on request, is on LinkedIn.
        </p>
      }
    >
      {roles.map((role) => (
        <Card key={`${role.company}-${role.period}`}>
          <ExperienceRecord role={role} />
        </Card>
      ))}
      <Card title="Education and languages">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="data text-muted">Education</h4>
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
            <h4 className="data text-muted">Languages</h4>
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
      </Card>
    </Section>
  );
}

function RecommendationsSection() {
  const featured = recommendations.slice(0, 3);
  const rest = recommendations.slice(3);
  return (
    <Section
      id="recommendations"
      lead={
        <p>
          {recommendations.length} LinkedIn recommendations from managers and colleagues,
          transcribed as written. Three of them first:
        </p>
      }
    >
      {featured.map((recommendation) => (
        <Card key={recommendation.name}>
          <RecommendationCard recommendation={recommendation} />
        </Card>
      ))}
      <Card>
        <details className="recommendations-more">
          <summary>
            <span className="recommendations-show">Read the other {rest.length}</span>
            <span className="recommendations-hide">Show the featured three</span>
            <span className="recommendations-toggle" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="recommendations-grid">
            {rest.map((recommendation) => (
              <RecommendationCard key={recommendation.name} recommendation={recommendation} />
            ))}
          </div>
        </details>
        <a className="action action-secondary mt-5" href={contact.linkedin}>
          <LinkedInIcon size={16} />
          View them on LinkedIn
        </a>
      </Card>
    </Section>
  );
}

function ToolboxSection() {
  return (
    <Section
      id="toolbox"
      lead={
        <p>
          Grouped by the job they do. Everything here is something I have actually used. Search
          covers all {toolbox.length} groups.
        </p>
      }
    >
      <Card>
        <ToolboxExplorer
          groups={toolbox.map((group) => ({
            id: group.id,
            search: [
              group.title,
              ...group.items.map((item) => (typeof item === "string" ? item : item.label)),
            ]
              .join(" ")
              .toLowerCase(),
            content: <ToolGroup group={group} />,
          }))}
        />
      </Card>
    </Section>
  );
}

function ContactSection() {
  return (
    <Section
      id="contact"
      lead={
        <p>
          LinkedIn is the route, and the work lives on GitHub. There is no contact form. My CV is
          sent on request: write to{" "}
          <a href={`mailto:${contact.email}?subject=CV%20request`} className="link-underline">
            {contact.email}
          </a>{" "}
          or message me on LinkedIn, and it comes back as a file rather than sitting here for
          anyone to lift.
        </p>
      }
    >
      <Card eyebrow="open to">
        <ul className="flex flex-wrap gap-1.5" aria-label="Open to">
          {availability.roles.map((role) => (
            <li key={role}>
              <TechnicalTag>{role}</TechnicalTag>
            </li>
          ))}
        </ul>
        <div className="card-actions">
          <a href={contact.linkedin} className="action action-primary">
            <LinkedInIcon size={16} />
            Connect on LinkedIn
          </a>
          <a href={`mailto:${contact.email}?subject=CV%20request`} className="action action-secondary">
            Request my CV by email
          </a>
          <a href={contact.github} className="action action-secondary">
            <GitHubIcon size={16} />
            Explore GitHub
          </a>
        </div>
      </Card>
    </Section>
  );
}

function FunSection() {
  return (
    <Section
      id="fun"
      lead={<p>A stress test you are allowed to fail. It is for after hours, and it is timed.</p>}
    >
      <article className="card fun-card">
        <div className="fun-grid">
          <div className="fun-copy">
            <p className="data card-eyebrow">After hours</p>
            <h3 className="card-title">Wreck the release machine</h3>
            <p className="fun-text">
              A mock early-2000s desktop, <code>bugs.exe</code> and <code>release-gate.yml</code>{" "}
              included, and nine tools to take it down to zero integrity. Streaks are named the way QA
              names them, from Smoke test to Chaos monkey, and a run climbs from Intern to Legend.
            </p>
            <ul className="fun-tools" aria-label="The nine tools">
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <tool.Icon className="fun-tool-icon" />
                  {tool.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="fun-zone">
            <PlayButton />
            <ul className="fun-keys" aria-label="Controls">
              <li>
                <kbd>Tab</kbd> next tool
              </li>
              <li>
                <kbd>Esc</kbd> back to the page
              </li>
            </ul>
            <p className="fun-note">It loads only when pressed. Nothing is saved, nothing is sent.</p>
          </div>
        </div>
      </article>
    </Section>
  );
}

export function Sections() {
  return (
    <>
      <AboutSection />
      <ExperienceSection />
      <ToolboxSection />
      <RecommendationsSection />
      <ProjectsSection />
      <CasesSection />
      <ContactSection />
      <FunSection />
    </>
  );
}
