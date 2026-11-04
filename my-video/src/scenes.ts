export type Scene = {
  id: string;
  title: string;
  bullets: string[];
  narration: string;
};

// Versión corta para TikTok (~50 s). Resume posturas tradicionales de cada partido.
// Son escenarios, no predicciones. Verifica las propuestas vigentes en fuentes oficiales.
export const scenes: Scene[] = [
  {
    id: "intro",
    title: "Qué cambia según quién gane",
    bullets: ["Posturas tradicionales de cada partido sobre inmigración"],
    narration:
      "Qué cambia en inmigración según quién gane. Estas son las posturas tradicionales de cada partido.",
  },
  {
    id: "demo",
    title: "Si ganan los demócratas",
    bullets: [
      "Camino a la ciudadanía para millones de personas indocumentadas",
      "Protección para jóvenes como los beneficiarios de DACA",
    ],
    narration:
      "Si ganan los demócratas, suelen proponer un camino a la ciudadanía para millones de personas indocumentadas, y más protección para jóvenes como los beneficiarios de DACA. Sus críticos advierten de más migración irregular.",
  },
  {
    id: "rep",
    title: "Si ganan los republicanos",
    bullets: [
      "Más control de la frontera",
      "Más deportaciones de personas sin estatus legal",
    ],
    narration:
      "Si ganan los republicanos, suelen priorizar el control de la frontera y más deportaciones de personas sin estatus legal. Sus críticos advierten de efectos en la agricultura y la construcción.",
  },
  {
    id: "cierre",
    title: "Antes de decidir",
    bullets: [
      "Revisa las plataformas oficiales de cada partido",
      "Consulta fuentes independientes",
    ],
    narration:
      "Ambos partidos dicen que el sistema necesita reformas. Antes de decidir, revisa las plataformas oficiales y fuentes independientes. Video informativo con voz sintética.",
  },
];
