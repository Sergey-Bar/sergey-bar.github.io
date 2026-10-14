import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";
import { availability, contact, site } from "@/content/site";
import { HERO_HEADLINE } from "@/sections/hero";
import {
  HammerIcon,
  TOOLS,
  TOOL_PALETTE,
  type ToolId,
} from "@/components/destruction-tools";

const PI2 = Math.PI * 2;

const SANS = '"Segoe UI", Roboto, Helvetica, Arial, system-ui, sans-serif';
const MONO = '"JetBrains Mono", "Cascadia Mono", ui-monospace, Consolas, monospace';

const DOMAIN = new URL(site.domain).hostname;
const readable = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

const PAINT_COLORS = [
  "#ff5252",
  "#ffb703",
  "#22c55e",
  "#3d5afe",
  "#b829ff",
  "#00c2ff",
  "#ff7a00",
];

const STAMP_TEXTS = [
  "BUG",
  "NOT A BUG",
  "WONTFIX",
  "DEPRECATED",
  "REJECTED",
  "DUPLICATE",
  "FLAKY",
];

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

const tokens = {
  critical: cssVar("--color-critical", "#dc3c3c"),
  criticalInk: cssVar("--color-critical-ink", "#b42626"),
  success: cssVar("--color-success", "#0f9d58"),
  successInk: cssVar("--color-success-ink", "#0a7a44"),
  accentInk: cssVar("--color-accent-ink", "#2f42cc"),
  warnInk: cssVar("--color-warn-ink", "#8f5d00"),
  ink: cssVar("--color-ink", "#101114"),
};

const STAMP_COLORS = [
  tokens.critical,
  tokens.successInk,
  tokens.accentInk,
  tokens.warnInk,
  tokens.ink,
  tokens.criticalInk,
];

type ParticleKind =
  | "fire"
  | "spark"
  | "ember"
  | "casing"
  | "dust"
  | "droplet"
  | "bubble"
  | "pop"
  | "flash"
  | "smoke"
  | "chip"
  | "arc"
  | "streak"
  | "heat";

type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  gravity: number;
};

type Termite = {
  x: number;
  y: number;
  angle: number;
  speed: number;
  phase: number;
  biteIn: number;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function rr(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}

function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function pcGlyph(g: CanvasRenderingContext2D, x: number, y: number) {
  g.fillStyle = "rgba(255,255,255,0.14)";
  rr(g, x - 17, y - 13, 34, 23, 3);
  g.fill();
  g.strokeStyle = "rgba(230,232,235,0.9)";
  g.lineWidth = 1.6;
  g.stroke();
  g.fillStyle = "rgba(230,232,235,0.55)";
  g.fillRect(x - 12, y - 8, 18, 2);
  g.fillRect(x - 12, y - 3, 12, 2);
  g.fillStyle = "rgba(230,232,235,0.9)";
  g.fillRect(x - 2.5, y + 10, 5, 5);
  g.fillRect(x - 9, y + 14, 18, 2.5);
}

function binGlyph(g: CanvasRenderingContext2D, x: number, y: number) {
  g.fillStyle = "rgba(230,232,235,0.88)";
  g.beginPath();
  g.moveTo(x - 11, y - 7);
  g.lineTo(x + 11, y - 7);
  g.lineTo(x + 8.5, y + 15);
  g.lineTo(x - 8.5, y + 15);
  g.closePath();
  g.fill();
  g.fillRect(x - 12.5, y - 10.5, 25, 3.4);
  g.fillRect(x - 4, y - 13.5, 8, 3);
  g.fillStyle = "rgba(20,22,28,0.32)";
  g.fillRect(x - 5, y - 1, 2.4, 12);
  g.fillRect(x - 1.2, y - 1, 2.4, 12);
  g.fillRect(x + 2.6, y - 1, 2.4, 12);
}

function bugGlyph(g: CanvasRenderingContext2D, x: number, y: number) {
  g.strokeStyle = "#3f6b22";
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x - 4, y + 1);
  g.lineTo(x - 11, y + 7);
  g.moveTo(x, y + 3);
  g.lineTo(x, y + 12);
  g.moveTo(x + 4, y + 1);
  g.lineTo(x + 11, y + 7);
  g.moveTo(x - 4, y - 2);
  g.lineTo(x - 10, y - 8);
  g.moveTo(x, y - 4);
  g.lineTo(x, y - 13);
  g.moveTo(x + 4, y - 2);
  g.lineTo(x + 10, y - 8);
  g.stroke();
  g.fillStyle = "#8fd14f";
  g.beginPath();
  g.ellipse(x, y + 1, 9.5, 11, 0, 0, PI2);
  g.fill();
  g.fillStyle = "#6fae3a";
  g.beginPath();
  g.ellipse(x, y + 1, 4.6, 8, 0, 0, PI2);
  g.fill();
  g.fillStyle = "#5d9430";
  g.beginPath();
  g.arc(x, y - 9, 5.2, 0, PI2);
  g.fill();
}

function docGlyph(g: CanvasRenderingContext2D, x: number, y: number) {
  rr(g, x - 10, y - 13, 20, 26, 2);
  g.fillStyle = "#f2f2ee";
  g.fill();
  g.strokeStyle = "#cfcfc9";
  g.lineWidth = 1.2;
  g.stroke();
  g.beginPath();
  g.moveTo(x + 10, y - 13);
  g.lineTo(x + 4, y - 13);
  g.lineTo(x + 10, y - 7);
  g.closePath();
  g.fillStyle = "#d8d8d2";
  g.fill();
  g.fillStyle = "#9a9aa2";
  g.fillRect(x - 6, y - 6, 12, 1.6);
  g.fillRect(x - 6, y - 2, 12, 1.6);
  g.fillRect(x - 6, y + 2, 8, 1.6);
  g.fillStyle = tokens.success;
  g.fillRect(x - 6, y + 6, 12, 1.6);
  g.fillStyle = tokens.critical;
  g.fillRect(x - 6, y + 9, 7, 1.6);
}

function drawDesktopIcon(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  glyph: (g: CanvasRenderingContext2D, x: number, y: number) => void,
  label: string,
) {
  glyph(g, x, y);
  g.font = `500 10.5px ${SANS}`;
  g.textAlign = "center";
  g.shadowColor = "rgba(0,0,0,0.6)";
  g.shadowBlur = 3;
  g.fillStyle = "#ffffff";
  g.fillText(label, x, y + 34);
  g.shadowColor = "transparent";
  g.shadowBlur = 0;
}

function paintDesktop(g: CanvasRenderingContext2D, w: number, h: number) {
  const showIcons = w >= 640;

  const wall = g.createLinearGradient(0, 0, w * 0.55, h);
  wall.addColorStop(0, "#2b1d70");
  wall.addColorStop(0.55, "#191157");
  wall.addColorStop(1, "#0b0834");
  g.fillStyle = wall;
  g.fillRect(0, 0, w, h);

  g.fillStyle = "rgba(255,255,255,0.05)";
  for (let x = 26; x < w - 12; x += 46) {
    for (let y = 26; y < h - 52; y += 46) g.fillRect(x, y, 2, 2);
  }

  const vignette = g.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.32,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.78,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  g.fillStyle = vignette;
  g.fillRect(0, 0, w, h);

  if (showIcons) {
    const iconX = 44;
    const step = Math.min(88, Math.max(70, (h - 150) / 4));
    drawDesktopIcon(g, iconX, 26, pcGlyph, "This PC");
    drawDesktopIcon(g, iconX, 26 + step, binGlyph, "Recycle Bin");
    drawDesktopIcon(g, iconX, 26 + step * 2, bugGlyph, "bugs.exe");
    drawDesktopIcon(g, iconX, 26 + step * 3, docGlyph, "release-gate.yml");
  }

  const ww = Math.round(Math.min(Math.max(w * 0.6, 330), 860));
  const wh = Math.round(Math.min(Math.max(h * 0.7, 360), 700));
  const wx = Math.round((w - ww) / 2 + (showIcons ? Math.min(72, w * 0.05) : 0));
  const wy = Math.round((h - 40 - wh) / 2);
  const titlebar = 34;
  const chrome = 42;

  g.save();
  g.shadowColor = "rgba(0,0,0,0.5)";
  g.shadowBlur = 34;
  g.shadowOffsetY = 12;
  rr(g, wx, wy, ww, wh, 10);
  g.fillStyle = "#f7f7f5";
  g.fill();
  g.restore();

  rr(g, wx, wy, ww, wh, 10);
  g.strokeStyle = "rgba(0,0,0,0.28)";
  g.lineWidth = 1;
  g.stroke();

  g.save();
  rr(g, wx, wy, ww, titlebar + 10, 10);
  g.clip();
  const titleGrad = g.createLinearGradient(0, wy, 0, wy + titlebar);
  titleGrad.addColorStop(0, "#f1f0ea");
  titleGrad.addColorStop(1, "#dcdbd4");
  g.fillStyle = titleGrad;
  g.fillRect(wx, wy, ww, titlebar);
  g.restore();

  g.fillStyle = "rgba(0,0,0,0.14)";
  g.fillRect(wx + 1, wy + titlebar, ww - 2, 1);

  const dots = ["#ff5f57", "#febc2e", "#28c840"];
  let dx = wx + 16;
  for (const color of dots) {
    g.fillStyle = color;
    g.beginPath();
    g.arc(dx, wy + titlebar / 2, 5, 0, PI2);
    g.fill();
    dx += 16;
  }

  g.font = `600 12px ${SANS}`;
  g.textAlign = "center";
  g.fillStyle = "#3c3d42";
  g.fillText(site.title, wx + ww / 2 + 20, wy + titlebar / 2 + 4);

  g.fillStyle = "#f7f7f5";
  g.fillRect(wx, wy + titlebar + 1, ww, chrome);
  g.fillStyle = "rgba(0,0,0,0.09)";
  g.fillRect(wx, wy + titlebar + 1 + chrome, ww, 1);

  const tabX = wx + 12;
  const tabY = wy + titlebar + 7;
  const tabW = Math.min(200, ww - 150);
  const tabH = chrome - 14;
  rr(g, tabX, tabY, tabW, tabH, 8);
  g.fillStyle = "#ffffff";
  g.fill();
  g.strokeStyle = "rgba(0,0,0,0.1)";
  g.lineWidth = 1;
  g.stroke();
  rr(g, tabX + 8, tabY + tabH / 2 - 7, 14, 14, 4);
  g.fillStyle = "#3d5afe";
  g.fill();
  g.font = `700 9px ${SANS}`;
  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.fillText("S", tabX + 15, tabY + tabH / 2 + 3.5);
  g.font = `500 11px ${SANS}`;
  g.textAlign = "left";
  g.fillStyle = "#22242a";
  g.fillText(DOMAIN, tabX + 28, tabY + tabH / 2 + 4);

  const urlX = tabX + tabW + 10;
  const urlW = ww - (urlX - wx) - 12;
  const urlY = tabY + 1;
  const urlH = tabH - 2;
  rr(g, urlX, urlY, urlW, urlH, urlH / 2);
  g.fillStyle = "#ffffff";
  g.fill();
  g.strokeStyle = "rgba(0,0,0,0.16)";
  g.stroke();
  g.strokeStyle = "#66686d";
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(urlX + 16, urlY + urlH / 2 - 2, 3, Math.PI, 0);
  g.stroke();
  g.fillStyle = "#66686d";
  g.fillRect(urlX + 13, urlY + urlH / 2 - 2, 6, 5.5);
  g.font = `400 11px ${MONO}`;
  g.textAlign = "left";
  g.fillStyle = "#4a4c50";
  g.fillText(site.domain, urlX + 27, urlY + urlH / 2 + 4);

  const pad = 30;
  const cx = wx + pad;
  const cw = ww - pad * 2;
  const contentTop = wy + titlebar + 1 + chrome;

  g.save();
  g.beginPath();
  g.rect(wx + 1, contentTop, ww - 2, wh - titlebar - 2);
  g.clip();

  g.textAlign = "left";
  let y = contentTop + 32;

  g.font = `650 23px ${SANS}`;
  g.fillStyle = "#101114";
  for (const line of wrap(g, HERO_HEADLINE, cw)) {
    g.fillText(line, cx, y);
    y += 28;
  }

  y += 6;
  g.font = `400 12px ${SANS}`;
  g.fillStyle = "#66686d";
  for (const line of wrap(g, site.description, cw)) {
    g.fillText(line, cx, y);
    y += 17;
  }

  y += 12;
  g.fillStyle = tokens.success;
  g.beginPath();
  g.arc(cx + 3, y - 4, 3.2, 0, PI2);
  g.fill();
  g.font = `400 11.5px ${SANS}`;
  g.fillStyle = "#4a4c50";
  g.fillText(availability.text, cx + 13, y);
  y += 26;

  const btnH = 34;
  let bx = cx;
  const drawButton = (label: string, primary: boolean, glyph: "in" | "gh") => {
    g.font = `600 12px ${SANS}`;
    const bw = g.measureText(label).width + 48;
    rr(g, bx, y, bw, btnH, 8);
    g.fillStyle = primary ? tokens.ink : "#ffffff";
    g.fill();
    if (!primary) {
      g.strokeStyle = "#cfcfc9";
      g.lineWidth = 1;
      g.stroke();
    }
    rr(g, bx + 12, y + btnH / 2 - 7, 14, 14, 3.5);
    g.fillStyle = glyph === "in" ? "#0a66c2" : tokens.ink;
    g.fill();
    g.font = `700 9px ${SANS}`;
    g.textAlign = "center";
    g.fillStyle = "#ffffff";
    g.fillText(glyph === "in" ? "in" : "GH", bx + 19, y + btnH / 2 + 3.5);
    g.font = `600 12px ${SANS}`;
    g.textAlign = "left";
    g.fillStyle = primary ? "#ffffff" : tokens.ink;
    g.fillText(label, bx + 33, y + btnH / 2 + 4);
    bx += bw + 12;
  };
  drawButton("Connect on LinkedIn", true, "in");
  drawButton("Open GitHub", false, "gh");

  y += btnH + 22;

  const cardsTop = y;
  const cardH = 98;
  if (cardsTop + cardH <= wy + wh - 12) {
    const gap = 12;
    const cardW = (cw - gap) / 2;
    const cards: Array<{ title: string; sub: string; url: string; glyph: "in" | "gh" }> = [
      {
        title: "Open LinkedIn",
        sub: "The full record: roles, dates, scope and outcomes.",
        url: readable(contact.linkedin),
        glyph: "in",
      },
      {
        title: "Open GitHub",
        sub: "The work itself: source, tests and the gating pipeline.",
        url: readable(contact.github),
        glyph: "gh",
      },
    ];
    cards.forEach((card, i) => {
      const cardX = cx + i * (cardW + gap);
      rr(g, cardX, cardsTop, cardW, cardH, 12);
      g.fillStyle = "#ffffff";
      g.fill();
      g.strokeStyle = "#cfcfc9";
      g.lineWidth = 1;
      g.stroke();
      rr(g, cardX + 12, cardsTop + 12, 26, 26, 6);
      g.fillStyle = tokens.ink;
      g.fill();
      rr(g, cardX + 17.5, cardsTop + 17.5, 15, 15, 3.6);
      g.fillStyle = card.glyph === "in" ? "#0a66c2" : "#2f343c";
      g.fill();
      g.font = `700 8.5px ${SANS}`;
      g.textAlign = "center";
      g.fillStyle = "#ffffff";
      g.fillText(card.glyph === "in" ? "in" : "GH", cardX + 25, cardsTop + 28);
      g.font = `600 12px ${SANS}`;
      g.textAlign = "left";
      g.fillStyle = "#101114";
      g.fillText(card.title, cardX + 48, cardsTop + 23);
      g.font = `400 10.5px ${SANS}`;
      g.fillStyle = "#66686d";
      let sy = cardsTop + 52;
      for (const line of wrap(g, card.sub, cardW - 24)) {
        g.fillText(line, cardX + 12, sy);
        sy += 14;
      }
      g.font = `400 10px ${MONO}`;
      g.fillStyle = "#4a4c50";
      g.fillText(card.url, cardX + 12, cardsTop + cardH - 12);
    });
  }

  g.restore();

  g.fillStyle = "#d8d8d2";
  rr(g, wx + ww - 9, contentTop + 8, 4, Math.min(46, wh * 0.2), 2);
  g.fill();

  const barH = 40;
  const barY = h - barH;
  g.fillStyle = "rgba(16,17,20,0.94)";
  g.fillRect(0, barY, w, barH);
  g.fillStyle = "rgba(255,255,255,0.12)";
  g.fillRect(0, barY, w, 1);

  rr(g, 12, barY + 7, 88, 26, 6);
  g.fillStyle = "#23262d";
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.16)";
  g.lineWidth = 1;
  g.stroke();
  const s = 4.6;
  const gapS = 1.6;
  g.fillStyle = "#e6e8eb";
  g.fillRect(26, barY + 14, s, s);
  g.fillRect(26 + s + gapS, barY + 14, s, s);
  g.fillRect(26, barY + 14 + s + gapS, s, s);
  g.fillRect(26 + s + gapS, barY + 14 + s + gapS, s, s);
  g.font = `500 11.5px ${SANS}`;
  g.textAlign = "left";
  g.fillStyle = "#e6e8eb";
  g.fillText("Start", 44, barY + 24);

  rr(g, 112, barY + 7, 180, 26, 6);
  g.fillStyle = "#2b2e35";
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.1)";
  g.stroke();
  rr(g, 120, barY + 13, 14, 14, 4);
  g.fillStyle = "#3d5afe";
  g.fill();
  g.font = `700 9px ${SANS}`;
  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.fillText("S", 127, barY + 23);
  g.font = `400 11px ${SANS}`;
  g.textAlign = "left";
  g.fillStyle = "#e6e8eb";
  g.fillText(DOMAIN, 142, barY + 24);

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  g.font = `400 11px ${MONO}`;
  g.textAlign = "right";
  g.fillStyle = "#e6e8eb";
  g.fillText(`${hh}:${mm}`, w - 16, barY + 17);
  g.font = `400 9.5px ${SANS}`;
  g.fillStyle = "#8b939d";
  g.fillText(`${dd}.${mo}.${now.getFullYear()}`, w - 16, barY + 30);
}

function mustContext(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  return ctx;
}

class Engine {
  tool: ToolId = "hammer";
  onIntegrity: (value: number) => void;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private desktop: HTMLCanvasElement;
  private dctx: CanvasRenderingContext2D;
  private holes: HTMLCanvasElement;
  private hctx: CanvasRenderingContext2D;
  private damage: HTMLCanvasElement;
  private gctx: CanvasRenderingContext2D;
  private surface: HTMLCanvasElement;
  private sctx: CanvasRenderingContext2D;
  private scratch: HTMLCanvasElement | null = null;

  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private resizeRaf = 0;
  private lastT = 0;
  private shake = 0;
  private reduced: boolean;
  private particles: Particle[] = [];
  private termites: Termite[] = [];
  private pointer = { x: 0, y: 0, down: false, inside: false, touch: false };
  private aim = 0;
  private recoil = 0;
  private lastShot = 0;
  private integrityAt = 0;
  private surfaceDirty = true;
  private bgGradient: CanvasGradient | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    options: { reduced: boolean; onIntegrity: (value: number) => void },
  ) {
    this.canvas = canvas;
    this.ctx = mustContext(canvas);
    this.desktop = document.createElement("canvas");
    this.dctx = mustContext(this.desktop);
    this.holes = document.createElement("canvas");
    this.hctx = mustContext(this.holes);
    this.damage = document.createElement("canvas");
    this.gctx = mustContext(this.damage);
    this.surface = document.createElement("canvas");
    this.sctx = mustContext(this.surface);
    this.reduced = options.reduced;
    this.onIntegrity = options.onIntegrity;
  }

  start() {
    this.resize();
    window.addEventListener("resize", this.onResize);
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    window.removeEventListener("resize", this.onResize);
  }

  private onResize = () => {
    if (this.resizeRaf) return;
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w === this.w && h === this.h && dpr === this.dpr) return;
      this.resize();
    });
  };

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const pw = Math.round(this.w * this.dpr);
    const ph = Math.round(this.h * this.dpr);
    for (const canvas of [
      this.canvas,
      this.desktop,
      this.holes,
      this.damage,
      this.surface,
    ]) {
      canvas.width = pw;
      canvas.height = ph;
    }
    this.dctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.hctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.gctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sctx.setTransform(1, 0, 0, 1, 0, 0);
    paintDesktop(this.dctx, this.w, this.h);
    this.hctx.clearRect(0, 0, this.w, this.h);
    this.gctx.clearRect(0, 0, this.w, this.h);
    this.particles = [];
    this.termites = [];
    this.surfaceDirty = true;
    const bg = this.ctx.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, "#04050a");
    bg.addColorStop(1, "#0a0b16");
    this.bgGradient = bg;
    this.onIntegrity(100);
  }

  reset() {
    this.hctx.clearRect(0, 0, this.w, this.h);
    this.gctx.clearRect(0, 0, this.w, this.h);
    this.particles = [];
    this.termites = [];
    this.surfaceDirty = true;
    this.onIntegrity(100);
  }

  setTool(tool: ToolId) {
    this.tool = tool;
  }

  leave() {
    this.pointer.inside = false;
  }

  press(x: number, y: number) {
    this.pointer.down = true;
    this.pointer.x = x;
    this.pointer.y = y;
    const tool = this.tool;
    if (tool === "hammer") this.hammer(x, y);
    else if (tool === "chainsaw") this.gouge(x, y, x, y);
    else if (tool === "machinegun") this.lastShot = 0;
    else if (tool === "stamp") this.stamp(x, y);
    else if (tool === "termites") this.dropTermites(x, y);
  }

  move(x: number, y: number, touch: boolean) {
    this.pointer.inside = true;
    this.pointer.touch = touch;
    if (this.pointer.down && this.tool === "chainsaw") {
      this.gouge(this.pointer.x, this.pointer.y, x, y);
    }
    const dx = x - this.pointer.x;
    const dy = y - this.pointer.y;
    if (Math.hypot(dx, dy) > 1) this.aim = Math.atan2(dy, dx);
    this.pointer.x = x;
    this.pointer.y = y;
  }

  release() {
    this.pointer.down = false;
  }

  private loop = (t: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, Math.max(0, (t - this.lastT) / 1000));
    this.lastT = t;
    this.update(dt);
    this.render();
  };

  private update(dt: number) {
    this.shake *= Math.exp(-5 * dt);
    if (this.shake < 0.05) this.shake = 0;
    this.recoil *= Math.exp(-8 * dt);

    const now = performance.now();
    if (this.pointer.down) {
      const tool = this.tool;
      if (tool === "machinegun" && now - this.lastShot >= 82) {
        this.shoot();
        this.lastShot = now;
      } else if (tool === "flamethrower") {
        this.burn();
      } else if (tool === "colorthrower" && now - this.lastShot >= 130) {
        this.launchPaint();
        this.lastShot = now;
      } else if (tool === "phaser") {
        this.phaser();
      } else if (tool === "washing") {
        this.washNow();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.vx *= Math.exp(-1.5 * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.kind === "bubble") p.x += Math.sin((p.maxLife - p.life) * 8) * 12 * dt;
      if (
        (p.kind === "chip" || p.kind === "dust" || p.kind === "casing") &&
        p.y > this.h - 6 &&
        p.vy > 0
      ) {
        p.y = this.h - 6;
        p.vy *= -0.35;
        p.vx *= 0.6;
        p.vr *= 0.5;
      }
      if (p.kind === "smoke") p.size += 26 * dt;
    }

    for (const termite of this.termites) {
      termite.angle += rand(-1.5, 1.5) * dt * 4;
      const nx = termite.x + Math.cos(termite.angle) * termite.speed * dt;
      const ny = termite.y + Math.sin(termite.angle) * termite.speed * dt;
      if (nx < 24 || nx > this.w - 24) termite.angle = Math.PI - termite.angle;
      else termite.x = nx;
      if (ny < 24 || ny > this.h - 64) termite.angle = -termite.angle;
      else termite.y = ny;
      termite.biteIn -= dt;
      if (termite.biteIn <= 0) {
        this.bite(termite.x, termite.y);
        termite.biteIn = rand(0.07, 0.2);
      }
    }

    if (now - this.integrityAt > 1000) {
      this.integrityAt = now;
      this.onIntegrity(this.measureIntegrity());
    }
  }

  private spawn(
    kind: ParticleKind,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    color: string,
    gravity = 0,
  ) {
    if (this.particles.length > (this.reduced ? 160 : 420)) return;
    this.particles.push({
      kind,
      x,
      y,
      vx,
      vy,
      life,
      maxLife: life,
      size,
      color,
      gravity,
      rot: Math.random() * PI2,
      vr: rand(-6, 6),
    });
  }

  private lastKick = 0;
  private kick(amount: number) {
    const now = performance.now();
    const scaled = this.reduced ? amount * 0.15 : amount;
    const gate = now - this.lastKick < 55 ? 0.25 : 1;
    this.lastKick = now;
    this.shake = Math.min(this.shake + scaled * gate, this.reduced ? 3 : 16);
  }

  private hole(x: number, y: number, r: number, alpha: number) {
    const g = this.hctx;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(0.72, `rgba(0,0,0,${alpha * 0.9})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, PI2);
    g.fill();
    this.surfaceDirty = true;
  }

  private erase(x: number, y: number, r: number) {
    const g = this.hctx;
    g.save();
    g.globalCompositeOperation = "destination-out";
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.7, "rgba(0,0,0,0.85)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, PI2);
    g.fill();
    g.restore();
    this.surfaceDirty = true;
  }

  private char(x: number, y: number, r: number) {
    const g = this.gctx;
    g.save();
    g.translate(x, y);
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * PI2;
      const d = r * rand(0.1, 0.4);
      g.fillStyle = "rgba(12,9,7,0.55)";
      g.beginPath();
      g.arc(Math.cos(a) * d, Math.sin(a) * d, r * rand(0.6, 0.9), 0, PI2);
      g.fill();
    }
    const grad = g.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
    grad.addColorStop(0, "rgba(14,10,8,0.85)");
    grad.addColorStop(0.55, "rgba(38,24,14,0.5)");
    grad.addColorStop(0.82, "rgba(64,40,20,0.28)");
    grad.addColorStop(1, "rgba(70,44,22,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(0, 0, r, 0, PI2);
    g.fill();
    g.fillStyle = "rgba(10,8,6,0.5)";
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * PI2;
      const d = r * rand(0.4, 1.05);
      g.beginPath();
      g.arc(Math.cos(a) * d, Math.sin(a) * d, rand(0.5, 1.6), 0, PI2);
      g.fill();
    }
    g.restore();
  }

  private hammer(x: number, y: number) {
    const r = rand(13, 22);
    this.hole(x, y, r, 0.96);
    this.hole(x, y, r * 1.55, 0.4);
    this.glassBruise(x, y, r);
    this.crack(x, y, r);
    this.spawn("flash", x, y, 0, 0, 0.09, r * 1.6, "#fff6d8");
    this.kick(11);
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * PI2;
      const sp = rand(120, 420);
      this.spawn("spark", x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.25, 0.5), 1.6, "#fff6d8");
    }
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * PI2;
      const sp = rand(60, 180);
      this.spawn("chip", x, y, Math.cos(a) * sp, Math.sin(a) * sp - 80, rand(0.7, 1.3), rand(1.6, 3), "rgba(235,238,244,0.95)", 900);
    }
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * PI2;
      const sp = rand(40, 130);
      this.spawn("dust", x, y, Math.cos(a) * sp, Math.sin(a) * sp - 40, rand(0.5, 0.9), 2.4, "#c9c4b8");
    }
  }

  private glassBruise(x: number, y: number, r: number) {
    const g = this.gctx;
    g.save();
    g.translate(x, y);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI2 + rand(-0.4, 0.4);
      const d = r * rand(0.25, 0.85);
      const rad = r * rand(0.3, 0.55);
      g.fillStyle = `rgba(226,229,236,${rand(0.3, 0.5)})`;
      g.beginPath();
      g.ellipse(Math.cos(a) * d, Math.sin(a) * d, rad, rad * rand(0.7, 1.1), a, 0, PI2);
      g.fill();
    }
    g.fillStyle = "rgba(120,126,138,0.22)";
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * PI2;
      const d = r * rand(0.5, 1.25);
      g.beginPath();
      g.arc(Math.cos(a) * d, Math.sin(a) * d, rand(0.5, 1.4), 0, PI2);
      g.fill();
    }
    g.restore();
  }

  private crack(x: number, y: number, r: number) {
    const g = this.gctx;
    g.save();
    g.translate(x, y);
    const arms = 9 + Math.floor(Math.random() * 5);
    const armPoints: Array<[number, number]> = [];
    for (let i = 0; i < arms; i++) {
      const a = (i / arms) * PI2 + rand(-0.2, 0.2);
      const len = r * rand(2.2, 4.4);
      g.beginPath();
      g.moveTo(0, 0);
      let px = 0;
      let py = 0;
      for (let s = 1; s <= 4; s++) {
        const ja = a + rand(-0.28, 0.28);
        const d = (len / 4) * s;
        px = Math.cos(ja) * d;
        py = Math.sin(ja) * d;
        g.lineTo(px, py);
      }
      armPoints.push([px, py]);
      g.strokeStyle = "rgba(20,22,28,0.4)";
      g.lineWidth = 3.2;
      g.stroke();
      g.strokeStyle = `rgba(255,255,255,${rand(0.75, 0.95)})`;
      g.lineWidth = rand(1, 1.7);
      g.stroke();
      if (Math.random() < 0.6) {
        g.strokeStyle = "rgba(255,255,255,0.5)";
        g.lineWidth = 0.9;
        g.beginPath();
        g.moveTo(px * 0.55, py * 0.55);
        g.lineTo(px * 0.55 + Math.cos(a + 1.1) * len * 0.35, py * 0.55 + Math.sin(a + 1.1) * len * 0.35);
        g.stroke();
      }
    }
    g.strokeStyle = "rgba(255,255,255,0.45)";
    g.lineWidth = 1.2;
    for (let ring = 0; ring < 2; ring++) {
      const rad = r * (1.4 + ring * 0.7);
      const startA = Math.random() * PI2;
      const sweep = rand(1.2, 2.6);
      g.beginPath();
      g.arc(0, 0, rad, startA, startA + sweep);
      g.stroke();
    }
    for (const [px, py] of armPoints) {
      if (Math.random() < 0.55) {
        g.fillStyle = "rgba(255,255,255,0.7)";
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px + rand(-3, 3), py + rand(-3, 3));
        g.lineTo(px + rand(-4, 4), py + rand(2, 5));
        g.closePath();
        g.fill();
      }
    }
    g.restore();
  }

  private gouge(x0: number, y0: number, x1: number, y1: number) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + dx * t + rand(-1.5, 1.5);
      const y = y0 + dy * t + rand(-1.5, 1.5);
      this.hole(x, y, rand(4, 8), 1);
      this.hole(x, y, rand(8, 12), 0.4);
    }
    this.kerf(x0, y0, x1, y1);
    this.kick(0.6);
    if (Math.random() < 0.8) {
      const a = Math.atan2(dy, dx) + Math.PI / 2 + rand(-0.5, 0.5);
      const sp = rand(60, 220);
      this.spawn("dust", x1, y1, Math.cos(a) * sp, Math.sin(a) * sp - 60, rand(0.4, 0.7), 1.8, "#b8b2a4");
    }
    if (Math.random() < 0.5) {
      const a = Math.atan2(dy, dx) + Math.PI / 2 + rand(-0.6, 0.6);
      const sp = rand(90, 240);
      this.spawn("chip", x1, y1, Math.cos(a) * sp, Math.sin(a) * sp - 100, rand(0.8, 1.5), rand(2, 3.6), "rgba(176,172,160,0.95)", 950);
    }
    this.recoil = Math.min(6, this.recoil + dist * 0.02);
  }

  private kerf(x0: number, y0: number, x1: number, y1: number) {
    const g = this.gctx;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const angle = Math.atan2(dy, dx);
    const perp = angle + Math.PI / 2;
    g.save();
    g.lineCap = "round";
    g.strokeStyle = "rgba(148,148,158,0.32)";
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
    g.strokeStyle = "rgba(214,217,224,0.4)";
    g.lineWidth = 1.2;
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const wobble = rand(-1.6, 1.6);
      const px = x0 + dx * t + Math.cos(perp) * wobble;
      const py = y0 + dy * t + Math.sin(perp) * wobble;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.3)";
    g.lineWidth = 0.9;
    const notchCount = Math.max(2, Math.floor(Math.hypot(dx, dy) / 9));
    for (let i = 0; i < notchCount; i++) {
      const t = Math.random();
      const side = Math.random() < 0.5 ? 1 : -1;
      const bx = x0 + dx * t + Math.cos(perp) * 3.4 * side;
      const by = y0 + dy * t + Math.sin(perp) * 3.4 * side;
      const len = rand(2, 5);
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx + Math.cos(angle) * len * side, by + Math.sin(angle) * len * side);
      g.stroke();
    }
    g.restore();
  }

  private shoot() {
    const spread = this.reduced ? 2 : 5;
    const x = this.pointer.x + rand(-spread, spread);
    const y = this.pointer.y + rand(-spread, spread);
    this.hole(x, y, 3.4, 1);
    this.bulletHole(x, y);
    this.spawn("flash", x, y, 0, 0, 0.06, 13, "#ffe9a8");
    this.kick(1.1);
    this.recoil = 5;
    const a = Math.random() * PI2;
    this.spawn("spark", x, y, Math.cos(a) * 200, Math.sin(a) * 200, 0.12, 1.4, "#ffe9a8");
    this.spawn("casing", x + 8, y + 4, rand(60, 120), rand(-300, -220), 0.9, 2, "#d8b25a", 900);
    if (Math.random() < 0.4) {
      this.spawn("chip", x, y, rand(-160, 160), rand(-260, -120), rand(0.4, 0.8), rand(1.2, 2.2), "rgba(235,238,244,0.95)", 900);
    }
  }

  private bulletHole(x: number, y: number) {
    const g = this.gctx;
    g.save();
    g.translate(x, y);
    g.fillStyle = "rgba(8,7,6,0.95)";
    g.beginPath();
    g.arc(0, 0, 3, 0, PI2);
    g.fill();
    g.strokeStyle = "rgba(228,231,238,0.5)";
    g.lineWidth = 1.1;
    g.beginPath();
    g.arc(0, 0, 4.4, 0, PI2);
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * PI2;
      const len = rand(4, 10);
      g.beginPath();
      g.moveTo(Math.cos(a) * 4.4, Math.sin(a) * 4.4);
      g.lineTo(Math.cos(a + rand(-0.3, 0.3)) * (4.4 + len), Math.sin(a + rand(-0.3, 0.3)) * (4.4 + len));
      g.stroke();
    }
    g.fillStyle = "rgba(210,214,222,0.4)";
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * PI2;
      const d = rand(4, 8);
      g.beginPath();
      g.arc(Math.cos(a) * d, Math.sin(a) * d, rand(0.4, 1), 0, PI2);
      g.fill();
    }
    g.restore();
  }

  private burn() {
    const palette = TOOL_PALETTE.flamethrower;
    const x = this.pointer.x + rand(-5, 5);
    const y = this.pointer.y + rand(-5, 5);
    this.hole(x, y, rand(9, 16), 0.9);
    this.char(x, y, rand(17, 27));
    this.spawn("heat", x, y, 0, 0, 0.35, rand(34, 48), "rgba(255,130,50,0.10)");
    this.kick(0.25);
    const n = this.reduced ? 2 : 5;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + rand(-0.55, 0.55);
      const sp = rand(60, 210);
      this.spawn(
        "fire",
        x,
        y,
        Math.cos(a) * sp * 0.4,
        Math.sin(a) * sp,
        rand(0.35, 0.65),
        rand(5, 12),
        Math.random() < 0.5 ? palette.flameOuter : palette.flameMid,
      );
    }
    if (Math.random() < 0.35) {
      this.spawn("smoke", x + rand(-8, 8), y - 6, rand(-14, 14), rand(-70, -40), rand(1.1, 2), rand(7, 12), "rgba(96,92,88,0.16)");
    }
    if (Math.random() < 0.45) {
      this.spawn("ember", x, y, rand(-30, 30), rand(-260, -140), rand(0.8, 1.4), 1.6, palette.flameMid, 120);
    }
  }

  private phaser() {
    const { x, y } = this.pointer;
    const r = 13 + Math.random() * 5;
    this.hole(x, y, r, 1);
    this.hole(x, y, r * 1.5, 0.4);
    this.moltenRim(x, y, r);
    this.kick(0.5);
    const n = this.reduced ? 1 : 4;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * PI2;
      const sp = rand(80, 300);
      this.spawn("spark", x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.2, 0.4), 1.8, "#bff0ff");
    }
    if (Math.random() < 0.4) {
      this.spawn("arc", x, y, rand(-40, 40), rand(-40, 40), 0.12, rand(10, 22), "#bff0ff");
    }
    if (Math.random() < 0.3) {
      this.spawn("flash", x, y, 0, 0, 0.07, r * 2.4, "#cfefff");
    }
  }

  private moltenRim(x: number, y: number, r: number) {
    const g = this.gctx;
    g.save();
    g.translate(x, y);
    this.char(0, 0, r * 1.6);
    g.strokeStyle = "rgba(255,168,72,0.4)";
    g.lineWidth = 2.6;
    g.beginPath();
    g.arc(0, 0, r * 0.95, 0, PI2);
    g.stroke();
    g.strokeStyle = "rgba(92,196,224,0.55)";
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(0, 0, r * 1.18, 0, PI2);
    g.stroke();
    g.fillStyle = "rgba(255,196,120,0.28)";
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * PI2;
      const d = r * rand(0.9, 1.25);
      g.beginPath();
      g.arc(Math.cos(a) * d, Math.sin(a) * d, rand(0.6, 1.8), 0, PI2);
      g.fill();
    }
    g.restore();
  }

  private stamp(x: number, y: number) {
    const text = STAMP_TEXTS[Math.floor(Math.random() * STAMP_TEXTS.length)];
    const color = STAMP_COLORS[Math.floor(Math.random() * STAMP_COLORS.length)];
    const size = Math.round(Math.min(30, Math.max(16, Math.min(this.w, this.h) / 24)));
    const g = this.gctx;
    g.save();
    g.translate(x, y);
    g.rotate(rand(-0.35, 0.35));
    g.globalAlpha = 0.92;
    g.font = `700 ${size}px ${SANS}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const width = g.measureText(text).width;
    g.strokeStyle = color;
    g.lineWidth = 2;
    rr(g, -width / 2 - 10, -size * 0.8, width + 20, size * 1.6, 6);
    g.stroke();
    g.fillStyle = color;
    g.fillText(text, 0, 1);
    g.restore();
    this.kick(3);
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * PI2;
      const sp = rand(40, 160);
      this.spawn("dust", x, y, Math.cos(a) * sp, Math.sin(a) * sp, 0.3, 1.8, color);
    }
  }

  private dropTermites(x: number, y: number) {
    for (const termite of this.termites) {
      if (Math.hypot(termite.x - x, termite.y - y) < 20) {
        this.squish(termite);
        return;
      }
    }
    if (this.termites.length >= (this.reduced ? 6 : 12)) return;
    for (let i = 0; i < 2; i++) {
      this.termites.push({
        x: x + rand(-13, 13),
        y: y + rand(-13, 13),
        angle: Math.random() * PI2,
        speed: rand(26, 56),
        phase: Math.random() * 10,
        biteIn: Math.random() * 0.15,
      });
    }
  }

  private squish(termite: Termite) {
    this.termites = this.termites.filter((other) => other !== termite);
    this.hole(termite.x, termite.y, 7, 0.95);
    const g = this.gctx;
    g.fillStyle = "rgba(90,40,20,0.8)";
    g.beginPath();
    g.ellipse(termite.x, termite.y, 8, 4.5, termite.angle, 0, PI2);
    g.fill();
    this.spawn("pop", termite.x, termite.y, 0, 0, 0.3, 8, "#7a2b18");
    this.kick(2.5);
  }

  private washNow() {
    const { x, y } = this.pointer;
    this.erase(x, y, 36);
    const g = this.gctx;
    g.save();
    g.globalCompositeOperation = "destination-out";
    const grad = g.createRadialGradient(x, y, 0, x, y, 34);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.7, "rgba(0,0,0,0.85)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, 34, 0, PI2);
    g.fill();
    g.restore();
    if (Math.random() < 0.5) {
      this.spawn(
        "droplet",
        x + rand(-16, 16),
        y + rand(-16, 16),
        rand(-40, 40),
        rand(-120, -60),
        0.4,
        2.2,
        "#7cc3f5",
        500,
      );
    }
    if (Math.random() < 0.45) {
      this.spawn(
        "streak",
        x + rand(-20, 20),
        y + rand(-14, 14),
        rand(-20, 20),
        rand(30, 90),
        rand(0.5, 0.9),
        rand(1.2, 2.4),
        "rgba(200,232,255,0.5)",
        260,
      );
    }
    if (Math.random() < 0.25) {
      this.spawn(
        "bubble",
        x + rand(-20, 20),
        y + rand(-20, 20),
        rand(-20, 20),
        rand(-90, -50),
        rand(1.2, 2.2),
        rand(3, 8),
        "#ffffff",
        -30,
      );
    }
  }

  private launchPaint() {
    const color = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
    const x = this.pointer.x + rand(-10, 10);
    const y = this.pointer.y + rand(-10, 10);
    this.paintSplat(x, y, color);
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * PI2;
      const sp = rand(80, 240);
      this.spawn("droplet", x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.25, 0.45), 2.2, color, 600);
    }
    this.kick(0.4);
  }

  private paintSplat(x: number, y: number, color: string) {
    const g = this.gctx;
    g.save();
    g.globalAlpha = 0.95;
    g.fillStyle = color;
    const r = rand(11, 21);
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * PI2;
      const d = Math.random() * r * 0.7;
      g.beginPath();
      g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * rand(0.55, 1.05), 0, PI2);
      g.fill();
    }
    const drops = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < drops; i++) {
      const a = Math.random() * PI2;
      const d = r + Math.random() * 14;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      const dr = rand(1.5, 5);
      g.beginPath();
      g.arc(px, py, dr, 0, PI2);
      g.fill();
      if (Math.random() < 0.5) {
        const len = rand(8, 34);
        g.beginPath();
        g.moveTo(px - dr * 0.5, py);
        g.lineTo(px - dr * 0.5, py + len);
        g.lineTo(px + dr * 0.5, py + len);
        g.lineTo(px + dr * 0.5, py);
        g.closePath();
        g.fill();
      }
    }
    g.restore();
    g.save();
    g.globalAlpha = 0.9;
    g.fillStyle = color;
    g.strokeStyle = "rgba(0,0,0,0.16)";
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(x, y, r * 0.92, 0, PI2);
    g.fill();
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.2)";
    g.beginPath();
    g.ellipse(x - r * 0.22, y - r * 0.26, r * 0.42, r * 0.3, -0.6, 0, PI2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.08)";
    g.beginPath();
    g.ellipse(x, y, r * 1.05, r * 0.75, 0, 0, PI2);
    g.fill();
    g.restore();
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * PI2;
      const sp = rand(60, 260);
      this.spawn("droplet", x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.3, 0.5), 2.2, color, 700);
    }
  }

  private bite(x: number, y: number) {
    this.hole(x, y, rand(2, 4.5), 1);
    const g = this.gctx;
    g.strokeStyle = "rgba(214,216,222,0.4)";
    g.lineWidth = 0.8;
    const nicks = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < nicks; i++) {
      const a = Math.random() * PI2;
      const r0 = rand(2.5, 4.5);
      const r1 = r0 + rand(1.5, 3.5);
      g.beginPath();
      g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      g.lineTo(x + Math.cos(a + rand(-0.5, 0.5)) * r1, y + Math.sin(a + rand(-0.5, 0.5)) * r1);
      g.stroke();
    }
    if (Math.random() < 0.5) {
      this.spawn("dust", x, y, rand(-30, 30), rand(-30, 30), 0.3, 1.4, "#cbbfa8");
    }
  }

  private measureIntegrity() {
    const sw = 320;
    const sh = 200;
    if (!this.scratch) {
      this.scratch = document.createElement("canvas");
      this.scratch.width = sw;
      this.scratch.height = sh;
    }
    const sctx = this.scratch.getContext("2d", { willReadFrequently: true });
    if (!sctx) return 100;
    sctx.clearRect(0, 0, sw, sh);
    sctx.drawImage(this.holes, 0, 0, sw, sh);
    sctx.drawImage(this.damage, 0, 0, sw, sh);
    const data = sctx.getImageData(0, 0, sw, sh).data;
    let damaged = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 16) damaged++;
    }
    const fraction = damaged / (sw * sh);
    return Math.max(0, 100 - 100 * Math.pow(fraction, 0.75));
  }

  private render() {
    const { ctx, w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (!this.bgGradient) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#04050a");
      bg.addColorStop(1, "#0a0b16");
      this.bgGradient = bg;
    }
    ctx.fillStyle = this.bgGradient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    const shake = this.shake;
    if (shake > 0.1) {
      ctx.translate(rand(-shake, shake), rand(-shake, shake));
    }

    if (this.surfaceDirty) {
      this.sctx.setTransform(1, 0, 0, 1, 0, 0);
      this.sctx.clearRect(0, 0, this.surface.width, this.surface.height);
      this.sctx.drawImage(this.desktop, 0, 0);
      this.sctx.globalCompositeOperation = "destination-out";
      this.sctx.drawImage(this.holes, 0, 0);
      this.sctx.globalCompositeOperation = "source-over";
      this.surfaceDirty = false;
    }
    ctx.drawImage(this.surface, 0, 0, w, h);
    ctx.drawImage(this.damage, 0, 0, w, h);

    for (const termite of this.termites) this.drawTermite(ctx, termite);

    this.drawParticles(ctx);

    if (this.pointer.down && this.tool === "phaser") this.drawPhaserGlow(ctx);
    if (this.pointer.down && this.tool === "washing") this.drawWashSheen(ctx);

    if (this.pointer.inside && !this.pointer.touch) this.drawCursor(ctx);

    ctx.restore();
  }

  private drawPhaserGlow(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pointer;
    const glow = TOOL_PALETTE.phaser.glowRgb;
    const flicker = rand(0.7, 1.05);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 46);
    grad.addColorStop(0, `rgba(160,235,255,${0.42 * flicker})`);
    grad.addColorStop(1, "rgba(160,235,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 46, 0, PI2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${glow},${0.8 * flicker})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 17 + Math.sin(performance.now() / 90) * 2, 0, PI2);
    ctx.stroke();
    ctx.restore();
  }

  private drawWashSheen(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pointer;
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 42);
    grad.addColorStop(0, "rgba(190,225,255,0.22)");
    grad.addColorStop(1, "rgba(190,225,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, PI2);
    ctx.fill();
    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      const t = Math.max(0, p.life / p.maxLife);
      if (p.kind === "fire" || p.kind === "spark" || p.kind === "ember") {
        ctx.globalCompositeOperation = "lighter";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }
      switch (p.kind) {
        case "fire": {
          const grow = 1.7 - t * 0.7;
          const rx = p.size * 0.72;
          const ry = p.size * grow;
          const dir = Math.atan2(p.vy, p.vx) + Math.PI / 2;
          ctx.globalAlpha = Math.min(1, t * 1.5) * 0.5;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, rx, ry * 1.35, dir, 0, PI2);
          ctx.fill();
          ctx.globalAlpha = Math.min(1, t * 1.5) * 0.85;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, rx * 0.66, ry, dir, 0, PI2);
          ctx.fill();
          ctx.globalAlpha = Math.min(1, t * 2) * 0.9;
          ctx.fillStyle = "#fff3b0";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, rx * 0.34, ry * 0.5, dir, 0, PI2);
          ctx.fill();
          break;
        }
        case "spark": {
          ctx.globalAlpha = t;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
          ctx.stroke();
          break;
        }
        case "ember": {
          ctx.globalAlpha = t;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, PI2);
          ctx.fill();
          break;
        }
        case "casing": {
          ctx.globalAlpha = Math.min(1, t * 2);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-2.2, -1, 4.4, 2);
          ctx.restore();
          break;
        }
        case "dust": {
          ctx.globalAlpha = t * 0.8;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          break;
        }
        case "droplet": {
          ctx.globalAlpha = t * 0.9;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, PI2);
          ctx.fill();
          break;
        }
        case "bubble": {
          ctx.globalAlpha = t * 0.8;
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, PI2);
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.fill();
          break;
        }
        case "pop": {
          ctx.globalAlpha = t;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1 - t) * 2.4), 0, PI2);
          ctx.stroke();
          break;
        }
        case "flash": {
          const fade = t * t;
          ctx.globalAlpha = fade;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.6;
          const spikes = 6;
          for (let i = 0; i < spikes; i++) {
            const a = (i / spikes) * PI2 + p.rot;
            const inner = p.size * 0.25;
            const outer = p.size * (0.6 + (i % 2) * 0.5) * fade;
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(a) * inner, p.y + Math.sin(a) * inner);
            ctx.lineTo(p.x + Math.cos(a) * outer, p.y + Math.sin(a) * outer);
            ctx.stroke();
          }
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.3 * fade, 0, PI2);
          ctx.fill();
          break;
        }
        case "smoke": {
          ctx.globalAlpha = t * 0.55;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, PI2);
          ctx.fill();
          break;
        }
        case "chip": {
          ctx.globalAlpha = Math.min(1, t * 1.6);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.35, p.size * 2, p.size * 0.7);
          ctx.restore();
          break;
        }
        case "arc": {
          ctx.globalAlpha = t;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          let ax = p.x;
          let ay = p.y;
          for (let i = 1; i <= 3; i++) {
            ax += p.vx / 3 + rand(-6, 6);
            ay += p.vy / 3 + rand(-6, 6);
            ctx.lineTo(ax, ay);
          }
          ctx.stroke();
          break;
        }
        case "streak": {
          ctx.globalAlpha = t * 0.7;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 3, -p.size * 0.35, p.size * 6, p.size * 0.7);
          ctx.restore();
          break;
        }
        case "heat": {
          ctx.globalAlpha = t * 0.5;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1.4 - t * 0.4), 0, PI2);
          ctx.fill();
          break;
        }
      }
    }
    ctx.restore();
  }

  private drawTermite(ctx: CanvasRenderingContext2D, termite: Termite) {
    const p = TOOL_PALETTE.termites;
    const time = performance.now() / 1000;
    const wiggle = Math.sin(time * 9 + termite.phase);
    const wiggle2 = Math.sin(time * 9 + termite.phase + 2.1);
    ctx.save();
    ctx.translate(termite.x, termite.y);
    ctx.rotate(termite.angle);
    ctx.strokeStyle = p.cursorLeg;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = -1; i <= 1; i++) {
      const swing = i % 2 === 0 ? wiggle : wiggle2;
      ctx.moveTo(-3 + i * 3.4, 1.6);
      ctx.lineTo(-3 + i * 3.4 + swing * 1.8, 6.5);
      ctx.moveTo(-3 + i * 3.4, -1.6);
      ctx.lineTo(-3 + i * 3.4 - swing * 1.8, -6.5);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(2.2, 0.8, 4.6, 3.4, 0, 0, PI2);
    ctx.fill();
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(2, 0, 4.6, 3.8, 0, 0, PI2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,240,210,0.14)";
    ctx.beginPath();
    ctx.ellipse(2, -1.2, 3.4, 1.5, 0, 0, PI2);
    ctx.fill();
    ctx.strokeStyle = "rgba(40,28,14,0.5)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-1.4, -3.4);
    ctx.lineTo(-0.6, 3.4);
    ctx.moveTo(5, -3.2);
    ctx.lineTo(4.4, 3.2);
    ctx.stroke();
    ctx.fillStyle = p.thorax;
    ctx.beginPath();
    ctx.ellipse(-2.6, 0, 2.9, 2.5, 0, 0, PI2);
    ctx.fill();
    ctx.fillStyle = p.head;
    ctx.beginPath();
    ctx.arc(-6, 0, 2.5, 0, PI2);
    ctx.fill();
    ctx.strokeStyle = "#2a1d0e";
    ctx.lineWidth = 0.9;
    const mandible = wiggle * 0.35;
    ctx.beginPath();
    ctx.moveTo(-8.2, -0.8);
    ctx.lineTo(-10.4, -0.8 + mandible);
    ctx.moveTo(-8.2, 0.8);
    ctx.lineTo(-10.4, 0.8 - mandible);
    ctx.stroke();
    ctx.strokeStyle = p.leg;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-8, -1.4);
    ctx.quadraticCurveTo(-11.5, -4 + wiggle, -13.6, -3 + wiggle * 1.5);
    ctx.moveTo(-8, 1.4);
    ctx.quadraticCurveTo(-11.5, 4 - wiggle, -13.6, 3 - wiggle * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  private drawCursor(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pointer;
    const tool = this.tool;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(4, 11.5);
    ctx.lineTo(6.5, 17.5);
    ctx.lineTo(9.5, 16);
    ctx.lineTo(7, 10.5);
    ctx.lineTo(11.5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.translate(10, 8);
    switch (tool) {
      case "hammer": {
        const p = TOOL_PALETTE.hammer;
        ctx.rotate(-0.6 + this.recoil * 0.02);
        ctx.fillStyle = p.head;
        ctx.strokeStyle = p.edge;
        ctx.lineWidth = 1.2;
        rr(ctx, -6, -20, 24, 11, 3);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = p.handle;
        ctx.lineWidth = 4.6;
        ctx.beginPath();
        ctx.moveTo(2, -10);
        ctx.lineTo(12, 14);
        ctx.stroke();
        break;
      }
      case "chainsaw": {
        const p = TOOL_PALETTE.chainsaw;
        ctx.rotate(this.aim + Math.PI);
        if (!this.reduced) ctx.translate(0, Math.sin(performance.now() / 20) * 0.8);
        ctx.fillStyle = p.body;
        ctx.strokeStyle = p.edge;
        ctx.lineWidth = 1.2;
        rr(ctx, -6, -8, 26, 15, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = p.bar;
        ctx.strokeStyle = "#6b7280";
        rr(ctx, -34, -4, 30, 7, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = p.teeth;
        for (let i = 0; i < 5; i++) {
          const tx = -32 + i * 6;
          ctx.beginPath();
          ctx.moveTo(tx, -4);
          ctx.lineTo(tx + 3, -8);
          ctx.lineTo(tx + 6, -4);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      case "machinegun": {
        const p = TOOL_PALETTE.machinegun;
        ctx.translate(-this.recoil, 0);
        ctx.rotate(-0.12);
        ctx.fillStyle = p.body;
        rr(ctx, -8, -5, 30, 10, 2);
        ctx.fill();
        ctx.fillStyle = p.metal;
        ctx.fillRect(20, -1.5, 12, 3);
        ctx.fillStyle = p.dark;
        ctx.beginPath();
        ctx.moveTo(2, 5);
        ctx.lineTo(6, 18);
        ctx.lineTo(10, 16);
        ctx.lineTo(6, 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = p.stock;
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.lineTo(-14, 4);
        ctx.lineTo(-9, 6);
        ctx.lineTo(-4, -3);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "flamethrower": {
        const p = TOOL_PALETTE.flamethrower;
        ctx.rotate(-0.35);
        ctx.fillStyle = p.tank;
        ctx.strokeStyle = p.edge;
        ctx.lineWidth = 1.1;
        rr(ctx, -4, -6, 20, 13, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = p.barrel;
        ctx.fillRect(16, -2.5, 12, 5);
        if (this.pointer.down) {
          ctx.globalCompositeOperation = "lighter";
          const grad = ctx.createRadialGradient(30, 0, 0, 30, 0, 16);
          grad.addColorStop(0, "rgba(255,190,80,0.8)");
          grad.addColorStop(1, "rgba(255,120,20,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(30, 0, 16, 0, PI2);
          ctx.fill();
        }
        break;
      }
      case "colorthrower": {
        const p = TOOL_PALETTE.colorthrower;
        ctx.rotate(-0.2);
        ctx.fillStyle = p.tank;
        ctx.strokeStyle = p.edge;
        ctx.lineWidth = 1.1;
        rr(ctx, -4, -7, 18, 14, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = p.barrel;
        ctx.fillRect(14, -2.5, 12, 5);
        ctx.fillStyle = p.paint;
        ctx.beginPath();
        ctx.arc(26, 0, 3.4, 0, PI2);
        ctx.fill();
        break;
      }
      case "phaser": {
        const p = TOOL_PALETTE.phaser;
        ctx.strokeStyle = `rgba(${p.glowRgb},0.85)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, PI2);
        ctx.stroke();
        ctx.fillStyle = p.glow;
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, PI2);
        ctx.fill();
        break;
      }
      case "stamp": {
        const p = TOOL_PALETTE.stamp;
        ctx.rotate(0.35);
        ctx.fillStyle = p.wood;
        ctx.strokeStyle = p.woodEdge;
        ctx.lineWidth = 1;
        rr(ctx, -10, -3, 20, 7, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = tokens.critical;
        rr(ctx, -8, -12, 16, 9, 2);
        ctx.fill();
        ctx.fillStyle = p.handle;
        rr(ctx, -3, -20, 6, 9, 2);
        ctx.fill();
        break;
      }
      case "termites": {
        const p = TOOL_PALETTE.termites;
        ctx.fillStyle = p.head;
        ctx.beginPath();
        ctx.arc(8, 4, 3, 0, PI2);
        ctx.fill();
        ctx.fillStyle = p.body;
        ctx.beginPath();
        ctx.ellipse(14, 5, 4, 3.2, 0.4, 0, PI2);
        ctx.fill();
        break;
      }
      case "washing": {
        const p = TOOL_PALETTE.washing;
        ctx.rotate(-0.2);
        ctx.fillStyle = p.tank;
        ctx.strokeStyle = p.edge;
        ctx.lineWidth = 1.1;
        rr(ctx, -4, -6, 18, 13, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = p.water;
        ctx.fillRect(0, -3, 8, 6);
        ctx.fillStyle = p.barrel;
        ctx.fillRect(14, -2.5, 12, 5);
        break;
      }
    }
    ctx.restore();
  }
}

export function DestructionGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [tool, setTool] = useState<ToolId>("hammer");
  const [integrity, setIntegrity] = useState(100);
  const [hint, setHint] = useState(true);

  const select = useCallback((id: ToolId) => {
    setTool(id);
    engineRef.current?.setTool(id);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setHint(false), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new Engine(canvas, { reduced, onIntegrity: setIntegrity });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (active === last || active === dialogRef.current)) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const digit = Number.parseInt(event.key, 10);
      if (digit >= 1 && digit <= TOOLS.length) {
        select(TOOLS[digit - 1].id);
        return;
      }
      if (event.key === "r" || event.key === "R") engineRef.current?.reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, select]);

  const pointFrom = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  return (
    <dialog ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      aria-modal="true"
      aria-label="Stress reducer: destroy the screen"
      tabIndex={-1}
      className="fixed inset-0 z-50 m-0 h-dvh w-screen max-h-none max-w-none select-none border-0 bg-[#05060a] p-0 text-white outline-none"
    >
      <p className="sr-only">
        A stress-relief toy. Destroy a mock screenshot of this website with{" "}
        {TOOLS.length} tools. Keys 1 to {TOOLS.length} select a tool, right
        click switches to the next one, R resets the screen and Escape closes.
      </p>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full cursor-none touch-none"
        onPointerDown={(event) => {
          const engine = engineRef.current;
          if (!engine) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const point = pointFrom(event);
          engine.press(point.x, point.y);
        }}
        onPointerMove={(event) => {
          const engine = engineRef.current;
          if (!engine) return;
          const point = pointFrom(event);
          engine.move(point.x, point.y, event.pointerType === "touch");
        }}
        onPointerUp={() => engineRef.current?.release()}
        onPointerCancel={() => engineRef.current?.release()}
        onPointerLeave={() => engineRef.current?.leave()}
        onContextMenu={(event) => {
          event.preventDefault();
          const current = TOOLS.findIndex((item) => item.id === tool);
          select(TOOLS[(current + 1) % TOOLS.length].id);
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[11px] text-white/60">
          stress reducer · {DOMAIN}
        </span>
        <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[11px] text-white/60 tabular-nums">
          screen integrity {integrity >= 99.95 ? "100" : integrity.toFixed(1)}%
        </span>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-64 flex justify-center transition-opacity duration-700",
          hint ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[12px] text-white/70">
          Pick a tool and go. This screen skipped its release gate.
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-5">
        <div className="pointer-events-auto w-full max-w-[27rem] rounded-xl border-2 border-[#4346b8] bg-[#191a63] p-2.5 shadow-2xl shadow-black/60 sm:p-3">
          <div className="flex items-center gap-2 px-1 pb-2.5">
            <HammerIcon className="size-3.5 text-white/80" />
            <span className="text-[13px] font-bold tracking-[0.14em] text-white uppercase">
              3x3 Toolbox
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close stress reducer"
              className="ml-auto rounded-md p-1 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            >
              <CloseIcon size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {TOOLS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === tool}
                onClick={() => select(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 transition-[background-color,border-color,box-shadow] duration-150 sm:py-2.5",
                  item.id === tool
                    ? "border-white bg-white/20 shadow-[0_0_14px_rgba(255,255,255,0.28)]"
                    : "border-white/15 bg-white/5 hover:bg-white/10",
                )}
              >
                <item.Icon className="size-6 sm:size-7" />
                <span
                  className={cn(
                    "text-[10px] leading-none sm:text-[11px]",
                    item.id === tool ? "text-white" : "text-white/60",
                  )}
                >
                  <span className="text-white/40">{index + 1}</span>
                  {": "}
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 px-1 pt-2.5 text-[10px] font-medium tracking-wider text-white/45 uppercase">
            <span>Tap / Right Click = Switch</span>
            <span>R = Reset</span>
            <span>Esc / X = Close</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}



