import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Character, cubano, mexicano, venezolana } from "./Character";
import { Flag, starPoints } from "./Flags";
import { CartoonScene, SceneKind, cartoonDisclaimer, cartoonScenes } from "./script";
import timing from "./timing.json";

const FPS = 30;
const PAD = 0.6; // segundos de pausa tras cada narración
const W = 1080;
const H = 1920;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const sceneFrames = cartoonScenes.map((s) =>
  Math.ceil(((timing as Record<string, number>)[s.id] + PAD) * FPS),
);
const totalFrames = sceneFrames.reduce((a, b) => a + b, 0);

// ---------- utilidades ----------
const splitSentences = (text: string) =>
  text.match(/[^.!?¿]+[.!?]+|¿[^?]+\?/g)?.map((s) => s.trim()) ?? [text];

const captionAt = (sentences: string[], frame: number, total: number) => {
  const lengths = sentences.map((s) => s.length);
  const sum = lengths.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < sentences.length; i++) {
    acc += (lengths[i] / sum) * total;
    if (frame < acc) return sentences[i];
  }
  return sentences[sentences.length - 1];
};

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } });
};

// ---------- fondos ----------
const Sky: React.FC<{ top: string; bottom: string; children?: React.ReactNode }> = ({ top, bottom, children }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}</svg>
  </AbsoluteFill>
);

const Clouds: React.FC<{ frame: number }> = ({ frame }) => (
  <g fill="rgba(255,255,255,0.6)">
    {[0, 1, 2].map((i) => {
      const x = ((frame * (0.6 + i * 0.3) + i * 420) % 1400) - 200;
      const y = 420 + i * 120;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cx={0} cy={0} rx={90} ry={38} />
          <ellipse cx={60} cy={-20} rx={70} ry={40} />
          <ellipse cx={-60} cy={-10} rx={60} ry={30} />
        </g>
      );
    })}
  </g>
);

const Ground: React.FC<{ color: string }> = ({ color }) => (
  <path d={`M0 1380 Q540 1300 1080 1380 L1080 1920 L0 1920 Z`} fill={color} />
);

const Capitol: React.FC = () => (
  <g fill="rgba(255,255,255,0.9)" transform="translate(360 760) scale(0.9)">
    <rect x={0} y={250} width={400} height={120} />
    <rect x={130} y={170} width={140} height={90} />
    <path d="M130 175 Q200 40 270 175 Z" />
    <rect x={192} y={10} width={16} height={60} />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={14 + i * 44} y={270} width={14} height={90} fill="rgba(30,64,175,0.35)" />
    ))}
  </g>
);

const Fence: React.FC = () => (
  <g>
    {Array.from({ length: 28 }).map((_, i) => (
      <rect key={i} x={i * 40} y={1060} width={18} height={360} fill="#57534e" />
    ))}
    <rect x={0} y={1060} width={W} height={16} fill="#44403c" />
  </g>
);

const Palm: React.FC<{ x: number; frame: number; flip?: boolean }> = ({ x, frame, flip }) => {
  const sway = Math.sin(frame / 20) * 4;
  return (
    <g transform={`translate(${x} 1380) scale(${flip ? -1 : 1} 1)`}>
      <path d="M0 0 Q20 -200 -10 -420" stroke="#92400e" strokeWidth={26} fill="none" />
      <g transform={`rotate(${sway} -10 -420)`} fill="#15803d">
        {[-70, -30, 10, 50, 90, 140].map((a) => (
          <ellipse key={a} cx={-10} cy={-420} rx={130} ry={26} transform={`rotate(${a} -10 -420) translate(110 0)`} />
        ))}
      </g>
    </g>
  );
};

const Sea: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={0} y={1180} width={W} height={220} fill="#0ea5e9" />
    {Array.from({ length: 8 }).map((_, i) => (
      <path
        key={i}
        d={`M${i * 150 - 100 + ((frame * 2) % 150)} 1250 q40 -20 80 0`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={6}
        fill="none"
      />
    ))}
    <path d="M0 1360 Q540 1310 1080 1360 L1080 1920 L0 1920 Z" fill="#fde68a" />
  </g>
);

const Pyramid: React.FC = () => (
  <g transform="translate(250 900)" fill="#b45309">
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={i * 50} y={(5 - i) * 70} width={580 - i * 100} height={72} fill={i % 2 ? "#a16207" : "#b45309"} />
    ))}
    <rect x={250} y={-60} width={80} height={60} fill="#92400e" />
  </g>
);

const Tepui: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <path d="M80 1400 L160 820 L620 800 L700 1400 Z" fill="#166534" />
    <path d="M560 1400 L640 980 L1000 960 L1060 1400 Z" fill="#15803d" />
    {/* salto de agua */}
    <rect x={380} y={810} width={46} height={590} fill="rgba(224,242,254,0.95)" />
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={386 + (i % 3) * 12} y={810 + ((frame * 18 + i * 97) % 590)} width={6} height={40} fill="#bae6fd" />
    ))}
  </g>
);

// ---------- piezas ----------
const Pills: React.FC<{ items: string[]; color: string; startY?: number }> = ({ items, color, startY = 400 }) => (
  <>
    {items.map((t, i) => (
      <Pill key={t} text={t} color={color} y={startY + i * 110} delay={12 + i * 14} />
    ))}
  </>
);

const Pill: React.FC<{ text: string; color: string; y: number; delay: number }> = ({ text, color, y, delay }) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        textAlign: "center",
        transform: `scale(${p})`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 46,
          color: "#fff",
          background: color,
          padding: "12px 28px",
          borderRadius: 999,
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePop(0);
  return (
    <div
      style={{
        position: "absolute",
        bottom: H - 1365,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 40,
        transform: `translateY(${(1 - p) * 500}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Icon: React.FC<{ kind: "heart" | "plus" | "share"; label: string; delay: number }> = ({ kind, label, delay }) => {
  const frame = useCurrentFrame();
  const p = usePop(delay);
  const pulse = 1 + Math.sin((frame - delay) / 5) * 0.06;
  return (
    <div style={{ textAlign: "center", transform: `scale(${p * pulse})`, fontFamily: FONT }}>
      <svg width={190} height={190} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={48} fill={kind === "heart" ? "#ef4444" : kind === "plus" ? "#ec4899" : "#22c55e"} />
        {kind === "heart" ? (
          <path d="M50 76 L26 52 A13 13 0 0 1 50 34 A13 13 0 0 1 74 52 Z" fill="#fff" />
        ) : null}
        {kind === "plus" ? (
          <g stroke="#fff" strokeWidth={10} strokeLinecap="round">
            <line x1={50} y1={28} x2={50} y2={72} />
            <line x1={28} y1={50} x2={72} y2={50} />
          </g>
        ) : null}
        {kind === "share" ? <path d="M30 70 Q34 44 58 42 L58 30 L78 50 L58 70 L58 56 Q40 56 30 70 Z" fill="#fff" /> : null}
      </svg>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 44, marginTop: 8, textShadow: "0 3px 8px rgba(0,0,0,0.4)" }}>
        {label}
      </div>
    </div>
  );
};

// ---------- escenas ----------
const SceneArt: React.FC<{ kind: SceneKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  switch (kind) {
    case "intro":
      return (
        <>
          <Sky top="#38bdf8" bottom="#bae6fd">
            <Clouds frame={frame} />
            <Ground color="#4ade80" />
          </Sky>
          <div style={{ position: "absolute", left: 390, top: 380 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 14, height: 520, background: "#a8a29e", borderRadius: 6 }} />
            <div style={{ position: "absolute", left: 14, top: 10 }}>
              <Flag country="usa" width={300} frame={frame} />
            </div>
          </div>
          <Row>
            <Character frame={frame} scale={1.25} {...cubano} phase={0} />
            <Character frame={frame} scale={1.25} {...mexicano} phase={11} />
            <Character frame={frame} scale={1.25} {...venezolana} phase={23} />
          </Row>
        </>
      );
    case "demo":
      return (
        <>
          <Sky top="#1d4ed8" bottom="#93c5fd">
            <Clouds frame={frame} />
            <Capitol />
            <Ground color="#86efac" />
          </Sky>
          <Pills items={["Camino a la ciudadanía", "Protección de DACA", "TPS y parole"]} color="#1e40af" />
          <Row>
            <Character frame={frame} scale={1.25} {...cubano} flag={undefined} phase={0} />
            <Character frame={frame} scale={1.25} {...mexicano} flag={undefined} phase={9} />
            <Character frame={frame} scale={1.25} {...venezolana} flag={undefined} phase={19} />
          </Row>
        </>
      );
    case "rep":
      return (
        <>
          <Sky top="#b91c1c" bottom="#fca5a5">
            <Clouds frame={frame} />
            <Ground color="#d6d3d1" />
            <Fence />
          </Sky>
          <Pills items={["Control de la frontera", "Más deportaciones", "Fin de TPS y parole"]} color="#991b1b" />
          <Row>
            <Character frame={frame} scale={1.25} {...cubano} flag={undefined} mood="worried" phase={0} />
            <Character frame={frame} scale={1.25} {...mexicano} flag={undefined} mood="worried" phase={9} />
            <Character frame={frame} scale={1.25} {...venezolana} flag={undefined} mood="worried" phase={19} />
          </Row>
        </>
      );
    case "cuba":
      return (
        <>
          <Sky top="#0284c7" bottom="#7dd3fc">
            <Clouds frame={frame} />
            <Sea frame={frame} />
            <Palm x={120} frame={frame} />
            <Palm x={980} frame={frame + 30} flip />
          </Sky>
          <Pills items={["Ley de Ajuste Cubano", "Residencia tras 1 año", "Parole: terminó en 2025"]} color="#002A8F" />
          <Row>
            <Character frame={frame} scale={1.45} {...cubano} />
          </Row>
        </>
      );
    case "mexico":
      return (
        <>
          <Sky top="#f97316" bottom="#fde68a">
            <Clouds frame={frame} />
            <Pyramid />
            <Ground color="#d9a066" />
          </Sky>
          <Pills items={["Grupo más grande", "Mayoría de DACA", "Frontera y deportaciones"]} color="#006847" />
          <Row>
            <Character frame={frame} scale={1.35} {...mexicano} />
            <Character frame={frame} scale={1.35} {...mexicano} skin="#c08552" hair="#2b1b10" shirt="#CE1126" flag={undefined} hat="hardhat" phase={14} />
          </Row>
        </>
      );
    case "venezuela":
      return (
        <>
          <Sky top="#0f766e" bottom="#99f6e4">
            <Clouds frame={frame} />
            <Tepui frame={frame} />
            <Ground color="#65a30d" />
          </Sky>
          <Pills items={["Dependían del TPS", "Cancelado en 2025", "Tribunales y Congreso"]} color="#00247D" />
          <Row>
            <Character frame={frame} scale={1.35} {...venezolana} />
            <Character frame={frame} scale={1.35} {...venezolana} skin="#c68642" hair="#111" shirt="#CF142B" flag={undefined} hat="cap" phase={14} />
          </Row>
        </>
      );
    case "cta":
      return (
        <>
          <Sky top="#7c3aed" bottom="#f472b6">
            {Array.from({ length: 14 }).map((_, i) => (
              <polygon
                key={i}
                points={starPoints((i * 173) % W, 300 + ((i * 251 + frame * 3) % 1500), 14)}
                fill="rgba(255,255,255,0.5)"
              />
            ))}
          </Sky>
          <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 50 }}>
            <Icon kind="plus" label="Sígueme" delay={4} />
            <Icon kind="heart" label="Me gusta" delay={14} />
            <Icon kind="share" label="Comparte" delay={24} />
          </div>
          <Row>
            <Character frame={frame} scale={1.25} {...cubano} phase={0} />
            <Character frame={frame} scale={1.25} {...mexicano} phase={11} />
            <Character frame={frame} scale={1.25} {...venezolana} phase={23} />
          </Row>
        </>
      );
  }
};

const titleColor: Record<SceneKind, string> = {
  intro: "#fbbf24",
  demo: "#2563eb",
  rep: "#dc2626",
  cuba: "#002A8F",
  mexico: "#006847",
  venezuela: "#00247D",
  cta: "#fbbf24",
};

const SceneView: React.FC<{ scene: CartoonScene; last: boolean }> = ({ scene, last }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = usePop(0);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const dark = titleColor[scene.id] === "#fbbf24";

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Audio src={staticFile(`audio/cartoon/${scene.id}.mp3`)} />
      <SceneArt kind={scene.id} />

      <div style={{ position: "absolute", top: 200, left: 50, right: 50, textAlign: "center", transform: `scale(${p})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 70,
            lineHeight: 1.1,
            color: dark ? "#111827" : "#fff",
            background: titleColor[scene.id],
            padding: "16px 34px",
            borderRadius: 22,
            border: "5px solid #fff",
            boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
          }}
        >
          {scene.title}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          bottom: 300,
          fontFamily: FONT,
          color: "#fff",
          fontSize: 46,
          fontWeight: 900,
          lineHeight: 1.28,
          textAlign: "center",
          textShadow: "0 0 6px rgba(0,0,0,0.95), 0 3px 12px rgba(0,0,0,0.8), 0 0 2px #000",
        }}
      >
        {captionAt(splitSentences(scene.narration), frame, durationInFrames - 1)}
      </div>

      {last ? (
        <div
          style={{
            position: "absolute",
            left: 50,
            right: 50,
            bottom: 230,
            fontFamily: FONT,
            fontSize: 26,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            textShadow: "0 2px 6px rgba(0,0,0,0.6)",
          }}
        >
          {cartoonDisclaimer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const CartoonVideo: React.FC = () => {
  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/music.mp3")} loop volume={0.1} />
      {cartoonScenes.map((s, i) => {
        const from = offset;
        offset += sceneFrames[i];
        return (
          <Sequence key={s.id} from={from} durationInFrames={sceneFrames[i]}>
            <SceneView scene={s} last={i === cartoonScenes.length - 1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CartoonComposition: React.FC = () => (
  <Composition id="Cartoon" component={CartoonVideo} durationInFrames={totalFrames} fps={FPS} width={W} height={H} />
);
