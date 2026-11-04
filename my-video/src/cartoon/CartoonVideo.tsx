import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Character, CharacterProps, cubano, mexicano, venezolana } from "./Character";
import { Flag, starPoints } from "./Flags";
import { CartoonScene, SceneKind, cartoonDisclaimer, cartoonScenes } from "./script";
import timing from "./timing.json";

const FPS = 30;
const PAD = 0.6; // segundos de pausa tras cada narración
const W = 1080;
const H = 1920;
const GROUND = 1365; // línea donde pisan los personajes
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const sceneFrames = cartoonScenes.map((s) =>
  Math.ceil(((timing as Record<string, number>)[s.id] + PAD) * FPS),
);
const totalFrames = sceneFrames.reduce((a, b) => a + b, 0);

// ---------- utilidades ----------
const L = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

const between = (f: number, a: number, b: number) => f >= a && f < b;

const pop = (f: number, delay: number) =>
  spring({ frame: f - delay, fps: FPS, config: { damping: 11, stiffness: 150 } });

// salto en arco: 0 → alto → 0 entre a y b
const hop = (f: number, a: number, b: number, height: number) =>
  between(f, a, b) ? Math.sin(((f - a) / (b - a)) * Math.PI) * height : 0;

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

// Personaje colocado en la escena: x = borde izquierdo, lift = altura sobre el suelo.
const Actor: React.FC<CharacterProps & { x: number; lift?: number; ground?: number }> = ({
  x,
  lift = 0,
  ground = GROUND,
  ...props
}) => {
  const s = props.scale ?? 1;
  return (
    <div style={{ position: "absolute", left: x, top: ground - 400 * s - lift }}>
      <Character {...props} />
    </div>
  );
};

// Capa SVG a pantalla completa
const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {children}
    </svg>
  </AbsoluteFill>
);

// ---------- fondos ----------
const Sky: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }} />
);

const Clouds: React.FC<{ frame: number; y?: number }> = ({ frame, y = 430 }) => (
  <g fill="rgba(255,255,255,0.6)">
    {[0, 1, 2].map((i) => {
      const x = ((frame * (0.6 + i * 0.3) + i * 420) % 1400) - 200;
      return (
        <g key={i} transform={`translate(${x} ${y + i * 110})`}>
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

const Capitol: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g fill="rgba(255,255,255,0.95)" transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={250} width={400} height={120} />
    <rect x={130} y={170} width={140} height={90} />
    <path d="M130 175 Q200 40 270 175 Z" />
    <rect x={192} y={10} width={16} height={60} />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={14 + i * 44} y={270} width={14} height={90} fill="rgba(30,64,175,0.35)" />
    ))}
    <rect x={170} y={290} width={60} height={80} fill="#1e3a8a" />
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

const Pyramid: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={i * 50} y={(5 - i) * 70} width={580 - i * 100} height={72} fill={i % 2 ? "#a16207" : "#b45309"} />
    ))}
    <rect x={250} y={-60} width={80} height={60} fill="#92400e" />
  </g>
);

const Tepuis: React.FC = () => (
  <g opacity={0.8}>
    <path d="M-40 1400 L40 900 L460 880 L540 1400 Z" fill="#475569" />
    <path d="M520 1400 L600 1000 L1000 980 L1100 1400 Z" fill="#334155" />
  </g>
);

// ---------- utilería ----------
const PatrolCar: React.FC<{ x: number; y: number; frame: number; s?: number; flip?: boolean }> = ({ x, y, frame, s = 1, flip }) => {
  const on = Math.floor(frame / 5) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x={0} y={40} width={300} height={80} rx={22} fill="#f8fafc" />
      <path d="M60 40 L95 0 L215 0 L250 40 Z" fill="#e2e8f0" />
      <rect x={100} y={8} width={50} height={30} rx={6} fill="#7dd3fc" />
      <rect x={160} y={8} width={50} height={30} rx={6} fill="#7dd3fc" />
      <rect x={0} y={78} width={300} height={16} fill="#15803d" />
      <rect x={120} y={-18} width={30} height={18} rx={5} fill={on ? "#ef4444" : "#7f1d1d"} />
      <rect x={150} y={-18} width={30} height={18} rx={5} fill={on ? "#1e3a8a" : "#3b82f6"} />
      {on ? <circle cx={135} cy={-10} r={34} fill="rgba(239,68,68,0.35)" /> : <circle cx={165} cy={-10} r={34} fill="rgba(59,130,246,0.35)" />}
      <circle cx={70} cy={122} r={28} fill="#111827" />
      <circle cx={230} cy={122} r={28} fill="#111827" />
      <circle cx={70} cy={122} r={10} fill="#9ca3af" />
      <circle cx={230} cy={122} r={10} fill="#9ca3af" />
    </g>
  );
};

const ResidencyCard: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-90} y={-58} width={180} height={116} rx={14} fill="#16a34a" stroke="#fff" strokeWidth={5} />
    <circle cx={-48} cy={-6} r={24} fill="#fef3c7" />
    <rect x={-14} y={-24} width={84} height={10} rx={5} fill="#fff" />
    <rect x={-14} y={-4} width={64} height={10} rx={5} fill="#fff" />
    <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill="#fff">
      RESIDENCIA
    </text>
  </g>
);

const Confetti: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  if (frame < start) return null;
  const colors = ["#f43f5e", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];
  return (
    <g>
      {Array.from({ length: 60 }).map((_, i) => {
        const f = frame - start;
        const x = (i * 137) % W + Math.sin((f + i * 7) / 8) * 30;
        const y = -40 + ((f * (8 + (i % 5)) + i * 53) % 1500);
        return <rect key={i} x={x} y={y} width={18} height={10} fill={colors[i % 5]} transform={`rotate(${f * 6 + i * 20} ${x} ${y})`} />;
      })}
    </g>
  );
};

const Fence: React.FC<{ x: number; rise: number }> = ({ x, rise }) => (
  <g transform={`translate(${x} ${GROUND}) scale(1 ${rise})`}>
    {Array.from({ length: 7 }).map((_, i) => (
      <rect key={i} x={i * 22} y={-600} width={14} height={600} fill="#57534e" />
    ))}
    <rect x={-6} y={-610} width={160} height={16} fill="#44403c" />
  </g>
);

const Boat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={150} y={-330} width={10} height={300} fill="#78350f" />
    <path d="M165 -320 L165 -60 L330 -60 Z" fill="#f8fafc" />
    <path d="M0 0 L420 0 L360 90 L60 90 Z" fill="#92400e" />
    <rect x={0} y={0} width={420} height={14} fill="#78350f" />
  </g>
);

const Sea: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={0} y={1180} width={W} height={220} fill="#0ea5e9" />
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M${i * 150 - 150 + ((frame * 2) % 150)} 1250 q40 -20 80 0`} stroke="rgba(255,255,255,0.7)" strokeWidth={6} fill="none" />
    ))}
  </g>
);

const Sand: React.FC = () => <path d="M420 1400 Q760 1300 1080 1330 L1080 1920 L0 1920 L0 1420 Z" fill="#fde68a" />;

const Calendar: React.FC<{ x: number; y: number; frame: number; start: number; s: number }> = ({ x, y, frame, start, s }) => {
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const idx = Math.floor(L(frame, start + 10, start + 70, 0, 12));
  const done = idx >= 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-110} y={-110} width={220} height={220} rx={22} fill="#fff" stroke="#e5e7eb" strokeWidth={4} />
      <rect x={-110} y={-110} width={220} height={62} rx={22} fill="#dc2626" />
      <rect x={-70} y={-126} width={14} height={36} rx={7} fill="#374151" />
      <rect x={56} y={-126} width={14} height={36} rx={7} fill="#374151" />
      <text x={0} y={-66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
        {done ? "¡1 AÑO!" : "CALENDARIO"}
      </text>
      <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={done ? 92 : 70} fill={done ? "#16a34a" : "#111827"}>
        {done ? "✓" : months[Math.min(idx, 11)]}
      </text>
    </g>
  );
};

const Sign: React.FC<{ x: number; y: number; text: string; s: number }> = ({ x, y, text, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={0} width={24} height={240} fill="#78350f" />
    <rect x={-170} y={-110} width={340} height={130} rx={14} fill="#fbbf24" stroke="#92400e" strokeWidth={8} />
    <text x={0} y={-25} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#78350f">
      {text}
    </text>
  </g>
);

const Stamp: React.FC<{ x: number; y: number; s: number; text: string }> = ({ x, y, s, text }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(-12) scale(${s})`} opacity={Math.min(1, s)}>
      <rect x={-235} y={-52} width={470} height={104} rx={14} fill="rgba(220,38,38,0.12)" stroke="#dc2626" strokeWidth={10} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill="#dc2626">
        {text}
      </text>
    </g>
  );

const WoodFrame: React.FC<{ x: number; frame: number }> = ({ x, frame }) => {
  const shake = Math.sin(frame / 1.25) * 1.5;
  return (
    <g transform={`translate(${x + shake} 0)`}>
      <rect x={0} y={1000} width={20} height={365} fill="#b45309" />
      <rect x={130} y={1000} width={20} height={365} fill="#b45309" />
      <rect x={-10} y={990} width={170} height={22} fill="#92400e" />
      <rect x={0} y={1180} width={150} height={18} fill="#a16207" transform="rotate(-28 75 1189)" />
    </g>
  );
};

const Crops: React.FC<{ x: number; grow: number }> = ({ x, grow }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${x + i * 48} ${GROUND}) scale(${grow})`}>
        <rect x={-4} y={-110} width={8} height={110} fill="#15803d" />
        <ellipse cx={-20} cy={-70} rx={22} ry={10} fill="#22c55e" />
        <ellipse cx={20} cy={-90} rx={22} ry={10} fill="#22c55e" />
        <circle cx={0} cy={-118} r={14} fill="#ef4444" />
      </g>
    ))}
  </g>
);

const GradCap: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <polygon points="-80,0 0,-34 80,0 0,34" fill="#111827" />
    <rect x={-40} y={6} width={80} height={30} rx={6} fill="#111827" />
    <line x1={60} y1={0} x2={70} y2={50} stroke="#facc15" strokeWidth={6} />
    <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#facc15">
      DACA
    </text>
  </g>
);

const Rain: React.FC<{ frame: number; amount?: number }> = ({ frame, amount = 70 }) => (
  <g stroke="rgba(191,219,254,0.85)" strokeWidth={5} strokeLinecap="round">
    {Array.from({ length: amount }).map((_, i) => {
      const x = (i * 97) % (W + 100) - 50;
      const y = ((frame * 28 + i * 211) % 1500) + 300;
      return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} />;
    })}
  </g>
);

const Umbrella: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-6} y={0} width={12} height={380} fill="#374151" />
    <path d="M-330 0 Q-330 -230 0 -240 Q330 -230 330 0 Q275 -40 220 0 Q165 -40 110 0 Q55 -40 0 0 Q-55 -40 -110 0 Q-165 -40 -220 0 Q-275 -40 -330 0 Z" fill="#0ea5e9" stroke="#0369a1" strokeWidth={6} />
    <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#fff">
      TPS
    </text>
  </g>
);

const Courthouse: React.FC<{ x: number; frame: number; bangStart: number }> = ({ x, frame, bangStart }) => {
  const bang = frame > bangStart ? Math.max(0, Math.sin((frame - bangStart) / 3)) * 40 : 0;
  return (
    <g transform={`translate(${x} 0)`}>
      <polygon points="-10,960 150,860 310,960" fill="#e5e7eb" />
      <rect x={0} y={960} width={300} height={30} fill="#f3f4f6" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={20 + i * 76} y={990} width={34} height={330} fill="#f9fafb" />
      ))}
      <rect x={-10} y={1320} width={320} height={45} fill="#d1d5db" />
      <text x={150} y={945} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#374151">
        TRIBUNAL
      </text>
      {/* mazo */}
      <g transform={`translate(150 790) rotate(${-30 + bang})`}>
        <rect x={-10} y={-10} width={130} height={20} rx={8} fill="#92400e" />
        <rect x={100} y={-38} width={56} height={76} rx={10} fill="#78350f" />
      </g>
      <rect x={60} y={820} width={180} height={26} rx={8} fill="#78350f" />
    </g>
  );
};

const FloatingHearts: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {Array.from({ length: 16 }).map((_, i) => {
      const x = (i * 151) % W;
      const y = 1900 - ((frame * (6 + (i % 4)) + i * 140) % 1700);
      const s = 0.8 + (i % 3) * 0.3;
      return (
        <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 30 L-28 2 A16 16 0 0 1 0 -18 A16 16 0 0 1 28 2 Z" fill={i % 2 ? "#fb7185" : "#f472b6"} opacity={0.85} />
      );
    })}
  </g>
);

const Icon: React.FC<{ kind: "heart" | "plus" | "share"; label: string; delay: number }> = ({ kind, label, delay }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, delay);
  const pulse = 1 + Math.sin((frame - delay) / 5) * 0.06;
  return (
    <div style={{ textAlign: "center", transform: `scale(${p * pulse})`, fontFamily: FONT }}>
      <svg width={190} height={190} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={48} fill={kind === "heart" ? "#ef4444" : kind === "plus" ? "#ec4899" : "#22c55e"} />
        {kind === "heart" ? <path d="M50 76 L26 52 A13 13 0 0 1 50 34 A13 13 0 0 1 74 52 Z" fill="#fff" /> : null}
        {kind === "plus" ? (
          <g stroke="#fff" strokeWidth={10} strokeLinecap="round">
            <line x1={50} y1={28} x2={50} y2={72} />
            <line x1={28} y1={50} x2={72} y2={50} />
          </g>
        ) : null}
        {kind === "share" ? <path d="M30 70 Q34 44 58 42 L58 30 L78 50 L58 70 L58 56 Q40 56 30 70 Z" fill="#fff" /> : null}
      </svg>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 44, marginTop: 8, textShadow: "0 3px 8px rgba(0,0,0,0.4)" }}>{label}</div>
    </div>
  );
};

// ---------- escenas con acción ----------
const IntroScene: React.FC = () => {
  const f = useCurrentFrame();
  const flagRise = L(f, 0, 75, 430, 0);
  const cubX = L(f, 0, 70, -320, 60);
  const venX = L(f, 10, 80, 1400, 740);
  const mexLift = (1 - pop(f, 35)) * 1100 + hop(f, 90, 110, 70) + hop(f, 150, 170, 70);
  return (
    <>
      <Sky top="#38bdf8" bottom="#bae6fd" />
      <Layer>
        <Clouds frame={f} />
        <Ground color="#4ade80" />
        <rect x={533} y={500} width={14} height={880} rx={6} fill="#a8a29e" />
      </Layer>
      <div style={{ position: "absolute", left: 547, top: 510 + flagRise }}>
        <Flag country="usa" width={260} frame={f} />
      </div>
      <Actor x={cubX} frame={f} {...cubano} scale={1.25} walking={f < 70} pose="wave" />
      <Actor x={400} lift={mexLift} frame={f} {...mexicano} scale={1.25} pose={f < 60 ? "cheer" : "wave"} phase={11} />
      <Actor x={venX} frame={f} {...venezolana} scale={1.25} walking={between(f, 10, 80)} flip={between(f, 10, 80)} pose="wave" phase={23} />
    </>
  );
};

const DemoScene: React.FC = () => {
  const f = useCurrentFrame();
  const xs = [40, 400, 760];
  const arrive = [55, 95, 135];
  const scale = 1.15;
  const door = { x: 540, y: 1080 };
  return (
    <>
      <Sky top="#1d4ed8" bottom="#93c5fd" />
      <Layer>
        <Clouds frame={f} />
        <Capitol x={340} y={700} s={1} />
        <Ground color="#86efac" />
      </Layer>
      {[cubano, mexicano, venezolana].map((p, i) => {
        const got = f >= arrive[i];
        const lift = hop(f, arrive[i], arrive[i] + 18, 110) + (f > 160 ? hop(f, 160 + i * 8, 180 + i * 8, 80) : 0);
        return (
          <Actor
            key={i}
            x={xs[i]}
            lift={lift}
            frame={f}
            {...p}
            flag={undefined}
            scale={scale}
            pose={got ? "hold" : "idle"}
            phase={i * 9}
          />
        );
      })}
      <Layer>
        {[0, 1, 2].map((i) => {
          const a = arrive[i] - 30;
          if (f < a) return null;
          const headX = xs[i] + 110 * scale;
          const headY = GROUND - 400 * scale - 20;
          const lift = hop(f, arrive[i], arrive[i] + 18, 110) + (f > 160 ? hop(f, 160 + i * 8, 180 + i * 8, 80) : 0);
          const x = L(f, a, arrive[i], door.x, headX);
          const y = L(f, a, arrive[i], door.y, headY) - Math.sin(L(f, a, arrive[i], 0, Math.PI)) * 260 - (f >= arrive[i] ? lift : 0);
          const r = f < arrive[i] ? (f - a) * 24 : 0;
          return <ResidencyCard key={i} x={x} y={y} r={r} s={0.9} />;
        })}
        <Confetti frame={f} start={150} />
      </Layer>
    </>
  );
};

const RepScene: React.FC = () => {
  const f = useCurrentFrame();
  const rise = L(f, 45, 80, 0, 1);
  const carX = L(f, 80, 130, 1300, 800);
  const turn = f >= 150;
  const back = L(f, 150, 216, 0, -520);
  const xs = [20, 240, 460];
  return (
    <>
      <Sky top="#b91c1c" bottom="#fca5a5" />
      <Layer>
        <Clouds frame={f} />
        <Ground color="#d6d3d1" />
        <Fence x={700} rise={rise} />
        <PatrolCar x={carX} y={1205} frame={f} s={0.85} />
      </Layer>
      {[cubano, mexicano, venezolana].map((p, i) => (
        <Actor
          key={i}
          x={L(f, 0, 70, xs[i] - 700, xs[i]) + back}
          frame={f}
          {...p}
          flag={undefined}
          scale={1.1}
          walking={f < 70 || turn}
          flip={turn}
          mood={f > 80 ? "worried" : "happy"}
          pose="idle"
          phase={i * 9}
        />
      ))}
    </>
  );
};

const CubaScene: React.FC = () => {
  const f = useCurrentFrame();
  const boatX = L(f, 0, 90, -520, 60);
  const bob = Math.sin(f / 8) * 8;
  const boatY = 1255 + bob;
  const inBoat = f < 90;
  const jumpX = L(f, 90, 115, boatX + 110, 420);
  const walkX = L(f, 115, 150, 420, 560);
  const x = inBoat ? boatX + 110 : f < 115 ? jumpX : walkX;
  const baseLift = inBoat ? GROUND - boatY + 10 : L(f, 90, 115, GROUND - 1255 + 10, 0);
  const lift = baseLift + hop(f, 90, 115, 160) + hop(f, 205, 222, 100);
  const cardIn = f >= 180;
  const cardX = L(f, 180, 205, 830, 560 + 110 * 1.25);
  const cardY = L(f, 180, 205, 620, GROUND - 400 * 1.25 - 20) - (f >= 205 ? hop(f, 205, 222, 100) : 0);
  const stampS = f >= 245 ? interpolate(pop(f, 245), [0, 1], [3, 1]) : 0;
  return (
    <>
      <Sky top="#0284c7" bottom="#7dd3fc" />
      <Layer>
        <Clouds frame={f} />
        <Sea frame={f} />
        <Sand />
        <Palm x={980} frame={f} flip />
        {f >= 100 ? <Calendar x={830} y={640} frame={f} start={100} s={pop(f, 100)} /> : null}
        {f >= 215 ? <Sign x={250} y={640} text="PAROLE" s={pop(f, 215)} /> : null}
        <Stamp x={250} y={740} s={stampS * 0.85} text="TERMINÓ 2025" />
      </Layer>
      <Actor
        x={x}
        lift={lift}
        frame={f}
        {...cubano}
        flag={undefined}
        scale={1.25}
        walking={between(f, 115, 150)}
        pose={inBoat ? "wave" : f >= 205 && f < 245 ? "hold" : f >= 245 ? "idle" : "wave"}
        mood={f >= 250 ? "worried" : "happy"}
      />
      <Layer>
        <Boat x={boatX} y={boatY} />
        {cardIn ? <ResidencyCard x={cardX} y={cardY} r={f < 205 ? (f - 180) * 15 : 0} s={0.9} /> : null}
      </Layer>
    </>
  );
};

const MexicoScene: React.FC = () => {
  const f = useCurrentFrame();
  const worried = f >= 215;
  const grow = L(f, 0, 60, 0.2, 1);
  const capUp = between(f, 110, 170);
  const capY = GROUND - 400 * 1.0 + 30 - hop(f, 110, 170, 420);
  const carX = L(f, 195, 300, 1200, -400);
  return (
    <>
      <Sky top="#f97316" bottom="#fde68a" />
      <Layer>
        <Clouds frame={f} />
        <Pyramid x={480} y={830} s={0.9} />
        <Ground color="#d9a066" />
        {f >= 195 ? <PatrolCar x={carX} y={1150} frame={f} s={0.7} flip /> : null}
        <WoodFrame x={240} frame={worried ? 0 : f} />
        <Crops x={640} grow={grow} />
      </Layer>
      <Actor x={10} frame={f} {...mexicano} flag={undefined} skin="#c08552" hair="#2b1b10" shirt="#CE1126" hat="hardhat" scale={1.0} pose={worried ? "idle" : "hammer"} mood={worried ? "worried" : "happy"} />
      <Actor x={420} frame={f} {...mexicano} flag={undefined} hat="straw" scale={1.0} pose={worried ? "idle" : "pick"} mood={worried ? "worried" : "happy"} phase={7} />
      <Actor
        x={830}
        lift={hop(f, 110, 130, 60)}
        frame={f}
        {...mexicano}
        flag={undefined}
        skin="#e0ac69"
        shirt="#1e3a8a"
        scale={1.0}
        pose={capUp ? "cheer" : worried ? "idle" : "wave"}
        mood={worried ? "worried" : "happy"}
        phase={15}
      />
      <Layer>
        <GradCap x={830 + 110} y={capY} r={capUp ? (f - 110) * 12 : 0} />
      </Layer>
    </>
  );
};

const VenezuelaScene: React.FC = () => {
  const f = useCurrentFrame();
  const gone = f >= 140;
  const ux = L(f, 140, 185, 470, 1500);
  const uy = L(f, 140, 185, 860, -300);
  const ur = L(f, 140, 185, 0, 70) + (gone ? 0 : Math.sin(f / 10) * 3);
  const courtX = L(f, 195, 230, 1200, 740);
  return (
    <>
      <Sky top="#475569" bottom="#cbd5e1" />
      <Layer>
        <Tepuis />
        <Ground color="#65a30d" />
        <Rain frame={f} />
        {f >= 195 ? <Courthouse x={courtX} frame={f} bangStart={235} /> : null}
      </Layer>
      <Actor x={140} frame={f} {...venezolana} flag={undefined} scale={1.15} pose="idle" mood={gone ? "worried" : "happy"} />
      <Actor
        x={420}
        frame={f}
        {...venezolana}
        flag={undefined}
        skin="#c68642"
        hair="#111"
        shirt="#CF142B"
        hat="cap"
        scale={1.15}
        pose="idle"
        mood={gone ? "worried" : "happy"}
        phase={14}
      />
      <Layer>
        <Umbrella x={ux} y={uy} r={ur} />
        {gone ? <Rain frame={f + 7} amount={30} /> : null}
      </Layer>
    </>
  );
};

const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Sky top="#7c3aed" bottom="#f472b6" />
      <Layer>
        <FloatingHearts frame={f} />
        {Array.from({ length: 12 }).map((_, i) => (
          <polygon key={i} points={starPoints((i * 173) % W, 300 + ((i * 251 + f * 3) % 1500), 14)} fill="rgba(255,255,255,0.5)" />
        ))}
      </Layer>
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 50 }}>
        <Icon kind="plus" label="Sígueme" delay={4} />
        <Icon kind="heart" label="Me gusta" delay={30} />
        <Icon kind="share" label="Comparte" delay={60} />
      </div>
      {[cubano, mexicano, venezolana].map((p, i) => (
        <Actor
          key={i}
          x={[60, 400, 740][i]}
          lift={Math.max(0, Math.sin((f + i * 10) / 6)) * 90}
          frame={f}
          {...p}
          scale={1.25}
          pose="cheer"
          phase={i * 10}
        />
      ))}
    </>
  );
};

const SceneArt: React.FC<{ kind: SceneKind }> = ({ kind }) => {
  switch (kind) {
    case "intro":
      return <IntroScene />;
    case "demo":
      return <DemoScene />;
    case "rep":
      return <RepScene />;
    case "cuba":
      return <CubaScene />;
    case "mexico":
      return <MexicoScene />;
    case "venezuela":
      return <VenezuelaScene />;
    case "cta":
      return <CtaScene />;
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
  const p = pop(frame, 0);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const dark = titleColor[scene.id] === "#fbbf24";

  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: "hidden" }}>
      <Audio src={staticFile(`audio/cartoon/${scene.id}.mp3`)} />
      <SceneArt kind={scene.id} />

      <div style={{ position: "absolute", top: 200, left: 50, right: 50, textAlign: "center", transform: `scale(${p})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 66,
            lineHeight: 1.1,
            color: dark ? "#111827" : "#fff",
            background: titleColor[scene.id],
            padding: "14px 32px",
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
