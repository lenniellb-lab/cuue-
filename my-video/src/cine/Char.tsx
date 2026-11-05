import React from "react";

// Personaje de estilo "3D animado": sin contorno, sombreado con degradados, luz de borde y ojos detallados.
export type CExpr = "happy" | "surprised" | "amazed" | "worried" | "angry" | "proud" | "neutral" | "joy";
export type Gesture = "none" | "point" | "wave" | "open" | "hug" | "shrug" | "cheer" | "think" | "hold";
export type CHair = "curly" | "swept" | "bun" | "wavy" | "granny" | "pigtails" | "crew" | "afro";

export type CLook = {
  skin: string;
  skinShadow: string;
  hair: string;
  hairLight: string;
  hairStyle: CHair;
  top: string;
  topShadow: string;
  pattern?: "cuba" | "usa" | "china" | "russia" | "suit" | "none";
  iris: string;
  lips: string;
  glasses?: boolean;
  lashes?: boolean;
  pants?: string;
  pantsShadow?: string;
  shoes?: string;
};

// Distancia de la cintura a la suela (unidades locales) en modo cuerpo entero
export const FEET = 410;

export type CharProps = {
  id: string;
  look: CLook;
  f: number;
  x: number;
  y: number; // cintura (borde inferior del torso)
  s?: number;
  expr?: CExpr;
  mouth?: number;
  lookX?: number;
  lookY?: number;
  gesture?: Gesture;
  walk?: boolean;
  rim?: string; // color de la luz de borde
  rimSide?: 1 | -1; // 1 = luz desde la derecha
  flip?: boolean;
  full?: boolean; // cuerpo entero con piernas
  run?: boolean;
};

const rad = (d: number) => (d * Math.PI) / 180;
const TORSO_CROP = "M-138 -300 Q-178 -292 -176 -226 L-170 420 L170 420 L176 -226 Q178 -292 138 -300 Q64 -342 0 -338 Q-64 -342 -138 -300 Z";
const TORSO_FULL = "M-138 -300 Q-178 -292 -176 -226 L-162 40 L162 40 L176 -226 Q178 -292 138 -300 Q64 -342 0 -338 Q-64 -342 -138 -300 Z";

const Arm: React.FC<{ sx: number; sy: number; a1: number; a2: number; color: string; shade: string; skin: string; skinShadow: string; side: 1 | -1 }> = ({
  sx, sy, a1, a2, color, shade, skin, skinShadow, side,
}) => {
  const L1 = 150;
  const L2 = 140;
  const ex = sx + Math.cos(rad(a1)) * L1;
  const ey = sy + Math.sin(rad(a1)) * L1;
  const hx = ex + Math.cos(rad(a1 + a2)) * L2;
  const hy = ey + Math.sin(rad(a1 + a2)) * L2;
  const d = `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`;
  return (
    <g>
      <path d={d} stroke={shade} strokeWidth={64} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={50} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${-side * 4} -4)`} />
      <g transform={`translate(${hx} ${hy}) rotate(${a1 + a2 - 90})`}>
        <ellipse cx={0} cy={18} rx={30} ry={36} fill={skinShadow} />
        <ellipse cx={-3} cy={14} rx={26} ry={32} fill={skin} />
        <ellipse cx={side * 24} cy={4} rx={10} ry={18} fill={skin} transform={`rotate(${side * 30} ${side * 24} 4)`} />
        <ellipse cx={-6} cy={4} rx={10} ry={8} fill="rgba(255,255,255,0.25)" />
      </g>
    </g>
  );
};

const Leg: React.FC<{ hx: number; a1: number; a2: number; color: string; shade: string; shoe: string; side: 1 | -1 }> = ({ hx, a1, a2, color, shade, shoe, side }) => {
  const L1 = 150;
  const L2 = 150;
  const kx = hx + Math.cos(rad(a1)) * L1;
  const ky = 100 + Math.sin(rad(a1)) * L1;
  const fx = kx + Math.cos(rad(a1 + a2)) * L2;
  const fy = ky + Math.sin(rad(a1 + a2)) * L2;
  const d = `M${hx} 100 L${kx} ${ky} L${fx} ${fy}`;
  return (
    <g>
      <path d={d} stroke={shade} strokeWidth={78} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={62} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${-side * 5} 0)`} />
      <g transform={`translate(${fx} ${fy + 8})`}>
        <ellipse cx={side * 10} cy={10} rx={56} ry={28} fill="#0d0a08" />
        <ellipse cx={side * 8} cy={4} rx={52} ry={24} fill={shoe} />
        <ellipse cx={side * 0 - 14} cy={-4} rx={20} ry={8} fill="rgba(255,255,255,0.25)" />
      </g>
    </g>
  );
};

const gestureAngles = (g: Gesture, t: number, mouth: number): [number, number, number, number] => {
  // [hombroIzq, codoIzq, hombroDer, codoDer] en grados (90 = hacia abajo)
  switch (g) {
    case "point":
      return [100, 10, -8 + Math.sin(t / 10) * 3, -6];
    case "wave":
      return [100, 10, -70, -40 + Math.sin(t / 3) * 35];
    case "open":
      return [130 + Math.sin(t / 7) * 6, -60 - mouth * 20, 50 - Math.sin(t / 7) * 6, 60 + mouth * 20];
    case "hug":
      return [40, 110, 140, -110];
    case "shrug":
      return [150, -100, 30, 100];
    case "cheer":
      return [-120 + Math.sin(t / 4) * 10, -20, -60 - Math.sin(t / 4) * 10, 20];
    case "think":
      return [100, 10, 120, -150];
    case "hold":
      return [70, 70, 110, -70];
    default:
      return [100 + Math.sin(t / 12) * 2, 8, 80 - Math.sin(t / 12) * 2, -8];
  }
};

const Eye: React.FC<{ cx: number; side: number; look: CLook; lookX: number; lookY: number; lid: number; lower: number; wide: number; pid: string }> = ({
  cx, side, look, lookX, lookY, lid, lower, wide, pid,
}) => {
  const rx = 34 * wide;
  const ry = 38 * wide;
  const ix = lookX * 12;
  const iy = lookY * 10 + 2;
  return (
    <g transform={`translate(${cx} -8)`}>
      <defs>
        <clipPath id={`${pid}eye${side}`}>
          <ellipse rx={rx} ry={ry} />
        </clipPath>
        <radialGradient id={`${pid}iris`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#f3d9a6" />
          <stop offset="0.35" stopColor={look.iris} />
          <stop offset="1" stopColor="#1a0f08" />
        </radialGradient>
        <radialGradient id={`${pid}sclera`} cx="0.5" cy="0.6" r="0.7">
          <stop offset="0.6" stopColor="#fbf8f4" />
          <stop offset="1" stopColor="#d9ccc4" />
        </radialGradient>
      </defs>
      <ellipse rx={rx + 5} ry={ry + 5} fill={look.skinShadow} opacity={0.55} />
      <ellipse rx={rx} ry={ry} fill={`url(#${pid}sclera)`} />
      <g clipPath={`url(#${pid}eye${side})`}>
        <circle cx={ix} cy={iy} r={22} fill={`url(#${pid}iris)`} />
        <circle cx={ix} cy={iy} r={10} fill="#0b0705" />
        <circle cx={ix - 8} cy={iy - 9} r={6.5} fill="#fff" />
        <circle cx={ix + 7} cy={iy + 7} r={3} fill="rgba(255,255,255,0.8)" />
        {/* párpado superior */}
        <rect x={-rx - 6} y={-ry - 6} width={(rx + 6) * 2} height={(ry + 6) * 2 * lid} fill={look.skin} />
        <rect x={-rx - 6} y={ry + 6 - (ry + 6) * 2 * lower} width={(rx + 6) * 2} height={(ry + 6) * 2 * lower} fill={look.skin} />
      </g>
      <path
        d={`M${-rx - 4} ${-ry + (ry * 2) * lid - 2} Q0 ${-ry - 10 + (ry * 2) * lid} ${rx + 4} ${-ry + (ry * 2) * lid - 2}`}
        stroke="#1b120c"
        strokeWidth={look.lashes ? 7 : 5}
        fill="none"
        strokeLinecap="round"
      />
      {look.lashes ? (
        <path d={`M${side * (rx - 2)} ${-ry + ry * 2 * lid - 4} l${side * 12} -10`} stroke="#1b120c" strokeWidth={5} strokeLinecap="round" />
      ) : null}
    </g>
  );
};

const HairShape: React.FC<{ style: CHair; pid: string; back?: boolean }> = ({ style, pid, back }) => {
  const fill = `url(#${pid}hair)`;
  if (back) {
    if (style === "wavy") return <path d="M-130 -40 Q-150 120 -100 210 Q0 240 100 210 Q150 120 130 -40 Z" fill={fill} />;
    if (style === "bun" || style === "granny") return <circle cx={0} cy={-150} r={52} fill={fill} />;
    if (style === "afro") return <ellipse cx={0} cy={-70} rx={158} ry={124} fill={fill} />;
    if (style === "pigtails")
      return (
        <g fill={fill}>
          <ellipse cx={-140} cy={20} rx={40} ry={62} />
          <ellipse cx={140} cy={20} rx={40} ry={62} />
        </g>
      );
    return null;
  }
  switch (style) {
    case "curly":
      return (
        <g fill={fill}>
          {[[-90, -80], [-55, -118], [-10, -132], [38, -124], [80, -96], [104, -56], [-110, -40], [0, -100], [-50, -80], [50, -84]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={40} />
          ))}
        </g>
      );
    case "afro":
      return <path d="M-118 -40 Q-110 -150 0 -152 Q110 -150 118 -40 Q80 -104 0 -108 Q-80 -104 -118 -40 Z" fill={fill} />;
    case "swept":
      return <path d="M-122 -20 Q-130 -130 -20 -146 Q90 -160 126 -70 Q130 -40 120 -10 Q90 -90 20 -100 Q-60 -96 -122 -20 Z" fill={fill} />;
    case "crew":
      return <path d="M-120 -30 Q-122 -130 0 -140 Q122 -130 120 -30 Q80 -90 0 -96 Q-80 -90 -120 -30 Z" fill={fill} />;
    case "bun":
    case "granny":
      return <path d="M-122 -10 Q-126 -134 0 -138 Q126 -134 122 -10 Q100 -84 30 -92 Q0 -70 -40 -92 Q-100 -84 -122 -10 Z" fill={fill} />;
    case "wavy":
    case "pigtails":
      return <path d="M-128 20 Q-134 -130 0 -140 Q134 -130 128 20 Q110 -70 40 -86 Q0 -60 -50 -86 Q-110 -70 -128 20 Z" fill={fill} />;
  }
};

export const Char: React.FC<CharProps> = ({
  id, look, f, x, y, s = 1, expr = "happy", mouth = 0, lookX = 0, lookY = 0, gesture = "none", walk = false,
  rim = "#7fd8ff", rimSide = 1, flip = false, full = false, run = false,
}) => {
  const pid = `c${id}`;
  const t = f + id.length * 9;
  const breath = Math.sin(t / 14) * 4;
  const moving = walk || run;
  const sp = run ? 3 : 5;
  const bob = moving ? -Math.abs(Math.sin(t / sp)) * (run ? 26 : 14) : 0;
  const stride = Math.sin(t / sp) * (run ? 36 : 22);
  const sway = moving ? Math.sin(t / sp) * 3 : Math.sin(t / 30) * 1.5;
  const headTilt = Math.sin(t / 37) * 3 + (expr === "amazed" ? -4 : 0) + lookX * 3 + mouth * Math.sin(t / 5) * 3;
  const blinkT = (t + id.length * 23) % 120;
  const blink = blinkT < 5 ? Math.sin((blinkT / 5) * Math.PI) : 0;
  const m = Math.max(0, Math.min(1, mouth));

  const E = {
    happy: { lid: 0.16, lower: 0.12, wide: 1, browY: -78, browA: -4, smile: 1 },
    joy: { lid: 0.3, lower: 0.28, wide: 0.98, browY: -84, browA: -6, smile: 1.3 },
    proud: { lid: 0.26, lower: 0.12, wide: 1, browY: -76, browA: 8, smile: 0.7 },
    neutral: { lid: 0.18, lower: 0.06, wide: 1, browY: -76, browA: 0, smile: 0 },
    surprised: { lid: 0.02, lower: 0, wide: 1.12, browY: -100, browA: -8, smile: -1 },
    amazed: { lid: 0.04, lower: 0, wide: 1.08, browY: -94, browA: -10, smile: 0.5 },
    worried: { lid: 0.12, lower: 0.06, wide: 1.04, browY: -86, browA: -18, smile: -0.4 },
    angry: { lid: 0.32, lower: 0.1, wide: 0.96, browY: -68, browA: 20, smile: -0.6 },
  }[expr];
  const lid = Math.min(1, E.lid + blink * (1 - E.lid));
  const ga = gestureAngles(gesture, t, m);
  // al caminar sin gesto, los brazos se balancean al ritmo de las piernas
  const [aL1, aL2, aR1, aR2] = moving && gesture === "none" ? [100 - stride * 1.1, 12, 80 - stride * 1.1, -12] : ga;
  const pants = look.pants ?? "#2b3444";
  const pantsShadow = look.pantsShadow ?? "#151b25";
  const shoe = look.shoes ?? "#3a2a20";
  const rimGrad = `${pid}rim`;

  return (
    <g transform={`translate(${x} ${y + bob}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${sway})`}>
      <defs>
        <radialGradient id={`${pid}skin`} cx={rimSide > 0 ? "0.38" : "0.62"} cy="0.36" r="0.75">
          <stop offset="0" stopColor={look.skin} />
          <stop offset="0.65" stopColor={look.skin} />
          <stop offset="1" stopColor={look.skinShadow} />
        </radialGradient>
        <linearGradient id={`${pid}top`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor={look.topShadow} />
          <stop offset="0.45" stopColor={look.top} />
          <stop offset="1" stopColor={look.topShadow} />
        </linearGradient>
        <linearGradient id={`${pid}hair`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={look.hairLight} />
          <stop offset="0.5" stopColor={look.hair} />
          <stop offset="1" stopColor={look.hair} />
        </linearGradient>
        <linearGradient id={rimGrad} x1={rimSide > 0 ? "1" : "0"} y1="0" x2={rimSide > 0 ? "0.55" : "0.45"} y2="0">
          <stop offset="0" stopColor={rim} stopOpacity="1" />
          <stop offset="1" stopColor={rim} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${pid}blush`}>
          <stop offset="0" stopColor="#ff7c8a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff7c8a" stopOpacity="0" />
        </radialGradient>
        <filter id={`${pid}soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id={`${pid}neck`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.skinShadow} />
          <stop offset="1" stopColor={look.skin} />
        </linearGradient>
      </defs>

      {full ? (
        <g>
          <Leg hx={-62} a1={92 + stride} a2={moving ? -Math.max(0, Math.sin(t / sp)) * 40 : -2} color={pants} shade={pantsShadow} shoe={shoe} side={-1} />
          <Leg hx={62} a1={88 - stride} a2={moving ? Math.max(0, -Math.sin(t / sp)) * 40 : 2} color={pants} shade={pantsShadow} shoe={shoe} side={1} />
          <path d="M-158 20 L158 20 L150 130 Q0 150 -150 130 Z" fill={pants} />
          <rect x={-160} y={14} width={320} height={22} rx={8} fill="#1c140e" />
        </g>
      ) : null}
      {/* brazos detrás */}
      <Arm sx={-132} sy={-290 + breath} a1={aL1} a2={aL2} color={look.top} shade={look.topShadow} skin={look.skin} skinShadow={look.skinShadow} side={-1} />

      {/* torso */}
      <g transform={`translate(0 ${breath * 0.5})`}>
        <path d={full ? TORSO_FULL : TORSO_CROP} fill={`url(#${pid}top)`} />
        {look.pattern === "cuba" ? (
          <g>
            <path d="M-60 -330 L-20 -150 L-60 -40 L-100 -150 Z" fill="#c81d2e" opacity={0.9} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M30 ${-250 + i * 40} L150 ${-250 + i * 40}`} stroke="#f5f5f0" strokeWidth={16} opacity={0.85} />
            ))}
            <polygon points="-60,-200 -52,-178 -28,-178 -47,-164 -40,-142 -60,-156 -80,-142 -73,-164 -92,-178 -68,-178" fill="#fff" />
          </g>
        ) : null}
        {look.pattern === "usa" ? (
          <g>
            <path d="M-40 -336 Q0 -300 40 -336 L60 -330 Q0 -270 -60 -330 Z" fill="#f2f2ee" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M-40 ${-320 + i * 18} Q0 ${-290 + i * 18} 40 ${-320 + i * 18}`} stroke={i % 2 ? "#f2f2ee" : "#c21d2c"} strokeWidth={12} fill="none" />
            ))}
            <circle cx={90} cy={-220} r={14} fill="#c9a227" />
          </g>
        ) : null}
        {look.pattern === "china" ? (
          <g>
            <path d="M0 -338 L0 20" stroke="#8f1414" strokeWidth={6} />
            <polygon points="80,-240 87,-220 108,-220 91,-208 97,-188 80,-200 63,-188 69,-208 52,-220 73,-220" fill="#ffd34d" />
          </g>
        ) : null}
        {look.pattern === "russia" ? (
          <g>
            <rect x={-190} y={-150} width={380} height={34} fill="#2445a8" opacity={0.9} /><rect x={-190} y={-184} width={380} height={34} fill="#f5f5f2" opacity={0.6} />
            <rect x={-190} y={-116} width={380} height={34} fill="#c62a1e" opacity={0.9} />
          </g>
        ) : null}
        {look.pattern === "suit" ? (
          <g>
            <path d="M-50 -334 L0 -200 L50 -334 Z" fill="#f1f1ec" />
            <path d="M-12 -320 L12 -320 L18 -220 L0 -196 L-18 -220 Z" fill="#9b1c2a" />
            <path d="M-50 -334 L-10 -180 L-100 -260 Z M50 -334 L10 -180 L100 -260 Z" fill="rgba(0,0,0,0.18)" />
          </g>
        ) : null}
        <path d={full ? TORSO_FULL : TORSO_CROP} fill="none" stroke={`url(#${rimGrad})`} strokeWidth={16} filter={`url(#${pid}soft)`} opacity={0.9} />
        {/* cuello */}
        <path d="M-46 -380 L-50 -318 Q0 -296 50 -318 L46 -380 Z" fill={`url(#${pid}neck)`} />
      </g>

      {/* cabeza */}
      <g transform={`translate(0 ${-540 + breath * 0.6}) rotate(${headTilt}) scale(1.2)`}>
        <HairShape style={look.hairStyle} pid={pid} back />
        <ellipse cx={-122} cy={6} rx={20} ry={30} fill={look.skinShadow} />
        <ellipse cx={122} cy={6} rx={20} ry={30} fill={look.skinShadow} />
        <path d="M0 -140 C84 -140 124 -84 124 -10 C124 62 82 126 0 134 C-82 126 -124 62 -124 -10 C-124 -84 -84 -140 0 -140 Z" fill={`url(#${pid}skin)`} />
        <path d="M0 -140 C84 -140 124 -84 124 -10 C124 62 82 126 0 134 C-82 126 -124 62 -124 -10 C-124 -84 -84 -140 0 -140 Z" fill="none" stroke={`url(#${rimGrad})`} strokeWidth={14} filter={`url(#${pid}soft)`} opacity={0.95} />
        <ellipse cx={-62} cy={44} rx={34} ry={22} fill={`url(#${pid}blush)`} />
        <ellipse cx={62} cy={44} rx={34} ry={22} fill={`url(#${pid}blush)`} />
        <Eye cx={-50} side={-1} look={look} lookX={lookX} lookY={lookY} lid={lid} lower={E.lower} wide={E.wide} pid={pid} />
        <Eye cx={50} side={1} look={look} lookX={lookX} lookY={lookY} lid={lid} lower={E.lower} wide={E.wide} pid={pid} />
        {look.glasses ? (
          <g fill="rgba(255,255,255,0.08)" stroke="#5b4636" strokeWidth={6}>
            <circle cx={-50} cy={-8} r={46} />
            <circle cx={50} cy={-8} r={46} />
            <path d="M-4 -10 L4 -10" />
          </g>
        ) : null}
        {/* cejas */}
        {[-1, 1].map((sd) => (
          <path
            key={sd}
            d={`M${sd * 20} ${E.browY + 4} Q${sd * 50} ${E.browY - 10} ${sd * 82} ${E.browY + 2}`}
            stroke={look.hair}
            strokeWidth={13}
            fill="none"
            strokeLinecap="round"
            transform={`rotate(${sd * E.browA} ${sd * 50} ${E.browY})`}
          />
        ))}
        {/* nariz */}
        <ellipse cx={4} cy={40} rx={16} ry={12} fill={look.skinShadow} opacity={0.55} />
        <ellipse cx={-2} cy={34} rx={8} ry={5} fill="rgba(255,255,255,0.35)" />
        {/* boca */}
        {m > 0.06 || E.smile < -0.8 ? (
          (() => {
            const h = E.smile < -0.8 && m < 0.06 ? 22 : 8 + m * 30;
            const w = E.smile < -0.8 && m < 0.06 ? 18 : 30 + E.smile * 6;
            return (
              <g transform="translate(0 82)">
                <ellipse rx={w + 4} ry={h + 4} fill={look.lips} />
                <ellipse rx={w} ry={h} fill="#3a0d12" />
                <ellipse cy={h * 0.5} rx={w * 0.6} ry={h * 0.35} fill="#c8505d" />
                {h > 10 ? <rect x={-w * 0.75} y={-h + 2} width={w * 1.5} height={h * 0.35} rx={4} fill="#f4efe8" /> : null}
              </g>
            );
          })()
        ) : (
          <path
            d={`M-34 ${80 - E.smile * 2} Q0 ${80 + E.smile * 22} 34 ${80 - E.smile * 2}`}
            stroke={look.lips}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
        )}
        <HairShape style={look.hairStyle} pid={pid} />
      </g>

      {/* brazo delante */}
      <Arm sx={132} sy={-290 + breath} a1={aR1} a2={aR2} color={look.top} shade={look.topShadow} skin={look.skin} skinShadow={look.skinShadow} side={1} />
    </g>
  );
};

// Reparto (los mismos personajes del vídeo anterior, con el nuevo estilo)
export const CUBI: CLook = { skin: "#c98f62", skinShadow: "#8f5a37", hair: "#16100b", hairLight: "#4a3424", hairStyle: "curly", top: "#2a56c9", topShadow: "#162f78", pattern: "cuba", iris: "#6b3d1d", lips: "#a8584e" , pants: "#e9e4d8", pantsShadow: "#a8a194", shoes: "#c81d2e" };
export const SAM: CLook = { skin: "#f1c8a6", skinShadow: "#c2876a", hair: "#c98a2a", hairLight: "#f2c66a", hairStyle: "swept", top: "#1e2f66", topShadow: "#0e1838", pattern: "usa", iris: "#3c6fa8", lips: "#c27a72" , pants: "#d9d4c6", pantsShadow: "#9c9686", shoes: "#3a2518" };
export const LI: CLook = { skin: "#efcfa7", skinShadow: "#bf9471", hair: "#141018", hairLight: "#3d3346", hairStyle: "bun", top: "#c4221a", topShadow: "#6e0f0b", pattern: "china", iris: "#3b2416", lips: "#c0605e", lashes: true , pants: "#2a1a1a", pantsShadow: "#120a0a", shoes: "#111" };
export const IVAN: CLook = { skin: "#f4d6c2", skinShadow: "#c99a84", hair: "#7a4a26", hairLight: "#b07a4c", hairStyle: "crew", top: "#eeeeea", topShadow: "#a9aab0", pattern: "russia", iris: "#5d7f6a", lips: "#c47e78" , pants: "#2c3d6b", pantsShadow: "#16203a", shoes: "#2b2b2b" };
export const MAMA: CLook = { skin: "#e0ad82", skinShadow: "#a8714f", hair: "#5b2410", hairLight: "#9a4a26", hairStyle: "wavy", top: "#1f8a64", topShadow: "#0e4a35", pattern: "none", iris: "#4a2a14", lips: "#b8545a", lashes: true , pants: "#25335c", pantsShadow: "#121a30", shoes: "#c9a07a" };
export const PAPA: CLook = { skin: "#8e5b3c", skinShadow: "#5a3522", hair: "#0d0b0a", hairLight: "#3a302a", hairStyle: "afro", top: "#3b4250", topShadow: "#1d222b", pattern: "suit", iris: "#2e1a0e", lips: "#7a3f36" , pants: "#3b4250", pantsShadow: "#1d222b", shoes: "#1a120c" };
export const ABUELA: CLook = { skin: "#d9a274", skinShadow: "#9c6a49", hair: "#d8d8dc", hairLight: "#ffffff", hairStyle: "granny", top: "#d7609a", topShadow: "#7d2a55", pattern: "none", iris: "#4a2c16", lips: "#a85a5e", glasses: true, lashes: true , pants: "#6b4a8a", pantsShadow: "#3a2650", shoes: "#5a3a2a" };
export const NENA: CLook = { skin: "#b97b50", skinShadow: "#7c4a2c", hair: "#3a1c0c", hairLight: "#6b3a1c", hairStyle: "pigtails", top: "#f2b632", topShadow: "#a06d10", pattern: "none", iris: "#3a2210", lips: "#b0565a", lashes: true , pants: "#e85a8a", pantsShadow: "#9a2a52", shoes: "#ffffff" };
