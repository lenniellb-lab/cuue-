import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Country, Flag } from "../cartoon/Flags";
import { FONT, FPS, Grain, H, PaperDefs, W, ease, hop, jit, popIn, stop } from "./paper";
import { CAST, Expr, PoseName, Prop, Puppet } from "./Puppet";
import {
  Backdrop, Banner, BigIcon, BoardIcon, Booth, BorderFence, Bush, Capitol, CloudStick, Cork, Courthouse, Curtains,
  Easel, Floor, Gate, Map3D, MapCam, Mesa, MiniWhiteHouse, Padlock, PaperTag, PatrolCar, PinFlag, Pin,
  Podium, StatusIcon, Sun, WhiteHouse, COUNTRY_POS, project,
} from "./sets";
import voice from "./voice.json";

type Word = { w: string; s: number; e: number };
type Voice = { duration: number; words: Word[]; mouth: number[] };
const V = voice as Record<string, Voice>;
const IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
type SceneId = (typeof IDS)[number];
const PAD = 0.4;
const TR = 8; // fotogramas de la transición de cartón
const sceneFrames = IDS.map((id) => Math.ceil((V[id].duration + PAD) * FPS));
const total = sceneFrames.reduce((a, b) => a + b, 0);

// ---------- voz ----------
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ0-9]/g, "");
const wordFrame = (id: SceneId, match: string, nth = 0) => {
  const hits = V[id].words.filter((w) => norm(w.w).startsWith(norm(match)));
  const w = hits[Math.min(nth, hits.length - 1)];
  return w ? Math.round(w.s * FPS) : 0;
};
const mouthAt = (id: SceneId, f: number) => {
  const m = V[id].mouth;
  const sf = stop(f);
  return m[sf] ?? 0;
};

// ---------- subtítulos animados palabra a palabra ----------
const groupWords = (words: Word[]) => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const gap = i > 0 ? w.s - words[i - 1].e : 0;
    if (cur.length >= 4 || (cur.length >= 2 && gap > 0.22)) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) groups.push(cur);
  return groups;
};

const Captions: React.FC<{ id: SceneId; f: number }> = ({ id, f }) => {
  const t = f / FPS;
  const groups = groupWords(V[id].words);
  let gi = 0;
  groups.forEach((g, i) => {
    if (t >= g[0].s - 0.05) gi = i;
  });
  const g = groups[gi];
  if (!g || t > g[g.length - 1].e + 0.6) return null;
  const startF = Math.round(g[0].s * FPS);
  const p = popIn(f, startF - 1, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        bottom: 300,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 72,
        lineHeight: 1.15,
        transform: `scale(${0.75 + 0.25 * p}) rotate(${jit(`cap${gi}`, f, 0.6)}deg)`,
        opacity: Math.min(1, p * 1.4),
      }}
    >
      {g.map((w, i) => {
        const active = t >= w.s - 0.03 && (i === g.length - 1 || t < g[i + 1].s - 0.03);
        const spoken = t >= w.s - 0.03;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 24px",
              transformOrigin: "center bottom",
              color: active ? "#ffd400" : spoken ? "#ffffff" : "rgba(255,255,255,0.9)",
              transform: `scale(${active ? 1.14 : 1}) translateY(${active ? -6 : 0}px)`,
              textShadow:
                "0 0 2px #000, 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 8px 14px rgba(0,0,0,0.55)",
            }}
          >
            {w.w.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

// ---------- cámara (se mueve en poses de stop motion) ----------
const Cam: React.FC<{ z: number; x?: number; y?: number; children: React.ReactNode }> = ({ z, x = 0, y = 0, children }) => (
  <g transform={`translate(${W / 2 + x} ${H / 2 + y}) scale(${z}) translate(${-W / 2} ${-H / 2})`}>{children}</g>
);

// ---------- ESCENA 1: gancho frente a la Casa Blanca ----------
const S1: React.FC<{ f: number }> = ({ f }) => {
  const sf = stop(f);
  const id: SceneId = "s1";
  const m = mouthAt(id, f);
  const split = wordFrame(id, "o");
  const end1 = wordFrame(id, "la", 0);
  const surprise = wordFrame(id, "respuesta");
  const arrived = 58;
  const dX = ease(sf, 0, arrived, -260, 300);
  const eX = ease(sf, 0, arrived, 1340, 780);
  const walking = sf < arrived;
  const dTalk = !walking && f < split;
  const eTalk = !walking && f >= split && f < end1;
  const both = f >= surprise;
  const signS = popIn(f, surprise, 8);
  const pose = (talk: boolean): PoseName => (walking ? "walk" : both ? "cheer" : talk ? "talk" : "idle");
  const expr = (talk: boolean): Expr => (both ? "surprised" : talk ? "happy" : "neutral");
  return (
    <Cam z={ease(sf, 0, 270, 1.0, 1.1)} y={ease(sf, 0, 270, 0, -30)}>
      <Backdrop top="#79b8e0" bottom="#d6eef8" />
      <CloudStick x={190} y={560} f={f} seed="c1" />
      <CloudStick x={880} y={640} f={f} seed="c2" s={0.8} />
      <CloudStick x={560} y={440} f={f} seed="c3" s={0.6} />
      <Floor y={1030} color="#6fb85a" stripe="rgba(255,255,255,0.12)" />
      <WhiteHouse x={205} y={750} f={f} />
      <Bush x={110} y={1090} f={f} seed="b1" />
      <Bush x={990} y={1100} f={f} seed="b2" s={0.9} />
      <Puppet id="donkey" look={CAST.donkey} f={f} x={dX} y={1330} s={1.05} pose={pose(dTalk)} expr={expr(dTalk)} mouth={dTalk || both ? m : 0} lookX={both ? 0 : 1} lift={both ? hop(f, surprise, surprise + 14, 60) : 0} />
      <Puppet id="elephant" look={CAST.elephant} f={f} x={eX} y={1330} s={1.05} flip={walking} pose={pose(eTalk)} expr={expr(eTalk)} mouth={eTalk || both ? m : 0} lookX={both ? 0 : -1} lift={both ? hop(f, surprise + 3, surprise + 17, 60) : 0} />
      {signS > 0 ? (
        <g transform={`translate(540 ${1120 - signS * 220}) rotate(${Math.sin(sf / 3) * 6}) scale(${signS})`} filter="url(#deep)">
          <rect x={-8} y={0} width={16} height={260} fill="#8a5a2b" />
          <circle cx={0} cy={-40} r={95} fill="#facc15" stroke="#fffaf0" strokeWidth={8} />
          <text x={0} y={-2} textAnchor="middle" fontFamily={FONT} fontSize={110} fill="#b91c1c">
            ?!
          </text>
        </g>
      ) : null}
    </Cam>
  );
};

// ---------- ESCENA 2: entran al mapa 3D ----------
const people = [
  { key: "cuban", look: CAST.cuban, from: "cuba", to: [300, 190], prop: "flag:cuba" as Prop, icon: "check" as const, doc: "#2563eb" },
  { key: "mexican", look: CAST.mexican, from: "mexico", to: [420, 250], prop: "flag:mexico" as Prop, icon: "clock" as const, doc: "#16a34a" },
  { key: "venezuelan", look: CAST.venezuelan, from: "venezuela", to: [560, 210], prop: "flag:venezuela" as Prop, icon: "question" as const, doc: "#eab308" },
  { key: "other", look: CAST.other, from: "other", to: [680, 260], prop: "globe" as Prop, icon: "doc" as const, doc: "#7c3aed" },
] as const;

const S2: React.FC<{ f: number }> = ({ f }) => {
  const sf = stop(f);
  const id: SceneId = "s2";
  const cam: MapCam = { cx: 540, cy: ease(sf, 0, 232, 960, 930), sc: ease(sf, 0, 232, 0.8, 0.9), tilt: ease(sf, 0, 232, 1.0, 0.88) };
  const lifts = {
    us: hop(f, 0, 14, 40),
    mexico: hop(f, 4, 18, 40),
    cuba: hop(f, 8, 22, 40),
    venezuela: hop(f, 12, 26, 40),
    other: hop(f, 16, 30, 40),
  };
  const iconAt = wordFrame(id, "pero");
  const m = mouthAt(id, f);
  const walkEnd = [120, 132, 144, 156];
  const actors = people
    .map((p, i) => {
      const [fu, fv] = COUNTRY_POS[p.from];
      const u = ease(sf, 20 + i * 8, walkEnd[i], fu, p.to[0]);
      const v = ease(sf, 20 + i * 8, walkEnd[i], fv, p.to[1]);
      const q = project(u, v, cam);
      const walking = sf >= 20 + i * 8 && sf < walkEnd[i];
      return { p, i, q, walking, v };
    })
    .sort((a, b) => a.v - b.v);
  return (
    <Cam z={1}>
      <Backdrop top="#5a3d22" bottom="#8c6239" />
      <Floor y={560} color="#b98b5a" stripe="rgba(90,60,30,0.25)" />
      <Map3D c={cam} f={f} lifts={lifts} />
      <PinFlag {...(() => { const q = project(170, 120, cam); return { x: q.x, y: q.y }; })()} country="usa" f={f} s={0.9} />
      {actors.map(({ p, i, q, walking }) => {
        const talk = !walking && f > iconAt;
        return (
          <g key={p.key}>
            <Puppet
              id={p.key}
              look={p.look}
              f={f}
              x={q.x}
              y={q.y}
              s={0.6 * q.p}
              pose={walking ? "walk" : f > iconAt ? "idle" : "wave"}
              prop={p.prop}
              expr={f > iconAt ? (p.icon === "check" ? "happy" : p.icon === "question" ? "worried" : "neutral") : "happy"}
              mouth={talk && i === 0 ? m : 0}
              lookX={walking ? 0 : i < 2 ? 1 : -1}
              flip={walking && p.from === "other" ? false : walking && q.x > 600}
            />
            <StatusIcon kind={p.icon} x={q.x} y={q.y - 320 * q.p} s={popIn(f, iconAt + i * 6, 8)} />
          </g>
        );
      })}
    </Cam>
  );
};

// ---------- ESCENA 3: si ganaran los demócratas ----------
const S3: React.FC<{ f: number }> = ({ f }) => {
  const sf = stop(f);
  const id: SceneId = "s3";
  const m = mouthAt(id, f);
  const fRoad = wordFrame(id, "legales");
  const fShield = wordFrame(id, "protecciones");
  const fDoor = wordFrame(id, "opciones");
  const fBut = wordFrame(id, "pero");
  const fProp = wordFrame(id, "propuestas");
  const fLeyes = wordFrame(id, "leyes");
  const fCong = wordFrame(id, "congreso");
  const presenting = (f >= fRoad - 6 && f < fDoor + 30);
  const shrug = f >= fBut;
  const capRise = ease(sf, fCong - 8, fCong + 10, 520, 0);
  const iconsOut = f >= fBut ? Math.max(0, 1 - (f - fBut) / 8) : 1;
  return (
    <Cam z={ease(sf, 0, 375, 1.0, 1.06)}>
      <Backdrop top="#0f1d4a" bottom="#1e3a8a" />
      <g transform={`translate(0 ${capRise})`}>
        <Capitol x={720} y={1150} s={0.95} />
      </g>
      <Floor y={1160} color="#8b6a46" stripe="rgba(60,40,20,0.35)" />
      <Curtains f={f} color="#2563eb" dark="#1e3a8a" />
      <Easel x={ease(sf, fBut + 4, fBut + 18, 770, 1450)} y={1190}>
        <g transform="translate(0 -60) scale(0.32)">
          <Map3D c={{ cx: 0, cy: 0, sc: 1, tilt: 0 }} f={f} labels={false} />
        </g>
        <g transform="translate(0 70)">
          <BoardIcon kind="road" x={-130} s={popIn(f, fRoad, 8) * iconsOut * 0.8} />
          <BoardIcon kind="shield" x={0} s={popIn(f, fShield, 8) * iconsOut * 0.8} />
          <BoardIcon kind="door" x={130} s={popIn(f, fDoor, 8) * iconsOut * 0.8} />
          <BoardIcon kind="question" x={0} s={popIn(f, fBut + 6, 8) * 0.9} />
        </g>
      </Easel>
      <Puppet id="donkey" look={CAST.donkey} f={f} x={300} y={1160} s={1.0} pose={shrug ? "shrug" : presenting ? "present" : "talk"} expr={shrug ? "neutral" : "happy"} mouth={m} lookX={presenting ? 1 : 0} prop={presenting ? "pointer" : "none"} />
      <Podium x={300} y={1240} color="#1d4ed8" />
      <PaperTag x={250} y={560} text="PROPUESTAS" s={popIn(f, fProp, 8)} r={-6} />
      <PaperTag x={760} y={540} text="LEYES" s={popIn(f, fLeyes, 8)} r={5} />
      <PaperTag x={560} y={680} text="CONGRESO" s={popIn(f, fCong, 8)} r={-3} color="#fde68a" />
      {/* familias observando */}
      {people.map((p, i) => {
        const clap = f > fDoor + 10 && f < fBut;
        return (
          <Puppet
            key={p.key}
            id={p.key}
            look={p.look}
            f={f}
            x={150 + i * 260}
            y={1430}
            s={0.72}
            pose={clap ? "clap" : "idle"}
            expr={shrug ? "worried" : "happy"}
            lookX={i < 2 ? 1 : 0.4}
            lift={clap ? hop(f, fDoor + 10 + i * 3, fDoor + 22 + i * 3, 30) : 0}
          />
        );
      })}
      <Banner text="Si ganaran los demócratas" f={f} color="#1d4ed8" />
    </Cam>
  );
};

// ---------- ESCENA 4: si ganaran los republicanos ----------
const S4: React.FC<{ f: number }> = ({ f }) => {
  const sf = stop(f);
  const id: SceneId = "s4";
  const m = mouthAt(id, f);
  const fCtrl = wordFrame(id, "controles");
  const fApl = wordFrame(id, "aplicacion");
  const fRestr = wordFrame(id, "restricciones");
  const gateAngle = ease(sf, fCtrl, fCtrl + 14, 75, 0);
  const lineX = [740, 615, 490, 365];
  const arrive = [86, 96, 106, 116];
  const showDoc = f >= fApl;
  return (
    <Cam z={ease(sf, 0, 284, 1.04, 1.0)} x={ease(sf, 0, 284, 20, -10)}>
      <Backdrop top="#f59e0b" bottom="#fde68a" />
      <Sun x={860} y={520} f={f} />
      <Mesa x={-60} y={1130} w={560} h={300} color="#c2410c" />
      <Mesa x={480} y={1130} w={680} h={220} color="#ea580c" />
      <Floor y={1120} color="#e8b26a" stripe="rgba(160,100,40,0.18)" />
      <PatrolCar x={ease(sf, 40, 284, 1250, -500)} y={1120} f={f} s={0.62} flip />
      <BorderFence y={1170} x0={-40} x1={1120} h={330} gapFrom={555} gapTo={905} />
      <Gate x={560} y={1170} angle={gateAngle} />
      <Booth x={930} y={1180} />
      {people.map((p, i) => {
        const walking = sf < arrive[i];
        const x = ease(sf, i * 6, arrive[i], lineX[i] - 760, lineX[i]);
        const isFirst = i === 0;
        return (
          <Puppet
            key={p.key}
            id={p.key}
            look={p.look}
            f={f}
            x={x}
            y={1300}
            s={0.8}
            pose={walking ? "walk" : isFirst && showDoc ? "hold" : "idle"}
            prop={isFirst && showDoc ? "doc" : "none"}
            docColor={p.doc}
            expr={f > fCtrl ? "worried" : "neutral"}
            lookX={1}
          />
        );
      })}
      <Puppet id="agent" look={CAST.agent} f={f} x={850} y={1350} s={0.95} pose={f > fCtrl + 10 ? (showDoc ? "idle" : "stop") : "idle"} prop={showDoc ? "clipboard" : "none"} expr="serious" lookX={-1} />
      <Puppet id="elephant" look={CAST.elephant} f={f} x={115} y={1430} s={1.0} pose="megaphone" prop="megaphone" expr="serious" mouth={m} lookX={1} />
      <PaperTag x={560} y={720} text="PROGRAMAS" s={popIn(f, fRestr, 8)} color="#fecaca" />
      <Padlock x={800} y={740} closed={ease(sf, fRestr + 10, fRestr + 18, 0, 1)} s={popIn(f, fRestr + 6, 8) * 0.8} />
      <Banner text="Si ganaran los republicanos" f={f} color="#b91c1c" />
    </Cam>
  );
};

// ---------- ESCENA 5: la realidad ----------
const S5: React.FC<{ f: number }> = ({ f }) => {
  const sf = stop(f);
  const id: SceneId = "s5";
  const m = mouthAt(id, f);
  const fSit = wordFrame(id, "situacion");
  const fCaso = wordFrame(id, "caso");
  const fDocs = wordFrame(id, "documentos");
  const fVig = wordFrame(id, "vigentes");
  const fAd = wordFrame(id, "ademas");
  const fPres = wordFrame(id, "presidente");
  const fCamb = wordFrame(id, "cambiar");
  const fSolo = wordFrame(id, "solo");
  const speaker = f < fSit ? 0 : f < fAd ? 1 : 2;
  const cam: MapCam = { cx: 540, cy: 780, sc: 0.95, tilt: 0 };
  const yarn = ease(sf, fSolo - 6, fSolo + 14, 0, 1);
  const b = [
    { x: 230, y: 960, s: popIn(f, fPres, 8) },
    { x: 850, y: 960, s: popIn(f, fCamb, 8) },
    { x: 540, y: 880, s: popIn(f, fCamb + 10, 8) },
  ];
  return (
    <Cam z={ease(sf, 0, 470, 1.08, 1.0)} y={ease(sf, 0, 470, -20, 10)}>
      <Cork />
      <g transform={`rotate(${jit("mapr", f, 0.3)} 540 780)`}>
        <Map3D c={cam} f={f} />
      </g>
      <Pin x={90} y={430} />
      <Pin x={990} y={430} />
      <Floor y={1250} color="#9a6b3d" stripe="rgba(60,40,20,0.3)" />
      <PaperTag x={250} y={470} text="SU CASO" s={popIn(f, fCaso, 8)} r={-6} />
      <PaperTag x={760} y={470} text="SUS DOCUMENTOS" s={popIn(f, fDocs, 8)} r={4} />
      <PaperTag x={540} y={590} text="LEYES VIGENTES" s={popIn(f, fVig, 8)} r={-2} color="#fde68a" />
      {yarn > 0 ? (
        <g stroke="#dc2626" strokeWidth={6}>
          <line x1={b[0].x} y1={b[0].y - 80} x2={b[0].x + (b[2].x - b[0].x) * yarn} y2={b[0].y - 80 + (b[2].y - 120 - b[0].y + 80) * yarn} />
          <line x1={b[1].x} y1={b[1].y - 80} x2={b[1].x + (b[2].x - b[1].x) * yarn} y2={b[1].y - 80 + (b[2].y - 120 - b[1].y + 80) * yarn} />
          <line x1={b[0].x} y1={b[0].y - 80} x2={b[0].x + (b[1].x - b[0].x) * yarn} y2={b[0].y - 80} />
        </g>
      ) : null}
      <MiniWhiteHouse x={b[0].x} y={b[0].y} s={b[0].s * 0.55} />
      <Capitol x={b[1].x} y={b[1].y} s={b[1].s * 0.5} />
      <Courthouse x={b[2].x} y={b[2].y} s={b[2].s * 0.45} f={f} />
      {people.map((p, i) => {
        const me = speaker === 0 ? i === 0 : speaker === 1 ? i === 1 : i === 2;
        const holding = f >= fDocs && f < fAd + 20;
        const look = me ? 0 : speaker === 0 ? -1 : speaker === 1 ? (i < 1 ? 1 : -1) : i < 2 ? 1 : -1;
        return (
          <Puppet
            key={p.key}
            id={p.key}
            look={p.look}
            f={f}
            x={150 + i * 260}
            y={1400}
            s={0.82}
            pose={holding ? "hold" : me ? (speaker === 0 && f < fSit ? "point" : "talk") : "idle"}
            prop={holding ? "doc" : "none"}
            docColor={p.doc}
            expr={me ? "serious" : holding ? "neutral" : "happy"}
            mouth={me ? m : 0}
            lookX={holding ? (i % 2 ? -1 : 1) : look}
          />
        );
      })}
      <Banner text="La realidad" f={f} color="#ea580c" />
    </Cam>
  );
};

// ---------- ESCENA 6: final ----------
const S6: React.FC<{ f: number }> = ({ f }) => {
  const sf = stop(f);
  const id: SceneId = "s6";
  const m = mouthAt(id, f);
  const fQ = 0;
  const fLike = wordFrame(id, "gusta");
  const fShare = wordFrame(id, "compartelo");
  const fSave = wordFrame(id, "guardalo");
  const fFollow = wordFrame(id, "sigueme");
  const d = ease(sf, 0, 150, 0, 1);
  const walking = sf < 150;
  const cast = [
    { key: "donkey", look: CAST.donkey, prop: "none" as Prop },
    { key: "cuban", look: CAST.cuban, prop: "flag:cuba" as Prop },
    { key: "mexican", look: CAST.mexican, prop: "flag:mexico" as Prop },
    { key: "venezuelan", look: CAST.venezuelan, prop: "flag:venezuela" as Prop },
    { key: "other", look: CAST.other, prop: "globe" as Prop },
    { key: "elephant", look: CAST.elephant, prop: "none" as Prop },
  ];
  const qS = popIn(f, fQ + 4, 10) * (f > fLike - 4 ? Math.max(0, 1 - (f - fLike + 4) / 8) : 1);
  const flags: Country[] = ["cuba", "mexico", "venezuela", "usa"];
  return (
    <Cam z={1}>
      <Backdrop top="#1e3a8a" bottom="#7c3aed" />
      {/* banderines */}
      <g filter="url(#cutSoft)">
        <path d="M-20 360 Q540 470 1100 360" stroke="#fffaf0" strokeWidth={4} fill="none" />
        {Array.from({ length: 10 }).map((_, i) => {
          const x = 30 + i * 110;
          const y = 360 + Math.sin((i / 9) * Math.PI) * 100;
          return <polygon key={i} points={`${x - 40},${y} ${x + 40},${y} ${x},${y + 80}`} fill={["#ef4444", "#fffaf0", "#2563eb"][i % 3]} stroke="rgba(70,45,20,0.6)" strokeWidth={2} transform={`rotate(${Math.sin(sf / 5 + i) * 8} ${x} ${y})`} />;
        })}
      </g>
      <Floor y={1080} color="#a3774a" stripe="rgba(60,40,20,0.3)" />
      {flags.map((c, i) => (
        <PinFlag key={c} x={120 + i * 280} y={1110} country={c} f={f} s={popIn(f, 20 + i * 6, 8) * 1.1} />
      ))}
      {cast.map((c, i) => {
        const spread = 70 + d * 110;
        const x = 540 + (i - 2.5) * spread;
        const sc = 0.42 + d * 0.38;
        const y = 1110 + d * 300;
        return (
          <Puppet
            key={c.key}
            id={c.key}
            look={c.look}
            f={f}
            x={x}
            y={y}
            s={sc}
            pose={walking ? "walk" : "cheer"}
            prop={c.prop}
            expr="happy"
            mouth={walking ? 0 : m}
            lift={walking ? 0 : Math.max(0, Math.sin((sf + i * 6) / 5)) * 40}
          />
        );
      })}
      <PaperTag x={540} y={640} text="¿Y TÚ QUÉ CREES?" s={qS * 1.3} r={Math.sin(sf / 4) * 4} color="#facc15" />
      <BigIcon kind="heart" x={180} y={620} s={popIn(f, fLike, 8) * 0.9} label="ME GUSTA" />
      <BigIcon kind="share" x={420} y={680} s={popIn(f, fShare, 8) * 0.9} label="COMPARTE" />
      <BigIcon kind="save" x={660} y={620} s={popIn(f, fSave, 8) * 0.9} label="GUARDA" />
      <BigIcon kind="follow" x={900} y={680} s={popIn(f, fFollow, 8) * 0.9} label="SÍGUEME" />
    </Cam>
  );
};

// ---------- transición: hoja de cartón con sello de país ----------
const STAMPS: Country[] = ["usa", "mexico", "cuba", "venezuela", "usa", "mexico"];
const PaperWipe: React.FC<{ f: number; dur: number; idx: number }> = ({ f, dur, idx }) => {
  let x: number | null = null;
  let country = STAMPS[idx];
  if (f < TR && idx > 0) {
    x = interpolate(f, [0, TR], [0, -W - 160]);
    country = STAMPS[idx - 1];
  } else if (f >= dur - TR && idx < IDS.length - 1) x = interpolate(f, [dur - TR, dur], [W + 160, 0]);
  if (x === null) return null;
  const xs = Math.round(x / 40) * 40;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${xs} 0)`} filter="url(#deep)">
        <path d={`M-60 -20 L${W} -20 L${W} ${H + 20} L-60 ${H + 20} ` + Array.from({ length: 20 }).map((_, i) => `L${-60 + (i % 2 ? 24 : 0)} ${H - i * 100}`).join(" ") + " Z"} fill="#c49a6c" stroke="#8a6a45" strokeWidth={4} />
        <g transform={`translate(${W / 2 - 160} ${H / 2 - 110}) rotate(-6)`}>
          <rect x={-20} y={-20} width={360} height={260} rx={16} fill="#fffaf0" stroke="#8a6a45" strokeWidth={6} />
          <Flag country={country} width={320} frame={0} wave={0} />
        </g>
      </g>
    </svg>
  );
};

const SCENES: Record<SceneId, React.FC<{ f: number }>> = { s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6 };

const SceneShell: React.FC<{ id: SceneId; idx: number; dur: number }> = ({ id, idx, dur }) => {
  const f = useCurrentFrame();
  const Comp = SCENES[id];
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#c49a6c" }}>
      <Audio src={staticFile(`audio/puppets/${id}.mp3`)} volume={1} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <PaperDefs />
        <Comp f={f} />
      </svg>
      <Grain f={f} />
      <Captions id={id} f={f} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <PaperDefs />
      </svg>
      <PaperWipe f={f} dur={dur} idx={idx} />
    </AbsoluteFill>
  );
};

export const PuppetVideo: React.FC = () => {
  let offset = 0;
  const frame = useCurrentFrame();
  const musicVol = interpolate(frame, [0, 20, total - 45, total], [0, 0.16, 0.16, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/puppets/music.mp3")} volume={musicVol} />
      {IDS.map((id, i) => {
        const from = offset;
        offset += sceneFrames[i];
        return (
          <Sequence key={id} from={from} durationInFrames={sceneFrames[i]}>
            <SceneShell id={id} idx={i} dur={sceneFrames[i]} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const PuppetComposition: React.FC = () => (
  <Composition id="Puppets" component={PuppetVideo} durationInFrames={total} fps={FPS} width={W} height={H} />
);
