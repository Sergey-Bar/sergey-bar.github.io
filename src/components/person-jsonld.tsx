import { contact, site } from "@/content/site";

/**
 * JSON-LD Person, emitted per route alongside that route's metadata (plan
 * §5.6). Only facts that appear on the page are declared — there is no email
 * address and no CV on this site, so neither is published in the payload either.
 */
export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    description: site.description,
    url: site.domain,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IL",
    },
    knowsLanguage: ["he", "en", "ru"],
    sameAs: [contact.linkedin, contact.github],
  };

  return (
    <script
      type="application/ld+json"
      // The payload is a literal built from typed constants, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}