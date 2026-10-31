import { Hero } from "@/home/hero";
import { HomeDirector } from "@/home/home-director";
import { Sections } from "@/home/sections";
import { contact, site } from "@/content/site";

/**
 * The opening screen: the name rising in like a heading, the role, and one
 * line that pretends to boot the page. It is in the HTML but shown only when
 * the layout's inline script has marked a session's first visit, and it fades
 * by itself; nothing behind it waits for it, so the page is already there.
 */
function BootScreen() {
  return (
    <div className="boot" aria-hidden="true">
      <div className="boot-inner">
        <p className="boot-title">{site.name}</p>
        <p className="boot-role">{site.role}</p>
        <p className="boot-line">
          <span className="boot-caret">▸</span>
          <span data-boot-line>Booting the page…</span>
          <span className="boot-cursor" />
        </p>
      </div>
    </div>
  );
}

/** The page's foot: who, and the three ways to reach them. */
function HomeFooter() {
  return (
    <footer className="home-footer">
      <p>
        <span className="home-footer-name">{site.name}</span> · {site.role}
      </p>
      <ul>
        <li>
          <a href={contact.linkedin} className="link-underline">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={contact.github} className="link-underline">
            GitHub
          </a>
        </li>
        <li>
          <a href={`mailto:${contact.email}`} className="link-underline">
            Email
          </a>
        </li>
      </ul>
    </footer>
  );
}

/**
 * The home page as one document: the hero, then every section in order, then
 * the foot. All of it is rendered here on the server; the director (a client
 * island) adds the contents and the ask bar around it.
 */
export function HomeShell() {
  return (
    <>
      <BootScreen />
      <HomeDirector hero={<Hero />} sections={<Sections />} footer={<HomeFooter />} />
    </>
  );
}
