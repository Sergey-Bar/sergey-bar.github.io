import { stages } from "@/content/quality-system";

/**
 * The one staged sequence on the site (plan §6.2). Deliberately plain: a grid of
 * stages and their micro-status, with no rail, no nodes and no motion. The order
 * is the content; the graphics were decoration pretending to be a diagram.
 */
export function QAFlow() {
  return (
    <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <li key={stage.id}>
          <h3 className="t-title leading-snug text-ink">{stage.title}</h3>
          <p className="data mt-2 text-muted">{stage.status}</p>
        </li>
      ))}
    </ol>
  );
}