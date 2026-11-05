import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp01, ease, hop, popIn } from "../puppets/paper";
import { ABUELA, CUBI, IVAN, LI, MAMA, NENA, OBRERA, OBRERO, PAPA, SAM, Toon, INK } from "./Toon";
import {
  BarChart, BigQuestion, Bubble, Clouds, CommentIcon, Coins, Conveyor, Dome, FactoryBack, FONT, Globe, Ground, H,
  Hearts, Hologram, Houses, Island, JobBoard, Morro, Palm, Plane, Rings, Robot, Sea, Seesaw, Shop, Sky, SpeedLines,
  Sun, Table, Terminal, Towers, Train, W, WorldMap,
} from "./bg";
import voice from "./voice.json";

const FPS = 30;
type Word = { w: string; s: number; e: number };
type Voice = { duration: number; window: number; words: Word[]; mouth: number[] };
const V = voice as unknown as Record<string, Voice>;
const IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
type SceneId = (typeof IDS)[number];
const sceneFrames = IDS.map((id) => V[id].window * FPS); // 8+10+10+11+11+10 = 60 s exactos
const total = sceneFrames.reduce((a, b) => a + b, 0);
const GY = 1330; // línea del suelo

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const wf = (id: SceneId, match: string, nth = 0) => {
  const hits = V[id].words.filter((w) => norm(w.w).startsWith(norm(match)));
  const w = hits[Math.min(nth, hits.length - 1)];
  return w ? Math.round(w.s * FPS) : 0;
};
const mouthAt = (id: SceneId, f: number) => {
  const m = V[id].mouth;
  return ((m[f - 1] ?? 0) + (m[f] ?? 0) * 2 + (m[f + 1] ?? 0)) / 4;
};

// Plano actual y "golpe de zoom" en cada corte
const shotOf = (f: number, cuts: number[]) => cuts.filter((c) => f >= c).length;
const Punch: React.FC<{ f: number; at: number; children: React.ReactNode; z?: number; px?: number; py?: number }> = ({ f, at, children, z = 1, px = 0, py = 0 }) => {
  const k = 1 + 0.07 * (1 - clamp01((f - at) / 8));
  return <g transform={`translate(${W / 2 + px} ${H / 2 + py}) scale(${k * z}) translate(${-W / 2} ${-H / 2})`}>{children}</g>;
};

// ---------- ESCENA 1: gancho ----------
const S1: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s1";
  const m = mouthAt(id, f);
  const cut = wf(id, "lo");
  const fPot = wf(id, "potencias");
  const shot = shotOf(f, [cut]);
  if (shot === 0) {
    const land = popIn(f, 6, 14);
    const glow = clamp01((f - fPot) / 10);
    return (
      <Punch f={f} at={0} z={1 + glow * 0.08}>
        <Sky a="#3aa7ff" b="#bfe8ff" />
        <Sun x={860} y={560} f={f} />
        <Clouds f={f} y={700} />
        <Sea y={1060} f={f} />
        <Island x={540} y={1250} s={1.15} glow={glow} />
        <Palm x={180} y={1250} f={f} s={0.8} />
        <Palm x={930} y={1280} f={f} s={0.7} flip />
        <Rings x={540} y={1100} f={f} start={fPot} />
        <Toon look={CUBI} f={f} x={540} y={1250} s={0.95} lift={(1 - land) * -500 + hop(f, fPot, fPot + 16, 120)} squash={f < 20 ? -0.6 * (1 - land) : 0}
          act={f >= fPot ? "cheer" : "talk"} expr={f >= fPot ? "surprised" : "happy"} mouth={m} />
        <g transform={`translate(540 470) scale(${popIn(f, 2, 12)}) rotate(${Math.sin(f / 8) * 2})`}>
          <rect x={-470} y={-120} width={940} height={240} rx={40} fill="#ffd23f" stroke={INK} strokeWidth={8} />
          <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={INK}>¿Y SI CUBA FUERA UNA</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#e11d2e" stroke={INK} strokeWidth={3}>POTENCIA MUNDIAL?</text>
        </g>
      </Punch>
    );
  }
  const g = f - cut;
  return (
    <Punch f={f} at={cut}>
      <Sky a="#0b1640" b="#2b3a8f" />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 137) % W} cy={(i * 271) % 1300} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} />
      ))}
      <Rings x={540} y={900} f={f} start={cut + 2} />
      <Globe x={540} y={900} r={340} f={f * 2} glowCuba={0.6 + 0.4 * Math.sin(f / 4)} />
      <Toon look={CUBI} f={f} x={540} y={565} s={0.62} act="cheer" expr="proud" mouth={m} lift={Math.abs(Math.sin(f / 5)) * 30} />
      <Toon look={SAM} f={f} x={150} y={GY} s={0.85} act="scared" expr="scared" lift={hop(g, 4, 18, 90)} lookX={1} />
      <Toon look={LI} f={f} x={540} y={GY + 80} s={0.85} act="scared" expr="surprised" lift={hop(g, 8, 22, 90)} />
      <Toon look={IVAN} f={f} x={930} y={GY} s={0.85} act="scared" expr="scared" lift={hop(g, 12, 26, 90)} lookX={-1} />
    </Punch>
  );
};

// ---------- ESCENA 2: economía ----------
const S2: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s2";
  const m = mouthAt(id, f);
  const c1 = wf(id, "empresas");
  const c2 = wf(id, "millones");
  const c3 = wf(id, "la") - 4;
  const fEco = wf(id, "economia");
  const shot = shotOf(f, [c1, c2, c3]);
  if (shot === 0) {
    const cx = ease(f, 0, 36, -200, 540);
    return (
      <Punch f={f} at={0}>
        <FactoryBack f={f} />
        <Conveyor y={1150} f={f} />
        <BarChart x={640} y={820} f={f} start={fEco} />
        <Toon look={OBRERA} f={f} x={170} y={GY + 60} s={0.85} act="work" expr="proud" prop="wrench" />
        <Toon look={OBRERO} f={f} x={910} y={GY + 60} s={0.85} act="work" expr="happy" prop="wrench" flip seed={3} />
        <Toon look={{ ...CUBI, hardhat: true }} f={f} x={cx} y={GY + 120} s={0.95} act={f < 36 ? "walk" : "point"} expr="happy" mouth={m} lookX={1} />
      </Punch>
    );
  }
  if (shot === 1) {
    return (
      <Punch f={f} at={c1}>
        <Sky a="#56b6ff" b="#d9f1ff" />
        <Clouds f={f} y={300} />
        <Towers f={f} start={c1} />
        <Ground y={GY} color="#9ca3af" dark="#6b7280" />
        <Coins f={f} start={c1 + 6} />
        <Toon look={PAPA} f={f} x={330} y={GY + 140} s={0.95} act="handshake" expr="happy" prop="briefcase" seed={2} />
        <Toon look={CUBI} f={f} x={720} y={GY + 140} s={0.95} act="handshake" expr="proud" mouth={m} flip />
      </Punch>
    );
  }
  if (shot === 2) {
    const g = f - c2;
    const runners = [OBRERO, MAMA, OBRERA, NENA, PAPA];
    return (
      <Punch f={f} at={c2}>
        <Sky a="#ffb347" b="#ffe6a7" />
        <Sun x={180} y={420} f={f} r={90} />
        <Ground y={GY - 40} color="#7bd36a" dark="#4caf50" />
        <JobBoard x={760} y={980} s={popIn(f, c2, 10)} />
        {runners.map((r, i) => (
          <Toon key={i} look={r} f={f} x={-200 - i * 170 + g * 14} y={GY + 100 + (i % 2) * 40} s={0.8} act="run" expr="happy" seed={i * 5} />
        ))}
      </Punch>
    );
  }
  return (
    <Punch f={f} at={c3}>
      <Sky a="#7dd3fc" b="#e0f7ff" />
      <Houses f={f} />
      <Ground y={GY} color="#e9c46a" />
      {[ABUELA, CUBI, NENA, MAMA].map((l, i) => (
        <Toon key={i} look={l} f={f} x={160 + i * 255} y={GY + 130} s={0.85} act="cheer" expr="happy" lift={Math.max(0, Math.sin((f + i * 8) / 5)) * 70} squash={Math.sin((f + i * 8) / 5) * 0.5} mouth={l === CUBI ? m : 0} />
      ))}
    </Punch>
  );
};

// ---------- ESCENA 3: tecnología ----------
const S3: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s3";
  const m = mouthAt(id, f);
  const fRasc = wf(id, "rascacielos");
  const c1 = wf(id, "trenes");
  const c2 = wf(id, "inteligencia");
  const c3 = wf(id, "capaz");
  const shot = shotOf(f, [c1, c2, c3]);
  if (shot === 0) {
    return (
      <Punch f={f} at={0}>
        <Sky a="#5b21b6" b="#ffc68a" c="#ff7aa2" />
        <Sun x={540} y={980} f={f} r={150} color="#ffb347" />
        <Towers f={f} start={fRasc - 6} logos={false} future />
        <Dome x={540} y={1250} />
        <Morro x={140} y={1250} f={f} />
        <Sea y={1240} f={f} color="#38bdf8" />
        <rect x={-100} y={1300} width={W + 200} height={90} fill="#cbd5e1" stroke={INK} strokeWidth={6} />
        <Toon look={CUBI} f={f} x={820} y={GY + 60} s={0.85} act={f > fRasc + 12 ? "cheer" : "idle"} expr="surprised" lookY={-1} mouth={m} />
      </Punch>
    );
  }
  if (shot === 1) {
    const g = f - c1;
    return (
      <Punch f={f} at={c1}>
        <Sky a="#3aa7ff" b="#d6f2ff" />
        <Clouds f={f} y={260} speed={3} />
        <rect x={-100} y={880} width={W + 200} height={40} fill="#94a3b8" stroke={INK} strokeWidth={6} />
        {[100, 400, 700, 1000].map((x) => (
          <rect key={x} x={x - 20} y={920} width={40} height={420} fill="#cbd5e1" stroke={INK} strokeWidth={5} />
        ))}
        <Train x={1500 - g * 70} y={880} />
        <SpeedLines f={f} />
        <Ground y={GY} color="#86efac" />
        <Toon look={CUBI} f={f} x={330} y={GY + 140} s={0.9} act="cheer" expr="surprised" lookX={-1} lookY={-1} mouth={m} />
        <Toon look={NENA} f={f} x={720} y={GY + 140} s={0.75} act="cheer" expr="happy" lift={Math.max(0, Math.sin(f / 4)) * 50} lookY={-1} />
      </Punch>
    );
  }
  if (shot === 2) {
    return (
      <Punch f={f} at={c2}>
        <Sky a="#0f172a" b="#1e3a8a" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={i * 100} y={0} width={4} height={H} fill="rgba(34,211,238,0.12)" />
        ))}
        <Hologram x={240} y={520} f={f} s={popIn(f, c2 + 2, 10)} kind={0} />
        <Hologram x={840} y={500} f={f} s={popIn(f, c2 + 8, 10)} kind={1} />
        <Hologram x={540} y={360} f={f} s={popIn(f, c2 + 14, 10)} kind={2} />
        <Robot x={540} y={820} f={f} s={1.05} talk={m} />
        <rect x={-100} y={GY - 20} width={W + 200} height={700} fill="#1e293b" stroke={INK} strokeWidth={6} />
        <Toon look={CUBI} f={f} x={220} y={GY + 140} s={0.85} act="talk" expr="happy" prop="tablet" mouth={m} lookX={1} />
        <Toon look={OBRERA} f={f} x={870} y={GY + 140} s={0.85} act="scared" expr="surprised" lookX={-1} />
      </Punch>
    );
  }
  const g = f - c3;
  const racers = [CUBI, SAM, LI, IVAN];
  return (
    <Punch f={f} at={c3}>
      <Sky a="#38bdf8" b="#e0f7ff" />
      <Clouds f={f} y={300} speed={4} />
      <rect x={-100} y={900} width={W + 200} height={1100} fill="#ef6f4a" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-100} y={1000 + i * 170} width={W + 200} height={8} fill="#fff" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={((i * 300 - g * 30) % 1500 + 1500) % 1500 - 200} y={950} width={60} height={20} fill="#fff" opacity={0.6} />
      ))}
      {racers.map((r, i) => (
        <Toon key={i} look={r} f={f} x={260 + i * 40 + Math.sin(g / 12 + i * 1.7) * 140 + (i === 0 ? 120 : 0)} y={1150 + i * 150} s={0.7} act="run" expr={i === 0 ? "proud" : "angry"} seed={i * 7} mouth={i === 0 ? m : 0} />
      ))}
    </Punch>
  );
};

// ---------- ESCENA 4: el mundo ----------
const S4: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s4";
  const m = mouthAt(id, f);
  const fUS = wf(id, "estados");
  const fCh = wf(id, "china");
  const fRu = wf(id, "rusia");
  const fNeg = wf(id, "negociar");
  const fCu = wf(id, "cuba");
  const cut = wf(id, "pequena");
  const shot = shotOf(f, [cut]);
  if (shot === 0) {
    const samX = ease(f, fUS, fUS + 26, -200, 170);
    const liX = ease(f, fCh, fCh + 24, 1300, 910);
    const ivX = ease(f, fRu, fRu + 22, -200, 380);
    const arguing = f >= fNeg && f < fCu + 6;
    const cubiIn = popIn(f, fCu - 2, 12);
    return (
      <Punch f={f} at={0}>
        <WorldMap f={f} />
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="rgba(15,23,42,0.35)" />
        <Toon look={SAM} f={f} x={samX} y={1250} s={0.85} act={f < fUS + 26 ? "walk" : arguing ? "angry" : "talk"} expr={arguing ? "angry" : "happy"} lookX={1} mouth={arguing ? m * 0.6 : 0} />
        <Toon look={IVAN} f={f} x={ivX} y={1250} s={0.85} act={f < fRu + 22 ? "walk" : arguing ? "angry" : "idle"} expr={arguing ? "angry" : "neutral"} lookX={-1} seed={4} />
        <Toon look={LI} f={f} x={liX} y={1250} s={0.85} act={f < fCh + 24 ? "walk" : "point"} expr={arguing ? "surprised" : "happy"} flip lookX={-1} seed={6} />
        <Toon look={CUBI} f={f} x={650} y={1250} s={0.9 * Math.max(0.01, cubiIn)} act="talk" expr="proud" mouth={f >= fCu ? m : 0} />
        <Table x={540} y={1260} />
        <Bubble x={200} y={620} s={popIn(f, fNeg, 8)} text="¡TRATO!" tail="down" />
        <Bubble x={860} y={660} s={popIn(f, fNeg + 8, 8)} text="¿Y YO?" tail="down" />
      </Punch>
    );
  }
  const g = f - cut;
  const line = clamp01(g / 40);
  const targets = [
    [220, 420],
    [780, 380],
    [640, 700],
    [320, 900],
  ];
  return (
    <Punch f={f} at={cut} z={ease(g, 0, 120, 1.15, 1)}>
      <WorldMap f={f} />
      <g transform="translate(450 640) scale(0.28)">
        <Island x={0} y={0} s={1} glow={0.7 + 0.3 * Math.sin(f / 4)} />
      </g>
      {targets.map(([tx, ty], i) => {
        const p = clamp01(line * 1.4 - i * 0.12);
        const mx = (450 + tx) / 2;
        const my = Math.min(640, ty) - 160;
        return <path key={i} d={`M450 640 Q${mx} ${my} ${tx} ${ty}`} stroke="#ffd23f" strokeWidth={12} fill="none" strokeDasharray="30 20" strokeDashoffset={-f * 3} pathLength={1000} opacity={p} strokeLinecap="round" />;
      })}
      <Rings x={450} y={640} f={f} start={cut + 4} />
      <Toon look={SAM} f={f} x={150} y={GY + 160} s={0.75} act="clap" expr="surprised" />
      <Toon look={IVAN} f={f} x={330} y={GY + 160} s={0.75} act="clap" expr="happy" seed={4} />
      <Toon look={CUBI} f={f} x={620} y={GY + 160} s={1.0} act="cheer" expr="proud" mouth={m} lift={Math.max(0, Math.sin(f / 6)) * 40} />
      <Toon look={LI} f={f} x={920} y={GY + 160} s={0.75} act="clap" expr="happy" seed={6} />
    </Punch>
  );
};

// ---------- ESCENA 5: los cubanos ----------
const S5: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s5";
  const m = mouthAt(id, f);
  const fReg = wf(id, "regresar");
  const c1 = wf(id, "visitar");
  const c2 = wf(id, "invertir");
  const shot = shotOf(f, [c1, c2]);
  if (shot === 0) {
    const out = f >= fReg - 10;
    return (
      <Punch f={f} at={0}>
        <Sky a="#4fb3ff" b="#dff3ff" />
        <Clouds f={f} y={280} speed={2} />
        <Plane x={ease(f, 0, 90, 1400, -500)} y={ease(f, 0, 90, 360, 560)} r={-6} s={0.9} />
        <Terminal />
        <Ground y={GY} color="#9ca3af" />
        <Toon look={MAMA} f={f} x={out ? ease(f, fReg - 10, fReg + 20, 460, 300) : 460} y={GY + 140} s={0.85 * (out ? 1 : 0.01)} act={f < fReg + 20 ? "run" : "cheer"} expr="happy" prop="suitcase" mouth={m} />
        <Toon look={PAPA} f={f} x={out ? ease(f, fReg - 6, fReg + 24, 620, 780) : 620} y={GY + 140} s={0.85 * (out ? 1 : 0.01)} act={f < fReg + 24 ? "run" : "wave"} expr="happy" prop="suitcase" seed={2} flip={f < fReg + 24} />
      </Punch>
    );
  }
  if (shot === 1) {
    const g = f - c1;
    const nx = ease(g, 0, 26, -200, 560);
    const hugging = g >= 26;
    return (
      <Punch f={f} at={c1}>
        <Sky a="#7dd3fc" b="#e0f7ff" />
        <Houses f={f} />
        <Ground y={GY} color="#e9c46a" />
        <Hearts f={f} start={c1 + 28} x={680} y={1000} />
        <Toon look={ABUELA} f={f} x={760} y={GY + 130} s={0.9} act="hug" expr={hugging ? "happy" : "surprised"} flip lookX={-1} />
        <Toon look={NENA} f={f} x={nx} y={GY + 130} s={0.75} act={hugging ? "hug" : "run"} expr="happy" lift={hugging ? 0 : 0} />
        <Toon look={MAMA} f={f} x={ease(g, 6, 40, -300, 300)} y={GY + 130} s={0.85} act={g < 40 ? "run" : "talk"} expr="happy" mouth={m} seed={3} />
      </Punch>
    );
  }
  const g = f - c2;
  return (
    <Punch f={f} at={c2}>
      <Sky a="#56b6ff" b="#d9f1ff" />
      <Sun x={900} y={420} f={f} r={90} />
      <Ground y={GY - 40} color="#7bd36a" dark="#4caf50" />
      <Coins f={f} start={c2} n={10} />
      <Shop x={720} y={GY - 20} grow={ease(g, 10, 34, 0, 1)} />
      <Toon look={PAPA} f={f} x={250} y={GY + 140} s={0.9} act="talk" expr="proud" prop="briefcase" mouth={m} lookX={1} />
      <Toon look={CUBI} f={f} x={940} y={GY + 160} s={0.75} act="cheer" expr="happy" lift={Math.max(0, Math.sin(f / 5)) * 40} />
    </Punch>
  );
};

// ---------- ESCENA 6: final ----------
const S6: React.FC<{ f: number }> = ({ f }) => {
  const id: SceneId = "s6";
  const m = mouthAt(id, f);
  const fPreg = wf(id, "pregunta");
  const fSup = wf(id, "superar");
  const cut = wf(id, "dejame");
  const shot = shotOf(f, [cut]);
  if (shot === 0) {
    const ang = f < fSup ? Math.sin(f / 10) * 5 : Math.sin((f - fSup) / 7) * 16;
    return (
      <Punch f={f} at={0}>
        <Sky a="#312e81" b="#a78bfa" />
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={i} cx={(i * 173) % W} cy={(i * 311) % 900 + 200} r={3} fill="#fff" opacity={0.6} />
        ))}
        <BigQuestion x={540} y={760} s={popIn(f, fPreg, 12)} f={f} />
        <Ground y={1360} color="#6d5bd0" />
        <Seesaw x={540} y={1200} ang={ang}>
          <Toon look={CUBI} f={f} x={-330} y={-22} s={0.7} act={f >= fSup ? "scared" : "think"} expr={f >= fSup ? "surprised" : "neutral"} mouth={m} lookX={1} />
          <Toon look={SAM} f={f} x={330} y={-22} s={0.7} act={f >= fSup ? "angry" : "think"} expr={f >= fSup ? "angry" : "neutral"} flip lookX={-1} seed={5} />
        </Seesaw>
      </Punch>
    );
  }
  const cast = [SAM, LI, CUBI, IVAN, ABUELA, NENA];
  return (
    <Punch f={f} at={cut}>
      <Sky a="#1d4fd8" b="#93c5fd" />
      {Array.from({ length: 30 }).map((_, i) => {
        const t = ((f - cut) * (6 + (i % 4)) + i * 70) % 1600;
        return <rect key={i} x={(i * 131) % W} y={t - 100} width={18} height={10} fill={["#e11d2e", "#fff", "#ffd23f", "#1d4fd8"][i % 4]} transform={`rotate(${f * 6 + i * 30} ${(i * 131) % W} ${t - 100})`} />;
      })}
      <CommentIcon x={540} y={640} s={popIn(f, cut, 12)} f={f} />
      <Bubble x={220} y={400} s={popIn(f, cut + 10, 8)} text="¡SÍ!" color="#bbf7d0" tail="right" />
      <Bubble x={860} y={400} s={popIn(f, cut + 16, 8)} text="¡NO!" color="#fecaca" tail="left" />
      <Ground y={1300} color="#22a35a" />
      {cast.map((c, i) => (
        <Toon key={i} look={c} f={f} x={110 + i * 172} y={GY + 150 + (i % 2) * 30} s={c === CUBI ? 0.8 : 0.62} act={c === CUBI ? "point" : "cheer"} expr="happy" mouth={c === CUBI ? m : 0}
          lift={Math.max(0, Math.sin((f + i * 7) / 5)) * 40} seed={i * 3} />
      ))}
    </Punch>
  );
};

// ---------- subtítulos animados ----------
const groupWords = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const gap = i > 0 ? w.s - words[i - 1].e : 0;
    if (cur.length >= 3 || (cur.length >= 2 && gap > 0.2)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{ id: SceneId; f: number }> = ({ id, f }) => {
  const t = f / FPS;
  const groups = groupWords(V[id].words);
  let gi = -1;
  groups.forEach((g, i) => {
    if (t >= g[0].s - 0.05) gi = i;
  });
  if (gi < 0) return null;
  const g = groups[gi];
  if (t > g[g.length - 1].e + 0.5) return null;
  const p = popIn(f, Math.round(g[0].s * FPS) - 1, 7);
  return (
    <div
      style={{
        position: "absolute", left: 30, right: 30, bottom: 310, textAlign: "center", fontFamily: FONT, fontWeight: 900,
        fontSize: 86, lineHeight: 1.1, transform: `scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 1.5),
      }}
    >
      {g.map((w, i) => {
        const active = t >= w.s - 0.03 && (i === g.length - 1 || t < g[i + 1].s - 0.03);
        return (
          <span
            key={i}
            style={{
              display: "inline-block", margin: "0 26px", transformOrigin: "center bottom",
              color: active ? "#ffd23f" : "#fff",
              transform: `scale(${active ? 1.08 : 1}) rotate(${active ? -3 : 0}deg)`,
              textShadow: "0 0 3px #1d1830, 5px 5px 0 #1d1830, -5px 5px 0 #1d1830, 5px -5px 0 #1d1830, -5px -5px 0 #1d1830, 0 5px 0 #1d1830, 0 -5px 0 #1d1830, 5px 0 0 #1d1830, -5px 0 0 #1d1830",
            }}
          >
            {w.w.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

const SCENES: Record<SceneId, React.FC<{ f: number }>> = { s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6 };

const Shell: React.FC<{ id: SceneId; idx: number }> = ({ id, idx }) => {
  const f = useCurrentFrame();
  const Comp = SCENES[id];
  // barrido rápido de entrada (whip pan) con desenfoque
  const p = idx === 0 ? 1 : clamp01(f / 8);
  const dx = (1 - p) * (1 - p) * W * 0.9 * (idx % 2 ? -1 : 1);
  const blur = (1 - p) * 22;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Audio src={staticFile(`audio/toon/${id}.mp3`)} />
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Comp f={f} />
        </svg>
      </div>
      {idx > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: (1 - p) * 0.5 }} /> : null}
      <div
        style={{
          position: "absolute", top: 160, left: 36, padding: "10px 22px", borderRadius: 999, background: "rgba(29,24,48,0.82)",
          color: "#ffd23f", fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 1, border: "3px solid #ffd23f",
        }}
      >
        <svg width={44} height={30} viewBox="0 0 110 70" style={{ verticalAlign: "-4px", marginRight: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={0} y={i * 14} width={110} height={14} fill={i % 2 ? "#fff" : "#1d4fd8"} />
          ))}
          <path d="M0 0 L60 35 L0 70 Z" fill="#e11d2e" />
        </svg>
        ESCENARIO HIPOTÉTICO
      </div>
      <Captions id={id} f={f} />
    </AbsoluteFill>
  );
};

export const ToonVideo: React.FC = () => {
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

export const ToonComposition: React.FC = () => (
  <Composition id="CubaPotencia" component={ToonVideo} durationInFrames={total} fps={FPS} width={W} height={H} />
);
