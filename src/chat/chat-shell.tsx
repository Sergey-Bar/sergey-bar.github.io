import Link from "next/link";

import { ChatDirector } from "@/chat/chat-director";
import { Flows, TopicChips } from "@/chat/flows";
import { Intro } from "@/chat/intro";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { contact } from "@/content/site";

/**
 * The home page as a conversation. Everything the visitor can read is rendered
 * here on the server; the director (a client island) only decides when each
 * part is shown. The two routes out, GitHub and LinkedIn, and the long-form
 * projects page sit in the corner on every state of the page.
 */
export function ChatShell() {
  return (
    <ChatDirector
      intro={<Intro />}
      flows={<Flows />}
      chips={<TopicChips />}
      topbar={
        <nav className="topbar" aria-label="Links">
          <Link href="/projects/" className="topbar-link">
            Projects
          </Link>
          <a href={contact.github} className="topbar-icon" aria-label="GitHub" title="GitHub">
            <GitHubIcon size={16} />
          </a>
          <a href={contact.linkedin} className="topbar-icon topbar-icon-primary" aria-label="LinkedIn" title="LinkedIn">
            <LinkedInIcon size={16} />
          </a>
        </nav>
      }
    />
  );
}
