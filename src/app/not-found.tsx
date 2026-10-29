import Link from "next/link";

import { TopicIcon } from "@/chat/icons";
import { BotAvatar } from "@/chat/message";
import { topics } from "@/chat/topics";
import { site } from "@/content/site";

/**
 * A missing page, answered the way the site answers everything: as a reply.
 * The chips open the matching conversation on the home page.
 */
export default function NotFound() {
  return (
    <main id="main" className="chat-shell lost">
      <div className="chat-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="grain chat-grain" />
      </div>
      <div className="chat-column lost-column">
        <p className="data text-muted">404</p>
        <article className="msg">
          <BotAvatar />
          <div className="bubble">
            <p>
              That URL does not resolve. Nothing here, which is at least honest. Everything I can
              talk about is a chip away:
            </p>
          </div>
        </article>
        <ul className="replies-list" aria-label="Topics">
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
