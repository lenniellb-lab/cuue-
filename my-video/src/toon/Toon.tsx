import React from "react";

export const INK = "#1d1830"; // contorno de dibujo animado
export type Expr = "happy" | "surprised" | "angry" | "scared" | "neutral" | "proud";
export type Act =
  | "idle" | "walk" | "run" | "talk" | "wave" | "cheer" | "point" | "scared" | "angry"
  | "shrug" | "work" | "hug" | "think" | "clap" | "handshake" | "carry";
export type Outfit = "cuba" | "usa" | "china" | "russia" | "plain" | "suit" | "worker";
export type Hair = "curly" | "spiky" | "bob" | "bun" | "long" | "granny" | "pigtails" | "slick" | "afro";

export type ToonLook = {
  skin: string;
  hair: string;
  hairStyle: Hair;
  outfit: Outfit;
  shirt?: string;
  pants: string;
  shoes?: string;
  glasses?: boolean;
  hardhat?: boolean;
  cape?: boolean;
};

export type ToonProps = {
  look: ToonLook;
  f: number;
  x: number;
  y: number; // pies
  s?: number;
  act?: Act;
  expr?: Expr;
  mouth?: number; // 0..1 apertura (sincronizada con la voz)
  lookX?: number;
  lookY?: number;
  flip?: boolean;
  lift?: number; // altura del salto
  squash?: number; // -1 aplastado .. 1 estirado
  seed?: number;
  prop?: "none" | "tablet" | "briefcase" | "suitcase" | "phone" | "flag" | "wrench";
};

const rad = (d: number) => (d * Math.PI) / 180;

// Extremidad de "manguera": curva desde el hombro/cadera hasta la mano/pie.
const Limb: React.FC<{ x: number; y: number; ang: number; len: number; bend: number; w: number; color: string; end?: React.ReactNode }> = ({
  x, y, ang, len, bend, w, color, end,
}) => {
  const ex = x + Math.cos(rad(ang)) * len;
  const ey = y + Math.sin(rad(ang)) * len;
  const mx = (x + ex) / 2 - Math.sin(rad(ang)) * bend;
  const my = (y + ey) / 2 + Math.cos(rad(ang)) * bend;
  const d = `M${x} ${y} Q${mx} ${my} ${ex} ${ey}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w + 9} fill="none" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
      <g transform={`translate(${ex} ${ey})`}>{end}</g>
    </g>
  );
};

type Pose = {
  aL: number; bL: number; aR: number; bR: number; // brazos: ángulo y curvatura
  lL: number; lR: number; kL: number; kR: number; // piernas
  bob: number; tilt: number; head: number; shake: number;
};

const pose = (act: Act, t: number, mouth: number): Pose => {
  const p: Pose = { aL: 115, bL: -10, aR: 65, bR: 10, lL: 96, lR: 84, kL: 0, kR: 0, bob: Math.sin(t / 10) * 2.5, tilt: 0, head: Math.sin(t / 25) * 3, shake: 0 };
  switch (act) {
    case "walk": {
      const s = Math.sin(t / 4.2);
      p.lL = 90 + s * 26; p.lR = 90 - s * 26; p.kL = -Math.max(0, s) * 18; p.kR = -Math.max(0, -s) * 18;
      p.aL = 110 - s * 28; p.aR = 70 - s * 28; p.bL = -14; p.bR = 14;
      p.bob = -Math.abs(Math.cos(t / 4.2)) * 9; p.tilt = 3; p.head = s * 3;
      break;
    }
    case "run": {
      const s = Math.sin(t / 2.6);
      p.lL = 90 + s * 42; p.lR = 90 - s * 42; p.kL = -Math.max(0, s) * 30; p.kR = -Math.max(0, -s) * 30;
      p.aL = 120 - s * 55; p.aR = 60 - s * 55; p.bL = -26; p.bR = 26;
      p.bob = -Math.abs(Math.cos(t / 2.6)) * 16; p.tilt = 10; p.head = 4;
      break;
    }
    case "talk":
      p.aR = 20 + Math.sin(t / 5) * 25 - mouth * 25; p.bR = 25;
      p.aL = 130 + Math.sin(t / 7) * 12; p.bL = -18;
      p.head = Math.sin(t / 6) * 6 * (0.5 + mouth); p.bob = Math.sin(t / 5) * 3;
      break;
    case "wave":
      p.aR = -60 + Math.sin(t / 3) * 22; p.bR = 30;
      break;
    case "cheer":
      p.aL = -125 + Math.sin(t / 3) * 15; p.aR = -55 - Math.sin(t / 3) * 15; p.bL = 15; p.bR = -15;
      p.bob = -Math.abs(Math.sin(t / 4)) * 10; p.head = Math.sin(t / 4) * 6;
      break;
    case "point":
      p.aR = -12 + Math.sin(t / 9) * 4; p.bR = 0; p.aL = 120;
      break;
    case "scared":
      p.aL = -140 + Math.sin(t) * 6; p.aR = -40 - Math.sin(t) * 6; p.bL = 30; p.bR = -30;
      p.lL = 102; p.lR = 78; p.kL = 12; p.kR = -12; p.shake = 3;
      break;
    case "angry":
      p.aL = 140; p.aR = 40; p.bL = 25; p.bR = -25; p.shake = 1.5; p.head = Math.sin(t / 2) * 3;
      p.bob = Math.sin(t / 3) * 3;
      break;
    case "shrug":
      p.aL = 200 + Math.sin(t / 6) * 6; p.aR = -20 - Math.sin(t / 6) * 6; p.bL = -30; p.bR = 30; p.head = Math.sin(t / 7) * 8;
      break;
    case "work":
      p.aR = 10 + Math.sin(t / 2.5) * 40; p.bR = 20; p.aL = 30 + Math.sin(t / 2.5 + 1) * 20; p.bL = 20; p.bob = Math.sin(t / 2.5) * 3;
      break;
    case "hug":
      p.aL = 20; p.aR = 160; p.bL = -40; p.bR = 40; p.bob = Math.sin(t / 4) * 2;
      break;
    case "think":
      p.aR = 160; p.bR = -60; p.aL = 120; p.head = 8;
      break;
    case "clap": {
      const c = Math.abs(Math.sin(t / 2.2));
      p.aL = 40 + c * 20; p.aR = 140 - c * 20; p.bL = -30; p.bR = 30;
      break;
    }
    case "handshake":
      p.aR = 15 + Math.sin(t / 2) * 12; p.bR = 10;
      break;
    case "carry":
      p.aL = 40; p.aR = 140; p.bL = -10; p.bR = 10; p.bob = -Math.abs(Math.cos(t / 4.2)) * 6;
      p.lL = 90 + Math.sin(t / 4.2) * 22; p.lR = 90 - Math.sin(t / 4.2) * 22;
      break;
    case "idle":
      break;
  }
  return p;
};

const HairBack: React.FC<{ style: Hair; c: string }> = ({ style, c }) => {
  if (style === "long") return <path d="M-92 -20 Q-104 90 -60 120 L60 120 Q104 90 92 -20 Z" fill={c} stroke={INK} strokeWidth={6} />;
  if (style === "pigtails")
    return (
      <g fill={c} stroke={INK} strokeWidth={6}>
        <ellipse cx={-104} cy={10} rx={30} ry={44} />
        <ellipse cx={104} cy={10} rx={30} ry={44} />
      </g>
    );
  if (style === "bun") return <circle cx={0} cy={-102} r={34} fill={c} stroke={INK} strokeWidth={6} />;
  if (style === "granny") return <circle cx={0} cy={-100} r={36} fill={c} stroke={INK} strokeWidth={6} />;
  return null;
};

const HairFront: React.FC<{ style: Hair; c: string }> = ({ style, c }) => {
  switch (style) {
    case "curly":
      return (
        <g fill={c} stroke={INK} strokeWidth={6}>
          {[-70, -40, -10, 22, 52, 76].map((x, i) => (
            <circle key={i} cx={x} cy={-62 - (i % 2) * 14 + Math.abs(x) * 0.12} r={30} />
          ))}
        </g>
      );
    case "afro":
      return <ellipse cx={0} cy={-58} rx={104} ry={72} fill={c} stroke={INK} strokeWidth={6} />;
    case "spiky":
      return <path d="M-88 -30 L-96 -78 L-60 -70 L-56 -116 L-20 -86 L4 -126 L24 -88 L58 -112 L60 -70 L96 -76 L88 -30 Q0 -70 -88 -30 Z" fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
    case "slick":
      return <path d="M-90 -24 Q-90 -100 0 -100 Q96 -100 92 -20 Q60 -66 -20 -60 Q-60 -56 -90 -24 Z" fill={c} stroke={INK} strokeWidth={6} />;
    case "bob":
    case "long":
    case "pigtails":
      return <path d="M-94 10 Q-100 -100 0 -100 Q100 -100 94 10 Q80 -50 30 -56 Q0 -30 -40 -56 Q-84 -50 -94 10 Z" fill={c} stroke={INK} strokeWidth={6} />;
    case "bun":
    case "granny":
      return <path d="M-90 -20 Q-90 -96 0 -96 Q90 -96 90 -20 Q50 -60 0 -56 Q-50 -60 -90 -20 Z" fill={c} stroke={INK} strokeWidth={6} />;
  }
};

const Face: React.FC<{ expr: Expr; mouth: number; lookX: number; lookY: number; blink: boolean; skin: string; glasses?: boolean }> = ({
  expr, mouth, lookX, lookY, blink, skin, glasses,
}) => {
  const big = expr === "surprised" || expr === "scared" ? 1.18 : 1;
  const pupil = expr === "surprised" ? 0.7 : expr === "scared" ? 0.6 : 1;
  const eyeY = 2;
  const brow = {
    happy: { y: -42, a: 4 },
    proud: { y: -42, a: -8 },
    neutral: { y: -38, a: 0 },
    surprised: { y: -58, a: 6 },
    scared: { y: -50, a: 20 },
    angry: { y: -32, a: -26 },
  }[expr];
  const talking = mouth > 0.06;
  return (
    <g>
      {expr === "angry" ? <circle cx={0} cy={0} r={96} fill="rgba(239,68,68,0.18)" /> : null}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 36} ${eyeY})`}>
          {blink ? (
            <path d="M-22 0 Q0 14 22 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <ellipse rx={26 * big} ry={30 * big} fill="#fff" stroke={INK} strokeWidth={5} />
              <circle cx={lookX * 9} cy={lookY * 8 + 2} r={14 * pupil} fill={INK} />
              <circle cx={lookX * 9 - 5} cy={lookY * 8 - 4} r={5 * pupil} fill="#fff" />
            </g>
          )}
          <rect x={-24} y={brow.y - 5} width={48} height={10} rx={5} fill={INK} transform={`rotate(${sd * brow.a} 0 ${brow.y})`} />
        </g>
      ))}
      {glasses ? (
        <g fill="none" stroke={INK} strokeWidth={4}>
          <circle cx={-36} cy={eyeY} r={32} />
          <circle cx={36} cy={eyeY} r={32} />
          <path d="M-4 0 L4 0" />
        </g>
      ) : null}
      <circle cx={-62} cy={34} r={13} fill="rgba(255,105,135,0.4)" />
      <circle cx={62} cy={34} r={13} fill="rgba(255,105,135,0.4)" />
      {/* boca */}
      {talking || expr === "surprised" || expr === "scared" ? (
        (() => {
          const h = expr === "surprised" && !talking ? 26 : expr === "scared" && !talking ? 14 : 8 + mouth * 30;
          const w = expr === "surprised" && !talking ? 22 : 30 + mouth * 6;
          return (
            <g transform="translate(0 50)">
              <ellipse rx={w} ry={h} fill="#7a1830" stroke={INK} strokeWidth={5} />
              <ellipse cy={h * 0.45} rx={w * 0.6} ry={h * 0.35} fill="#ff7d97" />
              {h > 12 ? <rect x={-w * 0.7} y={-h + 3} width={w * 1.4} height={7} rx={3} fill="#fff" /> : null}
            </g>
          );
        })()
      ) : expr === "angry" ? (
        <path d="M-26 60 Q0 40 26 60" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      ) : expr === "neutral" ? (
        <path d="M-18 52 L18 52" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      ) : (
        <path d="M-32 40 Q0 76 32 40 Z" fill="#7a1830" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      )}
      {expr === "scared" ? <path d="M78 -50 q12 22 0 34 q-12 -12 0 -34 Z" fill="#7dd3fc" stroke={INK} strokeWidth={3} /> : null}
      {expr === "angry" ? (
        <g stroke="#ef4444" strokeWidth={6} strokeLinecap="round" transform="translate(70 -76)">
          <path d="M-10 -10 L-2 -2 M10 -10 L2 -2 M-10 10 L-2 2 M10 10 L2 2" />
        </g>
      ) : null}
      <path d="M-6 18 Q0 28 8 20" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle r={0} fill={skin} />
    </g>
  );
};

const Torso: React.FC<{ look: ToonLook }> = ({ look }) => {
  const shape = "M-62 -150 Q-74 -60 -58 -64 L58 -64 Q74 -60 62 -150 Q0 -176 -62 -150 Z";
  const id = `clip-${look.outfit}-${look.shirt ?? ""}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={shape} />
        </clipPath>
      </defs>
      <path d={shape} fill={look.shirt ?? "#fff"} />
      <g clipPath={`url(#${id})`}>
        {look.outfit === "cuba" ? (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={-80} y={-176 + i * 23} width={160} height={23} fill={i % 2 ? "#fff" : "#1d4fd8"} />
            ))}
            <path d="M-80 -176 L-10 -120 L-80 -64 Z" fill="#e11d2e" />
            <polygon points="-56,-132 -51,-118 -36,-118 -48,-109 -44,-95 -56,-104 -68,-95 -64,-109 -76,-118 -61,-118" fill="#fff" />
          </g>
        ) : null}
        {look.outfit === "usa" ? (
          <g>
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={-80} y={-176 + i * 16} width={160} height={16} fill={i % 2 ? "#fff" : "#dc2626"} />
            ))}
            <rect x={-80} y={-176} width={78} height={64} fill="#1e3a8a" />
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={i} cx={-62 + (i % 3) * 22} cy={-150 + Math.floor(i / 3) * 22} r={5} fill="#fff" />
            ))}
          </g>
        ) : null}
        {look.outfit === "china" ? (
          <g>
            <rect x={-80} y={-176} width={160} height={120} fill="#de2910" />
            <polygon points="-40,-150 -34,-132 -16,-132 -30,-121 -25,-104 -40,-114 -55,-104 -50,-121 -64,-132 -46,-132" fill="#ffde00" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={-6 + (i % 2) * 8} cy={-150 + i * 9} r={4} fill="#ffde00" />
            ))}
          </g>
        ) : null}
        {look.outfit === "russia" ? (
          <g>
            <rect x={-80} y={-176} width={160} height={40} fill="#fff" />
            <rect x={-80} y={-136} width={160} height={36} fill="#1c3faa" />
            <rect x={-80} y={-100} width={160} height={40} fill="#d52b1e" />
          </g>
        ) : null}
        {look.outfit === "suit" ? (
          <g>
            <path d="M-20 -170 L0 -96 L20 -170 Z" fill="#fff" />
            <path d="M-6 -164 L6 -164 L10 -110 L0 -98 L-10 -110 Z" fill="#dc2626" />
          </g>
        ) : null}
        {look.outfit === "worker" ? (
          <g>
            <rect x={-80} y={-120} width={160} height={12} fill="#facc15" />
            <rect x={-30} y={-176} width={14} height={120} fill="#facc15" />
            <rect x={16} y={-176} width={14} height={120} fill="#facc15" />
          </g>
        ) : null}
      </g>
      <path d={shape} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

const Prop: React.FC<{ kind: NonNullable<ToonProps["prop"]> }> = ({ kind }) => {
  switch (kind) {
    case "tablet":
      return (
        <g transform="translate(6 -40) rotate(-10)">
          <rect x={-30} y={-42} width={60} height={84} rx={8} fill="#1e293b" stroke={INK} strokeWidth={4} />
          <rect x={-24} y={-34} width={48} height={64} rx={4} fill="#22d3ee" />
          <path d="M-16 14 L-4 0 L6 8 L18 -14" stroke="#fff" strokeWidth={5} fill="none" />
        </g>
      );
    case "briefcase":
      return (
        <g transform="translate(0 30)">
          <rect x={-34} y={-6} width={68} height={50} rx={6} fill="#7c4a1e" stroke={INK} strokeWidth={4} />
          <rect x={-12} y={-18} width={24} height={14} rx={4} fill="none" stroke={INK} strokeWidth={4} />
        </g>
      );
    case "suitcase":
      return (
        <g transform="translate(0 40)">
          <rect x={-36} y={0} width={72} height={64} rx={10} fill="#f59e0b" stroke={INK} strokeWidth={4} />
          <rect x={-10} y={-20} width={20} height={22} rx={4} fill="none" stroke={INK} strokeWidth={4} />
          <rect x={-36} y={26} width={72} height={8} fill="#b45309" />
        </g>
      );
    case "phone":
      return <rect x={-14} y={-50} width={28} height={50} rx={6} fill="#111827" stroke={INK} strokeWidth={3} />;
    case "flag":
      return (
        <g>
          <rect x={-4} y={-170} width={8} height={180} fill="#8b5a2b" stroke={INK} strokeWidth={2} />
          <g transform="translate(4 -170)">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={0} y={i * 14} width={110} height={14} fill={i % 2 ? "#fff" : "#1d4fd8"} />
            ))}
            <path d="M0 0 L60 35 L0 70 Z" fill="#e11d2e" />
            <rect x={0} y={0} width={110} height={70} fill="none" stroke={INK} strokeWidth={4} />
          </g>
        </g>
      );
    case "wrench":
      return <path d="M0 0 L0 -60 M-12 -70 Q0 -84 12 -70" stroke="#94a3b8" strokeWidth={12} fill="none" strokeLinecap="round" />;
    default:
      return null;
  }
};

export const Toon: React.FC<ToonProps> = ({
  look, f, x, y, s = 1, act = "idle", expr = "happy", mouth = 0, lookX = 0, lookY = 0, flip = false,
  lift = 0, squash = 0, seed = 0, prop = "none",
}) => {
  const t = f + seed * 17;
  const P = pose(act, t, mouth);
  const blink = (t + seed * 31) % 110 < 5 && expr !== "surprised";
  const shakeX = P.shake ? Math.sin(t * 2.7) * P.shake : 0;
  const sy = 1 + squash * 0.12;
  const sx = 1 - squash * 0.08;
  const shoes = look.shoes ?? "#2b2340";
  const skinHand = <circle r={17} fill={look.skin} stroke={INK} strokeWidth={5} />;
  const hand = (k: "L" | "R") =>
    k === "R" && prop !== "none" ? (
      <g>
        <Prop kind={prop} />
        {skinHand}
      </g>
    ) : (
      skinHand
    );
  const foot = (sd: number) => <ellipse cx={sd * 12} cy={4} rx={30} ry={16} fill={shoes} stroke={INK} strokeWidth={5} />;
  const legLen = 74;
  return (
    <g transform={`translate(${x + shakeX} ${y - lift}) scale(${(flip ? -1 : 1) * s * sx} ${s * sy})`}>
      <ellipse cx={0} cy={6 + lift / Math.max(0.2, s)} rx={70 - Math.min(40, lift * 0.15)} ry={12} fill="rgba(20,10,40,0.18)" />
      <g transform={`translate(0 ${P.bob}) rotate(${P.tilt} 0 -70)`}>
        {/* piernas */}
        <Limb x={-26} y={-72} ang={P.lL} len={legLen} bend={P.kL} w={26} color={look.pants} end={foot(-1)} />
        <Limb x={26} y={-72} ang={P.lR} len={legLen} bend={P.kR} w={26} color={look.pants} end={foot(1)} />
        {/* brazo trasero */}
        <Limb x={-54} y={-140} ang={P.aL} len={88} bend={P.bL} w={22} color={look.shirt ?? "#fff"} end={hand("L")} />
        {look.cape ? <path d="M-60 -150 Q-110 -40 -90 -20 L90 -20 Q110 -40 60 -150 Z" fill="#e11d2e" stroke={INK} strokeWidth={6} opacity={0.95} /> : null}
        <Torso look={look} />
        <path d="M-58 -78 L58 -78" stroke={INK} strokeWidth={6} />
        <Limb x={54} y={-140} ang={P.aR} len={88} bend={P.bR} w={22} color={look.shirt ?? "#fff"} end={hand("R")} />
        {/* cabeza grande */}
        <g transform={`translate(0 -250) rotate(${P.head})`}>
          <HairBack style={look.hairStyle} c={look.hair} />
          <circle cx={-92} cy={10} r={18} fill={look.skin} stroke={INK} strokeWidth={5} />
          <circle cx={92} cy={10} r={18} fill={look.skin} stroke={INK} strokeWidth={5} />
          <circle r={96} fill={look.skin} stroke={INK} strokeWidth={6} />
          <ellipse cx={-30} cy={-50} rx={34} ry={20} fill="rgba(255,255,255,0.22)" />
          <HairFront style={look.hairStyle} c={look.hair} />
          {look.hardhat ? (
            <g stroke={INK} strokeWidth={6}>
              <path d="M-90 -50 Q-86 -128 0 -130 Q86 -128 90 -50 Z" fill="#facc15" />
              <rect x={-108} y={-58} width={216} height={20} rx={10} fill="#eab308" />
            </g>
          ) : null}
          <g transform="translate(0 6)">
            <Face expr={expr} mouth={mouth} lookX={flip ? -lookX : lookX} lookY={lookY} blink={blink} skin={look.skin} glasses={look.glasses} />
          </g>
        </g>
      </g>
    </g>
  );
};

// Reparto: mismos personajes en todo el vídeo
export const CUBI: ToonLook = { skin: "#c68a5c", hair: "#1b120b", hairStyle: "curly", outfit: "cuba", shirt: "#1d4fd8", pants: "#1e293b", cape: true };
export const SAM: ToonLook = { skin: "#f3c9a5", hair: "#f2b134", hairStyle: "slick", outfit: "usa", shirt: "#1e3a8a", pants: "#1e3a8a" };
export const LI: ToonLook = { skin: "#f0cfa0", hair: "#0f0f14", hairStyle: "bun", outfit: "china", shirt: "#de2910", pants: "#7f1d1d" };
export const IVAN: ToonLook = { skin: "#f5d5c0", hair: "#9a5b2e", hairStyle: "spiky", outfit: "russia", shirt: "#1c3faa", pants: "#334155" };
export const ABUELA: ToonLook = { skin: "#d9a06f", hair: "#e5e7eb", hairStyle: "granny", outfit: "plain", shirt: "#f472b6", pants: "#7c3aed", glasses: true };
export const NENA: ToonLook = { skin: "#b97a4f", hair: "#4a2511", hairStyle: "pigtails", outfit: "plain", shirt: "#facc15", pants: "#ec4899" };
export const MAMA: ToonLook = { skin: "#e2b183", hair: "#7c2d12", hairStyle: "long", outfit: "plain", shirt: "#10b981", pants: "#1e3a8a" };
export const PAPA: ToonLook = { skin: "#8d5a3b", hair: "#111", hairStyle: "afro", outfit: "suit", shirt: "#334155", pants: "#334155" };
export const OBRERA: ToonLook = { skin: "#a86b45", hair: "#111", hairStyle: "bob", outfit: "worker", shirt: "#f97316", pants: "#1e40af", hardhat: true };
export const OBRERO: ToonLook = { skin: "#e8b88f", hair: "#5b3a1a", hairStyle: "spiky", outfit: "worker", shirt: "#0ea5e9", pants: "#334155", hardhat: true };
