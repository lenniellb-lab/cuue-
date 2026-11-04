import { CalculateMetadataFunction, Composition } from "remotion";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Clip, credits, scenes } from "./scenes";
import timing from "./timing.json";

const FPS = 30;
const PAD_SECONDS = 1.0; // pausa entre escenas
// Formato vertical para TikTok (9:16)
const WIDTH = 1080;
const HEIGHT = 1920;
const FADE = 8; // frames de fundido entre clips

type Props = {};

// Duración de cada escena = duración de la narración + pausa.
const sceneFrames = scenes.map((s) =>
  Math.ceil(((timing as Record<string, number>)[s.id] + PAD_SECONDS) * FPS),
);
const totalFrames = sceneFrames.reduce((a, b) => a + b, 0);

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return { durationInFrames: totalFrames };
};

// Divide la narración en frases y reparte el tiempo de la escena según su longitud.
const splitSentences = (text: string) =>
  text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];

const captionAt = (sentences: string[], frame: number, total: number): string => {
  const lengths = sentences.map((s) => s.length);
  const sum = lengths.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < sentences.length; i++) {
    acc += (lengths[i] / sum) * total;
    if (frame < acc) return sentences[i];
  }
  return sentences[sentences.length - 1];
};

// Un clip de b-roll a pantalla completa con fundido de entrada y zoom lento.
const BRoll: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08]);
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }}
      />
    </AbsoluteFill>
  );
};

// Reparte los clips de una escena; el último ocupa lo que quede.
const clipLayout = (clips: Clip[], total: number) => {
  let from = 0;
  return clips.map((c, i) => {
    const len = i === clips.length - 1 ? total - from : Math.round(c.seconds * FPS);
    const item = { src: c.src, from, len };
    from += len;
    return item;
  });
};

const SceneView: React.FC<{
  title: string;
  narration: string;
  audio: string;
  clips: Clip[];
  showCredits: boolean;
}> = ({ title, narration, audio, clips, showCredits }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const titleIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [0, 12], [-30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile(audio)} />
      {clipLayout(clips, durationInFrames).map((c) => (
        <Sequence key={c.src + c.from} from={c.from} durationInFrames={c.len}>
          <BRoll src={c.src} />
        </Sequence>
      ))}

      {/* Degradados para que el texto se lea sobre cualquier imagen */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 210,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          opacity: titleIn,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "#fbbf24",
            color: "#111827",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.15,
            padding: "14px 30px",
            borderRadius: 18,
          }}
        >
          {title}
        </span>
      </div>

      {/* Subtítulos por frase, por encima de la zona de controles de TikTok */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 330,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          color: "#fff",
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.3,
          textAlign: "center",
          textShadow: "0 3px 10px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)",
        }}
      >
        {captionAt(splitSentences(narration), frame, durationInFrames - 1)}
      </div>

      {showCredits ? (
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            bottom: 200,
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            color: "rgba(255,255,255,0.85)",
            fontSize: 24,
            lineHeight: 1.35,
            textAlign: "center",
            textShadow: "0 2px 6px rgba(0,0,0,0.9)",
          }}
        >
          {credits}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const MyComponent: React.FC<Props> = () => {
  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Música de fondo en bucle, suave */}
      <Audio src={staticFile("audio/music.mp3")} loop volume={0.12} />
      {scenes.map((s, i) => {
        const from = offset;
        offset += sceneFrames[i];
        return (
          <Sequence key={s.id} from={from} durationInFrames={sceneFrames[i]}>
            <SceneView
              title={s.title}
              narration={s.narration}
              audio={`audio/${s.id}.mp3`}
              clips={s.clips}
              showCredits={i === scenes.length - 1}
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
