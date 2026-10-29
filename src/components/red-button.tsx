"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const DestructionGame = dynamic(
  () => import("./destruction-game").then((m) => m.DestructionGame),
  { ssr: false },
);

export function RedButton() {
  const [open, setOpen] = useState(false);

  const press = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={press}
        className="fun-button"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          aria-hidden
          focusable="false"
        >
          <path
            d="M12 3.5 22 20H2L12 3.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 9.5v5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
        DO NOT PRESS THIS BUTTON
      </button>
      {open && <DestructionGame onClose={() => setOpen(false)} />}
    </>
  );
}

