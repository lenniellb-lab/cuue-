import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { clamp01, ease, popIn } from "../puppets/paper";
import { ABUELA, CUBI, CLook, Char, CharProps, FEET, IVAN, LI, MAMA, NENA, PAPA, SAM } from "./Char";
import { Bokeh, CityStreet, Grad, H, IDS, SANS, SERIF, SceneId, Shell, W, mouthAt, sceneFrames, total, wf } from "./CineVideo";

// ---------- planeta Tierra con el Caribe al frente ----------
export const Planet: React.FC<{ id: string; cx: number; cy: number; r: number; rot?: number; glow?: number; f: number; labels?: boolean }> = ({
  id, cx, cy, r, rot = 0, glow = 0, f, labels = true,
}) => {
  const k = r / 100;
  const land = "#3f9a5a";
  const off = rot; // desplazamiento horizontal (giro)
  return (
    <g>
      <defs>
        <radialGradient id={`${id}ocean`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#6fd0f5" />
          <stop offset="0.5" stopColor="#1d6fa8" />
          <stop offset="1" stopColor="#041a33" />
        </radialGradient>
        <radialGradient id={`${id}shade`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>
        <clipPath id={`${id}clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.06} fill="#59b9ff" opacity={0.28} filter="url(#b26)" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}ocean)`} />
      <g clipPath={`url(#${id}clip)`}>
        <g transform={`translate(${cx + off * k} ${cy}) scale(${k})`}>
          {[-200, 0, 200].map((dx) => (
            <g key={dx} transform={`translate(${dx} 0)`} fill={land}>
              {/* Norteamérica y Florida */}
              <path d="M-95 -130 L60 -130 L62 -92 Q40 -88 22 -96 Q10 -98 6 -84 L2 -76 Q-6 -82 -10 -92 Q-40 -96 -60 -86 Q-80 -84 -95 -100 Z" />
              {/* México y Centroamérica */}
              <path d="M-100 -96 Q-80 -84 -62 -86 Q-56 -70 -48 -62 Q-38 -58 -30 -64 Q-26 -56 -32 -50 Q-40 -44 -30 -36 Q-20 -28 -10 -24 L-6 -20 Q-16 -18 -26 -26 Q-44 -38 -58 -50 Q-80 -66 -100 -70 Z" />
              {/* Cuba */}
              <path d="M-26 -74 Q-14 -78 0 -76 Q14 -74 26 -70 Q32 -68 30 -66 Q16 -68 2 -70 Q-12 -70 -24 -70 Q-30 -71 -26 -74 Z" fill={glow > 0 ? "#ffd46a" : "#6cc27a"} />
              <path d="M36 -66 Q44 -68 50 -65 Q46 -62 38 -63 Z M56 -63 L62 -62 L60 -60 L55 -61 Z M-8 -64 Q-4 -65 -2 -63 Q-6 -62 -8 -64 Z" />
              {/* Sudamérica (Venezuela arriba) */}
              <path d="M-4 -24 Q10 -34 30 -32 Q50 -30 66 -20 Q80 -6 78 14 Q74 40 54 66 Q40 90 28 110 L10 110 Q14 80 6 50 Q-8 20 -10 0 Q-10 -14 -4 -24 Z" />
              {/* África */}
              <path d="M96 -70 Q120 -78 140 -60 L140 60 Q120 70 110 40 Q100 10 96 -20 Z" />
            </g>
          ))}
        </g>
        {glow > 0 ? (
          <g>
            <circle cx={cx} cy={cy - 0.72 * r} r={(0.16 + glow * 0.1) * r} fill="#ffd46a" opacity={0.25 * glow} filter="url(#b14)" />
            {[0, 1, 2].map((i) => {
              const t = ((f + i * 16) % 48) / 48;
              return <ellipse key={i} cx={cx} cy={cy - 0.72 * r} rx={(0.1 + t * 0.7) * r} ry={(0.03 + t * 0.2) * r} fill="none" stroke="#ffe08a" strokeWidth={Math.max(1, 6 * (1 - t))} opacity={(1 - t) * glow} />;
            })}
          </g>
        ) : null}
        {/* nubes */}
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse key={i} cx={cx + (((random(`cl${id}${i}`) * 2 - 1) * r + f * 0.6 * k) % (2 * r)) - (random(`cl${id}${i}`) > 0.5 ? 0 : 0)} cy={cy + (random(`cly${id}${i}`) * 1.6 - 0.8) * r} rx={0.18 * r} ry={0.035 * r} fill="#fff" opacity={0.35} filter="url(#b4)" />
        ))}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}shade)`} />
        <ellipse cx={cx - 0.35 * r} cy={cy - 0.45 * r} rx={0.35 * r} ry={0.18 * r} fill="#fff" opacity={0.18} filter="url(#b8)" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#a8e2ff" strokeWidth={Math.max(3, r * 0.012)} opacity={0.7} filter="url(#b4)" />
      {labels ? (
        <text x={cx + off * k * 0} y={cy - 0.64 * r} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={Math.max(18, r * 0.055)} fill="#fff6d8" opacity={0.9} letterSpacing={4}>
          CUBA
        </text>
      ) : null}
    </g>
  );
};

// Personaje de pie sobre la superficie del planeta (ángulo en grados desde arriba)
const OnPlanet: React.FC<{ cx: number; cy: number; r: number; ang: number; lift?: number; c: CharProps }> = ({ cx, cy, r, ang, lift = 0, c }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${ang}) translate(0 ${-r - lift})`}>
    <Char {...c} x={0} y={-FEET * (c.s ?? 1)} full />
  </g>
);

const Stars: React.FC<{ f: number; n?: number; seed?: string }> = ({ f, n = 140, seed = "s" }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={random(`${seed}x${i}`) * W} cy={random(`${seed}y${i}`) * H} r={0.8 + random(`${seed}r${i}`) * 2.2} fill="#fff" opacity={0.3 + 0.7 * Math.abs(Math.sin(f / 15 + i))} />
    ))}
  </g>
);

const Space: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Grad id="space" stops={[[0, "#03040c"], [0.5, "#0b1230"], [1, "#160b26"]]} />
    <rect width={W} height={H} fill="url(#space)" />
    <ellipse cx={300} cy={500} rx={500} ry={260} fill="#5a2a7a" opacity={0.25} filter="url(#b26)" />
    <ellipse cx={850} cy={350} rx={380} ry={200} fill="#1a5a7a" opacity={0.25} filter="url(#b26)" />
    <Stars f={f} />
  </g>
);

// Personaje de cuerpo entero sobre el suelo (pies en `feet`)
const Body: React.FC<Omit<CharProps, "y"> & { feet: number; lift?: number }> = ({ feet, lift = 0, ...c }) => <Char {...c} y={feet - FEET * (c.s ?? 1) - lift} full />;

// ---------- ESCENA 1 ----------
const S1: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s1";
  const m = mouthAt(id, f);
  const cut = wf(id, "lo");
  const fPot = wf(id, "potencias");
  if (f < cut) {
    const glow = clamp01((f - fPot) / 14);
    const land = popIn(f, 4, 16);
    return (
      <g transform={`translate(540 960) scale(${1 + clamp01(f / cut) * 0.06}) translate(-540 -960)`}>
        <Space f={f} />
        <circle cx={980} cy={900} r={260} fill="url(#sunGlow)" opacity={0.5 + glow * 0.5} />
        <Planet id="p1" cx={540} cy={2280} r={1150} f={f} glow={glow} />
        <OnPlanet cx={540} cy={2280} r={1150} ang={0} lift={(1 - land) * 900} c={{ id: "cubi", look: CUBI, f, x: 0, y: 0, s: 0.52, expr: f >= fPot ? "amazed" : "happy", mouth: m, gesture: f >= fPot ? "cheer" : f > 20 ? "wave" : "none", rim: "#ffb35c", rimSide: 1, lookY: f >= fPot ? -0.4 : 0 }} />
        <g opacity={clamp01((f - 4) / 14) * (1 - clamp01((f - fPot - 20) / 12))}>
          <text x={540} y={300} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={66} fill="#f4e6c8">¿Y si Cuba fuera una</text>
          <text x={540} y={400} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={98} fill="#ffcf7a" filter="url(#glow)">potencia mundial?</text>
          <rect x={390} y={432} width={300} height={3} fill="#ffcf7a" />
        </g>
      </g>
    );
  }
  const g = f - cut;
  const P = { cx: 540, cy: 1000, r: 390 };
  return (
    <g>
      <Space f={f} />
      <circle cx={980} cy={380} r={200} fill="url(#sunGlow)" opacity={0.8} />
      <Planet id="p1b" {...P} f={f} glow={0.8 + 0.2 * Math.sin(f / 4)} rot={Math.sin(g / 30) * 4} />
      <OnPlanet {...P} ang={0} c={{ id: "cubi", look: CUBI, f, x: 0, y: 0, s: 0.3, expr: "proud", gesture: "cheer", mouth: m, rim: "#ffb35c" }} lift={Math.abs(Math.sin(g / 5)) * 20} />
      <OnPlanet {...P} ang={-48} c={{ id: "sam", look: SAM, f, x: 0, y: 0, s: 0.3, expr: "surprised", gesture: "shrug", rim: "#7fd8ff" }} lift={Math.max(0, Math.sin((g - 4) / 4)) * 18} />
      <OnPlanet {...P} ang={50} c={{ id: "li", look: LI, f, x: 0, y: 0, s: 0.3, expr: "surprised", gesture: "open", rim: "#7fd8ff", rimSide: -1 }} lift={Math.max(0, Math.sin((g - 8) / 4)) * 18} />
      <OnPlanet {...P} ang={110} c={{ id: "ivan", look: IVAN, f, x: 0, y: 0, s: 0.3, expr: "worried", gesture: "shrug", rim: "#7fd8ff", rimSide: -1 }} />
    </g>
  );
};

// ---------- ESCENA 2 ----------
const Port: React.FC<{ f: number; start: number }> = ({ f, start }) => (
  <g>
    <Grad id="day" stops={[[0, "#3c8fd8"], [0.6, "#9fd4f0"], [1, "#f6d8a8"]]} />
    <rect width={W} height={H} fill="url(#day)" />
    <circle cx={880} cy={420} r={220} fill="url(#sunGlow)" opacity={0.8} />
    <rect y={900} width={W} height={400} fill="#2b84b8" />
    {/* la isla de Cuba al fondo, con fábricas que aparecen */}
    <g filter="url(#b2)">
      <path d="M-60 930 Q120 860 320 880 Q520 860 720 890 Q920 900 1140 940 L1140 960 L-60 960 Z" fill="#3e8a4e" />
      {Array.from({ length: 9 }).map((_, i) => {
        const s = popIn(f, start + i * 4, 10);
        const x = 60 + i * 115;
        return s > 0.01 ? (
          <g key={i} transform={`translate(${x} 900) scale(${s})`}>
            <rect x={-30} y={-90 - (i % 3) * 30} width={60} height={90 + (i % 3) * 30} fill={["#d9d4c6", "#c9b8a0", "#e6e1d6"][i % 3]} />
            <rect x={14} y={-150 - (i % 3) * 30} width={14} height={60} fill="#8a7a6a" />
            {[0, 1, 2].map((k) => {
              const t = ((f + k * 18 + i * 7) % 54) / 54;
              return <circle key={k} cx={21 + t * 20} cy={-150 - (i % 3) * 30 - t * 90} r={8 + t * 14} fill="#fff" opacity={0.8 * (1 - t)} />;
            })}
          </g>
        ) : null;
      })}
      {/* grúas */}
      {[180, 720].map((x, i) => (
        <g key={x} transform={`translate(${x} 900)`}>
          <rect x={-6} y={-260} width={12} height={260} fill="#d8a23a" />
          <rect x={-140} y={-262} width={220} height={10} fill="#d8a23a" transform={`rotate(${Math.sin(f / 40 + i) * 6} 0 -258)`} />
        </g>
      ))}
    </g>
    {/* barcos */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${((f * (1.5 + i) + i * 600) % 1500) - 300} ${1040 + i * 70})`}>
        <path d="M-120 0 L120 0 L100 36 L-100 36 Z" fill="#7a2a2a" />
        {[0, 1, 2, 3].map((c) => (
          <rect key={c} x={-90 + c * 46} y={-34} width={42} height={34} fill={["#2a6bd8", "#e8a33a", "#c81d2e", "#3a9a5a"][c]} />
        ))}
      </g>
    ))}
    <rect y={1300} width={W} height={620} fill="#6a5a4a" />
    <rect y={1300} width={W} height={16} fill="#3a2e24" />
  </g>
);

const S2: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s2";
  const m = mouthAt(id, f);
  const c1 = wf(id, "millones");
  const c2 = wf(id, "la") - 3;
  const fFab = wf(id, "fabricas");
  if (f < c1) {
    const cx = ease(f, 0, 55, 1250, 640);
    return (
      <g>
        <Port f={f} start={fFab - 4} />
        <Body id="papa" look={PAPA} f={f} x={260} feet={1440} s={0.58} expr="happy" lookX={1} gesture="open" rim="#ffd9a0" rimSide={1} />
        <Body id="cubi" look={CUBI} f={f} x={cx} feet={1450} s={0.62} walk={f < 55} expr="happy" mouth={m} gesture={f < 55 ? "none" : "point"} lookX={-0.6} rim="#ffd9a0" rimSide={-1} flip={f >= 55} />
      </g>
    );
  }
  if (f < c2) {
    const g = f - c1;
    return (
      <g>
        <Grad id="hav" stops={[[0, "#f0a35e"], [0.5, "#e07b4c"], [1, "#3a1f1a"]]} />
        <rect width={W} height={H} fill="url(#hav)" />
        <g filter="url(#b4)">
          {["#e7a0a8", "#f2d07a", "#8fc7d8", "#b9d58a", "#f0b083"].map((c, i) => (
            <g key={i} transform={`translate(${-60 + i * 240} 360)`}>
              <rect width={240} height={1000} fill={c} opacity={0.9} />
              {[0, 1, 2].map((r) => (
                <rect key={r} x={60} y={80 + r * 280} width={120} height={180} rx={60} fill="#3a2418" opacity={0.55} />
              ))}
            </g>
          ))}
          <rect x={560} y={700} width={420} height={130} rx={16} fill="#2a1410" />
          <text x={770} y={782} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill="#ffd06a" filter="url(#glow)">SE BUSCA PERSONAL</text>
        </g>
        <rect y={1360} width={W} height={560} fill="#7a5a44" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Body key={i} id={`p${i}`} look={[MAMA, PAPA, ABUELA, NENA, SAM, IVAN][i]} f={f + i * 7} x={((i * 220 + g * 6) % (W + 300)) - 150} feet={1300} s={0.34} walk expr="happy" rim="#ffcf7a" />
        ))}
        <Body id="mama" look={MAMA} f={f} x={300} feet={1460} s={0.6} expr="joy" lookX={1} gesture="open" mouth={m * 0.5} rim="#ffcf7a" rimSide={1} />
        <Body id="cubi" look={CUBI} f={f} x={780} feet={1470} s={0.62} expr="happy" lookX={-1} gesture="point" mouth={m} rim="#ffcf7a" rimSide={-1} flip />
      </g>
    );
  }
  const g = f - c2;
  return (
    <g>
      <Grad id="fest" stops={[[0, "#1d1030"], [0.6, "#5a2a3a"], [1, "#2a1010"]]} />
      <rect width={W} height={H} fill="url(#fest)" />
      <Bokeh f={g} seed="fest" n={40} colors={["#ffcf6a", "#ff7a8a", "#7fd8ff", "#ffffff"]} y0={200} y1={1300} r={[16, 50]} blur={8} drift={1} />
      {/* Cuba iluminada en el cielo, hecha de luces */}
      <g transform="translate(540 520) scale(1.1)" filter="url(#glow)">
        <path d="M-300 0 Q-200 -40 -80 -30 Q40 -40 160 -10 Q260 10 300 30 Q200 20 60 10 Q-80 10 -200 14 Q-280 20 -300 0 Z" fill="none" stroke="#ffd46a" strokeWidth={6} strokeDasharray="4 14" strokeDashoffset={-g * 2} />
      </g>
      <rect y={1360} width={W} height={560} fill="#2a1420" />
      <Body id="cubi" look={CUBI} f={f} x={380} feet={1460} s={0.66} expr="joy" mouth={m} gesture="cheer" lift={Math.max(0, Math.sin(g / 5)) * 60} rim="#ff9fb0" rimSide={-1} />
      <Body id="nena" look={NENA} f={f} x={760} feet={1460} s={0.5} expr="joy" gesture="cheer" lift={Math.max(0, Math.sin((g + 5) / 5)) * 70} rim="#7fd8ff" rimSide={1} />
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
    return (
      <g transform={`translate(540 960) scale(${1 + clamp01(f / c1) * 0.08}) translate(-540 -960)`}>
        <CityStreet f={f} trainAt={fTren} up={ease(f, 0, 70, 160, 0)} />
        <Body id="cubi" look={CUBI} f={f} x={ease(f, 0, 70, 160, 330)} feet={1460} s={0.6} walk={f < 70} expr="amazed" lookY={-0.9} mouth={m} rim="#4dd9ff" rimSide={1} gesture={f > fTren ? "point" : "none"} />
        <Body id="nena" look={NENA} f={f} x={ease(f, 6, 80, 900, 760)} feet={1470} s={0.46} walk={f < 80} expr="amazed" lookY={-0.9} rim="#ff4d6d" rimSide={-1} />
      </g>
    );
  }
  if (f < c2) {
    const g = f - c1;
    // planeta holográfico
    const R = 300;
    return (
      <g>
        <rect width={W} height={H} fill="#040b16" />
        <Bokeh f={g} seed="ai" n={30} colors={["#4dd9ff", "#7fffd4", "#2a6bff"]} r={[8, 30]} blur={4} drift={0.6} />
        <g filter="url(#glow)" opacity={popIn(g, 0, 14)}>
          <circle cx={540} cy={720} r={R} fill="rgba(77,217,255,0.08)" stroke="#4dd9ff" strokeWidth={4} />
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={i} cx={540} cy={720} rx={R * Math.abs(Math.cos((g / 30 + i / 6) * Math.PI))} ry={R} fill="none" stroke="#4dd9ff" strokeWidth={2} opacity={0.6} />
          ))}
          {[-0.6, -0.3, 0, 0.3, 0.6].map((v, i) => (
            <ellipse key={i} cx={540} cy={720 + v * R} rx={R * Math.sqrt(1 - v * v)} ry={R * 0.08 * Math.sqrt(1 - v * v)} fill="none" stroke="#4dd9ff" strokeWidth={2} opacity={0.5} />
          ))}
          <path d="M470 560 Q520 548 570 554 Q610 560 640 570 Q600 568 560 566 Q510 566 476 568 Z" fill="#ffd46a" />
          <text x={555} y={530} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#ffe7a8" letterSpacing={4}>CUBA</text>
          <ellipse cx={540} cy={1080} rx={240} ry={30} fill="#4dd9ff" opacity={0.35} />
          <polygon points="300,1080 780,1080 640,1040 440,1040" fill="#4dd9ff" opacity={0.12} />
        </g>
        <g transform={`translate(880 ${1100 + Math.sin(g / 7) * 18})`} filter="url(#glow)">
          <circle r={60} fill="#dce8f0" />
          <rect x={-40} y={-22} width={80} height={40} rx={20} fill="#0b1a2a" />
          <circle cx={-17} cy={-2} r={9} fill="#4dd9ff" />
          <circle cx={17} cy={-2} r={9} fill="#4dd9ff" />
        </g>
        <rect y={1380} width={W} height={540} fill="#08131f" />
        <Body id="cubi" look={CUBI} f={f} x={330} feet={1480} s={0.62} expr="amazed" mouth={m} lookX={0.6} lookY={-0.6} rim="#4dd9ff" rimSide={1} gesture="point" />
      </g>
    );
  }
  const g = f - c2;
  const form = clamp01(g / 40);
  return (
    <g>
      <Grad id="night" stops={[[0, "#050b1e"], [0.7, "#1a2350"], [1, "#2c1d3a"]]} />
      <rect width={W} height={H} fill="url(#night)" />
      {Array.from({ length: 70 }).map((_, i) => {
        const pos = (i / 70) * 10;
        const k = Math.floor(pos);
        const fr = pos - k;
        const vtx = (j: number) => {
          const r = j % 2 === 0 ? 240 : 96;
          const a = -Math.PI / 2 + (j * Math.PI) / 5;
          return [540 + Math.cos(a) * r, 560 + Math.sin(a) * r];
        };
        const [ax, ay] = vtx(k);
        const [bx, by] = vtx((k + 1) % 10);
        const sx = random(`dx${i}`) * W;
        const sy = 200 + random(`dy${i}`) * 700;
        return <circle key={i} cx={sx + (ax + (bx - ax) * fr - sx) * form} cy={sy + (ay + (by - ay) * fr - sy) * form} r={6} fill={i % 3 ? "#fff" : "#ff4d6d"} filter="url(#glow)" />;
      })}
      <g>
        {[[0, 1000, 160], [150, 900, 120], [300, 860, 140], [700, 880, 130], [860, 950, 160], [480, 1050, 100]].map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height={1400} fill="#0a0f1e" />
        ))}
      </g>
      <rect y={1360} width={W} height={560} fill="#141a2e" />
      <Body id="sam" look={SAM} f={f} x={170} feet={1440} s={0.48} expr="surprised" lookY={-0.8} rim="#ff8aa0" />
      <Body id="ivan" look={IVAN} f={f} x={360} feet={1460} s={0.46} expr="worried" lookY={-0.8} rim="#ff8aa0" />
      <Body id="cubi" look={CUBI} f={f} x={600} feet={1470} s={0.56} expr="proud" lookY={-0.5} mouth={m} gesture="cheer" rim="#ff8aa0" lift={Math.max(0, Math.sin(g / 6)) * 30} />
      <Body id="li" look={LI} f={f} x={880} feet={1440} s={0.48} expr="surprised" lookY={-0.8} rim="#ff8aa0" rimSide={-1} />
    </g>
  );
};

// ---------- ESCENA 4: estación espacial con la Tierra en la ventana ----------
const S4: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s4";
  const m = mouthAt(id, f);
  const fUS = wf(id, "estados");
  const fCh = wf(id, "china");
  const fRu = wf(id, "rusia");
  const fNeg = wf(id, "negociar");
  const fCu = wf(id, "cuba");
  const cut = wf(id, "pequena");
  if (f < cut) {
    const on = (t: number) => clamp01((f - t) / 8);
    const arguing = f >= fNeg && f < fCu + 6;
    return (
      <g>
        <rect width={W} height={H} fill="#070a12" />
        <defs>
          <clipPath id="win">
            <circle cx={540} cy={700} r={420} />
          </clipPath>
        </defs>
        <g clipPath="url(#win)">
          <Space f={f} />
          <Planet id="p4" cx={540} cy={900} r={420} f={f} glow={on(fCu)} rot={Math.sin(f / 60) * 3} />
        </g>
        <circle cx={540} cy={700} r={420} fill="none" stroke="#2a3442" strokeWidth={40} />
        <circle cx={540} cy={700} r={440} fill="none" stroke="#4a5666" strokeWidth={6} />
        <rect y={1300} width={W} height={620} fill="#11161f" />
        {/* mesa holográfica pequeña en el centro */}
        <ellipse cx={540} cy={1340} rx={130} ry={24} fill="#4dd9ff" opacity={0.4} filter="url(#glow)" />
        {[[180, fUS, "#7fb6ff"], [380, fRu, "#c9d4ff"], [900, fCh, "#ff8a7a"], [660, fCu, "#ffcf7a"]].map(([x, t, c], i) => (
          <polygon key={i} points={`${(x as number) - 30},300 ${(x as number) + 30},300 ${(x as number) + 170},1500 ${(x as number) - 170},1500`} fill={c as string} opacity={0.13 * on(t as number)} filter="url(#b14)" />
        ))}
        <Body id="sam" look={SAM} f={f} x={ease(f, fUS - 4, fUS + 24, -150, 170)} feet={1450} s={0.5} walk={f < fUS + 24} expr={arguing ? "angry" : "neutral"} lookX={f >= fCu ? 1 : 0.6} rim="#7fb6ff" gesture={arguing ? "point" : "none"} mouth={arguing ? m * 0.5 : 0} />
        <Body id="ivan" look={IVAN} f={f} x={ease(f, fRu - 4, fRu + 22, -150, 360)} feet={1460} s={0.48} walk={f < fRu + 22} expr={arguing ? "angry" : "neutral"} lookX={f >= fCu ? 1 : -0.6} rim="#c9d4ff" rimSide={-1} />
        <Body id="li" look={LI} f={f} x={ease(f, fCh - 4, fCh + 24, 1250, 900)} feet={1450} s={0.5} walk={f < fCh + 24} expr={arguing ? "worried" : "neutral"} lookX={-1} rim="#ff8aa0" rimSide={-1} gesture={arguing ? "open" : "none"} flip />
        <Body id="cubi" look={CUBI} f={f} x={640} feet={1470} s={0.56 * Math.max(0.01, popIn(f, fCu - 6, 12))} expr="proud" mouth={f >= fCu - 4 ? m : 0} rim="#ffcf7a" rimSide={-1} gesture={f >= fCu ? "open" : "none"} />
      </g>
    );
  }
  const g = f - cut;
  const P = { cx: 540, cy: 1020, r: 430 };
  const arcs = clamp01(g / 50);
  return (
    <g>
      <Space f={f} />
      <Planet id="p4b" {...P} f={f} glow={1} rot={Math.sin(g / 40) * 3} />
      {[[-420, -220], [380, -320], [460, 200], [-380, 260]].map(([dx, dy], i) => {
        const p = clamp01(arcs * 1.3 - i * 0.15);
        const sx = P.cx;
        const sy = P.cy - 0.72 * P.r;
        const tx = P.cx + dx;
        const ty = P.cy + dy;
        return p > 0 ? <path key={i} d={`M${sx} ${sy} Q${(sx + tx) / 2} ${Math.min(sy, ty) - 260} ${tx} ${ty}`} stroke="#ffd27a" strokeWidth={7} fill="none" pathLength={1} strokeDasharray={`${p} 1`} filter="url(#glow)" /> : null;
      })}
      <OnPlanet {...P} ang={0} c={{ id: "cubi", look: CUBI, f, x: 0, y: 0, s: 0.32, expr: "proud", gesture: "cheer", mouth: m, rim: "#ffd27a" }} lift={Math.max(0, Math.sin(g / 5)) * 18} />
      <OnPlanet {...P} ang={-42} c={{ id: "sam", look: SAM, f, x: 0, y: 0, s: 0.3, expr: "amazed", gesture: "open", rim: "#ffd27a" }} />
      <OnPlanet {...P} ang={42} c={{ id: "li", look: LI, f, x: 0, y: 0, s: 0.3, expr: "joy", gesture: "open", rim: "#ffd27a", rimSide: -1 }} />
      <OnPlanet {...P} ang={-95} c={{ id: "ivan", look: IVAN, f, x: 0, y: 0, s: 0.3, expr: "amazed", rim: "#ffd27a" }} />
    </g>
  );
};

// ---------- ESCENA 5 ----------
const S5: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s5";
  const m = mouthAt(id, f);
  const c1 = wf(id, "visitar");
  const c2 = wf(id, "invertir");
  if (f < c1) {
    // el avión viaja sobre el planeta hasta Cuba
    const P = { cx: 540, cy: 1900, r: 950 };
    const a = ease(f, 0, c1 - 10, -38, -2);
    const px = P.cx + Math.sin((a * Math.PI) / 180) * (P.r + 260);
    const py = P.cy - Math.cos((a * Math.PI) / 180) * (P.r + 260);
    return (
      <g>
        <Space f={f} />
        <circle cx={160} cy={500} r={240} fill="url(#sunGlow)" opacity={0.7} />
        <Planet id="p5" {...P} f={f} glow={0.6} />
        <path d={`M${P.cx - 650} ${P.cy - 900} Q${P.cx - 300} ${P.cy - 1240} ${px} ${py}`} stroke="#fff" strokeWidth={4} strokeDasharray="12 14" fill="none" opacity={0.6} />
        <g transform={`translate(${px} ${py}) rotate(${a + 90})`} filter="url(#glow)">
          <path d="M-70 0 Q-60 -12 -30 -12 L60 -12 Q80 -8 84 0 Q80 8 60 8 L-30 8 Q-60 8 -70 0 Z" fill="#f5f2ee" />
          <path d="M-6 -6 L20 -6 L-4 -46 L-18 -46 Z M-6 6 L20 6 L-4 46 L-18 46 Z" fill="#cfd6de" />
        </g>
        <OnPlanet {...P} ang={-6} c={{ id: "mama", look: MAMA, f, x: 0, y: 0, s: 0.42, expr: "joy", gesture: "wave", rim: "#ffcf7a", mouth: m * 0.5 }} />
        <OnPlanet {...P} ang={6} c={{ id: "papa", look: PAPA, f: f + 9, x: 0, y: 0, s: 0.44, expr: "amazed", gesture: "wave", rim: "#ffcf7a", rimSide: -1, lookY: -0.5 }} />
      </g>
    );
  }
  if (f < c2) {
    const g = f - c1;
    const nx = ease(g, 0, 28, -200, 360);
    const hugging = g >= 28;
    return (
      <g>
        <Grad id="mal" stops={[[0, "#f5a25a"], [0.55, "#ffd6a0"], [1, "#2a6b8a"]]} />
        <rect width={W} height={H} fill="url(#mal)" />
        <circle cx={760} cy={900} r={300} fill="url(#sunGlow)" />
        <rect y={1000} width={W} height={300} fill="#2a7fa8" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={((i * 140 + g * 2) % 1300) - 100} y={1040 + (i % 4) * 50} width={90} height={5} rx={3} fill="#ffe7c0" opacity={0.6} />
        ))}
        <rect y={1240} width={W} height={80} fill="#d8cdb8" />
        <rect y={1320} width={W} height={600} fill="#b8a890" />
        <Bokeh f={g} seed="hug" n={14} colors={["#ffcf7a", "#fff1cf"]} y0={300} y1={900} r={[30, 70]} blur={14} />
        <Body id="mama" look={MAMA} f={f} x={ease(g, 8, 44, -260, 140)} feet={1420} s={0.5} walk={g < 44} expr="joy" mouth={m * 0.4} rim="#ffcf7a" />
        <Body id="abuela" look={ABUELA} f={f} x={680} feet={1460} s={0.6} expr={hugging ? "joy" : "amazed"} gesture="hug" rim="#ffcf7a" rimSide={-1} flip />
        <Body id="nena" look={NENA} f={f} x={hugging ? 540 : nx} feet={1470} s={0.48} run={!hugging} expr="joy" gesture={hugging ? "hug" : "none"} rim="#ffcf7a" />
        {hugging
          ? Array.from({ length: 6 }).map((_, i) => {
              const t = ((g - 28 + i * 9) % 54) / 54;
              return <path key={i} transform={`translate(${600 + Math.sin(i * 2) * 120} ${1000 - t * 380}) scale(${1.2 - t * 0.4})`} d="M0 26 L-26 0 A15 15 0 0 1 0 -20 A15 15 0 0 1 26 0 Z" fill="#ff6b81" opacity={1 - t} filter="url(#glow)" />;
            })
          : null}
      </g>
    );
  }
  const g = f - c2;
  const shutter = ease(g, 6, 30, 0, 1);
  return (
    <g>
      <Grad id="eve" stops={[[0, "#0f1730"], [0.7, "#2a2340"], [1, "#151020"]]} />
      <rect width={W} height={H} fill="url(#eve)" />
      <Planet id="p5c" cx={880} cy={380} r={170} f={f} glow={0.5} labels={false} />
      <g transform="translate(540 1300)">
        <rect x={-380} y={-640} width={760} height={640} fill="#2a2030" />
        <rect x={-320} y={-500} width={640} height={420} fill="#ffcf7a" opacity={0.15 + shutter * 0.75} filter="url(#b4)" />
        <rect x={-320} y={-500} width={640} height={420 * (1 - shutter)} fill="#5a5560" />
        <g opacity={clamp01((g - 26) / 6)} filter="url(#glow)">
          <rect x={-200} y={-620} width={400} height={96} rx={18} fill="none" stroke="#ff4d6d" strokeWidth={8} />
          <text x={0} y={-552} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={60} fill="#ff4d6d">ABIERTO</text>
        </g>
      </g>
      <rect y={1300} width={W} height={620} fill="#1a1422" />
      <Body id="papa" look={PAPA} f={f} x={260} feet={1460} s={0.6} expr="proud" mouth={m} gesture="open" rim="#ffcf7a" lookX={0.5} />
      <Body id="cubi" look={CUBI} f={f} x={840} feet={1470} s={0.54} expr="joy" gesture="wave" rim="#ffcf7a" rimSide={-1} lookX={-0.6} />
    </g>
  );
};

// ---------- ESCENA 6 ----------
const S6: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s6";
  const m = mouthAt(id, f);
  const fPreg = wf(id, "pregunta");
  const fSup = wf(id, "superar");
  const cut = wf(id, "dejame");
  if (f < cut) {
    const P = { cx: 540, cy: 1900, r: 1000 };
    const q = popIn(f, fPreg, 12);
    return (
      <g>
        <Space f={f} />
        <circle cx={540} cy={640} r={420} fill="url(#sunGlow)" opacity={0.5} />
        <Planet id="p6" {...P} f={f} glow={0.7} rot={0} />
        <text x={540} y={P.cy - P.r * 0.94} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#fff6d8" letterSpacing={4} opacity={0.85}>EE. UU.</text>
        {q > 0.01 ? (
          <text x={540} y={700} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={300 * q} fill="#ffcf7a" filter="url(#glow)" opacity={0.95}>?</text>
        ) : null}
        <OnPlanet {...P} ang={10} c={{ id: "cubi", look: CUBI, f, x: 0, y: 0, s: 0.5, expr: f >= fSup ? "proud" : "neutral", gesture: f >= fSup ? "point" : "think", mouth: m, lookX: -1, rim: "#ffb35c", rimSide: -1, flip: true }} />
        <OnPlanet {...P} ang={-10} c={{ id: "sam", look: SAM, f, x: 0, y: 0, s: 0.5, expr: f >= fSup ? "surprised" : "neutral", gesture: f >= fSup ? "shrug" : "think", lookX: 1, rim: "#ffb35c" }} />
      </g>
    );
  }
  const g = f - cut;
  const P = { cx: 540, cy: 2150, r: 1150 };
  return (
    <g>
      <Space f={f} />
      <Bokeh f={g} seed="end" n={20} colors={["#ffb35c", "#ff7a8a", "#ffd9a0"]} y0={200} y1={900} r={[20, 60]} blur={8} />
      <Planet id="p6b" {...P} f={f} glow={1} />
      <g transform={`translate(800 ${560 + (1 - popIn(g, 4, 12)) * 60})`} opacity={popIn(g, 4, 12)}>
        <rect x={-190} y={-110} width={380} height={220} rx={40} fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
        <path d="M-60 108 L-110 190 L10 108 Z" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
        {[-90, 0, 90].map((dx, i) => (
          <circle key={dx} cx={dx} cy={Math.sin(g / 4 + i) * 10} r={24} fill="#fff" opacity={0.9} />
        ))}
      </g>
      {([[-26, SAM, "sam"], [-15, LI, "li"], [15, ABUELA, "abuela"], [26, IVAN, "ivan"]] as [number, CLook, string][]).map(([a, l, k], i) => (
        <OnPlanet key={k} {...P} ang={a} lift={Math.max(0, Math.sin((g + i * 6) / 5)) * 24} c={{ id: k, look: l, f, x: 0, y: 0, s: 0.4, expr: "joy", gesture: "cheer", rim: "#ffb35c", rimSide: a > 0 ? -1 : 1 }} />
      ))}
      <OnPlanet {...P} ang={0} c={{ id: "cubi", look: CUBI, f, x: 0, y: 0, s: 0.62, expr: "joy", gesture: "point", mouth: m, rim: "#ffb35c" }} />
    </g>
  );
};

const SCENES: Record<SceneId, React.FC<{ f: number }>> = { s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6 };

export const CineFullVideo: React.FC = () => {
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
            <Shell id={id} idx={i} scenes={SCENES} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CineFullComposition: React.FC = () => (
  <Composition id="CubaCineEntero" component={CineFullVideo} durationInFrames={total} fps={30} width={W} height={H} />
);
