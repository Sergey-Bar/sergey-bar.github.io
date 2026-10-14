/** A normal-flow statement, readable in every motion mode. */
export function QualityStory() {
  return (
    <section className="quality-story" aria-labelledby="quality-story-heading">
      <div className="story-sticky shell">
        <p className="story-context">The principle behind the work</p>
        <h2 id="quality-story-heading"><span>Most teams</span><span>test software.</span><span>I make sure it</span><span>deserves to ship.</span></h2>
        <p className="story-caption">Strategy. Automation. Evidence.<br />Confidence at every release.</p>
        <a href="#profile" className="story-next">Meet the engineer <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
