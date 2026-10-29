"use client";

import { useId, useRef, useState, type ReactNode } from "react";

type Group = { id: string; search: string; content: ReactNode };

export function ToolboxExplorer({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const term = query.trim().toLowerCase();
  const matches = groups.filter((group) => group.search.includes(term));
  const visible = term || expanded ? matches : matches.slice(0, 6);
  return (
    <div className="mt-10">
      <div className="toolbox-search">
        <label htmlFor={inputId}>Find a tool or discipline</label>
        <div className="toolbox-search-field">
          <input ref={inputRef} id={inputId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Python, automation or cloud" aria-controls={`${inputId}-results`} />
          {query && <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>Clear</button>}
        </div>
        <p role="status" className="t-small text-muted">Showing {visible.length} of {groups.length} groups</p>
      </div>
      <div id={`${inputId}-results`} className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
        {visible.map((group) => <div key={group.id}>{group.content}</div>)}
      </div>
      {!term && <button className="toolbox-expand" type="button" aria-expanded={expanded} aria-controls={`${inputId}-results`} onClick={() => setExpanded(!expanded)}>{expanded ? "Show essential groups" : `Explore all ${groups.length} groups`}</button>}
      {matches.length === 0 && <p className="py-8 t-body text-muted">No matching tools. Try a different name or clear your search to see everything.</p>}
    </div>
  );
}
