import Link from "next/link";

import { site } from "@/content/site";

const links = [
  { label: "Recommendations", href: "/#recommendations" },
  { label: "Experience", href: "/#experience" },
  { label: "Toolbox", href: "/#toolbox" },
  { label: "Projects", href: "/projects/" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="shell py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="t-body font-semibold tracking-[-0.02em] text-ink">
              {site.name}
            </p>
            <p className="mt-1 t-small text-muted">{site.role}</p>
            <p className="mt-6 max-w-[46ch] t-small text-muted">
              Built with the same attention to quality I expect from software.
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 self-end">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="t-small text-muted transition-colors duration-150 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
