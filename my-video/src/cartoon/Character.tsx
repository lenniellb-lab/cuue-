import React from "react";
import { Country, Flag } from "./Flags";

export type CharacterProps = {
  frame: number;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  flag?: Country;
  mood?: "happy" | "worried";
  hat?: "hardhat" | "cap";
  scale?: number;
  phase?: number; // desfase para que no se muevan todos igual
};

// Muñequito animado: rebota, saluda con un brazo y parpadea.
export const Character: React.FC<CharacterProps> = ({
  frame,
  skin,
  hair,
  shirt,
  pants,
  flag,
  mood = "happy",
  hat,
  scale = 1,
  phase = 0,
}) => {
  const t = frame + phase;
  const bob = Math.sin(t / 7) * 6;
  const wave = Math.sin(t / 5) * 28;
  const blink = t % 96 < 5 ? 0.1 : 1;
  const leg = Math.sin(t / 7) * 5;

  return (
    <div style={{ position: "relative", width: 220 * scale, height: 400 * scale }}>
      <svg width={220 * scale} height={400 * scale} viewBox="0 0 220 400" style={{ overflow: "visible" }}>
        <g transform={`translate(0 ${bob})`}>
          {/* sombra */}
          <ellipse cx={110} cy={392 - bob} rx={60} ry={10} fill="rgba(0,0,0,0.18)" />
          {/* piernas */}
          <rect x={78} y={270} width={26} height={100} rx={12} fill={pants} transform={`rotate(${leg} 91 270)`} />
          <rect x={116} y={270} width={26} height={100} rx={12} fill={pants} transform={`rotate(${-leg} 129 270)`} />
          <ellipse cx={88} cy={372} rx={20} ry={10} fill="#3f3f46" />
          <ellipse cx={132} cy={372} rx={20} ry={10} fill="#3f3f46" />
          {/* brazo izquierdo */}
          <g transform={`rotate(${10 + Math.sin(t / 9) * 6} 66 180)`}>
            <rect x={52} y={176} width={24} height={86} rx={12} fill={shirt} />
            <circle cx={64} cy={266} r={14} fill={skin} />
          </g>
          {/* cuerpo */}
          <rect x={60} y={165} width={100} height={120} rx={34} fill={shirt} />
          <path d="M92 168 Q110 188 128 168" fill={skin} />
          {/* brazo derecho saludando */}
          <g transform={`rotate(${-150 + wave} 154 180)`}>
            <rect x={142} y={176} width={24} height={86} rx={12} fill={shirt} />
            <circle cx={154} cy={266} r={14} fill={skin} />
          </g>
          {/* cabeza */}
          <circle cx={110} cy={105} r={62} fill={skin} />
          <path d="M48 98 Q52 38 110 38 Q170 38 172 98 Q150 66 110 70 Q70 66 48 98 Z" fill={hair} />
          {hat === "hardhat" ? (
            <g>
              <path d="M50 86 Q56 30 110 28 Q164 30 170 86 Z" fill="#facc15" />
              <rect x={40} y={80} width={140} height={14} rx={7} fill="#eab308" />
            </g>
          ) : null}
          {hat === "cap" ? (
            <g>
              <path d="M52 84 Q58 36 110 34 Q162 36 168 84 Z" fill="#1d4ed8" />
              <rect x={110} y={78} width={78} height={12} rx={6} fill="#1e40af" />
            </g>
          ) : null}
          {/* ojos */}
          <g transform={`translate(0 112) scale(1 ${blink}) translate(0 -112)`}>
            <ellipse cx={88} cy={112} rx={9} ry={12} fill="#111827" />
            <ellipse cx={132} cy={112} rx={9} ry={12} fill="#111827" />
            <circle cx={91} cy={107} r={3} fill="#fff" />
            <circle cx={135} cy={107} r={3} fill="#fff" />
          </g>
          {/* mejillas */}
          <circle cx={74} cy={134} r={9} fill="rgba(244,114,182,0.45)" />
          <circle cx={146} cy={134} r={9} fill="rgba(244,114,182,0.45)" />
          {/* boca */}
          {mood === "happy" ? (
            <path d="M90 138 Q110 160 130 138" stroke="#7f1d1d" strokeWidth={6} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M92 148 Q110 136 128 148" stroke="#7f1d1d" strokeWidth={6} fill="none" strokeLinecap="round" />
          )}
          {mood === "worried" ? (
            <g stroke="#111827" strokeWidth={4} strokeLinecap="round">
              <line x1={78} y1={90} x2={96} y2={96} />
              <line x1={142} y1={90} x2={124} y2={96} />
            </g>
          ) : null}
        </g>
      </svg>
      {flag ? (
        // Asta sujeta con la mano izquierda; la bandera ondea por encima de la cabeza.
        <div style={{ position: "absolute", left: 0, top: (bob - 70) * scale }}>
          <div
            style={{
              position: "absolute",
              left: 44 * scale,
              top: 0,
              width: 10 * scale,
              height: 336 * scale,
              borderRadius: 4 * scale,
              background: "#78350f",
            }}
          />
          <div style={{ position: "absolute", left: 54 * scale, top: 0 }}>
            <Flag country={flag} width={120 * scale} frame={frame + phase} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Presets por país
export const cubano = { skin: "#c68642", hair: "#1f1300", shirt: "#002A8F", pants: "#1e293b", flag: "cuba" as const };
export const mexicano = { skin: "#d19a66", hair: "#111111", shirt: "#006847", pants: "#334155", flag: "mexico" as const };
export const venezolana = { skin: "#e0ac69", hair: "#3b2416", shirt: "#FFCC00", pants: "#1e3a8a", flag: "venezuela" as const };
