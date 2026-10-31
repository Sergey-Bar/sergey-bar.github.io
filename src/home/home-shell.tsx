import Link from "next/link";

import { Hero } from "@/home/hero";
import { HomeDirector } from "@/home/home-director";
import { Sections } from "@/home/sections";
import { site } from "@/content/site";

/** The page's foot: the long pages, which are not in the contents. */
function HomeFooter() {
  return (
    <footer className="home-footer">
      <p>
        <span className="home-footer-name">{site.name}</span> · {site.role}
      </p>
      <ul>
        <li>
          <Link href="/projects/" className="link-underline">
            Projects in full
          </Link>
        </li>
        <li>
          <Link href="/colophon/" className="link-underline">
            How this site is built
          </Link>
        </li>
        <li>
          <Link href="/accessibility/" className="link-underline">
            Accessibility
          </Link>
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
  return <HomeDirector hero={<Hero />} sections={<Sections />} footer={<HomeFooter />} />;
}
