import Link from "next/link";

import { TopicIcon } from "@/chat/icons";
import { Bubble, Card, QuickReplies, UserBubble } from "@/chat/message";
import { topicById, topics, type TopicId } from "@/chat/topics";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { CountUp } from "@/components/count-up";
import { ExperienceRecord } from "@/components/experience-record";
import { MjolnirConsole } from "@/components/mjolnir-console";
import { RecommendationCard } from "@/components/recommendation-card";
import { RedButton } from "@/components/red-button";
import { StatusChip } from "@/components/status-chip";
import { TechnicalTag } from "@/components/technical-tag";
import { ToolGroup } from "@/components/tool-group";
import { ToolboxExplorer } from "@/components/toolbox-explorer";
import { roles } from "@/content/experience";
import { employers, hero } from "@/content/hero";
import { proofRow } from "@/content/metrics";
import { mjolnir } from "@/content/mjolnir-facts";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { recommendations } from "@/content/recommendations";
import { availability, contact, site } from "@/content/site";
import { credentials, toolbox } from "@/content/toolbox";

/**
 * Every answer the site can give, rendered on the server in full. The director
 * reveals a flow when the visitor asks for it, one message at a time; a visitor
 * without JavaScript, or a crawler, reads all of them in this order. Nothing
 * below is copy that lives only in a component: every figure, role and quote
 * comes from the content modules, exactly as the previous site stated them.
 */

function Flow({ id, children }: { id: TopicId; children: React.ReactNode }) {
  const topic = topicById[id];
  return (
    <section
      className="flow"
      id={id}
      data-flow={id}
      data-topic={id}
      aria-label={topic.description}
      tabIndex={-1}
    >
      <UserBubble>{topic.prompt}</UserBubble>
      {children}
    </section>
  );
}

/** A spec-sheet row inside the at-a-glance card. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="spec-row">
      <dt className="data text-muted">{label}</dt>
      <dd className="flex flex-wrap items-center gap-1.5 t-small text-ink">{children}</dd>
    </div>
  );
}

function AboutFlow() {
  return (
    <Flow id="about">
      <Bubble>
        <p>
          I&apos;m <strong>{site.name}</strong>, {site.role.replace("&", "and")} based in{" "}
          {site.location}. {hero.positioning}
        </p>
      </Bubble>
      <Bubble first={false}>
        <p>{profile.distinction}</p>
      </Bubble>
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
      <Card eyebrow="verified outcomes" title="Five figures a stranger can check">
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
      <Card eyebrow="experience across teams at">
        <ul className="employers" aria-label="Employers">
          {employers.map((employer) => (
            <li key={employer.name} title={employer.name}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, brand assets */}
              <img
                src={employer.logo}
                alt={employer.name}
                width={employer.iw}
                height={employer.ih}
                loading="lazy"
                className={`${employer.h} w-auto`}
              />
            </li>
          ))}
        </ul>
      </Card>
      <QuickReplies lead="Want the detail?" ids={["experience", "projects", "contact"]} />
    </Flow>
  );
}

function ProjectsFlow() {
  return (
    <Flow id="projects">
      <Bubble>
        <p>
          Two open-source products I built and maintain. Both are on GitHub, and both state
          their own limits. A tool that rounds itself up is not worth reading.
        </p>
      </Bubble>
      {projects.map((project) => (
        <Card key={project.slug} eyebrow={project.kind} title={project.name}>
          {project.slug === "mjolnir" ? (
            <div className="mb-4">
              <StatusChip tone="success" label={`v${mjolnir.package.version} published`} />
            </div>
          ) : null}
          <p className="t-title text-ink">{project.tagline}</p>
          <p className="mt-3 t-body text-muted">{project.about}</p>
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
          <div className="card-actions">
            <a href={project.repo} className="action action-primary">
              <GitHubIcon size={15} />
              Open on GitHub
            </a>
            <span className="data text-muted">{project.repoLabel}</span>
          </div>
        </Card>
      ))}
      <Bubble first={false}>
        <p>
          The long version, with each repository&apos;s full design argument, is on the{" "}
          <Link href="/projects/" className="link-underline">
            projects page
          </Link>
          .
        </p>
      </Bubble>
      <QuickReplies ids={["toolbox", "experience", "contact"]} />
    </Flow>
  );
}

function ExperienceFlow() {
  return (
    <Flow id="experience">
      <Bubble>
        <p>
          Five roles, most recent first: role, period, scope and outcomes. The full record, with
          references on request, is on LinkedIn.
        </p>
      </Bubble>
      {roles.map((role) => (
        <Card key={`${role.company}-${role.period}`} first={false}>
          <ExperienceRecord role={role} />
        </Card>
      ))}
      <Card eyebrow="education and languages" first={false}>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="data text-muted">education</h4>
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
            <h4 className="data text-muted">languages</h4>
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
      <QuickReplies ids={["recommendations", "projects", "contact"]} />
    </Flow>
  );
}

function RecommendationsFlow() {
  const featured = recommendations.slice(0, 3);
  const rest = recommendations.slice(3);
  return (
    <Flow id="recommendations">
      <Bubble>
        <p>
          {recommendations.length} LinkedIn recommendations from managers and colleagues,
          transcribed as written. Three of them:
        </p>
      </Bubble>
      {featured.map((recommendation) => (
        <Card key={recommendation.name} first={false}>
          <RecommendationCard recommendation={recommendation} />
        </Card>
      ))}
      <Card first={false}>
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
      <QuickReplies ids={["experience", "about", "contact"]} />
    </Flow>
  );
}

function ToolboxFlow() {
  return (
    <Flow id="toolbox">
      <Bubble>
        <p>
          Grouped by the job they do. Everything here is something I have actually used.
          Search covers all {toolbox.length} groups.
        </p>
      </Bubble>
      <Card first={false}>
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
      <QuickReplies ids={["projects", "experience", "contact"]} />
    </Flow>
  );
}

function ContactFlow() {
  return (
    <Flow id="contact">
      <Bubble>
        <p>
          LinkedIn is the route. There is no contact form and no published email address: the
          record lives on LinkedIn and the work lives on GitHub.
        </p>
      </Bubble>
      <Card eyebrow="open to" first={false}>
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
          <a href={contact.github} className="action action-secondary">
            <GitHubIcon size={16} />
            Explore GitHub
          </a>
        </div>
      </Card>
      <QuickReplies ids={["projects", "recommendations", "fun"]} />
    </Flow>
  );
}

function FunFlow() {
  return (
    <Flow id="fun">
      <Bubble>
        <p>An after-hours experiment: a stress-relief toy. Press Escape to come back.</p>
      </Bubble>
      <Card first={false}>
        <RedButton />
      </Card>
      <QuickReplies ids={["projects", "about", "contact"]} />
    </Flow>
  );
}

export function Flows() {
  return (
    <>
      <AboutFlow />
      <ProjectsFlow />
      <ExperienceFlow />
      <RecommendationsFlow />
      <ToolboxFlow />
      <ContactFlow />
      <FunFlow />
    </>
  );
}

/** The chip row in the composer, in conversation order. */
export function TopicChips() {
  return (
    <ul className="chips" aria-label="Topics">
      {topics.map((topic) => (
        <li key={topic.id}>
          <a href={`#${topic.id}`} className="chip" data-ask={topic.id} data-topic={topic.id}>
            <TopicIcon id={topic.id} size={15} />
            {topic.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
