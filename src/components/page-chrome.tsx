/**
 * Page chrome. Two pieces, both pure CSS, both off the main thread.
 *
 * A boot veil gives the first paint a shape: the wordmark, and a hairline that
 * draws across it before the veil lifts. It is an overlay, never a content
 * hider — the page underneath is laid out and painted the whole time, so nothing
 * is delayed and nothing is lost if an animation does not run. It sits inside
 * `prefers-reduced-motion: no-preference`, so a visitor who asks for less motion
 * never sees it at all and simply gets the page.
 *
 * A scroll-progress hairline answers a real question on a page this long: how
 * much is left. Where `animation-timeline` is unsupported it is not drawn rather
 * than faked with a scroll listener.
 */
export function PageChrome() {
  return (
    <>
      <div
        aria-hidden="true"
        className="boot pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-paper"
      >
        <span className="boot-mark flex flex-col items-center gap-3">
          <span className="text-small font-semibold tracking-[-0.02em] text-ink">
            Sergey Bar
          </span>
          <span className="boot-rule block h-px w-24 bg-accent" />
        </span>
      </div>
      <span
        aria-hidden="true"
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 block h-0.5 origin-left bg-accent"
      />
    </>
  );
}