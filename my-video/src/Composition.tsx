import { CalculateMetadataFunction, Composition } from "remotion";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { scenes } from "./scenes";
import timing from "./timing.json";

const FPS = 30;
const PAD_SECONDS = 1.0; // pausa entre escenas
const WIDTH = 1280;
const HEIGHT = 720;

type Props = {};

// Duración de cada escena = duración de la narración + pausa.
const sceneFrames = scenes.map((s) =>
  Math.ceil(((timing as Record<string, number>)[s.id] + PAD_SECONDS) * FPS),
);
const totalFrames = sceneFrames.reduce((a, b) => a + b, 0);

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return { durationInFrames: totalFrames };
};

const SceneView: React.FC<{
  title: string;
  bullets: string[];
  narration: string;
  audio: string;
  index: number;
}> = ({ title, bullets, narration, audio, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const slide = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #7f1d1d 100%)",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        padding: 80,
        justifyContent: "center",
        opacity,
      }}
    >
      <Audio src={staticFile(audio)} />
      <div style={{ transform: `translateY(${slide}px)` }}>
        <div style={{ fontSize: 22, letterSpacing: 4, opacity: 0.7, textTransform: "uppercase" }}>
          {String(index + 1).padStart(2, "0")} · Inmigración en EE. UU.
        </div>
        <h1 style={{ fontSize: 60, margin: "18px 0 36px", lineHeight: 1.15 }}>{title}</h1>
        <ul style={{ fontSize: 32, lineHeight: 1.5, paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {bullets.map((b, i) => {
            const start = 25 + i * 20;
            const o = interpolate(frame, [start, start + 15], [0, 1], { extrapolateRight: "clamp" });
            return (
              <li key={i} style={{ opacity: o, marginBottom: 14 }}>
                <span style={{ color: "#fbbf24", marginRight: 14 }}>▸</span>
                {b}
              </li>
            );
          })}
        </ul>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 40,
          fontSize: 20,
          opacity: 0.6,
          lineHeight: 1.4,
        }}
      >
        {narration}
      </div>
    </AbsoluteFill>
  );
};

export const MyComponent: React.FC<Props> = () => {
  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      {/* Música de fondo en bucle, suave */}
      <Audio src={staticFile("audio/music.mp3")} loop volume={0.12} />
      {scenes.map((s, i) => {
        const from = offset;
        offset += sceneFrames[i];
        return (
          <Sequence key={s.id} from={from} durationInFrames={sceneFrames[i]}>
            <SceneView
              title={s.title}
              bullets={s.bullets}
              narration={s.narration}
              audio={`audio/${s.id}.mp3`}
              index={i}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const MyCompositionRoot = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComponent}
      durationInFrames={totalFrames}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      calculateMetadata={calculateMetadata}
    />
  );
};
