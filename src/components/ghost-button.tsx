"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const DestructionGame = dynamic(
  () => import("./destruction-game").then((m) => m.DestructionGame),
  { ssr: false },
);

/** A small ghost, drawn in the site's line weight. */
export function GhostIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3a7 7 0 0 0-7 7v10.2l2.6-2 2.4 2 2-2 2 2 2.4-2 2.6 2V10a7 7 0 0 0-7-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="9.6" cy="10.6" r="1.25" fill="currentColor" />
      <circle cx="14.4" cy="10.6" r="1.25" fill="currentColor" />
    </svg>
  );
}

/**
 * The ghost in the corner: the shortest route to the game. It opens the
 * demolition run straight away, without the conversation, and Escape or the
 * game's own close returns to wherever the visitor was.
 */
export function GhostButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="ghost"
        onClick={() => setOpen(true)}
        aria-label="Play the demolition run"
        title="Something fun: the demolition run"
      >
        <GhostIcon />
      </button>
      {open ? <DestructionGame onClose={() => setOpen(false)} /> : null}
    </>
  );
}
