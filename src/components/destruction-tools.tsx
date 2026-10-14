import type { ReactElement } from "react";

export type ToolId =
  | "hammer"
  | "chainsaw"
  | "machinegun"
  | "flamethrower"
  | "colorthrower"
  | "phaser"
  | "stamp"
  | "termites"
  | "washing";

export type Tool = {
  id: ToolId;
  label: string;
  Icon: (props: { className?: string }) => ReactElement;
};

export const TOOL_PALETTE = {
  hammer: { head: "#8fb0ff", edge: "#3f63b8", handle: "#a4743c", grip: "#c99a5b" },
  chainsaw: {
    body: "#ff8a3d",
    edge: "#b85a17",
    bar: "#c3c9d2",
    teeth: "#8d949e",
    dark: "#2b2f36",
    bolt: "#5c3a17",
  },
  machinegun: {
    body: "#2f343c",
    dark: "#23272e",
    metal: "#565e69",
    stock: "#3a414b",
  },
  flamethrower: {
    tank: "#dfe4ec",
    edge: "#8a929e",
    barrel: "#6b7280",
    flameOuter: "#ff7a00",
    flameMid: "#ffd23f",
    flameCore: "#fff3b0",
  },
  colorthrower: { tank: "#eef1f6", edge: "#8a929e", barrel: "#6b7280", paint: "#ff5252" },
  phaser: {
    body: "#2f343c",
    prong: "#8ea0b5",
    glow: "#5cc4e0",
    glowRgb: "92,196,224",
    grip: "#23272e",
    metal: "#565e69",
  },
  stamp: {
    wood: "#e8b04b",
    woodEdge: "#a97a22",
    handle: "#8a5a2b",
    knob: "#a97a3f",
  },
  termites: {
    body: "#7a5a34",
    thorax: "#6b4e2c",
    head: "#5a3f22",
    leg: "#5a432a",
    cursorLeg: "#4a3520",
  },
  washing: {
    tank: "#bfe3ff",
    edge: "#6fa8d8",
    water: "#7cc3f5",
    waterRgb: "124,195,245",
    foamRgb: "200,235,255",
    barrel: "#6b7280",
    drop: "#4db2ff",
  },
} as const;

function svg(className: string | undefined, children: ReactElement) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function HammerIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.hammer;
  return svg(
    className,
    <>
      <path
        d="M8 14 18 26"
        stroke={p.handle}
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <path
        d="M8 14 18 26"
        stroke={p.grip}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="4.5"
        width="15"
        height="8"
        rx="2.4"
        fill={p.head}
        stroke={p.edge}
        strokeWidth="1.3"
      />
      <rect x="17" y="6" width="6.5" height="5" rx="1.6" fill="#b9ccff" />
    </>,
  );
}

export function ChainsawIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.chainsaw;
  return svg(
    className,
    <>
      <rect
        x="3"
        y="12.5"
        width="21"
        height="5"
        rx="2.5"
        fill={p.bar}
        stroke="#6b7280"
        strokeWidth="1.2"
      />
      <path
        d="M6 12.5 l1.4 -3.2 l1.4 3.2 M11 12.5 l1.4 -3.2 l1.4 3.2 M16 12.5 l1.4 -3.2 l1.4 3.2 M21 12.5 l1.4 -3.2 l1.4 3.2"
        fill={p.teeth}
        stroke="#6b7280"
        strokeWidth="0.9"
      />
      <rect
        x="18"
        y="8"
        width="11"
        height="13"
        rx="3"
        fill={p.body}
        stroke={p.edge}
        strokeWidth="1.3"
      />
      <path
        d="M20.5 8 q1.5 -5.5 6.5 -5.5"
        stroke={p.dark}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="13.5" r="1.6" fill={p.bolt} />
    </>,
  );
}

export function MachineGunIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.machinegun;
  return svg(
    className,
    <>
      <path d="M4.5 9.5 4 19l4.5.8 1-10.3z" fill={p.stock} />
      <rect x="4.5" y="11" width="17" height="6" rx="1.6" fill={p.body} />
      <rect x="21" y="12.6" width="8.5" height="2.6" rx="1.3" fill={p.metal} />
      <path d="M10 17 l1.6 8h3.6l1.2-8z" fill={p.dark} />
      <path d="M14.5 17 l.9 7 3.2-.8-.7-6.4z" fill={p.dark} />
      <rect x="22.5" y="9" width="1.8" height="3.4" fill={p.body} />
      <rect x="6" y="12.6" width="4" height="1.4" fill={p.metal} />
    </>,
  );
}

export function FlameThrowerIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.flamethrower;
  return svg(
    className,
    <>
      <rect
        x="4"
        y="11"
        width="11"
        height="11"
        rx="4.5"
        fill={p.tank}
        stroke={p.edge}
        strokeWidth="1.2"
      />
      <rect x="15" y="14.5" width="8" height="4.4" rx="1.4" fill={p.barrel} />
      <path d="M24.5 10 q6.5 8.5 0 16 q-6.5 -7.5 0 -16" fill={p.flameOuter} />
      <path d="M24.5 13 q3.6 6.5 0 11.5 q-3.6 -5 0 -11.5" fill={p.flameMid} />
      <path d="M24.5 16 q1.7 3.8 0 7 q-1.7 -3.2 0 -7" fill={p.flameCore} />
    </>,
  );
}

export function ColorThrowerIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.colorthrower;
  return svg(
    className,
    <>
      <rect
        x="4"
        y="10"
        width="10"
        height="12"
        rx="4.5"
        fill={p.tank}
        stroke={p.edge}
        strokeWidth="1.2"
      />
      <rect x="14" y="14" width="7" height="4.4" rx="1.4" fill={p.barrel} />
      <circle cx="23.5" cy="12.5" r="2.4" fill={p.paint} />
      <circle cx="26.5" cy="17" r="2.7" fill="#3d5afe" />
      <circle cx="23" cy="21.5" r="2.1" fill="#22c55e" />
    </>,
  );
}

export function PhaserIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.phaser;
  return svg(
    className,
    <>
      <path d="M11 19.5 12 27.5l3.6-1-1.2-7z" fill={p.grip} />
      <rect x="5" y="11.5" width="15" height="8" rx="3.4" fill={p.body} />
      <rect x="19.5" y="9" width="3.2" height="5" rx="1.4" fill={p.prong} />
      <rect x="19.5" y="17.5" width="3.2" height="5" rx="1.4" fill={p.prong} />
      <circle cx="24" cy="15.5" r="5" fill={p.glow} opacity="0.28" />
      <circle cx="24" cy="15.5" r="2.6" fill={p.glow} />
      <rect x="7" y="13.4" width="4" height="1.4" fill={p.metal} />
    </>,
  );
}

export function StampIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.stamp;
  return svg(
    className,
    <>
      <rect
        x="6.5"
        y="14.5"
        width="16"
        height="4.6"
        rx="1.6"
        fill={p.wood}
        stroke={p.woodEdge}
        strokeWidth="1.1"
      />
      <rect x="8" y="8.5" width="13" height="6.5" rx="2" fill="var(--color-critical)" />
      <rect x="12" y="2" width="5" height="7" rx="2.2" fill={p.handle} />
      <circle cx="14.5" cy="2.6" r="2.7" fill={p.knob} />
      <path d="M9 19.1 h11" stroke={p.woodEdge} strokeWidth="1" />
    </>,
  );
}

export function TermitesIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.termites;
  return svg(
    className,
    <>
      <g stroke={p.leg} strokeWidth="1.3" strokeLinecap="round">
        <path d="M11.5 19.5 10 24" />
        <path d="M14.5 20 14.5 24.5" />
        <path d="M17.5 19.5 19.5 24" />
        <path d="M11.5 16 9 12" />
        <path d="M14.5 15.5 14.5 11.5" />
        <path d="M17.5 16 20 12" />
      </g>
      <ellipse cx="16.5" cy="16.5" rx="4.8" ry="4.2" fill={p.body} />
      <ellipse cx="13.5" cy="18" rx="3.1" ry="2.7" fill={p.thorax} />
      <circle cx="10" cy="19" r="2.9" fill={p.head} />
      <path
        d="M8.2 17.2 q-3 -2.2 -4.6 -0.6 M8.2 20.8 q-3.6 1.6 -4.8 0.4"
        stroke={p.leg}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </>,
  );
}

export function WashingIcon({ className }: { className?: string }) {
  const p = TOOL_PALETTE.washing;
  return svg(
    className,
    <>
      <rect
        x="4"
        y="10.5"
        width="10"
        height="12"
        rx="4.5"
        fill={p.tank}
        stroke={p.edge}
        strokeWidth="1.2"
      />
      <rect x="6.2" y="14" width="5.6" height="4.6" rx="1" fill={p.water} />
      <rect x="14" y="14.5" width="7" height="4.4" rx="1.4" fill={p.barrel} />
      <circle cx="24" cy="13" r="2" fill={p.drop} />
      <circle cx="27" cy="17.5" r="2.4" fill={p.drop} />
      <circle cx="23" cy="21.5" r="1.7" fill={p.drop} />
    </>,
  );
}

export const TOOLS: readonly Tool[] = [
  { id: "hammer", label: "Hammer", Icon: HammerIcon },
  { id: "chainsaw", label: "Chain-saw", Icon: ChainsawIcon },
  { id: "machinegun", label: "Machine gun", Icon: MachineGunIcon },
  { id: "flamethrower", label: "Flame-thrower", Icon: FlameThrowerIcon },
  { id: "colorthrower", label: "Color-thrower", Icon: ColorThrowerIcon },
  { id: "phaser", label: "Phaser", Icon: PhaserIcon },
  { id: "stamp", label: "Stamp", Icon: StampIcon },
  { id: "termites", label: "Termites", Icon: TermitesIcon },
  { id: "washing", label: "Washing", Icon: WashingIcon },
] as const;
