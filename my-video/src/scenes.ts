export type Scene = {
  id: string;
  title: string;
  bullets: string[];
  narration: string;
};

// Guion informativo: resume posturas tradicionales de cada partido en inmigración.
// Son escenarios, no predicciones. Verifica las propuestas vigentes en las fuentes oficiales.
export const scenes: Scene[] = [
  {
    id: "intro",
    title: "Qué podría cambiar según quién gane",
    bullets: [
      "Resumen de posturas de demócratas y republicanos",
      "Escenarios generales, no predicciones",
    ],
    narration:
      "Qué podría cambiar en Estados Unidos según quién gane. Este video resume las posturas tradicionales de los dos grandes partidos sobre inmigración. Son escenarios generales, no predicciones.",
  },
  {
    id: "demo",
    title: "Si ganan los demócratas",
    bullets: [
      "Camino a la ciudadanía para millones de personas indocumentadas",
      "Protección para jóvenes llegados de niños, como los beneficiarios de DACA",
      "Más recursos para procesar solicitudes de asilo",
    ],
    narration:
      "Si ganan los demócratas, suelen proponer un camino a la ciudadanía para millones de personas indocumentadas, protección para jóvenes llegados de niños, y más recursos para procesar solicitudes de asilo. Sus defensores dicen que esto fortalecería la economía y a las familias. Sus críticos advierten de más incentivos a la migración irregular y de costos fiscales.",
  },
  {
    id: "rep",
    title: "Si ganan los republicanos",
    bullets: [
      "Más control fronterizo y muros o tecnología en la frontera",
      "Ampliación de deportaciones de personas sin estatus legal",
      "Límites a algunas vías de inmigración legal",
    ],
    narration:
      "Si ganan los republicanos, suelen priorizar el control de la frontera, ampliar las deportaciones de personas sin estatus legal, y limitar algunas vías de inmigración legal. Sus defensores dicen que esto protege empleos y la seguridad. Sus críticos advierten de efectos en sectores como la agricultura y la construcción, y en familias con miembros de distintos estatus migratorios.",
  },
  {
    id: "practica",
    title: "Qué cambia en la práctica",
    bullets: [
      "Estatus legal y tiempos de espera",
      "Reglas de asilo y protección temporal",
      "Decretos ejecutivos y decisiones de los tribunales",
    ],
    narration:
      "En la práctica, lo que pasaría depende de las leyes que realmente se aprueben, de los decretos ejecutivos y de lo que decidan los tribunales. Los cambios en estatus legal, tiempos de espera y reglas de asilo son los que más afectan la vida diaria de los inmigrantes.",
  },
  {
    id: "acuerdo",
    title: "Coincidencias y desacuerdos",
    bullets: [
      "Ambos partidos reconocen que el sistema migratorio necesita reformas",
      "La diferencia está en las prioridades: integración o control",
    ],
    narration:
      "Ambos partidos coinciden en que el sistema migratorio necesita reformas. La diferencia está en las prioridades: integración de quienes ya viven en el país, o control de la frontera y de la entrada.",
  },
  {
    id: "cierre",
    title: "Antes de decidir",
    bullets: [
      "Revisa las plataformas oficiales de cada partido",
      "Consulta fuentes independientes y datos de organismos oficiales",
    ],
    narration:
      "Antes de decidir, revisa las plataformas oficiales de cada partido y consulta fuentes independientes. Este video es informativo y fue generado con voz sintética.",
  },
];
