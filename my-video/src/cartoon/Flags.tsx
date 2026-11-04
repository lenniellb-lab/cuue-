import React from "react";

export type Country = "cuba" | "mexico" | "venezuela" | "usa";

// Estrella de cinco puntas centrada en (cx, cy).
export const starPoints = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`);
  }
  return pts.join(" ");
};

const FlagArt: React.FC<{ country: Country }> = ({ country }) => {
  switch (country) {
    case "cuba":
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={0} y={i * 40} width={300} height={40} fill={i % 2 === 0 ? "#002A8F" : "#FFFFFF"} />
          ))}
          <polygon points="0,0 173,100 0,200" fill="#CF142B" />
          <polygon points={starPoints(58, 100, 30)} fill="#FFFFFF" />
        </g>
      );
    case "mexico":
      return (
        <g>
          <rect x={0} y={0} width={100} height={200} fill="#006847" />
          <rect x={100} y={0} width={100} height={200} fill="#FFFFFF" />
          <rect x={200} y={0} width={100} height={200} fill="#CE1126" />
          {/* Escudo simplificado: águila sobre nopal */}
          <path d="M122 128 Q150 150 178 128" stroke="#2e7d32" strokeWidth={6} fill="none" />
          <ellipse cx={150} cy={100} rx={20} ry={24} fill="#8B5A2B" />
          <circle cx={150} cy={74} r={10} fill="#8B5A2B" />
          <path d="M138 84 L120 70 M162 84 L180 70" stroke="#8B5A2B" strokeWidth={7} strokeLinecap="round" />
        </g>
      );
    case "venezuela":
      return (
        <g>
          <rect x={0} y={0} width={300} height={67} fill="#FFCC00" />
          <rect x={0} y={67} width={300} height={66} fill="#00247D" />
          <rect x={0} y={133} width={300} height={67} fill="#CF142B" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = Math.PI * (1.15 + (i * 0.7) / 7);
            return (
              <polygon key={i} points={starPoints(150 + 52 * Math.cos(a), 128 + 52 * Math.sin(a), 8)} fill="#FFFFFF" />
            );
          })}
        </g>
      );
    case "usa":
      return (
        <g>
          {Array.from({ length: 13 }).map((_, i) => (
            <rect key={i} x={0} y={(i * 200) / 13} width={300} height={200 / 13 + 0.5} fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"} />
          ))}
          <rect x={0} y={0} width={130} height={(200 / 13) * 7} fill="#3C3B6E" />
          {Array.from({ length: 20 }).map((_, i) => (
            <circle key={i} cx={14 + (i % 5) * 25} cy={13 + Math.floor(i / 5) * 25} r={4} fill="#FFFFFF" />
          ))}
        </g>
      );
  }
};

// Bandera que ondea: se dibuja en franjas verticales desplazadas con una onda.
export const Flag: React.FC<{ country: Country; width: number; frame: number; wave?: number }> = ({
  country,
  width,
  frame,
  wave = 1,
}) => {
  const slices = 12;
  const id = `flag-${country}`;
  return (
    <svg width={width} height={(width * 2) / 3 + 24} viewBox="0 -12 300 224" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={0} width={300} height={200} rx={6} />
        </clipPath>
      </defs>
      {Array.from({ length: slices }).map((_, i) => {
        const x = (i * 300) / slices;
        const dy = Math.sin(frame / 6 - i * 0.6) * 7 * wave * (i / slices);
        return (
          <svg key={i} x={x} y={dy} width={300 / slices + 1} height={200} viewBox={`${x} 0 ${300 / slices + 1} 200`}>
            <g clipPath={`url(#${id}-clip)`}>
              <FlagArt country={country} />
            </g>
          </svg>
        );
      })}
    </svg>
  );
};
