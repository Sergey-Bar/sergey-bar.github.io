import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionRule } from "@/components/section-rule";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import routes from "@/content/routes.json";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="shell py-24 lg:py-32">
        <SectionRule />
        <p className="data mt-6 text-muted">404</p>
        <h1 className="measure mt-4 t-display-l text-ink">
          That URL does not resolve.
        </h1>
        <p className="measure mt-5 t-body text-muted">
          Nothing here, which is at least honest. The pages that do exist:
        </p>

        <ul className="mt-8 flex flex-col gap-2">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className="link-underline t-small text-muted"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>

        <Button asChild variant="primary" className="mt-10">
          <Link href="/">Back to the start</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  );
}