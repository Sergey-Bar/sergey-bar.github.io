import { employers } from "@/content/hero";

/**
 * The employer strip at the foot of the hero panel: real company logos, most
 * recent first. They sit muted and gain their colour on hover. The strip is a
 * scale signal, and each name is evidenced by its entry in the experience
 * timeline below.
 */
export function EmployerStrip() {
  return (
    <section
      aria-label="Employers"
      className="border-t border-line/60 px-5 py-6 sm:px-10"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {employers.map((employer) => (
          <span key={employer.name} title={employer.name} className="group">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, brand assets, plain img keeps them cacheable and unprocessed */}
            <img
              src={employer.logo}
              alt={employer.name}
              width={employer.iw}
              height={employer.ih}
              loading="lazy"
              className={`${employer.h} w-auto opacity-65 grayscale transition-[opacity,filter] duration-150 group-hover:opacity-100 group-hover:grayscale-0`}
            />
            <span className="sr-only">{employer.name}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
