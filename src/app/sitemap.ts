import type { MetadataRoute } from "next";

import routes from "@/content/routes.json";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-04T00:00:00Z");

  return routes.map((route) => ({
    url: `${site.domain}${route.href}`,
    lastModified: now,
    priority: route.priority,
  }));
}
