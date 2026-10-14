/** A lightweight, eagerly loaded portrait; the frame is styled by the hero. */
export function HeroPortrait() {
  return (
    <div className="portrait-frame">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src="/portrait.webp" alt="Sergey Bar" width={880} height={1100} fetchPriority="high" className="portrait-photo" />
    </div>
  );
}
