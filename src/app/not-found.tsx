import type { Metadata } from "next";
import Link from "next/link";

import { TopicIcon } from "@/home/icons";
import { topics } from "@/home/topics";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Page not found" };

/**
 * A missing page, answered plainly, with every section of the home page a
 * link away.
 */
export default function NotFound() {
  return (
    <main id="main" className="lost">
      <div className="page-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="grain page-grain" />
      </div>
      <div className="lost-column">
        <p className="data text-muted">404</p>
        <h1 className="lost-title">Page not found</h1>
        <p className="lost-text">
          That URL does not resolve. Nothing here, which is at least honest. Everything on the
          site is a link away:
        </p>
        <ul className="replies-list" aria-label="Sections">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link href={`/#${topic.id}`} className="chip" data-topic={topic.id}>
                <TopicIcon id={topic.id} size={15} />
                {topic.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 t-small text-muted">
          <Link href="/" className="link-underline">
            Back to the start
          </Link>
          {" · "}
          <Link href="/projects/" className="link-underline">
            Projects
          </Link>
          {" · "}
          <Link href="/colophon/" className="link-underline">
            How {site.name.split(" ")[0]}&apos;s site is built
          </Link>
        </p>
      </div>
    </main>
  );
}
