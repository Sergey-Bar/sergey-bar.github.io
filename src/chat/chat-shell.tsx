import { ChatDirector } from "@/chat/chat-director";
import { Flows } from "@/chat/flows";
import { Intro } from "@/chat/intro";
import { GhostButton } from "@/components/ghost-button";

/**
 * The home page as a conversation. Everything the visitor can read is rendered
 * here on the server; the director (a client island) only decides when each
 * part is shown. The loading screen carries no controls at all. Once the chat
 * is open the corner holds the ghost, the direct route to the game, beside
 * the director's own "Start over"; GitHub, LinkedIn and email live in the
 * sidebar and behind the composer's plus.
 */
export function ChatShell() {
  return (
    <ChatDirector
      intro={<Intro />}
      flows={<Flows />}
      topbar={
        <nav className="topbar" aria-label="Game">
          <GhostButton />
        </nav>
      }
    />
  );
}
