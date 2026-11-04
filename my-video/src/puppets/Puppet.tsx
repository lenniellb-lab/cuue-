import React from "react";
import { Country, Flag } from "../cartoon/Flags";
import { EDGE, jit, stop } from "./paper";

export type Kind = "human" | "donkey" | "elephant";
export type Expr = "happy" | "neutral" | "surprised" | "worried" | "serious";
export type PoseName =
  | "idle"
  | "walk"
  | "talk"
  | "present"
  | "cheer"
  | "wave"
  | "stop"
  | "shrug"
  | "hold"
  | "point"
  | "clap"
  | "megaphone";
export type Prop = "none" | "doc" | "pointer" | "megaphone" | "clipboard" | "globe" | `flag:${Country}`;

export type Look = {
  kind: Kind;
  skin: string;
  hair?: string;
  hairStyle?: "short" | "curly" | "long" | "bun" | "none";
  shirt: string;
  jacket?: string;
  tie?: string;
  pants: string;
  shoes?: string;
  hat?: "none" | "agent" | "cap";
  badge?: boolean;
};

export type PuppetProps = {
  id: string; // semilla del temblor de stop motion
  look: Look;
  f: number; // fotograma de la escena
  x: number;
  y: number; // línea de los pies
  s?: number;
  flip?: boolean;
  pose?: PoseName;
  expr?: Expr;
  mouth?: number; // 0..1, apertura de la boca (sincronizada con la voz)
  lookX?: number; // -1..1 hacia dónde mira
  prop?: Prop;
  propL?: Prop;
  docColor?: string;
  lift?: number;
};

type Joints = {
  hipL: number; kneeL: number; hipR: number; kneeR: number;
  shL: number; elL: number; shR: number; elR: number;
  head: number; bob: number; lean: number;
};

// Ángulos "hacia fuera": brazo 0 = colgando, 90 = horizontal, 160 = arriba.
const computeJoints = (pose: PoseName, t: number, mouth: number): Joints => {
  const j: Joints = { hipL: 0, kneeL: 0, hipR: 0, kneeR: 0, shL: 12, elL: 8, shR: 12, elR: 8, head: 0, bob: 0, lean: 0 };
  const breathe = Math.sin(t / 9);
  j.bob = breathe * 2;
  j.head = Math.sin(t / 23) * 4;
  switch (pose) {
    case "walk": {
      const s = Math.sin(t * 0.42);
      j.hipL = s * 26; j.hipR = -s * 26;
      j.kneeL = Math.max(0, -s) * 34; j.kneeR = Math.max(0, s) * 34;
      j.shL = 14 - s * 22; j.shR = 14 + s * 22; j.elL = 20; j.elR = 20;
      j.bob = -Math.abs(Math.cos(t * 0.42)) * 10;
      j.head = s * 4;
      break;
    }
    case "talk":
      j.shR = 40 + Math.sin(t / 5) * 18 + mouth * 20; j.elR = 50 + Math.sin(t / 4) * 20;
      j.shL = 22 + Math.sin(t / 7) * 8; j.elL = 30;
      j.head = Math.sin(t / 6) * 7 * (0.4 + mouth);
      break;
    case "present":
      j.shR = 100 + Math.sin(t / 8) * 6; j.elR = -8;
      j.shL = 30 + Math.sin(t / 6) * 12 + mouth * 15; j.elL = 60;
      j.head = Math.sin(t / 7) * 5;
      break;
    case "cheer":
      j.shL = 150 + Math.sin(t / 3) * 16; j.shR = 150 - Math.sin(t / 3) * 16; j.elL = 20; j.elR = 20;
      j.bob = -Math.abs(Math.sin(t / 5)) * 16;
      j.head = Math.sin(t / 4) * 8;
      break;
    case "wave":
      j.shR = 150; j.elR = 30 + Math.sin(t / 3) * 35;
      break;
    case "stop":
      j.shR = 92; j.elR = 80 + Math.sin(t / 10) * 4;
      j.shL = 10;
      j.head = Math.sin(t / 12) * 6;
      break;
    case "shrug":
      j.shL = 55 + Math.sin(t / 6) * 6; j.elL = -70; j.shR = 55 + Math.sin(t / 6) * 6; j.elR = -70;
      j.head = Math.sin(t / 8) * 9;
      j.bob = Math.abs(Math.sin(t / 6)) * -4;
      break;
    case "hold":
      j.shR = 125 + Math.sin(t / 8) * 5; j.elR = 25; j.shL = 15;
      break;
    case "point":
      j.shR = 140; j.elR = -5; j.shL = 20;
      j.head = Math.sin(t / 9) * 4;
      break;
    case "clap": {
      const c = Math.abs(Math.sin(t / 2.5));
      j.shL = 50; j.shR = 50; j.elL = 70 + c * 30; j.elR = 70 + c * 30;
      break;
    }
    case "megaphone":
      j.shR = 95; j.elR = 75; j.shL = 30 + Math.sin(t / 5) * 15 + mouth * 25; j.elL = 45;
      j.head = Math.sin(t / 6) * 5;
      break;
    case "idle":
      break;
  }
  return j;
};

const Brad: React.FC<{ x?: number; y?: number }> = ({ x = 0, y = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={6} fill="#c9a227" stroke="#7a5c10" strokeWidth={1.5} />
    <circle cx={x - 1.5} cy={y - 1.5} r={2} fill="#fff6c8" />
  </g>
);

const PropArt: React.FC<{ prop: Prop; f: number; docColor: string }> = ({ prop, f, docColor }) => {
  if (prop === "none") return null;
  if (prop.startsWith("flag:")) {
    const c = prop.slice(5) as Country;
    return (
      <g>
        <rect x={-4} y={-150} width={8} height={170} fill="#8a5a2b" stroke={EDGE} strokeWidth={1.5} />
        <g transform="translate(4 -150)">
          <Flag country={c} width={110} frame={stop(f)} />
        </g>
      </g>
    );
  }
  switch (prop) {
    case "doc":
      return (
        <g transform="rotate(-8)">
          <rect x={-34} y={-62} width={68} height={86} rx={4} fill="#fffdf5" stroke={EDGE} strokeWidth={2} />
          <rect x={-34} y={-62} width={68} height={18} rx={4} fill={docColor} />
          <circle cx={-16} cy={-24} r={9} fill={docColor} opacity={0.6} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-2} y={-30 + i * 12} width={28} height={5} rx={2} fill="#9ca3af" />
          ))}
          {[0, 1].map((i) => (
            <rect key={i} x={-24} y={2 + i * 10} width={48} height={5} rx={2} fill="#cbd5e1" />
          ))}
        </g>
      );
    case "pointer":
      return <rect x={-3} y={0} width={6} height={150} rx={3} fill="#5b3a1a" />;
    case "megaphone":
      return (
        <g>
          <path d="M-10 -12 L-10 12 L40 34 L40 -34 Z" fill="#f97316" stroke={EDGE} strokeWidth={2} />
          <rect x={-22} y={-8} width={14} height={16} fill="#334155" />
        </g>
      );
    case "clipboard":
      return (
        <g>
          <rect x={-34} y={-40} width={68} height={86} rx={6} fill="#a16207" stroke={EDGE} strokeWidth={2} />
          <rect x={-26} y={-30} width={52} height={68} fill="#fff" />
          <rect x={-12} y={-46} width={24} height={12} rx={3} fill="#9ca3af" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-20} y={-20 + i * 14} width={40} height={5} rx={2} fill="#94a3b8" />
          ))}
        </g>
      );
    case "globe":
      return (
        <g>
          <rect x={-4} y={-130} width={8} height={150} fill="#8a5a2b" />
          <circle cx={0} cy={-150} r={40} fill="#38bdf8" stroke={EDGE} strokeWidth={2} />
          <path d="M-22 -170 q14 6 8 18 q-10 8 2 20 M8 -178 q16 10 6 22 q10 8 18 4 M-30 -140 q12 -4 18 8" stroke="#16a34a" strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      );
  }
  return null;
};

// ---------- cabezas ----------
const Eyes: React.FC<{ cx: number; cy: number; gap: number; lookX: number; blink: boolean; expr: Expr; r?: number }> = ({
  cx, cy, gap, lookX, blink, expr, r = 10,
}) => {
  const wide = expr === "surprised" ? 1.3 : 1;
  const browY = expr === "surprised" ? -24 : expr === "worried" ? -16 : -18;
  const browTilt = expr === "worried" ? 14 : expr === "serious" ? -14 : expr === "surprised" ? 0 : -4;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${cx + sd * gap} ${cy})`}>
          {blink ? (
            <path d={`M${-r} 0 Q0 ${r * 0.6} ${r} 0`} stroke="#1f2937" strokeWidth={4} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={0} cy={0} rx={r * wide} ry={r * 1.2 * wide} fill="#fff" stroke={EDGE} strokeWidth={1.5} />
              <circle cx={lookX * r * 0.45} cy={1} r={r * 0.58} fill="#1f2937" />
              <circle cx={lookX * r * 0.45 - 2} cy={-2} r={r * 0.2} fill="#fff" />
            </g>
          )}
          <rect
            x={-r - 2}
            y={browY - 3}
            width={2 * r + 4}
            height={6}
            rx={3}
            fill="#2b1a0b"
            transform={`rotate(${sd * browTilt} 0 ${browY})`}
          />
        </g>
      ))}
    </g>
  );
};

const Mouth: React.FC<{ x: number; y: number; open: number; expr: Expr; w?: number }> = ({ x, y, open, expr, w = 26 }) => {
  if (expr === "surprised" && open < 0.2) {
    return <ellipse cx={x} cy={y} rx={w * 0.38} ry={w * 0.48} fill="#5b1414" stroke={EDGE} strokeWidth={1.5} />;
  }
  if (open > 0.08) {
    const h = 4 + open * 24;
    return (
      <g>
        <ellipse cx={x} cy={y + h * 0.25} rx={w * 0.55} ry={h * 0.55} fill="#5b1414" stroke={EDGE} strokeWidth={1.5} />
        <ellipse cx={x} cy={y + h * 0.55} rx={w * 0.32} ry={h * 0.22} fill="#e8798a" />
        <rect x={x - w * 0.35} y={y + h * 0.25 - h * 0.55 + 1} width={w * 0.7} height={4} rx={2} fill="#fff" />
      </g>
    );
  }
  if (expr === "worried" || expr === "serious") {
    return <path d={`M${x - w / 2} ${y + 4} Q${x} ${y - 6} ${x + w / 2} ${y + 4}`} stroke="#5b1414" strokeWidth={5} fill="none" strokeLinecap="round" />;
  }
  if (expr === "neutral") {
    return <rect x={x - w / 2.5} y={y - 2} width={(w / 2.5) * 2} height={5} rx={2.5} fill="#5b1414" />;
  }
  return <path d={`M${x - w / 2} ${y - 2} Q${x} ${y + 14} ${x + w / 2} ${y - 2}`} stroke="#5b1414" strokeWidth={5} fill="none" strokeLinecap="round" />;
};

const HumanHead: React.FC<{ look: Look; lookX: number; blink: boolean; expr: Expr; mouth: number }> = ({ look, lookX, blink, expr, mouth }) => {
  const hair = look.hair ?? "#2b1a0b";
  return (
    <g>
      {look.hairStyle === "long" ? <path d="M-60 -60 Q-66 30 -40 40 L40 40 Q66 30 60 -60 Z" fill={hair} stroke={EDGE} strokeWidth={2} /> : null}
      {look.hairStyle === "bun" ? <circle cx={0} cy={-118} r={22} fill={hair} stroke={EDGE} strokeWidth={2} /> : null}
      <circle cx={-56} cy={-52} r={12} fill={look.skin} stroke={EDGE} strokeWidth={2} />
      <circle cx={56} cy={-52} r={12} fill={look.skin} stroke={EDGE} strokeWidth={2} />
      <circle cx={0} cy={-56} r={58} fill={look.skin} stroke={EDGE} strokeWidth={2.5} />
      {look.hairStyle === "curly" ? (
        <g fill={hair} stroke={EDGE} strokeWidth={1.5}>
          {[-44, -26, -8, 10, 28, 44].map((x, i) => (
            <circle key={i} cx={x} cy={-100 + Math.abs(x) * 0.25} r={18} />
          ))}
        </g>
      ) : null}
      {look.hairStyle === "short" || look.hairStyle === "long" || look.hairStyle === "bun" ? (
        <path d="M-58 -60 Q-54 -118 0 -118 Q56 -118 58 -60 Q40 -86 0 -84 Q-36 -88 -58 -60 Z" fill={hair} stroke={EDGE} strokeWidth={2} />
      ) : null}
      {look.hat === "agent" ? (
        <g stroke={EDGE} strokeWidth={2}>
          <path d="M-60 -86 Q-56 -126 0 -128 Q56 -126 60 -86 Z" fill="#14532d" />
          <rect x={-66} y={-92} width={132} height={14} rx={6} fill="#0f3d22" />
          <path d="M10 -84 L70 -78 L66 -70 L6 -76 Z" fill="#0f3d22" />
          <circle cx={0} cy={-108} r={9} fill="#facc15" />
        </g>
      ) : null}
      {look.hat === "cap" ? (
        <g stroke={EDGE} strokeWidth={2}>
          <path d="M-58 -84 Q-54 -122 0 -124 Q54 -122 58 -84 Z" fill="#b91c1c" />
          <path d="M0 -86 L84 -80 L80 -70 L0 -76 Z" fill="#7f1d1d" />
        </g>
      ) : null}
      <Eyes cx={0} cy={-58} gap={21} lookX={lookX} blink={blink} expr={expr} />
      <circle cx={-34} cy={-34} r={9} fill="rgba(239,108,128,0.35)" />
      <circle cx={34} cy={-34} r={9} fill="rgba(239,108,128,0.35)" />
      <path d="M-4 -46 Q0 -36 6 -42" stroke={EDGE} strokeWidth={3} fill="none" />
      <Mouth x={0} y={-24} open={mouth} expr={expr} />
    </g>
  );
};

const DonkeyHead: React.FC<{ t: number; lookX: number; blink: boolean; expr: Expr; mouth: number }> = ({ t, lookX, blink, expr, mouth }) => {
  const ear = Math.sin(t / 7) * 8;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`rotate(${sd * (18 + ear * sd)} ${sd * 24} -104)`}>
          <ellipse cx={sd * 24} cy={-150} rx={16} ry={52} fill="#8b95a5" stroke={EDGE} strokeWidth={2} />
          <ellipse cx={sd * 24} cy={-146} rx={8} ry={38} fill="#f2b8c6" />
        </g>
      ))}
      <ellipse cx={0} cy={-70} rx={50} ry={60} fill="#9aa4b4" stroke={EDGE} strokeWidth={2.5} />
      <path d="M-14 -128 q8 -22 14 0 q8 -20 14 0" fill="#2b2b2b" />
      <ellipse cx={0} cy={-28} rx={44} ry={32} fill="#d9dde3" stroke={EDGE} strokeWidth={2} />
      <ellipse cx={-14} cy={-36} rx={5} ry={7} fill="#4b5563" />
      <ellipse cx={14} cy={-36} rx={5} ry={7} fill="#4b5563" />
      <Eyes cx={0} cy={-84} gap={22} lookX={lookX} blink={blink} expr={expr} r={9} />
      <Mouth x={0} y={-12} open={mouth} expr={expr} w={30} />
    </g>
  );
};

const ElephantHead: React.FC<{ t: number; lookX: number; blink: boolean; expr: Expr; mouth: number }> = ({ t, lookX, blink, expr, mouth }) => {
  const sway = Math.sin(t / 6) * 10 + mouth * 12;
  const flap = Math.sin(t / 8) * 6;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`rotate(${sd * flap} ${sd * 40} -70)`}>
          <ellipse cx={sd * 70} cy={-66} rx={46} ry={58} fill="#8c96a6" stroke={EDGE} strokeWidth={2.5} />
          <ellipse cx={sd * 72} cy={-64} rx={30} ry={42} fill="#c9a9b4" />
        </g>
      ))}
      <circle cx={0} cy={-66} r={56} fill="#9ca6b6" stroke={EDGE} strokeWidth={2.5} />
      <Eyes cx={0} cy={-80} gap={22} lookX={lookX} blink={blink} expr={expr} r={9} />
      <Mouth x={-30} y={-30} open={mouth} expr={expr} w={22} />
      <path d={`M-4 -50 Q-10 0 ${sway} 24 Q${sway + 18} 36 ${sway + 26} 20`} stroke="#9ca6b6" strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={`M-4 -50 Q-10 0 ${sway} 24 Q${sway + 18} 36 ${sway + 26} 20`} stroke={EDGE} strokeWidth={2} fill="none" strokeDasharray="6 10" />
      <path d="M-26 -30 q-6 16 4 22" stroke="#fffaf0" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M22 -30 q6 16 -4 22" stroke="#fffaf0" strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ---------- marioneta completa ----------
export const Puppet: React.FC<PuppetProps> = ({
  id, look, f, x, y, s = 1, flip = false, pose = "idle", expr = "happy", mouth = 0, lookX = 0,
  prop = "none", propL = "none", docColor = "#2563eb", lift = 0,
}) => {
  const sf = stop(f);
  const t = sf + (id.length * 13) % 40;
  const J = computeJoints(pose, t, mouth);
  const k = (n: string, a = 1.6) => jit(`${id}-${n}`, f, a);
  const blink = t % 84 < 4 && expr !== "surprised";
  const jacket = look.jacket ?? look.shirt;
  const shoes = look.shoes ?? "#3f2a1d";
  const m = Math.max(0, Math.min(1, mouth));

  const Arm: React.FC<{ sd: -1 | 1; sh: number; el: number; p: Prop }> = ({ sd, sh, el, p }) => (
    <g transform={`translate(${sd * 56} -292) rotate(${sd * -(sh + k(`sh${sd}`))})`}>
      <rect x={-12} y={-6} width={24} height={76} rx={11} fill={jacket} stroke={EDGE} strokeWidth={2} />
      <g transform={`translate(0 66) rotate(${sd * -(el + k(`el${sd}`))})`}>
        <rect x={-11} y={-4} width={22} height={68} rx={10} fill={jacket} stroke={EDGE} strokeWidth={2} />
        <rect x={-11} y={50} width={22} height={10} fill="#fffaf0" opacity={look.jacket ? 1 : 0} />
        <g transform="translate(0 70)">
          {/* los objetos se mantienen derechos aunque el brazo gire (salvo el puntero) */}
          <g transform={p === "pointer" ? `scale(${sd} 1)` : `rotate(${sd * (sh + el)}) scale(${sd} 1)`}>
            <PropArt prop={p} f={f} docColor={docColor} />
          </g>
          <circle cx={0} cy={0} r={15} fill={look.kind === "human" ? look.skin : "#9aa4b4"} stroke={EDGE} strokeWidth={2} />
        </g>
        <Brad />
      </g>
      <Brad />
    </g>
  );

  const Leg: React.FC<{ sd: -1 | 1; hip: number; knee: number }> = ({ sd, hip, knee }) => (
    <g transform={`translate(${sd * 24} -172) rotate(${hip + k(`hip${sd}`, 1.2)})`}>
      <rect x={-15} y={-6} width={30} height={92} rx={12} fill={look.pants} stroke={EDGE} strokeWidth={2} />
      <g transform={`translate(0 84) rotate(${knee + k(`kn${sd}`, 1.2)})`}>
        <rect x={-14} y={-4} width={28} height={86} rx={11} fill={look.pants} stroke={EDGE} strokeWidth={2} />
        <ellipse cx={sd * 9} cy={86} rx={26} ry={13} fill={shoes} stroke={EDGE} strokeWidth={2} />
        <Brad />
      </g>
      <Brad />
    </g>
  );

  return (
    <g transform={`translate(${x + k("x", 1.5)} ${y - lift + k("y", 1.2)}) scale(${(flip ? -1 : 1) * s} ${s})`} filter="url(#cut)">
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="rgba(30,18,8,0.22)" />
      <g transform={`translate(0 ${J.bob}) rotate(${J.lean + k("lean", 0.8)} 0 -172)`}>
        <Leg sd={-1} hip={J.hipL} knee={J.kneeL} />
        <Leg sd={1} hip={J.hipR} knee={J.kneeR} />
        <Arm sd={-1} sh={J.shL} el={J.elL} p={propL} />
        {/* torso */}
        <path d="M-56 -300 Q-62 -230 -48 -168 L48 -168 Q62 -230 56 -300 Q0 -316 -56 -300 Z" fill={jacket} stroke={EDGE} strokeWidth={2.5} />
        {look.jacket ? (
          <g>
            <path d="M-20 -304 L0 -250 L20 -304 Z" fill={look.shirt} />
            {look.tie ? <path d="M-7 -300 L7 -300 L11 -236 L0 -220 L-11 -236 Z" fill={look.tie} stroke={EDGE} strokeWidth={1.5} /> : null}
            <path d="M-20 -304 L-6 -240 L-40 -262 Z M20 -304 L6 -240 L40 -262 Z" fill="rgba(0,0,0,0.12)" />
          </g>
        ) : (
          <path d="M-22 -304 Q0 -282 22 -304" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
        )}
        {look.badge ? <polygon points="-30,-262 -22,-268 -14,-262 -16,-252 -28,-252" fill="#facc15" stroke={EDGE} strokeWidth={1.5} /> : null}
        <rect x={-48} y={-186} width={96} height={14} fill="rgba(0,0,0,0.25)" />
        <Arm sd={1} sh={J.shR} el={J.elR} p={prop} />
        {/* cabeza articulada en el cuello */}
        <g transform={`translate(0 -306) rotate(${J.head + k("head", 2)})`}>
          <rect x={-12} y={-18} width={24} height={22} fill={look.kind === "human" ? look.skin : "#9aa4b4"} stroke={EDGE} strokeWidth={2} />
          {look.kind === "human" ? <HumanHead look={look} lookX={flip ? -lookX : lookX} blink={blink} expr={expr} mouth={m} /> : null}
          {look.kind === "donkey" ? <DonkeyHead t={t} lookX={flip ? -lookX : lookX} blink={blink} expr={expr} mouth={m} /> : null}
          {look.kind === "elephant" ? <ElephantHead t={t} lookX={flip ? -lookX : lookX} blink={blink} expr={expr} mouth={m} /> : null}
          <Brad y={-6} />
        </g>
      </g>
    </g>
  );
};

// ---------- reparto (los mismos personajes en todo el vídeo) ----------
export const CAST = {
  donkey: { kind: "donkey", skin: "#9aa4b4", shirt: "#ffffff", jacket: "#1d4ed8", tie: "#60a5fa", pants: "#1e3a8a" } as Look,
  elephant: { kind: "elephant", skin: "#9ca6b6", shirt: "#ffffff", jacket: "#b91c1c", tie: "#fca5a5", pants: "#7f1d1d" } as Look,
  cuban: { kind: "human", skin: "#b9784a", hair: "#1b1209", hairStyle: "short", shirt: "#1e40af", pants: "#e5e7eb" } as Look,
  mexican: { kind: "human", skin: "#c98d5b", hair: "#120c07", hairStyle: "long", shirt: "#15803d", pants: "#374151" } as Look,
  venezuelan: { kind: "human", skin: "#e2b183", hair: "#3b2213", hairStyle: "curly", shirt: "#eab308", pants: "#1e3a8a" } as Look,
  other: { kind: "human", skin: "#8d5a3b", hair: "#0b0b0b", hairStyle: "bun", shirt: "#7c3aed", pants: "#3f3f46" } as Look,
  agent: { kind: "human", skin: "#d6a77a", hair: "#3b2a1a", hairStyle: "short", shirt: "#166534", pants: "#14532d", hat: "agent", badge: true } as Look,
};
