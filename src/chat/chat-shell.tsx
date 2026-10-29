import { ChatDirector } from "@/chat/chat-director";
import { Flows } from "@/chat/flows";
import { Intro } from "@/chat/intro";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { GhostButton } from "@/components/ghost-button";
import { contact } from "@/content/site";

/**
 * The home page as a conversation. Everything the visitor can read is rendered
 * here on the server; the director (a client island) only decides when each
 * part is shown. The two routes out, GitHub and LinkedIn, sit in the corner
 * on the intro and move into the sidebar once the chat is open; the ghost
 * beside them is the direct route to the game on every state of the page.
 */
export function ChatShell() {
  return (
    <ChatDirector
      intro={<Intro />}
      flows={<Flows />}
      topbar={
        <nav className="topbar" aria-label="Profiles">
          {/* One pill, two routes. The filled half follows the pointer (or
              keyboard focus) and rests on LinkedIn, the contact route. */}
          <div className="social">
            <a href={contact.github} className="social-link" aria-label="GitHub" title="GitHub">
              <GitHubIcon size={16} />
            </a>
            <a href={contact.linkedin} className="social-link" aria-label="LinkedIn" title="LinkedIn">
              <LinkedInIcon size={16} />
            </a>
          </div>
          <GhostButton />
        </nav>
      }
    />
  );
}
