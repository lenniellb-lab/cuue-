import React from "react";
import { INK } from "./Toon";

export const W = 1080;
export const H = 1920;
export const FONT = "Inter, 'Inter Display', 'DejaVu Sans', sans-serif";

export const Sky: React.FC<{ a: string; b: string; c?: string }> = ({ a, b, c }) => (
  <g>
    <defs>
      <linearGradient id={`sky${a}${b}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        {c ? <stop offset="0.55" stopColor={c} /> : null}
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill={`url(#sky${a}${b})`} />
  </g>
);

export const Sun: React.FC<{ x: number; y: number; f: number; r?: number; color?: string }> = ({ x, y, f, r = 110, color = "#ffd23f" }) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${f * 0.6})`}>
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={-8} y={-r - 60} width={16} height={40} rx={8} fill={color} opacity={0.8} transform={`rotate(${i * (360 / 14)})`} />
      ))}
    </g>
    <circle r={r} fill={color} stroke={INK} strokeWidth={6} />
    <ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.35} ry={r * 0.2} fill="rgba(255,255,255,0.4)" />
  </g>
);

export const Clouds: React.FC<{ f: number; y?: number; n?: number; speed?: number }> = ({ f, y = 380, n = 3, speed = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = ((f * (0.7 + i * 0.35) * speed + i * 460) % 1500) - 250;
      return (
        <g key={i} transform={`translate(${x} ${y + i * 130}) scale(${0.8 + (i % 2) * 0.3})`}>
          <path d="M-120 30 Q-140 -20 -80 -26 Q-70 -80 -10 -66 Q30 -110 80 -64 Q140 -66 130 -10 Q160 30 110 36 Z" fill="#fff" stroke={INK} strokeWidth={5} />
        </g>
      );
    })}
  </g>
);

export const Sea: React.FC<{ y: number; f: number; color?: string }> = ({ y, f, color = "#22b8e8" }) => (
  <g>
    <rect x={-300} y={y} width={W + 600} height={H} fill={color} />
    {Array.from({ length: 6 }).map((_, r) =>
      Array.from({ length: 8 }).map((_, i) => {
        const x = ((i * 180 + f * (2 + r * 0.6) + r * 70) % 1440) - 180;
        return <path key={`${r}-${i}`} d={`M${x} ${y + 40 + r * 70} q30 -18 60 0 q30 18 60 0`} stroke="rgba(255,255,255,0.7)" strokeWidth={6} fill="none" strokeLinecap="round" />;
      }),
    )}
  </g>
);

export const Ground: React.FC<{ y: number; color: string; dark?: string }> = ({ y, color, dark }) => (
  <g>
    <path d={`M-300 ${y} Q${W / 2} ${y - 50} ${W + 300} ${y} L${W + 300} ${H + 300} L-300 ${H + 300} Z`} fill={color} stroke={INK} strokeWidth={6} />
    {dark ? <path d={`M-300 ${y + 60} Q${W / 2} ${y + 20} ${W + 300} ${y + 60}`} stroke={dark} strokeWidth={10} fill="none" opacity={0.4} /> : null}
  </g>
);

export const Palm: React.FC<{ x: number; y: number; f: number; s?: number; flip?: boolean }> = ({ x, y, f, s = 1, flip }) => {
  const sway = Math.sin(f / 16 + x) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 Q30 -180 -6 -360" stroke={INK} strokeWidth={40} fill="none" strokeLinecap="round" />
      <path d="M0 0 Q30 -180 -6 -360" stroke="#a5682a" strokeWidth={30} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${sway} -6 -360)`}>
        {[-160, -120, -70, -20, 30, 80].map((a) => (
          <path key={a} d="M-6 -360 q80 -40 160 10 q-80 0 -160 -10" fill="#22a35a" stroke={INK} strokeWidth={5} transform={`rotate(${a} -6 -360)`} />
        ))}
        <circle cx={-6} cy={-350} r={16} fill="#7c4a1e" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

// Isla de Cuba dibujada
export const CUBA_PATH = "M-420 -10 Q-380 -60 -300 -50 Q-200 -70 -120 -40 Q-40 -60 40 -20 Q140 -10 230 10 Q330 20 410 60 Q440 80 400 90 Q320 80 240 70 Q150 60 60 40 Q-40 30 -140 20 Q-240 20 -330 30 Q-400 40 -420 -10 Z";
export const Island: React.FC<{ x: number; y: number; s: number; glow?: number }> = ({ x, y, s, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 ? <path d={CUBA_PATH} fill="none" stroke="#ffe066" strokeWidth={40 * glow} opacity={0.6} /> : null}
    <path d={CUBA_PATH} fill="#ffe1a1" stroke={INK} strokeWidth={6 / s} transform="translate(0 14)" />
    <path d={CUBA_PATH} fill="#4cc25a" stroke={INK} strokeWidth={6 / s} />
  </g>
);

// Globo terráqueo que gira
export const Globe: React.FC<{ x: number; y: number; r: number; f: number; glowCuba?: number }> = ({ x, y, r, f, glowCuba = 0 }) => {
  const off = (f * 4) % (r * 4);
  const lands = [
    { x: -0.6, y: -0.35, rx: 0.32, ry: 0.22 },
    { x: -0.35, y: 0.25, rx: 0.16, ry: 0.32 },
    { x: 0.35, y: -0.3, rx: 0.36, ry: 0.2 },
    { x: 0.3, y: 0.2, rx: 0.2, ry: 0.28 },
    { x: 0.9, y: 0.45, rx: 0.16, ry: 0.1 },
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id="globeClip">
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r + 30} fill="rgba(125,211,252,0.35)" />
      <circle r={r} fill="#2aa8e0" />
      <g clipPath="url(#globeClip)">
        {[0, 1, 2].map((k) =>
          lands.map((l, i) => (
            <ellipse key={`${k}-${i}`} cx={l.x * r + k * r * 4 - off - r * 2} cy={l.y * r} rx={l.rx * r} ry={l.ry * r} fill="#4cc25a" stroke={INK} strokeWidth={5} />
          )),
        )}
        <g transform={`translate(${-0.15 * r} ${-0.02 * r}) scale(${r / 1800})`}>
          <path d={CUBA_PATH} fill="#ffd23f" stroke={INK} strokeWidth={30} />
          {glowCuba > 0 ? <path d={CUBA_PATH} fill="none" stroke="#fff3a0" strokeWidth={120 * glowCuba} opacity={0.7} /> : null}
        </g>
        <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.4} ry={r * 0.2} fill="rgba(255,255,255,0.25)" />
      </g>
      <circle r={r} fill="none" stroke={INK} strokeWidth={8} />
    </g>
  );
};

export const Rings: React.FC<{ x: number; y: number; f: number; start: number }> = ({ x, y, f, start }) => {
  if (f < start) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = (f - start - i * 8) / 30;
        if (t < 0 || t > 1) return null;
        return <circle key={i} cx={x} cy={y} r={100 + t * 600} fill="none" stroke="#fff" strokeWidth={14 * (1 - t)} opacity={1 - t} />;
      })}
    </g>
  );
};

// ---------- economía ----------
export const Gear: React.FC<{ x: number; y: number; r: number; f: number; dir?: number; color?: string }> = ({ x, y, r, f, dir = 1, color = "#94a3b8" }) => (
  <g transform={`translate(${x} ${y}) rotate(${f * 3 * dir})`}>
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-r * 0.16} y={-r - r * 0.25} width={r * 0.32} height={r * 0.4} rx={6} fill={color} stroke={INK} strokeWidth={5} transform={`rotate(${i * 36})`} />
    ))}
    <circle r={r} fill={color} stroke={INK} strokeWidth={6} />
    <circle r={r * 0.35} fill="#475569" stroke={INK} strokeWidth={5} />
  </g>
);

export const Conveyor: React.FC<{ y: number; f: number }> = ({ y, f }) => (
  <g>
    <rect x={-60} y={y} width={W + 120} height={50} rx={25} fill="#475569" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 14 }).map((_, i) => (
      <circle key={i} cx={((i * 90 + f * 6) % (W + 120)) - 40} cy={y + 25} r={14} fill="#94a3b8" stroke={INK} strokeWidth={4} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => {
      const x = ((i * 260 + f * 6) % (W + 300)) - 200;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x={-70} y={-120} width={140} height={120} rx={8} fill="#d9a066" stroke={INK} strokeWidth={6} />
          <path d="M-70 -84 L70 -84" stroke={INK} strokeWidth={4} />
          <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>
            HECHO EN
          </text>
          <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#e11d2e">
            CUBA
          </text>
        </g>
      );
    })}
  </g>
);

export const FactoryBack: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#ffcf7a" />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${120 + i * 330} 420)`}>
        <rect x={0} y={0} width={240} height={300} rx={10} fill="#8ed1fc" stroke={INK} strokeWidth={6} />
        <path d="M120 0 L120 300 M0 150 L240 150" stroke={INK} strokeWidth={6} />
        {/* chimeneas con vapor limpio */}
        <rect x={150} y={180} width={40} height={120} fill="#e2725b" stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((k) => {
          const t = ((f + k * 20 + i * 13) % 60) / 60;
          return <circle key={k} cx={170 + t * 30} cy={170 - t * 140} r={14 + t * 20} fill="#fff" opacity={1 - t} />;
        })}
      </g>
    ))}
    <Gear x={90} y={900} r={70} f={f} />
    <Gear x={200} y={1000} r={50} f={f} dir={-1.4} color="#cbd5e1" />
    <Gear x={980} y={880} r={80} f={f} dir={-1} color="#fbbf24" />
    <rect x={-300} y={1180} width={W + 600} height={800} fill="#c2834a" stroke={INK} strokeWidth={6} />
  </g>
);

export const Coins: React.FC<{ f: number; start: number; n?: number }> = ({ f, start, n = 26 }) => {
  if (f < start) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const t = f - start - (i % 9) * 3;
        if (t < 0) return null;
        const x = (i * 97) % W;
        const y = -80 + t * (16 + (i % 4) * 3);
        if (y > H) return null;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${Math.abs(Math.cos((t + i) / 5))} 1)`}>
            <circle r={30} fill="#ffd23f" stroke={INK} strokeWidth={5} />
            <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#b45309">
              $
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Towers: React.FC<{ f: number; start: number; logos?: boolean; future?: boolean }> = ({ f, start, logos = true, future }) => {
  const bs = [
    { x: 40, w: 170, h: 640, c: "#60a5fa" },
    { x: 230, w: 150, h: 860, c: "#a78bfa" },
    { x: 400, w: 200, h: 1040, c: "#34d399" },
    { x: 620, w: 160, h: 780, c: "#f472b6" },
    { x: 800, w: 210, h: 940, c: "#fbbf24" },
  ];
  return (
    <g>
      {bs.map((b, i) => {
        const p = Math.max(0, Math.min(1, (f - start - i * 5) / 16));
        const e = 1 - Math.pow(1 - p, 3);
        const h = b.h * e;
        const base = 1330;
        return (
          <g key={i}>
            <rect x={b.x} y={base - h} width={b.w} height={h} rx={future ? 24 : 6} fill={b.c} stroke={INK} strokeWidth={6} />
            {Array.from({ length: Math.floor(h / 70) }).map((_, r) => (
              <g key={r}>
                {[0, 1, 2].map((c) => (
                  <rect key={c} x={b.x + 18 + c * ((b.w - 36) / 3)} y={base - h + 30 + r * 70} width={(b.w - 36) / 3 - 12} height={36} rx={6} fill={(r + c + i) % 3 ? "rgba(255,255,255,0.75)" : "#fff7c2"} />
                ))}
              </g>
            ))}
            {future && h > 200 ? <rect x={b.x + b.w / 2 - 4} y={base - h - 70} width={8} height={70} fill={INK} /> : null}
            {future && h > 200 ? <circle cx={b.x + b.w / 2} cy={base - h - 74} r={12} fill={(f + i * 7) % 30 < 15 ? "#f43f5e" : "#fff"} stroke={INK} strokeWidth={3} /> : null}
            {logos && h > 300 ? (
              <g transform={`translate(${b.x + b.w / 2} ${base - h + 40})`}>
                <circle r={34} fill="#fff" stroke={INK} strokeWidth={5} />
                <circle r={20} fill="none" stroke={b.c} strokeWidth={6} />
                <path d="M-20 0 L20 0 M0 -20 Q14 0 0 20 Q-14 0 0 -20" stroke={b.c} strokeWidth={4} fill="none" />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

export const BarChart: React.FC<{ x: number; y: number; f: number; start: number }> = ({ x, y, f, start }) => {
  const p = Math.max(0, Math.min(1, (f - start) / 40));
  const hs = [80, 140, 210, 300];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-20} y={-360} width={340} height={380} rx={20} fill="#fff" stroke={INK} strokeWidth={6} />
      {hs.map((h, i) => (
        <rect key={i} x={10 + i * 75} y={-h * p} width={55} height={h * p} rx={8} fill={["#60a5fa", "#34d399", "#fbbf24", "#f43f5e"][i]} stroke={INK} strokeWidth={5} />
      ))}
      <path d={`M10 -40 L${10 + 260 * p} ${-40 - 280 * p}`} stroke="#16a34a" strokeWidth={14} strokeLinecap="round" />
      {p > 0.95 ? <polygon points={`${270 + 10},${-320 - 10} ${300},${-350} ${246},${-344}`} fill="#16a34a" stroke={INK} strokeWidth={4} /> : null}
    </g>
  );
};

export const JobBoard: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={-20} width={24} height={360} fill="#8b5a2b" stroke={INK} strokeWidth={5} />
    <rect x={-300} y={-260} width={600} height={240} rx={24} fill="#ffd23f" stroke={INK} strokeWidth={8} />
    <text x={0} y={-160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={INK}>
      ¡SE BUSCA
    </text>
    <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#e11d2e">
      PERSONAL!
    </text>
  </g>
);

export const Houses: React.FC<{ f: number }> = ({ f }) => {
  const cols = ["#ff8fab", "#ffd23f", "#7dd3fc", "#a3e635", "#fdba74", "#c4b5fd"];
  return (
    <g>
      {cols.map((c, i) => (
        <g key={i} transform={`translate(${-20 + i * 190} 760)`}>
          <rect x={0} y={0} width={190} height={570} fill={c} stroke={INK} strokeWidth={6} />
          <rect x={-6} y={-24} width={202} height={30} fill="#fff" stroke={INK} strokeWidth={5} />
          {[0, 1].map((r) => (
            <g key={r}>
              <path d={`M40 ${90 + r * 200} a55 55 0 0 1 110 0 L150 ${200 + r * 200} L40 ${200 + r * 200} Z`} fill="#fff" stroke={INK} strokeWidth={5} />
              <rect x={30} y={200 + r * 200} width={130} height={14} fill="#fff" stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3].map((b) => (
                <rect key={b} x={44 + b * 30} y={214 + r * 200} width={6} height={36} fill={INK} />
              ))}
            </g>
          ))}
        </g>
      ))}
      {/* banderines de fiesta */}
      <path d="M-20 700 Q540 820 1100 700" stroke={INK} strokeWidth={4} fill="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 20 + i * 92;
        const y = 700 + Math.sin((i / 11) * Math.PI) * 110;
        return <polygon key={i} points={`${x - 30},${y} ${x + 30},${y} ${x},${y + 60}`} fill={["#1d4fd8", "#fff", "#e11d2e"][i % 3]} stroke={INK} strokeWidth={4} transform={`rotate(${Math.sin(f / 6 + i) * 8} ${x} ${y})`} />;
      })}
    </g>
  );
};

// ---------- tecnología ----------
export const Morro: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-160 0 L-120 -120 L120 -120 L160 0 Z" fill="#d6b27c" stroke={INK} strokeWidth={6} />
    <rect x={-36} y={-420} width={72} height={300} fill="#f1e3c6" stroke={INK} strokeWidth={6} />
    <rect x={-50} y={-470} width={100} height={50} rx={8} fill="#fde68a" stroke={INK} strokeWidth={6} />
    <path d="M-36 -470 L0 -520 L36 -470" fill="#e11d2e" stroke={INK} strokeWidth={6} />
    <g transform="translate(0 -446)" opacity={0.6}>
      <path d={`M0 0 L${Math.cos(f / 10) * 500} -60 L${Math.cos(f / 10) * 500} 60 Z`} fill="#fff7c2" />
    </g>
  </g>
);

export const Dome: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-200} y={-160} width={400} height={160} fill="#f8fafc" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={-184 + i * 48} y={-140} width={18} height={130} fill="#e2e8f0" stroke={INK} strokeWidth={3} />
    ))}
    <rect x={-90} y={-250} width={180} height={90} fill="#f8fafc" stroke={INK} strokeWidth={6} />
    <path d="M-90 -250 Q0 -420 90 -250 Z" fill="#fcd34d" stroke={INK} strokeWidth={6} />
    <rect x={-8} y={-440} width={16} height={80} fill="#f8fafc" stroke={INK} strokeWidth={4} />
  </g>
);

export const Train: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={-1200 + i * 40} y={-70 + (i % 3) * 40} width={160 - i * 20} height={10} rx={5} fill="#fff" opacity={0.7} />
    ))}
    {[0, 1, 2].map((c) => (
      <g key={c} transform={`translate(${-c * 380} 0)`}>
        <path d={c === 0 ? "M-180 -120 L120 -120 Q260 -110 300 -10 L300 0 L-180 0 Z" : "M-180 -120 L180 -120 L180 0 L-180 0 Z"} fill="#f8fafc" stroke={INK} strokeWidth={6} />
        <rect x={-180} y={-40} width={c === 0 ? 480 : 360} height={16} fill="#e11d2e" />
        <rect x={-180} y={-24} width={c === 0 ? 480 : 360} height={10} fill="#1d4fd8" />
        {[0, 1, 2].map((w) => (
          <rect key={w} x={-150 + w * 100} y={-100} width={70} height={44} rx={10} fill="#22d3ee" stroke={INK} strokeWidth={4} />
        ))}
      </g>
    ))}
  </g>
);

export const Robot: React.FC<{ x: number; y: number; f: number; s?: number; talk?: number }> = ({ x, y, f, s = 1, talk = 0 }) => {
  const hover = Math.sin(f / 6) * 14;
  const blink = f % 70 < 4;
  return (
    <g transform={`translate(${x} ${y + hover}) scale(${s})`}>
      <ellipse cx={0} cy={210 - hover} rx={70} ry={14} fill="rgba(20,10,40,0.2)" />
      <path d="M-40 150 Q0 200 40 150" stroke="#22d3ee" strokeWidth={10} fill="none" opacity={0.7} />
      <rect x={-80} y={0} width={160} height={140} rx={50} fill="#e2e8f0" stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={70} r={26} fill="#22d3ee" stroke={INK} strokeWidth={5} />
      <rect x={-100} y={-170} width={200} height={160} rx={60} fill="#f8fafc" stroke={INK} strokeWidth={6} />
      <rect x={-74} y={-140} width={148} height={96} rx={40} fill="#1e293b" />
      {blink ? (
        <g stroke="#22d3ee" strokeWidth={8} strokeLinecap="round">
          <path d="M-46 -94 L-18 -94 M18 -94 L46 -94" />
        </g>
      ) : (
        <g fill="#22d3ee">
          <circle cx={-32} cy={-96} r={16} />
          <circle cx={32} cy={-96} r={16} />
        </g>
      )}
      <rect x={-24} y={-68} width={48} height={6 + talk * 14} rx={4} fill="#22d3ee" />
      <rect x={-6} y={-210} width={12} height={40} fill={INK} />
      <circle cx={0} cy={-214} r={14} fill="#f43f5e" stroke={INK} strokeWidth={4} />
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M${sd * 80} 40 q${sd * 60} ${20 + Math.sin(f / 5 + sd) * 30} ${sd * 70} 80`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      ))}
      {[-1, 1].map((sd) => (
        <path key={`i${sd}`} d={`M${sd * 80} 40 q${sd * 60} ${20 + Math.sin(f / 5 + sd) * 30} ${sd * 70} 80`} stroke="#cbd5e1" strokeWidth={14} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

export const Hologram: React.FC<{ x: number; y: number; f: number; s: number; kind: number }> = ({ x, y, f, s, kind }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(f / 8 + kind) * 10}) scale(${s})`} opacity={0.92}>
      <rect x={-120} y={-80} width={240} height={160} rx={18} fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth={5} />
      {kind === 0 ? <path d="M-90 40 L-40 -10 L0 20 L80 -50" stroke="#a5f3fc" strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
      {kind === 1 ? (
        <g fill="none" stroke="#a5f3fc" strokeWidth={8}>
          <circle r={44} />
          <path d="M-44 0 L44 0 M0 -44 Q24 0 0 44 Q-24 0 0 -44" />
        </g>
      ) : null}
      {kind === 2 ? (
        <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#a5f3fc">
          IA
        </text>
      ) : null}
    </g>
  );

// ---------- mundo ----------
export const WorldMap: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#3ab0e6" />
    {Array.from({ length: 10 }).map((_, i) => (
      <path key={i} d={`M-100 ${200 + i * 170} Q540 ${170 + i * 170 + Math.sin(f / 20 + i) * 10} 1180 ${200 + i * 170}`} stroke="rgba(255,255,255,0.15)" strokeWidth={4} fill="none" />
    ))}
    <g fill="#5fcf6a" stroke={INK} strokeWidth={6}>
      <path d="M60 330 Q160 250 330 300 Q420 360 380 470 Q330 560 260 600 Q200 640 160 560 Q90 480 60 330 Z" />
      <path d="M260 760 Q330 720 380 790 Q400 900 330 1020 Q290 1080 270 990 Q240 880 260 760 Z" />
      <path d="M560 300 Q680 250 820 290 Q960 330 1010 420 Q980 520 860 540 Q760 520 700 470 Q600 430 560 300 Z" />
      <path d="M560 560 Q650 540 700 620 Q710 760 640 840 Q580 860 560 760 Q540 650 560 560 Z" />
      <path d="M860 840 Q930 820 970 870 Q960 930 890 930 Q850 900 860 840 Z" />
    </g>
  </g>
);

export const Table: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={20} rx={420} ry={90} fill="#7c4a1e" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={0} rx={420} ry={90} fill="#b7773f" stroke={INK} strokeWidth={6} />
    <ellipse cx={-120} cy={-10} rx={60} ry={14} fill="#fff" stroke={INK} strokeWidth={4} />
    <ellipse cx={120} cy={-6} rx={60} ry={14} fill="#fff" stroke={INK} strokeWidth={4} />
    <rect x={-30} y={-40} width={60} height={40} rx={6} fill="#fef3c7" stroke={INK} strokeWidth={4} />
  </g>
);

export const Bubble: React.FC<{ x: number; y: number; s: number; text: string; color?: string; tail?: "left" | "right" | "down" }> = ({ x, y, s, text, color = "#fff", tail = "down" }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-Math.max(90, text.length * 22)} y={-60} width={Math.max(180, text.length * 44)} height={110} rx={50} fill={color} stroke={INK} strokeWidth={6} />
      {tail === "down" ? <path d="M-20 48 L0 90 L20 48" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
      {tail === "left" ? <path d="M-60 40 L-100 80 L-30 46" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
      {tail === "right" ? <path d="M60 40 L100 80 L30 46" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
      <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>
        {text}
      </text>
    </g>
  );

// ---------- diáspora ----------
export const Plane: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-220 -10 Q-200 -50 -120 -50 L200 -50 Q260 -40 270 0 Q260 30 200 30 L-120 30 Q-200 30 -220 -10 Z" fill="#f8fafc" stroke={INK} strokeWidth={6} />
    <path d="M-40 -20 L60 -20 L-20 -140 L-70 -140 Z" fill="#1d4fd8" stroke={INK} strokeWidth={6} />
    <path d="M-40 10 L60 10 L-20 120 L-70 120 Z" fill="#1d4fd8" stroke={INK} strokeWidth={6} />
    <path d="M-200 -30 L-170 -130 L-130 -130 L-130 -40 Z" fill="#e11d2e" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 6 }).map((_, i) => (
      <circle key={i} cx={-80 + i * 44} cy={-12} r={11} fill="#22d3ee" stroke={INK} strokeWidth={3} />
    ))}
    <path d="M230 -30 Q256 -20 262 0" stroke={INK} strokeWidth={5} fill="#22d3ee" />
  </g>
);

export const Terminal: React.FC = () => (
  <g>
    <rect x={-100} y={760} width={W + 200} height={570} fill="#e0f2fe" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={20 + i * 180} y={820} width={150} height={260} rx={10} fill="#7dd3fc" stroke={INK} strokeWidth={5} />
    ))}
    <rect x={180} y={640} width={720} height={130} rx={20} fill="#1d4fd8" stroke={INK} strokeWidth={6} />
    <text x={540} y={728} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill="#fff">
      BIENVENIDOS
    </text>
  </g>
);

export const Hearts: React.FC<{ f: number; start: number; x: number; y: number }> = ({ f, start, x, y }) => {
  if (f < start) return null;
  return (
    <g>
      {Array.from({ length: 8 }).map((_, i) => {
        const t = (f - start - i * 5) / 40;
        if (t < 0 || t > 1) return null;
        const hx = x + Math.sin(i * 2.3) * 160 + Math.sin(t * 6 + i) * 20;
        const hy = y - t * 420;
        return <path key={i} transform={`translate(${hx} ${hy}) scale(${0.8 + (i % 3) * 0.3})`} d="M0 30 L-30 0 A17 17 0 0 1 0 -22 A17 17 0 0 1 30 0 Z" fill="#f43f5e" stroke={INK} strokeWidth={4} opacity={1 - t * 0.6} />;
      })}
    </g>
  );
};

export const Shop: React.FC<{ x: number; y: number; grow: number }> = ({ x, y, grow }) =>
  grow <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${grow})`}>
      <rect x={-180} y={-300} width={360} height={300} fill="#fde68a" stroke={INK} strokeWidth={6} />
      <path d="M-200 -300 L200 -300 L170 -380 L-170 -380 Z" fill="#e11d2e" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={-170 + i * 57} y={-380} width={28} height={80} fill="#fff" opacity={0.85} />
      ))}
      <rect x={-140} y={-240} width={150} height={120} fill="#7dd3fc" stroke={INK} strokeWidth={5} />
      <rect x={40} y={-200} width={100} height={200} fill="#8b5a2b" stroke={INK} strokeWidth={5} />
      <rect x={-150} y={-440} width={300} height={70} rx={14} fill="#1d4fd8" stroke={INK} strokeWidth={5} />
      <text x={0} y={-392} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">
        NEGOCIO
      </text>
    </g>
  );

// ---------- final ----------
export const Seesaw: React.FC<{ x: number; y: number; ang: number; children?: React.ReactNode }> = ({ x, y, ang, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <polygon points="-80,140 80,140 0,0" fill="#f59e0b" stroke={INK} strokeWidth={6} />
    <g transform={`rotate(${ang})`}>
      <rect x={-440} y={-22} width={880} height={36} rx={18} fill="#8b5a2b" stroke={INK} strokeWidth={6} />
      {children}
    </g>
  </g>
);

export const CommentIcon: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + Math.sin(f / 5) * 0.05)})`}>
      <path d="M-200 -130 Q-200 -170 -160 -170 L160 -170 Q200 -170 200 -130 L200 60 Q200 100 160 100 L-40 100 L-110 170 L-90 100 L-160 100 Q-200 100 -200 60 Z" fill="#fff" stroke={INK} strokeWidth={8} />
      {[-90, 0, 90].map((dx, i) => (
        <circle key={dx} cx={dx} cy={-34 + Math.sin(f / 4 + i) * 10} r={26} fill={["#1d4fd8", "#e11d2e", "#1d4fd8"][i]} stroke={INK} strokeWidth={5} />
      ))}
    </g>
  );

export const BigQuestion: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 6) * 8})`}>
      <text x={6} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={260} fill={INK}>
        ?
      </text>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={260} fill="#ffd23f" stroke={INK} strokeWidth={8}>
        ?
      </text>
    </g>
  );

export const SpeedLines: React.FC<{ f: number; color?: string }> = ({ f, color = "rgba(255,255,255,0.5)" }) => (
  <g>
    {Array.from({ length: 14 }).map((_, i) => {
      const y = 300 + ((i * 113) % 1300);
      const x = W - ((f * 60 + i * 230) % (W + 600));
      return <rect key={i} x={x} y={y} width={220 + (i % 3) * 80} height={10} rx={5} fill={color} />;
    })}
  </g>
);
