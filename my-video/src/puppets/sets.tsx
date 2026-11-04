import React from "react";
import { Country, Flag, starPoints } from "../cartoon/Flags";
import { EDGE, FONT, H, W, jit, stop } from "./paper";

// ---------- básicos ----------
export const Backdrop: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => (
  <g>
    <defs>
      <linearGradient id={`bg-${top}-${bottom}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#bg-${top}-${bottom})`} />
  </g>
);

// Nube de cartón colgada de un palito
export const CloudStick: React.FC<{ x: number; y: number; f: number; s?: number; seed: string }> = ({ x, y, f, s = 1, seed }) => {
  const sf = stop(f);
  const dy = Math.sin(sf / 14 + x) * 10 + jit(seed, f, 1.5);
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${s})`} filter="url(#cutSoft)">
      <rect x={-3} y={-400} width={6} height={380} fill="#8a6a45" opacity={0.6} />
      <path d="M-110 20 Q-120 -30 -70 -34 Q-60 -80 -10 -70 Q20 -110 70 -70 Q120 -70 115 -20 Q140 20 100 30 Z" fill="#fffaf0" stroke={EDGE} strokeWidth={3} />
    </g>
  );
};

// Suelo de cartón en perspectiva
export const Floor: React.FC<{ y: number; color: string; stripe?: string }> = ({ y, color, stripe }) => (
  <g>
    <path d={`M-200 ${y} L${W + 200} ${y} L${W + 400} ${H + 200} L-400 ${H + 200} Z`} fill={color} />
    {stripe
      ? Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M${i * 140 - 20} ${y} L${(i - 4) * 260 + W / 2} ${H + 200}`} stroke={stripe} strokeWidth={6} />
        ))
      : null}
    <rect x={-200} y={y - 4} width={W + 400} height={10} fill="rgba(0,0,0,0.15)" />
  </g>
);

export const Bush: React.FC<{ x: number; y: number; s?: number; f: number; seed: string }> = ({ x, y, s = 1, f, seed }) => (
  <g transform={`translate(${x + jit(seed, f, 1.5)} ${y}) scale(${s})`} filter="url(#cut)">
    <path d="M-120 0 Q-130 -60 -80 -70 Q-70 -120 -20 -110 Q10 -150 60 -110 Q110 -110 110 -60 Q140 -30 120 0 Z" fill="#3f8f3a" stroke={EDGE} strokeWidth={3} />
    <path d="M-80 -30 q20 -20 40 0 M10 -60 q20 -20 40 0" stroke="#2f6e2b" strokeWidth={6} fill="none" />
  </g>
);

// ---------- Casa Blanca (diorama con volumen) ----------
export const WhiteHouse: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#deep)">
    {/* cara lateral y techo: grosor */}
    <path d="M600 0 L670 -46 L670 236 L600 280 Z" fill="#cfc8b8" stroke={EDGE} strokeWidth={3} />
    <path d="M0 0 L70 -46 L670 -46 L600 0 Z" fill="#e7e1d3" stroke={EDGE} strokeWidth={3} />
    <rect x={0} y={0} width={600} height={280} fill="#f7f3ea" stroke={EDGE} strokeWidth={3} />
    {[0, 1].map((r) =>
      Array.from({ length: 6 }).map((_, i) => (
        <g key={`${r}-${i}`}>
          <rect x={30 + i * 95 + (i > 2 ? 40 : 0) - (i > 2 ? 40 : 0)} y={40 + r * 120} width={46} height={70} fill="#9fb3c8" stroke={EDGE} strokeWidth={2} />
          <rect x={26 + i * 95} y={34 + r * 120} width={54} height={8} fill="#ece6d8" />
        </g>
      )),
    )}
    {/* pórtico */}
    <rect x={180} y={-92} width={240} height={26} fill="#efe9dc" stroke={EDGE} strokeWidth={3} />
    <polygon points="180,-92 300,-150 420,-92" fill="#f7f3ea" stroke={EDGE} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={198 + i * 58} y={-66} width={26} height={346} fill="#fffdf7" stroke={EDGE} strokeWidth={2} />
        <rect x={218 + i * 58} y={-66} width={6} height={346} fill="rgba(0,0,0,0.12)" />
      </g>
    ))}
    <rect x={278} y={190} width={44} height={90} fill="#5b4632" stroke={EDGE} strokeWidth={2} />
    {/* asta y bandera */}
    <rect x={296} y={-300} width={8} height={152} fill="#8a8a8a" />
    <g transform="translate(304 -298)">
      <Flag country="usa" width={130} frame={stop(f)} />
    </g>
  </g>
);

// ---------- Mapa 3D ----------
type Pt = [number, number];
const US: Pt[] = [
  [60, 40], [250, 55], [520, 60], [560, 40], [600, 80], [620, 110], [680, 100], [720, 120], [760, 90], [790, 60], [800, 100],
  [770, 140], [740, 170], [720, 220], [710, 270], [680, 320], [690, 360], [705, 430], [672, 440], [650, 380], [620, 352],
  [560, 362], [520, 380], [480, 400], [440, 450], [400, 420], [360, 380], [290, 370], [200, 350], [150, 300], [90, 220], [60, 150],
];
const MEX: Pt[] = [
  [200, 350], [290, 370], [360, 380], [400, 420], [440, 450], [470, 500], [500, 556], [560, 560], [600, 540], [612, 580],
  [560, 622], [520, 640], [470, 640], [400, 600], [330, 540], [270, 470], [230, 420], [208, 388],
];
const CUBA: Pt[] = [[610, 478], [650, 468], [700, 474], [752, 488], [776, 500], [742, 506], [690, 498], [640, 492], [614, 488]];
const VEN: Pt[] = [[760, 610], [800, 594], [852, 600], [902, 616], [912, 652], [882, 692], [832, 702], [790, 682], [770, 650]];
const OTHER: Pt[] = Array.from({ length: 18 }).map((_, i) => {
  const a = (i / 18) * Math.PI * 2;
  return [130 + Math.cos(a) * 62, 610 + Math.sin(a) * 46] as Pt;
});

export type MapCam = { cx: number; cy: number; sc: number; tilt: number };
const MU = 480;
const MV = 360;
export const project = (u: number, v: number, c: MapCam) => {
  const dx = u - MU;
  const dy = v - MV;
  const a = c.tilt;
  const z = dy * Math.sin(a) * c.sc;
  const p = 1500 / (1500 - z);
  return { x: c.cx + dx * c.sc * p, y: c.cy + dy * Math.cos(a) * c.sc * p, p };
};

const poly = (pts: Pt[], c: MapCam, dz = 0) =>
  pts
    .map(([u, v]) => {
      const q = project(u, v, c);
      return `${q.x},${q.y + dz * q.p}`;
    })
    .join(" ");

export const COUNTRY_POS: Record<"us" | "mexico" | "cuba" | "venezuela" | "other", Pt> = {
  us: [430, 220],
  mexico: [420, 540],
  cuba: [690, 488],
  venezuela: [840, 648],
  other: [130, 610],
};

const Piece: React.FC<{ pts: Pt[]; c: MapCam; color: string; side: string; th: number; lift?: number }> = ({ pts, c, color, side, th, lift = 0 }) => (
  <g transform={`translate(0 ${-lift})`}>
    <polygon points={poly(pts, c, th)} fill={side} stroke={EDGE} strokeWidth={3} />
    {/* paredes del grosor */}
    {pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      return <polygon key={i} points={poly([p, q], c) + " " + poly([q, p], c, th)} fill={side} />;
    })}
    <polygon points={poly(pts, c)} fill={color} stroke={EDGE} strokeWidth={3} />
  </g>
);

export const Map3D: React.FC<{ c: MapCam; f: number; lifts?: Partial<Record<string, number>>; labels?: boolean }> = ({ c, f, lifts = {}, labels = true }) => {
  const th = 26;
  const label = (k: keyof typeof COUNTRY_POS, text: string, dv = 0) => {
    const q = project(COUNTRY_POS[k][0], COUNTRY_POS[k][1] + dv, c);
    return (
      <text x={q.x} y={q.y - (lifts[k] ?? 0)} textAnchor="middle" fontFamily={FONT} fontSize={30 * q.p * c.sc} fill="#3b2a1a" opacity={0.85}>
        {text}
      </text>
    );
  };
  return (
    <g filter="url(#deep)">
      {/* mar de cartón */}
      <polygon points={poly([[-80, -60], [1040, -60], [1040, 780], [-80, 780]], c)} fill="#7cc4e4" stroke={EDGE} strokeWidth={4} />
      {Array.from({ length: 7 }).map((_, i) => {
        const v = 20 + i * 110;
        const off = (stop(f) * 1.5 + i * 40) % 120;
        return <polyline key={i} points={poly([[-40 + off, v], [40 + off, v - 10], [120 + off, v]], c)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={5} />;
      })}
      <Piece pts={OTHER} c={c} color="#c4b5fd" side="#8b7bd8" th={th} lift={lifts.other} />
      <Piece pts={MEX} c={c} color="#86c06c" side="#5d8f47" th={th} lift={lifts.mexico} />
      <Piece pts={US} c={c} color="#f2d48a" side="#c9a75a" th={th} lift={lifts.us} />
      <Piece pts={CUBA} c={c} color="#f4a3a3" side="#c76f6f" th={th} lift={lifts.cuba} />
      <Piece pts={VEN} c={c} color="#f6c453" side="#c7952a" th={th} lift={lifts.venezuela} />
      {labels ? (
        <g>
          {label("us", "ESTADOS UNIDOS", 30)}
          {label("mexico", "MÉXICO", 30)}
          {label("cuba", "CUBA", 44)}
          {label("venezuela", "VENEZUELA", 70)}
          {label("other", "OTROS PAÍSES", 80)}
        </g>
      ) : null}
    </g>
  );
};

// Banderita clavada en el mapa
export const PinFlag: React.FC<{ x: number; y: number; country: Country; f: number; s?: number }> = ({ x, y, country, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#cutSoft)">
    <rect x={-3} y={-110} width={6} height={110} fill="#6b4a2a" />
    <g transform="translate(3 -110)">
      <Flag country={country} width={80} frame={stop(f)} />
    </g>
  </g>
);

// ---------- escenario de discurso ----------
export const Curtains: React.FC<{ f: number; color: string; dark: string }> = ({ f, color, dark }) => {
  const sw = Math.sin(stop(f) / 12) * 6;
  return (
    <g filter="url(#deep)">
      <rect x={-100} y={-100} width={W + 200} height={230} fill={dark} />
      {[0, 1].map((side) => (
        <g key={side} transform={side ? `translate(${W} 0) scale(-1 1)` : undefined}>
          <path d={`M-40 0 L260 0 Q${200 + sw} 500 ${150 + sw} 1500 L-40 1500 Z`} fill={color} stroke={EDGE} strokeWidth={4} />
          {[40, 110, 180].map((x) => (
            <path key={x} d={`M${x} 0 Q${x - 20 + sw} 700 ${x - 40 + sw} 1500`} stroke={dark} strokeWidth={10} fill="none" opacity={0.5} />
          ))}
        </g>
      ))}
      <path d={`M-40 0 L${W + 40} 0 L${W + 40} 120 Q${W / 2} 200 -40 120 Z`} fill={color} stroke={EDGE} strokeWidth={4} />
    </g>
  );
};

export const Podium: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#deep)">
    <path d="M-110 -230 L110 -230 L140 -260 L-80 -260 Z" fill="#e5d3b3" stroke={EDGE} strokeWidth={3} />
    <path d="M110 -230 L140 -260 L140 -20 L110 0 Z" fill="#a88b62" stroke={EDGE} strokeWidth={3} />
    <rect x={-110} y={-230} width={220} height={230} fill="#c8a97c" stroke={EDGE} strokeWidth={3} />
    <circle cx={0} cy={-130} r={46} fill={color} stroke="#fff" strokeWidth={6} />
    <polygon points={starPoints(0, -130, 26)} fill="#fff" />
  </g>
);

export const Easel: React.FC<{ x: number; y: number; children?: React.ReactNode }> = ({ x, y, children }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#deep)">
    <path d="M-150 0 L-60 -560 M150 0 L60 -560 M0 -560 L0 40" stroke="#8a5a2b" strokeWidth={14} />
    <rect x={-210} y={-600} width={420} height={330} rx={10} fill="#fffaf0" stroke={EDGE} strokeWidth={4} />
    <g transform="translate(0 -435)">{children}</g>
  </g>
);

// Icono de cartón sobre la pizarra
export const BoardIcon: React.FC<{ kind: "road" | "shield" | "door" | "question"; x: number; s: number }> = ({ kind, x, s }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} 0) scale(${s})`} filter="url(#cutSoft)">
      {kind === "road" ? (
        <g>
          <path d="M-40 60 L-12 -60 L12 -60 L40 60 Z" fill="#475569" stroke={EDGE} strokeWidth={3} />
          <path d="M0 50 L0 30 M0 10 L0 -10 M0 -30 L0 -50" stroke="#facc15" strokeWidth={6} />
          <path d="M20 -70 L48 -92 L48 -80 L70 -80 L70 -60 L48 -60 L48 -48 Z" fill="#16a34a" />
        </g>
      ) : null}
      {kind === "shield" ? (
        <g>
          <path d="M0 -70 L56 -48 Q56 30 0 70 Q-56 30 -56 -48 Z" fill="#2563eb" stroke={EDGE} strokeWidth={3} />
          <path d="M-22 0 L-6 18 L26 -20" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {kind === "door" ? (
        <g>
          <rect x={-40} y={-70} width={80} height={140} rx={6} fill="#a16207" stroke={EDGE} strokeWidth={3} />
          <rect x={-28} y={-58} width={56} height={116} fill="#fde68a" />
          <circle cx={18} cy={4} r={6} fill="#78350f" />
        </g>
      ) : null}
      {kind === "question" ? (
        <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontSize={120} fill="#dc2626">
          ?
        </text>
      ) : null}
    </g>
  );

export const Capitol: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#deep)">
    <rect x={-230} y={-120} width={460} height={120} fill="#f7f3ea" stroke={EDGE} strokeWidth={3} />
    <path d="M230 -120 L260 -140 L260 -20 L230 0 Z" fill="#d6cfbf" stroke={EDGE} strokeWidth={3} />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-214 + i * 44} y={-104} width={16} height={96} fill="#e5dfd0" stroke={EDGE} strokeWidth={1.5} />
    ))}
    <rect x={-80} y={-200} width={160} height={80} fill="#f7f3ea" stroke={EDGE} strokeWidth={3} />
    <path d="M-80 -196 Q0 -330 80 -196 Z" fill="#fffdf7" stroke={EDGE} strokeWidth={3} />
    <rect x={-10} y={-350} width={20} height={70} fill="#f7f3ea" stroke={EDGE} strokeWidth={2} />
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={34} fill="#3b2a1a">
      CONGRESO
    </text>
  </g>
);

export const Courthouse: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const bang = Math.max(0, Math.sin(stop(f) / 3)) * 35;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#deep)">
      <polygon points="-170,-260 0,-340 170,-260" fill="#f3efe6" stroke={EDGE} strokeWidth={3} />
      <rect x={-170} y={-260} width={340} height={24} fill="#e7e1d3" stroke={EDGE} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-150 + i * 90} y={-236} width={36} height={210} fill="#fffdf7" stroke={EDGE} strokeWidth={2} />
      ))}
      <rect x={-190} y={-26} width={380} height={26} fill="#d6cfbf" stroke={EDGE} strokeWidth={3} />
      <g transform={`translate(110 -360) rotate(${-35 + bang})`}>
        <rect x={-8} y={-8} width={110} height={16} rx={6} fill="#92400e" />
        <rect x={84} y={-30} width={46} height={60} rx={8} fill="#78350f" />
      </g>
      <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontSize={34} fill="#3b2a1a">
        TRIBUNALES
      </text>
    </g>
  );
};

export const MiniWhiteHouse: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#deep)">
    <rect x={-200} y={-150} width={400} height={150} fill="#f7f3ea" stroke={EDGE} strokeWidth={3} />
    <polygon points="-80,-150 0,-200 80,-150" fill="#fffdf7" stroke={EDGE} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-70 + i * 40} y={-150} width={18} height={150} fill="#fffdf7" stroke={EDGE} strokeWidth={1.5} />
    ))}
    {[-170, -130, 110, 150].map((xx) => (
      <rect key={xx} x={xx} y={-120} width={24} height={36} fill="#9fb3c8" />
    ))}
    <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontSize={34} fill="#3b2a1a">
      PRESIDENCIA
    </text>
  </g>
);

// ---------- frontera ----------
export const Mesa: React.FC<{ x: number; y: number; w: number; h: number; color: string }> = ({ x, y, w, h, color }) => (
  <path d={`M${x} ${y} L${x + w * 0.15} ${y - h} L${x + w * 0.85} ${y - h} L${x + w} ${y} Z`} fill={color} stroke={EDGE} strokeWidth={3} filter="url(#cut)" />
);

export const Sun: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y}) rotate(${stop(f) * 0.8})`} filter="url(#cut)">
    {Array.from({ length: 12 }).map((_, i) => (
      <polygon key={i} points="-14,-110 14,-110 0,-160" fill="#fbbf24" transform={`rotate(${i * 30})`} stroke={EDGE} strokeWidth={2} />
    ))}
    <circle r={90} fill="#fde047" stroke={EDGE} strokeWidth={3} />
  </g>
);

export const BorderFence: React.FC<{ y: number; x0: number; x1: number; h: number; gapFrom?: number; gapTo?: number }> = ({ y, x0, x1, h, gapFrom, gapTo }) => (
  <g filter="url(#cut)">
    {Array.from({ length: Math.floor((x1 - x0) / 30) }).map((_, i) => {
      const x = x0 + i * 30;
      if (gapFrom !== undefined && gapTo !== undefined && x > gapFrom && x < gapTo) return null;
      return <rect key={i} x={x} y={y - h} width={16} height={h} fill="#6b5b4d" stroke={EDGE} strokeWidth={1.5} />;
    })}
    <rect x={x0 - 10} y={y - h - 12} width={(gapFrom ?? x1) - x0 + 10} height={14} fill="#4a3f36" />
    {gapTo !== undefined ? <rect x={gapTo} y={y - h - 12} width={x1 - gapTo} height={14} fill="#4a3f36" /> : null}
  </g>
);

export const Booth: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#deep)">
    <path d="M150 -300 L190 -330 L190 -30 L150 0 Z" fill="#9aa5b1" stroke={EDGE} strokeWidth={3} />
    <rect x={-10} y={-300} width={160} height={300} fill="#e2e8f0" stroke={EDGE} strokeWidth={3} />
    <rect x={10} y={-260} width={120} height={90} fill="#7dd3fc" stroke={EDGE} strokeWidth={2} />
    <path d="M-30 -300 L170 -300 L210 -340 L10 -340 Z" fill="#166534" stroke={EDGE} strokeWidth={3} />
    <text x={70} y={-120} textAnchor="middle" fontFamily={FONT} fontSize={30} fill="#14532d">
      CONTROL
    </text>
  </g>
);

export const Gate: React.FC<{ x: number; y: number; angle: number }> = ({ x, y, angle }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#cut)">
    <rect x={-16} y={-150} width={32} height={150} fill="#334155" stroke={EDGE} strokeWidth={2} />
    <g transform={`translate(0 -130) rotate(${-angle})`}>
      <rect x={0} y={-12} width={330} height={24} rx={8} fill="#fff" stroke={EDGE} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={20 + i * 64} y={-12} width={32} height={24} fill="#dc2626" />
      ))}
    </g>
  </g>
);

export const PatrolCar: React.FC<{ x: number; y: number; f: number; s?: number; flip?: boolean }> = ({ x, y, f, s = 1, flip }) => {
  const on = Math.floor(stop(f) / 6) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#deep)">
      <rect x={0} y={-120} width={320} height={84} rx={24} fill="#f8fafc" stroke={EDGE} strokeWidth={3} />
      <path d="M64 -120 L102 -168 L226 -168 L262 -120 Z" fill="#e2e8f0" stroke={EDGE} strokeWidth={3} />
      <rect x={108} y={-160} width={50} height={32} rx={6} fill="#7dd3fc" />
      <rect x={168} y={-160} width={50} height={32} rx={6} fill="#7dd3fc" />
      <rect x={0} y={-80} width={320} height={16} fill="#15803d" />
      <rect x={130} y={-188} width={32} height={20} rx={6} fill={on ? "#ef4444" : "#7f1d1d"} />
      <rect x={162} y={-188} width={32} height={20} rx={6} fill={on ? "#1e3a8a" : "#60a5fa"} />
      <circle cx={on ? 146 : 178} cy={-178} r={40} fill={on ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"} />
      {[74, 246].map((cx) => (
        <g key={cx} transform={`rotate(${stop(f) * 12} ${cx} -36)`}>
          <circle cx={cx} cy={-36} r={30} fill="#111827" />
          <rect x={cx - 4} y={-60} width={8} height={48} fill="#6b7280" />
        </g>
      ))}
    </g>
  );
};

export const Padlock: React.FC<{ x: number; y: number; closed: number; s?: number }> = ({ x, y, closed, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#cut)">
    <path d={`M-34 ${-40 - (1 - closed) * 40} L-34 -76 Q-34 -120 0 -120 Q34 -120 34 -76 L34 ${-40 - (1 - closed) * 40}`} transform={`translate(0 ${-(1 - closed) * 40})`} stroke="#64748b" strokeWidth={16} fill="none" />
    <rect x={-56} y={-50} width={112} height={92} rx={14} fill="#f59e0b" stroke={EDGE} strokeWidth={3} />
    <circle cx={0} cy={-6} r={12} fill="#78350f" />
    <rect x={-5} y={-4} width={10} height={24} fill="#78350f" />
  </g>
);

// ---------- pared de corcho con mapa ----------
export const Cork: React.FC = () => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#c89b62" />
    {Array.from({ length: 160 }).map((_, i) => (
      <circle key={i} cx={(i * 137) % W} cy={(i * 251) % 1500} r={3 + (i % 3)} fill="#a97b44" opacity={0.6} />
    ))}
  </g>
);

export const Pin: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = "#dc2626" }) => (
  <g filter="url(#cutSoft)">
    <circle cx={x} cy={y} r={14} fill={color} stroke={EDGE} strokeWidth={2} />
    <circle cx={x - 4} cy={y - 4} r={4} fill="#fff" opacity={0.7} />
  </g>
);

export const PaperTag: React.FC<{ x: number; y: number; text: string; s: number; color?: string; r?: number }> = ({ x, y, text, s, color = "#fffaf0", r = -4 }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#cut)">
      <rect x={-text.length * 15 - 24} y={-40} width={text.length * 30 + 48} height={80} rx={6} fill={color} stroke={EDGE} strokeWidth={3} />
      <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={40} fill="#3b2a1a">
        {text}
      </text>
      <Pin x={0} y={-40} />
    </g>
  );

// Icono de situación (sobre la cabeza)
export const StatusIcon: React.FC<{ kind: "check" | "question" | "clock" | "doc"; x: number; y: number; s: number }> = ({ kind, x, y, s }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#cut)">
      <circle r={46} fill="#fffaf0" stroke={EDGE} strokeWidth={3} />
      {kind === "check" ? <path d="M-20 0 L-6 16 L22 -18" stroke="#16a34a" strokeWidth={11} fill="none" strokeLinecap="round" /> : null}
      {kind === "question" ? (
        <text y={22} textAnchor="middle" fontFamily={FONT} fontSize={64} fill="#dc2626">
          ?
        </text>
      ) : null}
      {kind === "clock" ? (
        <g>
          <circle r={28} fill="none" stroke="#2563eb" strokeWidth={7} />
          <path d="M0 -16 L0 0 L14 8" stroke="#2563eb" strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {kind === "doc" ? (
        <g>
          <rect x={-20} y={-26} width={40} height={52} rx={4} fill="#fff" stroke="#7c3aed" strokeWidth={5} />
          <path d="M-10 -8 h20 M-10 4 h20 M-10 16 h12" stroke="#7c3aed" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );

// Cartel colgante con el título de la escena (cae y se balancea)
export const Banner: React.FC<{ text: string; f: number; color: string; textColor?: string }> = ({ text, f, color, textColor = "#fff" }) => {
  const sf = stop(f);
  const drop = Math.min(1, sf / 12);
  const y = -260 + drop * 450;
  const swing = Math.sin(sf / 4) * 10 * Math.exp(-sf / 30);
  const w = Math.max(520, text.length * 38 + 80);
  return (
    <g transform={`translate(${W / 2} ${y}) rotate(${swing})`} filter="url(#deep)">
      <path d={`M${-w / 2 + 40} -300 L${-w / 2 + 40} -10 M${w / 2 - 40} -300 L${w / 2 - 40} -10`} stroke="#6b4a2a" strokeWidth={4} />
      <rect x={-w / 2} y={-10} width={w} height={110} rx={12} fill={color} stroke="#fffaf0" strokeWidth={6} />
      <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontSize={56} fill={textColor}>
        {text}
      </text>
    </g>
  );
};

export const BigIcon: React.FC<{ kind: "heart" | "share" | "save" | "follow"; x: number; y: number; s: number; label: string }> = ({ kind, x, y, s, label }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#deep)">
      <circle r={78} fill={{ heart: "#ef4444", share: "#22c55e", save: "#f59e0b", follow: "#ec4899" }[kind]} stroke="#fffaf0" strokeWidth={8} />
      {kind === "heart" ? <path d="M0 36 L-38 -2 A22 22 0 0 1 0 -32 A22 22 0 0 1 38 -2 Z" fill="#fff" /> : null}
      {kind === "share" ? <path d="M-36 30 Q-30 -10 8 -12 L8 -34 L40 0 L8 34 L8 12 Q-16 12 -36 30 Z" fill="#fff" /> : null}
      {kind === "save" ? <path d="M-26 -38 L26 -38 L26 40 L0 18 L-26 40 Z" fill="#fff" /> : null}
      {kind === "follow" ? <path d="M-8 -36 h16 v28 h28 v16 h-28 v28 h-16 v-28 h-28 v-16 h28 Z" fill="#fff" /> : null}
      <text y={128} textAnchor="middle" fontFamily={FONT} fontSize={36} fill="#fff" stroke="#3b2a1a" strokeWidth={2}>
        {label}
      </text>
    </g>
  );
