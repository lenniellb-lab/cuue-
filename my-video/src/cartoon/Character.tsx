import React from "react";
import { Country, Flag } from "./Flags";

export type Pose = "idle" | "wave" | "cheer" | "hammer" | "pick" | "hold";

export type CharacterProps = {
  frame: number;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  flag?: Country;
  mood?: "happy" | "worried";
  hat?: "hardhat" | "cap" | "straw" | "grad";
  scale?: number;
  phase?: number; // desfase para que no se muevan todos igual
  pose?: Pose;
  walking?: boolean;
  flip?: boolean;
};

// Muñequito animado: camina, salta, saluda, martillea, cosecha, celebra y parpadea.
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
  pose = "wave",
  walking = false,
  flip = false,
}) => {
  const t = frame + phase;
  const blink = t % 96 < 5 ? 0.1 : 1;

  let bob = Math.sin(t / 7) * 5;
  let legL = Math.sin(t / 7) * 4;
  let legR = -legL;
  let armL = 10 + Math.sin(t / 9) * 6;
  let armR = -10 - Math.sin(t / 9) * 6;

  if (walking) {
    const s = Math.sin(t / 3);
    bob = -Math.abs(s) * 10;
    legL = s * 24;
    legR = -s * 24;
    armL = -s * 28;
    armR = -s * 28;
  } else {
    switch (pose) {
      case "wave":
        armR = -150 + Math.sin(t / 5) * 28;
        break;
      case "cheer":
        armL = 150 - Math.sin(t / 4) * 22;
        armR = -150 + Math.sin(t / 4) * 22;
        break;
      case "hammer":
        armR = -60 + Math.sin(t / 2.5) * 50;
        armL = 20;
        break;
      case "pick":
        armR = -20 - Math.sin(t / 6) * 32;
        armL = 22;
        bob = Math.sin(t / 6) * 6 + 6;
        break;
      case "hold":
        armL = 165;
        armR = -165;
        break;
      case "idle":
        break;
    }
  }

  return (
    <div style={{ position: "relative", width: 220 * scale, height: 400 * scale }}>
      <svg width={220 * scale} height={400 * scale} viewBox="0 0 220 400" style={{ overflow: "visible" }}>
        {/* sombra (no sube con el salto) */}
        <ellipse cx={110} cy={392} rx={60} ry={10} fill="rgba(0,0,0,0.18)" />
        <g transform={flip ? "translate(220 0) scale(-1 1)" : undefined}>
          <g transform={`translate(0 ${bob})`}>
            {/* piernas */}
            <g transform={`rotate(${legL} 91 272)`}>
              <rect x={78} y={270} width={26} height={100} rx={12} fill={pants} />
              <ellipse cx={92} cy={372} rx={20} ry={10} fill="#3f3f46" />
            </g>
            <g transform={`rotate(${legR} 129 272)`}>
              <rect x={116} y={270} width={26} height={100} rx={12} fill={pants} />
              <ellipse cx={132} cy={372} rx={20} ry={10} fill="#3f3f46" />
            </g>
            {/* brazo izquierdo */}
            <g transform={`rotate(${armL} 66 180)`}>
              <rect x={52} y={176} width={24} height={86} rx={12} fill={shirt} />
              <circle cx={64} cy={266} r={14} fill={skin} />
              {pose === "pick" && !walking ? (
                <g>
                  <path d="M36 268 L92 268 L84 312 L44 312 Z" fill="#a16207" />
                  <circle cx={54} cy={266} r={8} fill="#dc2626" />
                  <circle cx={70} cy={262} r={8} fill="#16a34a" />
                </g>
              ) : null}
            </g>
            {/* cuerpo */}
            <rect x={60} y={165} width={100} height={120} rx={34} fill={shirt} />
            <path d="M92 168 Q110 188 128 168" fill={skin} />
            {/* brazo derecho */}
            <g transform={`rotate(${armR} 154 180)`}>
              <rect x={142} y={176} width={24} height={86} rx={12} fill={shirt} />
              {pose === "hammer" && !walking ? (
                <g>
                  <rect x={150} y={258} width={9} height={62} rx={3} fill="#92400e" />
                  <rect x={134} y={310} width={42} height={20} rx={4} fill="#6b7280" />
                </g>
              ) : null}
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
            {hat === "straw" ? (
              <g>
                <ellipse cx={110} cy={70} rx={96} ry={18} fill="#eab308" />
                <path d="M62 70 Q66 22 110 20 Q154 22 158 70 Z" fill="#facc15" />
                <rect x={62} y={58} width={96} height={10} fill="#a16207" />
              </g>
            ) : null}
            {/* ojos */}
            <g transform={`translate(0 112) scale(1 ${blink}) translate(0 -112)`}>
              <ellipse cx={88} cy={112} rx={9} ry={12} fill="#111827" />
              <ellipse cx={132} cy={112} rx={9} ry={12} fill="#111827" />
              <circle cx={91} cy={107} r={3} fill="#fff" />
              <circle cx={135} cy={107} r={3} fill="#fff" />
            </g>
            <circle cx={74} cy={134} r={9} fill="rgba(244,114,182,0.45)" />
            <circle cx={146} cy={134} r={9} fill="rgba(244,114,182,0.45)" />
            {mood === "happy" ? (
              <path d="M90 138 Q110 160 130 138" stroke="#7f1d1d" strokeWidth={6} fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <path d="M92 150 Q110 136 128 150" stroke="#7f1d1d" strokeWidth={6} fill="none" strokeLinecap="round" />
                <g stroke="#111827" strokeWidth={4} strokeLinecap="round">
                  <line x1={78} y1={90} x2={96} y2={96} />
                  <line x1={142} y1={90} x2={124} y2={96} />
                </g>
              </g>
            )}
          </g>
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
