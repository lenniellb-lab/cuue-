export type SceneKind = "intro" | "demo" | "rep" | "cuba" | "mexico" | "venezuela" | "cta";

export type CartoonScene = {
  id: SceneKind;
  title: string;
  narration: string;
};

// Guion (~1 min). Posturas generales de cada partido y situación de cada comunidad.
// Datos de programas migratorios a 2025; verifica su estado actual en fuentes oficiales.
export const cartoonScenes: CartoonScene[] = [
  {
    id: "intro",
    title: "Cuba · México · Venezuela",
    narration:
      "¿Qué pasa con los inmigrantes cubanos, mexicanos y venezolanos según quién gane? Te lo explico en un minuto.",
  },
  {
    id: "demo",
    title: "Si ganan los demócratas",
    narration:
      "Los demócratas suelen apoyar un camino a la ciudadanía, la protección de DACA y programas humanitarios como el TPS y el parole.",
  },
  {
    id: "rep",
    title: "Si ganan los republicanos",
    narration:
      "Los republicanos suelen priorizar el control de la frontera, más deportaciones y el fin de esos programas temporales.",
  },
  {
    id: "cuba",
    title: "Cubanos",
    narration:
      "Los cubanos tienen la Ley de Ajuste Cubano, que les permite pedir la residencia después de un año en el país. Pero el parole humanitario terminó en 2025.",
  },
  {
    id: "mexico",
    title: "Mexicanos",
    narration:
      "Los mexicanos son el grupo de inmigrantes más grande de Estados Unidos, y la mayoría de los beneficiarios de DACA. Las deportaciones y la frontera son lo que más los afecta.",
  },
  {
    id: "venezuela",
    title: "Venezolanos",
    narration:
      "Muchos venezolanos dependían del TPS, que el gobierno republicano canceló en 2025. Su futuro depende de los tribunales y del Congreso.",
  },
  {
    id: "cta",
    title: "¡Sígueme para más!",
    narration: "Sígueme para más videos, dale me gusta y comparte con quien lo necesite.",
  },
];

export const cartoonDisclaimer =
  "Contenido informativo · Voz sintética · Verifica en fuentes oficiales";
