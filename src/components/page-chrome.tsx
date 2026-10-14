/** Reading progress is progressive enhancement; no loading overlay delays the page. */
export function PageChrome() {
  return <span aria-hidden="true" className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 block h-0.5 origin-left bg-accent" />;
}
