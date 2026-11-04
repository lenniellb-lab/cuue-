export type Clip = { src: string; seconds: number };

export type Scene = {
  id: string;
  title: string;
  narration: string;
  clips: Clip[]; // b-roll de archivo; el último clip cubre el resto de la escena
};

// Versión corta para TikTok (~50 s). Resume posturas tradicionales de cada partido.
// Son escenarios, no predicciones. Verifica las propuestas vigentes en fuentes oficiales.
// Imágenes de archivo ilustrativas (ver CREDITS.md).
export const scenes: Scene[] = [
  {
    id: "intro",
    title: "¿Qué cambia según quién gane?",
    narration:
      "Qué cambia en inmigración según quién gane. Estas son las posturas tradicionales de cada partido.",
    clips: [
      { src: "broll/oath_hands.mp4", seconds: 3.0 },
      { src: "broll/wall_work3.mp4", seconds: 6.0 },
    ],
  },
  {
    id: "demo",
    title: "Si ganan los demócratas",
    narration:
      "Si ganan los demócratas, suelen proponer un camino a la ciudadanía para millones de personas indocumentadas, y más protección para jóvenes como los beneficiarios de DACA. Sus críticos advierten de más migración irregular.",
    clips: [
      { src: "broll/salute_flag.mp4", seconds: 6.0 },
      { src: "broll/certificate.mp4", seconds: 2.3 },
      { src: "broll/salute_flag2.mp4", seconds: 4.85 },
      { src: "broll/stage_handshake.mp4", seconds: 2.3 },
    ],
  },
  {
    id: "rep",
    title: "Si ganan los republicanos",
    narration:
      "Si ganan los republicanos, suelen priorizar el control de la frontera y más deportaciones de personas sin estatus legal. Sus críticos advierten de efectos en la agricultura y la construcción.",
    clips: [
      { src: "broll/border_aerial.mp4", seconds: 4.0 },
      { src: "broll/wall_work.mp4", seconds: 5.86 },
      { src: "broll/border_field.mp4", seconds: 3.5 },
    ],
  },
  {
    id: "cierre",
    title: "Antes de decidir",
    narration:
      "Ambos partidos dicen que el sistema necesita reformas. Antes de decidir, revisa las plataformas oficiales y fuentes independientes. Video informativo con voz sintética.",
    clips: [
      { src: "broll/salute_flag3.mp4", seconds: 4.0 },
      { src: "broll/wall_work2.mp4", seconds: 6.0 },
      { src: "broll/mountain.mp4", seconds: 4.3 },
    ],
  },
];

export const credits =
  "Imágenes de archivo ilustrativas: U.S. Navy y U.S. Customs and Border Protection (dominio público); Mount Rainier National Park (CC BY 3.0). Voz sintética.";
