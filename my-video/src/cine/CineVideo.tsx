import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { clamp01, ease, popIn } from "../puppets/paper";
import voice from "../toon/voice.json";
import { ABUELA, CUBI, Char, IVAN, LI, MAMA, NENA, PAPA, SAM } from "./Char";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const SANS = "Inter, 'Inter Display', 'DejaVu Sans', sans-serif";
export const SERIF = "Caladea, 'Bitstream Charter', 'DejaVu Serif', serif";
type Word = { w: string; s: number; e: number };
type Voice = { duration: number; window: number; words: Word[]; mouth: number[] };
export const V = voice as unknown as Record<string, Voice>;
export const IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
export type SceneId = (typeof IDS)[number];
export const sceneFrames = IDS.map((id) => V[id].window * FPS);
export const total = sceneFrames.reduce((a, b) => a + b, 0);
export const CHAPTERS = ["EL GANCHO", "LA ECONOMÍA", "LA TECNOLOGÍA", "EL MUNDO", "LOS CUBANOS", "LA PREGUNTA"];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
export const wf = (id: SceneId, match: string) => {
  const w = V[id].words.find((x) => norm(x.w).startsWith(norm(match)));
  return w ? Math.round(w.s * FPS) : 0;
};
export const mouthAt = (id: SceneId, f: number) => {
  const m = V[id].mouth;
  return ((m[f - 1] ?? 0) + (m[f] ?? 0) * 2 + (m[f + 1] ?? 0)) / 4;
};

// ---------- utilidades visuales ----------
export const Defs: React.FC = () => (
  <defs>
    {[2, 4, 8, 14, 26].map((b) => (
      <filter key={b} id={`b${b}`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation={b} />
      </filter>
    ))}
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10" result="g" />
      <feMerge>
        <feMergeNode in="g" />
        <feMergeNode in="g" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="sunGlow">
      <stop offset="0" stopColor="#fff4d6" />
      <stop offset="0.2" stopColor="#ffc56b" stopOpacity="0.9" />
      <stop offset="1" stopColor="#ff7a3d" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="softWhite">
      <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

export const Grad: React.FC<{ id: string; stops: [number, string][]; x2?: number; y2?: number }> = ({ id, stops, x2 = 0, y2 = 1 }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c], i) => (
        <stop key={i} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  </defs>
);

export const Bokeh: React.FC<{ f: number; seed: string; n: number; colors: string[]; y0?: number; y1?: number; r?: [number, number]; blur?: number; drift?: number }> = ({
  f, seed, n, colors, y0 = 0, y1 = H, r = [20, 60], blur = 8, drift = 0.3,
}) => (
  <g filter={`url(#b${blur})`}>
    {Array.from({ length: n }).map((_, i) => {
      const rx = random(`${seed}x${i}`);
      const ry = random(`${seed}y${i}`);
      const rr = r[0] + random(`${seed}r${i}`) * (r[1] - r[0]);
      const x = ((rx * W + f * drift * (0.5 + rx)) % (W + 200)) - 100;
      const y = y0 + ry * (y1 - y0) + Math.sin(f / 30 + i) * 8;
      return <circle key={i} cx={x} cy={y} r={rr} fill={colors[i % colors.length]} opacity={0.35 + 0.4 * random(`${seed}o${i}`) + 0.15 * Math.sin(f / 9 + i)} />;
    })}
  </g>
);

export const GodRays: React.FC<{ x: number; y: number; color: string; n?: number; spread?: number; ang?: number; len?: number; f: number; op?: number }> = ({
  x, y, color, n = 6, spread = 40, ang = 30, len = 2200, f, op = 0.18,
}) => (
  <g filter="url(#b14)" style={{ mixBlendMode: "screen" }}>
    {Array.from({ length: n }).map((_, i) => {
      const a = ang - spread / 2 + (i / Math.max(1, n - 1)) * spread + Math.sin(f / 40 + i) * 1.5;
      const w = 40 + (i % 3) * 30;
      return (
        <polygon
          key={i}
          points={`${x},${y} ${x + Math.cos(((a - 1.5) * Math.PI) / 180) * len},${y + Math.sin(((a - 1.5) * Math.PI) / 180) * len} ${x + Math.cos(((a + 1.5) * Math.PI) / 180) * len + w},${y + Math.sin(((a + 1.5) * Math.PI) / 180) * len}`}
          fill={color}
          opacity={op * (0.6 + 0.4 * Math.sin(f / 25 + i * 1.7))}
        />
      );
    })}
  </g>
);

export const Cam: React.FC<{ f: number; dur: number; z0?: number; z1?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ f, dur, z0 = 1, z1 = 1.06, dx = 0, dy = 0, children }) => {
  const p = clamp01(f / dur);
  const z = z0 + (z1 - z0) * p;
  return <g transform={`translate(${W / 2 + dx * p} ${H / 2 + dy * p}) scale(${z}) translate(${-W / 2} ${-H / 2})`}>{children}</g>;
};

export const Silhouette: React.FC<{ x: number; y: number; s: number; f: number; walk?: number; color?: string }> = ({ x, y, s, f, walk = 0, color = "#0b0f17" }) => {
  const st = Math.sin(f / 5 + x) * walk;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <circle cx={0} cy={-170} r={22} />
      <path d="M-26 -146 Q0 -154 26 -146 L32 -70 L-32 -70 Z" />
      <path d={`M-20 -72 L${-24 + st * 14} 0 L${-10 + st * 14} 0 L0 -60 L${10 - st * 14} 0 L${24 - st * 14} 0 L20 -72 Z`} />
    </g>
  );
};

// ---------- ESCENA 1 ----------
const S1: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s1";
  const m = mouthAt(id, f);
  const cut = wf(id, "lo");
  const fPot = wf(id, "potencias");
  if (f < cut) {
    const dawn = clamp01((f - fPot + 10) / 40);
    return (
      <Cam f={f} dur={cut} z0={1} z1={1.07}>
        <Grad id="s1sky" stops={[[0, "#08142b"], [0.55, "#123a5a"], [1, "#2b6b7f"]]} />
        <Grad id="s1dawn" stops={[[0, "#1b2346"], [0.45, "#b8566a"], [0.75, "#ff9f5a"], [1, "#ffd28a"]]} />
        <rect width={W} height={H} fill="url(#s1sky)" />
        <rect width={W} height={H} fill="url(#s1dawn)" opacity={dawn} />
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={random(`st${i}`) * W} cy={random(`sty${i}`) * 900} r={1 + random(`str${i}`) * 2.4} fill="#fff" opacity={(0.4 + 0.6 * Math.abs(Math.sin(f / 12 + i))) * (1 - dawn)} />
        ))}
        <circle cx={540} cy={1060} r={220 + dawn * 520} fill="url(#sunGlow)" opacity={0.25 + dawn * 0.75} />
        <circle cx={540} cy={1080} r={70} fill="#fff1d0" opacity={dawn} filter="url(#b4)" />
        {/* mar con reflejo */}
        <Grad id="s1sea" stops={[[0, "#0f2d44"], [1, "#04101c"]]} />
        <rect y={1060} width={W} height={H} fill="url(#s1sea)" />
        <g filter="url(#b2)">
          {Array.from({ length: 34 }).map((_, i) => {
            const y = 1075 + i * 18 + i * i * 0.9;
            const w = 30 + i * 9 + Math.sin(f / 6 + i * 1.3) * 18;
            return <rect key={i} x={540 - w / 2 + Math.sin(f / 9 + i) * 12} y={y} width={w} height={4 + i * 0.25} rx={3} fill={dawn > 0.1 ? "#ffcf8a" : "#9fd0ff"} opacity={0.15 + 0.5 * (1 - i / 34) * (0.4 + dawn)} />;
          })}
        </g>
        {/* silueta de la isla con luces */}
        <g transform="translate(540 1050) scale(1.25 0.5)">
          <path d="M-420 -10 Q-380 -60 -300 -50 Q-200 -70 -120 -40 Q-40 -60 40 -20 Q140 -10 230 10 Q330 20 410 60 Q440 80 400 90 Q320 80 240 70 Q150 60 60 40 Q-40 30 -140 20 Q-240 20 -330 30 Q-400 40 -420 -10 Z" fill="#050b14" />
        </g>
        {Array.from({ length: 40 }).map((_, i) => {
          const on = i / 40 < 0.25 + dawn * 0.75 + clamp01((f - fPot) / 30) * 0.2;
          return on ? <circle key={i} cx={60 + random(`il${i}`) * 960} cy={1030 + random(`ily${i}`) * 26} r={2 + random(`ilr${i}`) * 3} fill="#ffd98a" filter="url(#b2)" /> : null;
        })}
        <Char id="cubi" look={CUBI} f={f} x={540} y={1820} s={1.22} expr={f >= fPot ? "amazed" : "neutral"} mouth={m} lookY={f >= fPot ? -0.6 : -0.2} rim={dawn > 0.2 ? "#ffb35c" : "#7fd8ff"} rimSide={1} gesture={f >= fPot + 10 ? "open" : "none"} />
        <g opacity={clamp01((f - 4) / 14) * (1 - clamp01((f - fPot - 18) / 12))}>
          <text x={540} y={430} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={70} fill="#f4e6c8" letterSpacing={2}>¿Y si Cuba fuera una</text>
          <text x={540} y={540} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={104} fill="#ffcf7a" letterSpacing={3} filter="url(#glow)">potencia mundial?</text>
          <rect x={390} y={580} width={300} height={3} fill="#ffcf7a" opacity={0.8} />
        </g>
      </Cam>
    );
  }
  const g = f - cut;
  return (
    <Cam f={g} dur={240 - cut} z0={1.05} z1={1.0}>
      <rect width={W} height={H} fill="#02040a" />
      {Array.from({ length: 120 }).map((_, i) => (
        <circle key={i} cx={random(`sp${i}`) * W} cy={random(`spy${i}`) * H} r={0.8 + random(`spr${i}`) * 2} fill="#fff" opacity={0.3 + 0.7 * random(`spo${i}`)} />
      ))}
      <defs>
        <radialGradient id="earth" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#4aa8d8" />
          <stop offset="0.55" stopColor="#14507a" />
          <stop offset="1" stopColor="#020c18" />
        </radialGradient>
        <clipPath id="earthClip">
          <circle cx={540} cy={1000} r={520} />
        </clipPath>
      </defs>
      <circle cx={540} cy={1000} r={560} fill="#4fb3ff" opacity={0.25} filter="url(#b26)" />
      <circle cx={540} cy={1000} r={520} fill="url(#earth)" />
      <g clipPath="url(#earthClip)">
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${((g * 1.2) % 1400) - k * 1400} 0)`} fill="#2f7a4e" opacity={0.85} filter="url(#b2)">
            <path d="M120 760 Q260 640 420 720 Q520 820 460 960 Q380 1060 300 1000 Q180 900 120 760 Z" />
            <path d="M380 1100 Q460 1060 520 1160 Q520 1320 440 1420 Q380 1360 380 1100 Z" />
            <path d="M760 700 Q900 640 1060 720 Q1120 860 980 900 Q860 880 760 700 Z" />
          </g>
        ))}
        {/* ciudades encendidas que se extienden */}
        {Array.from({ length: 90 }).map((_, i) => {
          const d = random(`city${i}`);
          const on = d < clamp01((g - 10) / 60);
          return on ? <circle key={i} cx={200 + random(`cx${i}`) * 700} cy={640 + random(`cy${i}`) * 720} r={2 + random(`cr${i}`) * 3} fill="#ffd98a" filter="url(#b2)" /> : null;
        })}
        <circle cx={470} cy={930} r={30 + Math.sin(g / 4) * 8} fill="#ffe08a" filter="url(#glow)" />
        {[0, 1, 2].map((i) => {
          const t = ((g + i * 14) % 42) / 42;
          return <circle key={i} cx={470} cy={930} r={40 + t * 420} fill="none" stroke="#ffd27a" strokeWidth={6 * (1 - t)} opacity={1 - t} />;
        })}
      </g>
      <circle cx={540} cy={1000} r={520} fill="none" stroke="#9fd8ff" strokeWidth={10} opacity={0.6} filter="url(#b4)" />
      <circle cx={1020} cy={420} r={200} fill="url(#sunGlow)" opacity={0.8} />
    </Cam>
  );
};

// ---------- ESCENA 2 ----------
const S2: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s2";
  const m = mouthAt(id, f);
  const c1 = wf(id, "millones");
  const c2 = wf(id, "la") - 3;
  if (f < c1) {
    const cx = ease(f, 0, 50, 1250, 600);
    return (
      <Cam f={f} dur={c1} z0={1.02} z1={1.08} dx={-20}>
        <Grad id="fac" stops={[[0, "#2a1a10"], [0.6, "#3d2614"], [1, "#120a05"]]} />
        <rect width={W} height={H} fill="url(#fac)" />
        <g filter="url(#b8)">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={40 + i * 200} y={300} width={150} height={700} fill="#ffcf8a" opacity={0.5} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${620 + i * 120} ${600 + Math.sin(f / 10 + i) * 6})`}>
              <rect x={-30} y={0} width={60} height={600} fill="#1a1109" />
              <path d={`M0 0 L${Math.cos(f / 12 + i) * 120} ${-90 + Math.sin(f / 12 + i) * 40}`} stroke="#2a1c10" strokeWidth={40} strokeLinecap="round" />
            </g>
          ))}
          <rect x={0} y={1180} width={W} height={80} fill="#22160c" />
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`translate(${((i * 230 + f * 5) % (W + 300)) - 150} 1080)`}>
              <rect x={-70} y={0} width={140} height={100} rx={6} fill="#a8743f" />
              <text x={0} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill="#3b220e">HECHO EN CUBA</text>
            </g>
          ))}
        </g>
        <GodRays x={-100} y={150} color="#ffd9a0" n={7} ang={52} spread={22} f={f} op={0.22} />
        {Array.from({ length: 30 }).map((_, i) => {
          const t = ((f * 2 + i * 13) % 60) / 60;
          return <circle key={i} cx={760 + Math.sin(i) * 60 + t * 120 * Math.cos(i)} cy={760 - t * 200 + t * t * 300} r={3} fill="#ffb347" opacity={1 - t} filter="url(#b2)" />;
        })}
        <Silhouette x={300} y={1180} s={1.4} f={f} walk={0.6} color="#160d06" />
        <Char id="cubi" look={CUBI} f={f} x={cx} y={1830} s={1.12} walk={f < 50} expr="happy" mouth={m} gesture={f < 50 ? "none" : "open"} rim="#ffb35c" rimSide={-1} lookX={-0.3} />
        <Bokeh f={f} seed="fac" n={10} colors={["#ffb35c", "#ffd9a0"]} y0={1400} y1={1900} r={[40, 90]} blur={14} />
      </Cam>
    );
  }
  if (f < c2) {
    const g = f - c1;
    return (
      <Cam f={g} dur={c2 - c1} z0={1.04} z1={1.0}>
        <Grad id="hav" stops={[[0, "#f0a35e"], [0.5, "#e07b4c"], [1, "#3a1f1a"]]} />
        <rect width={W} height={H} fill="url(#hav)" />
        <g filter="url(#b8)">
          {["#e7a0a8", "#f2d07a", "#8fc7d8", "#b9d58a", "#f0b083"].map((c, i) => (
            <g key={i} transform={`translate(${-60 + i * 240} 420)`}>
              <rect width={240} height={900} fill={c} opacity={0.85} />
              {[0, 1, 2].map((r) => (
                <rect key={r} x={60} y={80 + r * 260} width={120} height={170} rx={60} fill="#3a2418" opacity={0.6} />
              ))}
            </g>
          ))}
          <rect x={560} y={760} width={420} height={130} rx={16} fill="#2a1410" />
          <text x={770} y={842} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill="#ffd06a" filter="url(#glow)">SE BUSCA PERSONAL</text>
          {Array.from({ length: 9 }).map((_, i) => (
            <Silhouette key={i} x={((i * 150 + g * (4 + (i % 3))) % (W + 200)) - 100} y={1320 + (i % 3) * 20} s={1.6} f={f} walk={0.8} color="#2a1410" />
          ))}
        </g>
        <GodRays x={1180} y={200} color="#ffe2a8" n={6} ang={140} spread={20} f={f} op={0.2} />
        <Char id="mama" look={MAMA} f={f} x={300} y={1850} s={1.0} expr="joy" lookX={1} rim="#ffcf7a" rimSide={1} gesture="open" mouth={m * 0.6} />
        <Char id="cubi" look={CUBI} f={f} x={800} y={1880} s={1.06} expr="happy" lookX={-1} rim="#ffcf7a" rimSide={-1} mouth={m} gesture="point" flip />
      </Cam>
    );
  }
  const g = f - c2;
  const jump = popIn(g, 8, 14);
  return (
    <Cam f={g} dur={300 - c2} z0={1.0} z1={1.06}>
      <Grad id="fest" stops={[[0, "#1d1030"], [0.6, "#5a2a3a"], [1, "#2a1010"]]} />
      <rect width={W} height={H} fill="url(#fest)" />
      <Bokeh f={g} seed="fest" n={40} colors={["#ffcf6a", "#ff7a8a", "#7fd8ff", "#ffffff"]} y0={200} y1={1300} r={[16, 50]} blur={8} drift={1} />
      <path d="M-40 420 Q540 620 1120 420" stroke="#5a3a2a" strokeWidth={4} fill="none" />
      {Array.from({ length: 14 }).map((_, i) => {
        const x = i * 80;
        const y = 420 + Math.sin((i / 13) * Math.PI) * 180;
        return <circle key={i} cx={x} cy={y + 14} r={12} fill={["#ffcf6a", "#ff7a8a", "#7fd8ff"][i % 3]} filter="url(#glow)" opacity={0.7 + 0.3 * Math.sin(g / 4 + i)} />;
      })}
      <Char id="cubi" look={CUBI} f={f} x={420} y={1800} s={1.2} expr="joy" mouth={m} gesture="cheer" rim="#ff9fb0" rimSide={-1} />
      <Char id="nena" look={NENA} f={f} x={860} y={1900 + (1 - jump) * 700 - Math.abs(Math.sin(g / 5)) * 50} s={0.85} expr="joy" gesture="cheer" rim="#7fd8ff" rimSide={1} />
    </Cam>
  );
};

// ---------- ciudad (escena 3) ----------
export const CityStreet: React.FC<{ f: number; trainAt: number; up: number }> = ({ f, trainAt, up }) => {
  const vp = { x: 540, y: 980 };
  const signs = [
    { x: 190, y: 760, t: "CAFÉ", c: "#ff4d6d" },
    { x: 880, y: 640, t: "METRO", c: "#4dd9ff" },
    { x: 150, y: 1040, t: "HOTEL", c: "#ffd24d" },
    { x: 930, y: 960, t: "BODEGA", c: "#ff8a3d" },
  ];
  return (
    <g transform={`translate(0 ${up})`}>
      <Grad id="cityS" stops={[[0, "#5f8a96"], [0.6, "#9fbfc4"], [1, "#2b3e47"]]} />
      <rect y={-400} width={W} height={H + 800} fill="url(#cityS)" />
      {/* torres al fondo en la niebla */}
      <g filter="url(#b4)" opacity={0.7}>
        <path d="M520 1000 L520 330 L540 120 L560 330 L560 1000 Z" fill="#40626d" />
        {[[380, 520, 110], [640, 420, 120], [300, 700, 80], [740, 620, 90], [460, 600, 60]].map(([x, top, w], i) => (
          <rect key={i} x={x} y={top} width={w} height={1000 - top} fill="#476a74" />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <rect key={i} x={520 + (i % 2) * 22} y={340 + i * 16} width={10} height={6} fill="#cfe9ef" opacity={0.6} />
        ))}
      </g>
      <rect y={500} width={W} height={600} fill="#a9c4c8" opacity={0.35} filter="url(#b26)" />
      {/* edificios laterales en perspectiva */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          {[0, 1, 2].map((k) => {
            const xo = sd < 0 ? 0 : W;
            const xi = vp.x + sd * (120 + k * 40);
            const near = k / 3;
            return (
              <polygon key={k} points={`${xo},${-200 + k * 120} ${xi},${vp.y - 520 + k * 60} ${xi},${vp.y + 40} ${xo},${H - 380 + k * 40}`} fill={["#1c2a31", "#22333b", "#2a3d45"][k]} opacity={1 - near * 0.2} />
            );
          })}
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 3 }).map((_, c) => {
              const t = (c + 1) / 4;
              const xo = sd < 0 ? 0 : W;
              const xi = vp.x + sd * 140;
              const x = xo + (xi - xo) * t;
              const yTop = 100 + r * 130;
              const y = yTop + (vp.y - 300 - yTop) * t * 0.4;
              const lit = random(`win${sd}${r}${c}`) > 0.45;
              return <rect key={`${r}-${c}`} x={x - (1 - t) * 50} y={y} width={(1 - t) * 70 + 10} height={(1 - t) * 60 + 8} fill={lit ? "#f6c98a" : "#2e434c"} opacity={lit ? 0.75 : 0.9} />;
            }),
          )}
        </g>
      ))}
      {/* letreros de neón */}
      {signs.map((s, i) => (
        <g key={i} filter="url(#glow)" opacity={0.85 + 0.15 * Math.sin(f / (3 + i) + i)}>
          <rect x={s.x - 70} y={s.y - 40} width={140} height={80} rx={10} fill="none" stroke={s.c} strokeWidth={6} />
          <text x={s.x} y={s.y + 14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} fill={s.c}>{s.t}</text>
        </g>
      ))}
      {/* cables */}
      <path d="M0 260 Q540 340 1080 240" stroke="#0e1418" strokeWidth={4} fill="none" />
      <path d="M0 300 Q540 380 1080 290" stroke="#0e1418" strokeWidth={3} fill="none" />
      {/* tren maglev cruzando por un puente */}
      <rect x={0} y={820} width={W} height={26} fill="#1b262c" />
      {f >= trainAt - 4 ? (
        <g transform={`translate(${1500 - (f - trainAt) * 60} 760)`}>
          {[0, 1, 2].map((c) => (
            <g key={c} transform={`translate(${c * 330} 0)`}>
              <path d={c === 0 ? "M-160 0 L140 0 Q240 10 260 60 L-160 60 Z" : "M-160 0 L160 0 L160 60 L-160 60 Z"} fill="#e6eef2" />
              <rect x={-150} y={14} width={c === 0 ? 370 : 300} height={18} fill="#2b3e47" />
              <rect x={-160} y={50} width={c === 0 ? 420 : 320} height={8} fill="#4dd9ff" filter="url(#glow)" />
            </g>
          ))}
        </g>
      ) : null}
      {/* calle mojada con reflejos */}
      <polygon points={`${vp.x - 60},${vp.y + 40} ${vp.x + 60},${vp.y + 40} ${W + 300},${H} ${-300},${H}`} fill="#1a2328" />
      <g filter="url(#b8)" opacity={0.6}>
        {signs.map((s, i) => (
          <rect key={i} x={s.x - 40 + (540 - s.x) * 0.2} y={1300} width={80} height={420} fill={s.c} opacity={0.35} />
        ))}
      </g>
      {Array.from({ length: 9 }).map((_, i) => {
        const y = vp.y + 40 + (1460 - vp.y) * 0.9 + 0;
        return <rect key={i} x={120 + i * 96} y={y} width={60} height={22} fill="#dfe6e8" opacity={0.6} transform={`skewX(${(i - 4) * -6})`} />;
      })}
      {/* coches */}
      <g filter="url(#b4)">
        {[[300, 1180, "#fff2c8"], [480, 1120, "#fff2c8"], [700, 1150, "#ff3b3b"], [820, 1190, "#ff3b3b"]].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${(x as number) + Math.sin(f / 30 + i) * 6} ${y})`}>
            <rect x={-70} y={-50} width={140} height={60} rx={14} fill="#2a3338" />
            <circle cx={-44} cy={-14} r={12} fill={c as string} filter="url(#glow)" />
            <circle cx={44} cy={-14} r={12} fill={c as string} filter="url(#glow)" />
          </g>
        ))}
      </g>
      <Silhouette x={160 + (f * 1.6) % 300} y={1330} s={1.7} f={f} walk={0.8} />
      <Silhouette x={980 - (f * 1.2) % 260} y={1320} s={1.6} f={f + 7} walk={0.8} />
    </g>
  );
};

// ---------- ESCENA 3 ----------
const S3: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s3";
  const m = mouthAt(id, f);
  const fTren = wf(id, "trenes");
  const c1 = wf(id, "inteligencia");
  const c2 = wf(id, "capaz");
  if (f < c1) {
    const up = ease(f, 0, 70, 160, 0);
    return (
      <Cam f={f} dur={c1} z0={1.0} z1={1.1} dy={-40}>
        <CityStreet f={f} trainAt={fTren} up={up} />
        <Char id="cubi" look={CUBI} f={f} x={300} y={1900} s={1.0} expr="amazed" lookY={-0.9} lookX={0.4} mouth={m} rim="#4dd9ff" rimSide={1} gesture={f > fTren ? "point" : "none"} />
        <Bokeh f={f} seed="city" n={12} colors={["#ff4d6d", "#4dd9ff", "#ffd24d"]} y0={1500} y1={1900} r={[40, 100]} blur={26} />
      </Cam>
    );
  }
  if (f < c2) {
    const g = f - c1;
    return (
      <Cam f={g} dur={c2 - c1} z0={1.08} z1={1.0}>
        <rect width={W} height={H} fill="#050d18" />
        <Bokeh f={g} seed="ai" n={30} colors={["#4dd9ff", "#7fffd4", "#2a6bff"]} r={[8, 30]} blur={4} drift={0.6} />
        {[
          { x: 250, y: 560, k: 0, d: 0 },
          { x: 830, y: 520, k: 1, d: 6 },
          { x: 540, y: 380, k: 2, d: 12 },
        ].map((p) => {
          const s = popIn(g, p.d, 12);
          return s > 0.01 ? (
            <g key={p.k} transform={`translate(${p.x} ${p.y + Math.sin(g / 10 + p.k) * 12}) scale(${s})`} filter="url(#glow)" opacity={0.9}>
              <rect x={-150} y={-100} width={300} height={200} rx={20} fill="rgba(77,217,255,0.12)" stroke="#4dd9ff" strokeWidth={4} />
              {p.k === 0 ? <path d="M-110 50 L-50 -10 L0 30 L100 -60" stroke="#7fffd4" strokeWidth={8} fill="none" /> : null}
              {p.k === 1 ? (
                <g fill="none" stroke="#7fffd4" strokeWidth={6}>
                  <circle r={56} />
                  <path d="M-56 0 L56 0 M0 -56 Q30 0 0 56 Q-30 0 0 -56" />
                </g>
              ) : null}
              {p.k === 2 ? <text y={30} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={96} fill="#bff6ff">IA</text> : null}
            </g>
          ) : null;
        })}
        <g transform={`translate(830 ${980 + Math.sin(g / 7) * 18})`} filter="url(#glow)">
          <circle r={70} fill="#dce8f0" />
          <rect x={-46} y={-26} width={92} height={46} rx={22} fill="#0b1a2a" />
          <circle cx={-20} cy={-3} r={10} fill="#4dd9ff" />
          <circle cx={20} cy={-3} r={10} fill="#4dd9ff" />
          <ellipse cy={110} rx={40} ry={10} fill="#4dd9ff" opacity={0.4} />
        </g>
        <Char id="cubi" look={CUBI} f={f} x={420} y={1830} s={1.25} expr="amazed" mouth={m} lookX={0.6} lookY={-0.4} rim="#4dd9ff" rimSide={1} gesture="open" />
        <rect width={W} height={H} fill="#4dd9ff" opacity={0.06} />
      </Cam>
    );
  }
  const g = f - c2;
  const form = clamp01(g / 40);
  return (
    <Cam f={g} dur={300 - c2} z0={1.0} z1={1.05}>
      <Grad id="night" stops={[[0, "#050b1e"], [0.7, "#1a2350"], [1, "#2c1d3a"]]} />
      <rect width={W} height={H} fill="url(#night)" />
      {/* drones formando la estrella */}
      {Array.from({ length: 70 }).map((_, i) => {
        const pos = (i / 70) * 10;
        const k = Math.floor(pos);
        const fr = pos - k;
        const vtx = (j: number) => {
          const r = j % 2 === 0 ? 260 : 105;
          const a = -Math.PI / 2 + (j * Math.PI) / 5;
          return [540 + Math.cos(a) * r, 580 + Math.sin(a) * r];
        };
        const [ax, ay] = vtx(k);
        const [bx, by] = vtx((k + 1) % 10);
        const tx = ax + (bx - ax) * fr;
        const ty = ay + (by - ay) * fr;
        const sx = random(`dx${i}`) * W;
        const sy = 200 + random(`dy${i}`) * 700;
        return <circle key={i} cx={sx + (tx - sx) * form} cy={sy + (ty - sy) * form} r={6} fill={i % 3 ? "#ffffff" : "#ff4d6d"} filter="url(#glow)" />;
      })}
      <g opacity={0.9}>
        {[[0, 1100, 160, 500], [150, 1000, 120, 600], [300, 950, 140, 650], [700, 980, 130, 620], [860, 1050, 160, 550], [480, 1150, 100, 450]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h + 300} fill="#0a0f1e" />
        ))}
      </g>
      <Char id="sam" look={SAM} f={f} x={180} y={1900} s={0.8} expr="surprised" lookY={-0.8} rim="#ff8aa0" rimSide={1} />
      <Char id="li" look={LI} f={f} x={900} y={1900} s={0.8} expr="surprised" lookY={-0.8} rim="#ff8aa0" rimSide={-1} />
      <Char id="ivan" look={IVAN} f={f} x={700} y={1960} s={0.78} expr="worried" lookY={-0.8} rim="#ff8aa0" rimSide={-1} />
      <Char id="cubi" look={CUBI} f={f} x={420} y={1860} s={1.0} expr="proud" lookY={-0.5} mouth={m} rim="#ff8aa0" rimSide={1} gesture="cheer" />
    </Cam>
  );
};

// ---------- ESCENA 4 ----------
const S4: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s4";
  const m = mouthAt(id, f);
  const fUS = wf(id, "estados");
  const fCh = wf(id, "china");
  const fRu = wf(id, "rusia");
  const fNeg = wf(id, "negociar");
  const fCu = wf(id, "cuba");
  const cut = wf(id, "pequena");
  const MapScreen: React.FC<{ blur: number; arcs: number }> = ({ blur, arcs }) => (
    <g filter={blur ? `url(#b${blur})` : undefined}>
      <rect x={60} y={360} width={960} height={620} rx={20} fill="#0a2a44" />
      <g fill="#1f6b8f" opacity={0.9}>
        <path d="M120 460 Q220 400 360 440 Q420 500 380 600 Q320 660 260 680 Q190 640 120 460 Z" />
        <path d="M300 720 Q360 700 390 760 Q400 860 340 940 Q300 880 300 720 Z" />
        <path d="M560 440 Q700 400 860 440 Q960 480 990 560 Q960 640 840 650 Q700 620 560 440 Z" />
        <path d="M560 660 Q640 650 680 720 Q690 840 620 900 Q570 820 560 660 Z" />
      </g>
      <circle cx={400} cy={660} r={14 + Math.sin(f / 4) * 4} fill="#ffd27a" />
      {[[240, 500], [760, 480], [620, 760], [900, 560]].map(([tx, ty], i) => {
        const p = clamp01(arcs * 1.3 - i * 0.15);
        return p > 0 ? <path key={i} d={`M400 660 Q${(400 + tx) / 2} ${Math.min(660, ty) - 160} ${tx} ${ty}`} stroke="#ffd27a" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${p} 1`} /> : null;
      })}
    </g>
  );
  if (f < cut) {
    const spot = (t: number) => clamp01((f - t) / 8);
    const arguing = f >= fNeg && f < fCu + 6;
    return (
      <Cam f={f} dur={cut} z0={1.0} z1={1.06}>
        <rect width={W} height={H} fill="#06080f" />
        <MapScreen blur={8} arcs={0} />
        <rect x={0} y={0} width={W} height={H} fill="#06080f" opacity={0.25} />
        {[[200, fUS, "#7fb6ff"], [880, fCh, "#ff8a7a"], [420, fRu, "#c9d4ff"], [640, fCu, "#ffcf7a"]].map(([x, t, c], i) => (
          <polygon key={i} points={`${(x as number) - 40},0 ${(x as number) + 40},0 ${(x as number) + 230},1500 ${(x as number) - 230},1500`} fill={c as string} opacity={0.14 * spot(t as number)} filter="url(#b14)" />
        ))}
        <Char id="sam" look={SAM} f={f} x={200} y={1600} s={0.78} expr={arguing ? "angry" : "neutral"} mouth={arguing ? m * 0.5 : 0} lookX={f >= fCu ? 1 : 0.6} rim="#7fb6ff" rimSide={1} gesture={arguing ? "point" : "none"} />
        <Char id="ivan" look={IVAN} f={f} x={420} y={1620} s={0.74} expr={arguing ? "angry" : "neutral"} lookX={f >= fCu ? 1 : -0.6} rim="#c9d4ff" rimSide={-1} />
        <Char id="li" look={LI} f={f} x={880} y={1600} s={0.78} expr={arguing ? "worried" : "neutral"} lookX={-1} rim="#ff8a7a" rimSide={-1} gesture={arguing ? "open" : "none"} flip />
        <Char id="cubi" look={CUBI} f={f} x={640} y={1560 + (1 - spot(fCu - 4)) * 300} s={0.86} expr="proud" mouth={f >= fCu - 4 ? m : 0} rim="#ffcf7a" rimSide={-1} gesture={f >= fCu ? "open" : "none"} />
        {/* mesa en primer plano */}
        <Grad id="table" stops={[[0, "#3a2414"], [1, "#120a05"]]} />
        <path d="M-100 1520 L1180 1520 L1300 1920 L-220 1920 Z" fill="url(#table)" />
        <rect x={-100} y={1510} width={W + 200} height={14} fill="#6a4426" />
        <g filter="url(#b8)" opacity={0.5}>
          <rect x={160} y={1560} width={90} height={260} fill="#7fb6ff" opacity={0.25} />
          <rect x={600} y={1560} width={90} height={260} fill="#ffcf7a" opacity={0.3} />
        </g>
      </Cam>
    );
  }
  const g = f - cut;
  return (
    <Cam f={g} dur={330 - cut} z0={1.12} z1={1.0}>
      <rect width={W} height={H} fill="#03060c" />
      <g transform="translate(-60 -60) scale(1.12)">
        <MapScreen blur={0} arcs={clamp01(g / 50)} />
      </g>
      <circle cx={388} cy={679} r={60 + Math.sin(g / 5) * 10} fill="#ffd27a" opacity={0.25} filter="url(#b14)" />
      <Bokeh f={g} seed="map" n={14} colors={["#ffd27a", "#7fb6ff"]} y0={200} y1={1100} r={[20, 50]} blur={8} />
      <Char id="sam" look={SAM} f={f} x={140} y={1950} s={0.72} expr="surprised" lookX={1} lookY={-0.5} rim="#ffd27a" rimSide={1} />
      <Char id="li" look={LI} f={f} x={950} y={1950} s={0.72} expr="amazed" lookX={-1} lookY={-0.5} rim="#ffd27a" rimSide={-1} />
      <Char id="cubi" look={CUBI} f={f} x={540} y={1860} s={1.05} expr="proud" mouth={m} rim="#ffd27a" rimSide={1} gesture="cheer" />
    </Cam>
  );
};

// ---------- ESCENA 5 ----------
const S5: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s5";
  const m = mouthAt(id, f);
  const c1 = wf(id, "visitar");
  const c2 = wf(id, "invertir");
  if (f < c1) {
    const z = ease(f, 0, c1, 0.82, 1.0);
    return (
      <Cam f={f} dur={c1} z0={1.0} z1={1.04}>
        <Grad id="air" stops={[[0, "#f6b26b"], [0.5, "#f7d6a6"], [1, "#6a5a52"]]} />
        <rect width={W} height={H} fill="url(#air)" />
        <g filter="url(#b8)">
          <rect y={1180} width={W} height={20} fill="#8a6f5c" />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={i * 170 - 20} y={300} width={14} height={900} fill="#5a463b" />
          ))}
          <g transform={`translate(${ease(f, 0, c1, 1300, -300)} ${ease(f, 0, c1, 560, 700)}) rotate(4)`}>
            <path d="M-200 0 Q-180 -30 -100 -30 L180 -30 Q230 -20 240 0 Q230 20 180 20 L-100 20 Q-180 20 -200 0 Z" fill="#f5f2ee" />
            <path d="M-20 -10 L60 -10 L-10 -110 L-50 -110 Z" fill="#cfd6de" />
            <path d="M-180 -20 L-150 -100 L-120 -100 L-120 -24 Z" fill="#c21d2c" />
          </g>
        </g>
        <GodRays x={540} y={200} color="#fff1cf" n={8} ang={95} spread={50} f={f} op={0.18} />
        <rect y={1200} width={W} height={720} fill="#3a2e2a" />
        <g filter="url(#b14)" opacity={0.5}>
          <rect x={300} y={1220} width={480} height={300} fill="#f7d6a6" opacity={0.4} />
        </g>
        <Char id="mama" look={MAMA} f={f} x={360} y={1700 + (1 - z) * -200} s={0.95 * z} walk expr="joy" mouth={m * 0.6} rim="#ffd9a0" rimSide={1} lookX={0.4} />
        <Char id="papa" look={PAPA} f={f + 9} x={740} y={1720 + (1 - z) * -200} s={1.0 * z} walk expr="amazed" lookY={-0.3} rim="#ffd9a0" rimSide={-1} />
      </Cam>
    );
  }
  if (f < c2) {
    const g = f - c1;
    return (
      <Cam f={g} dur={c2 - c1} z0={1.0} z1={1.08}>
        <Grad id="hug" stops={[[0, "#3a1f14"], [0.5, "#8a4a26"], [1, "#2a140c"]]} />
        <rect width={W} height={H} fill="url(#hug)" />
        <Bokeh f={g} seed="hug" n={26} colors={["#ffcf7a", "#ffb35c", "#fff1cf"]} y0={200} y1={1300} r={[30, 80]} blur={14} />
        <circle cx={760} cy={600} r={500} fill="url(#sunGlow)" opacity={0.6} />
        <g filter="url(#b8)" opacity={0.85}>
          <Char id="mama2" look={MAMA} f={f} x={880} y={1500} s={0.7} expr="joy" rim="#ffcf7a" rimSide={-1} />
        </g>
        <Char id="abuela" look={ABUELA} f={f} x={640} y={1820} s={1.1} expr="joy" gesture="hug" rim="#ffcf7a" rimSide={1} flip mouth={m * 0.4} />
        <Char id="nena" look={NENA} f={f} x={360} y={1960} s={0.95} expr="joy" gesture="hug" rim="#ffcf7a" rimSide={-1} />
        {Array.from({ length: 8 }).map((_, i) => {
          const t = ((g + i * 9) % 60) / 60;
          return <circle key={i} cx={500 + Math.sin(i * 2) * 140} cy={1000 - t * 420} r={6} fill="#fff1cf" opacity={1 - t} filter="url(#glow)" />;
        })}
      </Cam>
    );
  }
  const g = f - c2;
  const shutter = ease(g, 6, 30, 0, 1);
  return (
    <Cam f={g} dur={330 - c2} z0={1.04} z1={1.0}>
      <Grad id="eve" stops={[[0, "#0f1730"], [0.7, "#2a2340"], [1, "#151020"]]} />
      <rect width={W} height={H} fill="url(#eve)" />
      <g transform="translate(540 1200)">
        <rect x={-380} y={-620} width={760} height={620} fill="#2a2030" />
        <rect x={-320} y={-480} width={640} height={420} fill="#ffcf7a" opacity={0.15 + shutter * 0.75} filter="url(#b4)" />
        <rect x={-320} y={-480} width={640} height={420 * (1 - shutter)} fill="#5a5560" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={-320} y={-480 + i * 42 * (1 - shutter)} width={640} height={4} fill="#3a3540" opacity={1 - shutter} />
        ))}
        <g opacity={clamp01((g - 26) / 6)} filter="url(#glow)">
          <rect x={-200} y={-600} width={400} height={96} rx={18} fill="none" stroke="#ff4d6d" strokeWidth={8} />
          <text x={0} y={-532} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={60} fill="#ff4d6d">ABIERTO</text>
        </g>
      </g>
      <Bokeh f={g} seed="eve" n={14} colors={["#ffcf7a", "#ff4d6d"]} y0={1300} y1={1900} r={[40, 90]} blur={26} />
      <Char id="papa" look={PAPA} f={f} x={300} y={1880} s={1.05} expr="proud" mouth={m} gesture="open" rim="#ffcf7a" rimSide={1} lookX={0.5} />
      <Char id="cubi" look={CUBI} f={f} x={840} y={1940} s={0.85} expr="joy" gesture="wave" rim="#ffcf7a" rimSide={-1} lookX={-0.6} />
    </Cam>
  );
};

// ---------- ESCENA 6 ----------
const S6: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s6";
  const m = mouthAt(id, f);
  const fSup = wf(id, "superar");
  const cut = wf(id, "dejame");
  if (f < cut) {
    return (
      <Cam f={f} dur={cut} z0={1.0} z1={1.07}>
        <Grad id="set" stops={[[0, "#2b1b46"], [0.45, "#c2546a"], [0.7, "#ff9a4d"], [1, "#ffd08a"]]} />
        <rect width={W} height={H} fill="url(#set)" />
        <circle cx={540} cy={1050} r={600} fill="url(#sunGlow)" />
        <circle cx={540} cy={1060} r={130} fill="#fff1cf" filter="url(#b4)" />
        <GodRays x={540} y={1060} color="#ffe2b0" n={10} ang={-90} spread={150} f={f} op={0.12} />
        {/* skyline: Capitolio, Morro y torres nuevas */}
        <g fill="#1a0f1e">
          <rect x={0} y={1080} width={W} height={900} />
          <rect x={60} y={900} width={70} height={200} />
          <rect x={70} y={860} width={50} height={50} />
          <rect x={360} y={960} width={240} height={140} />
          <path d="M410 960 Q480 820 550 960 Z" />
          <rect x={472} y={780} width={16} height={60} />
          {[[700, 640, 90], [810, 720, 80], [920, 560, 100], [220, 760, 90]].map(([x, y, w], i) => (
            <rect key={i} x={x} y={y} width={w} height={1100 - y} rx={10} />
          ))}
        </g>
        <polygon points={`95,880 ${95 + Math.cos(f / 15) * 900},820 ${95 + Math.cos(f / 15) * 900},940`} fill="#fff1cf" opacity={0.15} filter="url(#b8)" />
        <rect y={1280} width={W} height={700} fill="#120a14" />
        <Char id="cubi" look={CUBI} f={f} x={330} y={1880} s={1.05} expr={f >= fSup ? "neutral" : "proud"} gesture={f >= fSup ? "think" : "none"} lookX={f >= fSup ? 1 : 0.2} lookY={-0.2} mouth={m} rim="#ffb35c" rimSide={1} />
        <Char id="sam" look={SAM} f={f} x={770} y={1900} s={1.0} expr={f >= fSup ? "surprised" : "neutral"} lookX={-1} lookY={-0.1} rim="#ffb35c" rimSide={-1} flip />
      </Cam>
    );
  }
  const g = f - cut;
  return (
    <Cam f={g} dur={300 - cut} z0={1.06} z1={1.0}>
      <Grad id="end" stops={[[0, "#24143c"], [0.6, "#7a3a52"], [1, "#2a1420"]]} />
      <rect width={W} height={H} fill="url(#end)" />
      <Bokeh f={g} seed="end" n={30} colors={["#ffb35c", "#ff7a8a", "#ffd9a0"]} y0={200} y1={1500} r={[30, 80]} blur={14} />
      <g transform={`translate(800 ${700 + (1 - popIn(g, 4, 12)) * 60})`} opacity={popIn(g, 4, 12)}>
        <rect x={-200} y={-120} width={400} height={240} rx={40} fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
        <path d="M-60 118 L-110 200 L10 118 Z" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
        {[-90, 0, 90].map((dx, i) => (
          <circle key={dx} cx={dx} cy={Math.sin(g / 4 + i) * 10} r={24} fill="#fff" opacity={0.9} />
        ))}
      </g>
      <Char id="cubi" look={CUBI} f={f} x={440} y={1760} s={1.3} expr="joy" mouth={m} gesture="point" rim="#ffb35c" rimSide={1} lookX={0} />
    </Cam>
  );
};

// ---------- subtítulos y encabezados ----------
const groupWords = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const gap = i > 0 ? w.s - words[i - 1].e : 0;
    if (cur.length >= 5 || (cur.length >= 2 && gap > 0.2)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{ id: SceneId; f: number }> = ({ id, f }) => {
  const t = f / FPS;
  const groups = groupWords(V[id].words);
  let gi = -1;
  groups.forEach((g, i) => {
    if (t >= g[0].s - 0.05) gi = i;
  });
  if (gi < 0) return null;
  const g = groups[gi];
  if (t > g[g.length - 1].e + 0.5) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 330, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 62, lineHeight: 1.25 }}>
      {g.map((w, i) => {
        const p = clamp01((t - w.s + 0.08) / 0.18);
        const active = t >= w.s - 0.03 && (i === g.length - 1 || t < g[i + 1].s - 0.03);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 10px",
              opacity: 0.55 + 0.45 * p,
              transform: `translateY(${(1 - p) * 14}px)`,
              color: active ? "#ffd59a" : "#ffffff",
              textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.6)",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

export const Chapter: React.FC<{ idx: number; f: number }> = ({ idx, f }) => {
  if (idx === 0) return null;
  const o = clamp01((f - 8) / 10) * (1 - clamp01((f - 80) / 14));
  if (o <= 0) return null;
  const slide = (1 - clamp01((f - 8) / 14)) * -30;
  return (
    <div style={{ position: "absolute", top: 230, left: 70, opacity: o, transform: `translateX(${slide}px)`, color: "#f4e6c8" }}>
      <div style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 700, lineHeight: 1, color: "#ffcf7a" }}>{String(idx + 1).padStart(2, "0")}</div>
      <div style={{ width: 120 * clamp01((f - 12) / 14), height: 3, background: "#ffcf7a", margin: "14px 0" }} />
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: 10 }}>{CHAPTERS[idx]}</div>
    </div>
  );
};

const SCENES: Record<SceneId, React.FC<{ f: number }>> = { s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6 };

export const Shell: React.FC<{ id: SceneId; idx: number; scenes?: Record<SceneId, React.FC<{ f: number }>> }> = ({ id, idx, scenes = SCENES }) => {
  const f = useCurrentFrame();
  const Comp = scenes[id];
  const fadeIn = idx === 0 ? clamp01(f / 12) : clamp01(f / 8);
  const leak = idx === 0 ? 0 : 1 - clamp01(f / 16);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Audio src={staticFile(`audio/toon/${id}.mp3`)} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
        <Defs />
        <Comp f={f} />
      </svg>
      {/* gradación de color cinematográfica */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,90,110,0.55) 0%, rgba(0,0,0,0) 45%, rgba(255,140,60,0.45) 100%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)" }} />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("puppets/grain.png")})`, backgroundSize: "100% 100%", mixBlendMode: "overlay", opacity: 0.22,
          transform: `translate(${(random(`gx${f}`) - 0.5) * 30}px, ${(random(`gy${f}`) - 0.5) * 30}px) scale(1.05)`,
        }}
      />
      {leak > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${20 + (1 - leak) * 80}% 30%, rgba(255,170,90,${0.75 * leak}) 0%, rgba(255,90,60,${0.35 * leak}) 35%, rgba(0,0,0,0) 70%)`, mixBlendMode: "screen" }} />
      ) : null}
      <Chapter idx={idx} f={f} />
      <div style={{ position: "absolute", top: 170, right: 50, padding: "8px 18px", border: "2px solid rgba(255,230,190,0.7)", borderRadius: 6, color: "rgba(255,236,205,0.92)", fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 4, background: "rgba(0,0,0,0.25)" }}>
        ESCENARIO HIPOTÉTICO
      </div>
      <Captions id={id} f={f} />
    </AbsoluteFill>
  );
};

export const CineVideo: React.FC = () => {
  const frame = useCurrentFrame();
  let offset = 0;
  const musicVol = interpolate(frame, [0, 15, total - 40, total], [0, 0.2, 0.2, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/toon/music.mp3")} volume={musicVol} />
      {IDS.map((id, i) => {
        const from = offset;
        offset += sceneFrames[i];
        return (
          <Sequence key={id} from={from} durationInFrames={sceneFrames[i]}>
            <Shell id={id} idx={i} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CineComposition: React.FC = () => (
  <Composition id="CubaCine" component={CineVideo} durationInFrames={total} fps={FPS} width={W} height={H} />
);
