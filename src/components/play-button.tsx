"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const DestructionGame = dynamic(
  () => import("./destruction-game").then((m) => m.DestructionGame),
  { ssr: false },
);

/** Opens the game. Its chunk downloads only when this is pressed. */
export function PlayButton() {
  const [open, setOpen] = useState(false);

  const press = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <button type="button" onClick={press} className="fun-button">
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor" />
        </svg>
        Play
      </button>
      {open && <DestructionGame onClose={() => setOpen(false)} />}
    </>
  );
}
