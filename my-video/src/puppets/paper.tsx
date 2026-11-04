import React from "react";
import { random, staticFile } from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FONT = "Inter, 'Inter Display', 'DejaVu Sans', sans-serif";

// Stop motion: cada pose se mantiene 2 fotogramas (12-15 poses por segundo).
export const stop = (f: number) => Math.floor(f / 2) * 2;

// Temblor de stop motion: valor estable dentro del mismo fotograma retenido.
export const jit = (seed: string, f: number, amt = 1) => (random(`${seed}-${stop(f)}`) * 2 - 1) * amt;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Interpolación con suavizado
export const ease = (f: number, a: number, b: number, from: number, to: number) => {
  const p = clamp01((f - a) / (b - a));
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  return from + (to - from) * e;
};

// Rebote "pop" al aparecer
export const popIn = (f: number, a: number, dur = 10) => {
  const p = clamp01((f - a) / dur);
  if (p <= 0) return 0;
  const c = 1.70158 * 1.4;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};

export const hop = (f: number, a: number, b: number, h: number) =>
  f >= a && f < b ? Math.sin(((f - a) / (b - a)) * Math.PI) * h : 0;

// Bordes y sombras de cartón recortado
export const EDGE = "rgba(70,45,20,0.6)";
export const PaperDefs: React.FC = () => (
  <defs>
    <style>{`text { font-weight: 900; }`}</style>
    <filter id="cut" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="7" stdDeviation="3" floodColor="#2b1a0b" floodOpacity="0.38" />
    </filter>
    <filter id="cutSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#2b1a0b" floodOpacity="0.3" />
    </filter>
    <filter id="deep" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="8" dy="14" stdDeviation="6" floodColor="#1c1008" floodOpacity="0.4" />
    </filter>
  </defs>
);

// Grano de cartón sobre todo el fotograma (se mueve un poco en cada pose: stop motion)
export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <div
    style={{
      position: "absolute",
      inset: -20,
      backgroundImage: `url(${staticFile("puppets/grain.png")})`,
      backgroundSize: "100% 100%",
      mixBlendMode: "multiply",
      opacity: 0.32,
      transform: `translate(${jit("gx", f, 6)}px, ${jit("gy", f, 6)}px)`,
      pointerEvents: "none",
    }}
  />
);
