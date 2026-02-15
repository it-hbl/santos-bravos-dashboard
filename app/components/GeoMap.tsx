"use client";

import { useMemo, useState, useEffect } from "react";

interface GeoMapProps {
  countries: { name: string; flag: string; listeners: number; code?: string }[];
}

/**
 * GeoMap — Simplified SVG world map with animated pulsing dots
 * showing listener distribution across countries.
 * Uses a minimalist equirectangular projection with country centroids.
 */

// Approximate country centroids (lon, lat) for major markets
const COUNTRY_COORDS: Record<string, [number, number]> = {
  // Latin America
  "Mexico": [-102, 23],
  "Brasil": [-51, -10],
  "Brazil": [-51, -10],
  "Colombia": [-74, 4],
  "Argentina": [-64, -34],
  "Chile": [-71, -33],
  "Peru": [-76, -10],
  "Ecuador": [-78, -1.5],
  "Venezuela": [-66, 7],
  "Guatemala": [-90, 15],
  "Costa Rica": [-84, 10],
  "Dominican Republic": [-70, 19],
  "Puerto Rico": [-66, 18],
  "El Salvador": [-89, 14],
  "Honduras": [-87, 15],
  "Paraguay": [-58, -23],
  "Uruguay": [-56, -33],
  "Bolivia": [-65, -17],
  "Panama": [-80, 9],
  "Nicaragua": [-85, 13],
  // North America
  "United States": [-97, 38],
  "USA": [-97, 38],
  "Canada": [-106, 56],
  // Europe
  "Spain": [-4, 40],
  "Portugal": [-8, 39],
  "France": [2, 47],
  "Germany": [10, 51],
  "United Kingdom": [-2, 54],
  "Italy": [12, 43],
  "Netherlands": [5, 52],
  // Asia
  "South Korea": [128, 36],
  "Japan": [138, 36],
  "Philippines": [122, 12],
  "Indonesia": [117, -2],
  "India": [79, 21],
  "Thailand": [101, 15],
  // Other
  "Australia": [134, -25],
  "Turkey": [35, 39],
};

// Simplified world map outline as SVG path (equirectangular, viewBox 0 0 360 180)
// We use a super-simplified path that just suggests continents
const WORLD_PATH = `
M 30,35 Q 35,30 45,32 L 55,28 Q 60,25 70,27 L 80,30 Q 85,28 95,30 L 100,32 Q 110,30 115,35 L 118,40 Q 120,45 118,50 L 115,55 Q 112,58 108,55 L 100,50 Q 95,48 90,50 L 85,52 Q 80,55 75,52 L 70,48 Q 65,45 60,47 L 55,50 Q 50,52 45,50 L 40,45 Q 35,42 30,40 Z
M 120,35 Q 125,28 135,30 L 145,28 Q 155,25 165,30 L 170,35 Q 175,40 173,48 L 170,52 Q 168,55 165,52 L 160,48 Q 155,45 150,48 L 145,52 Q 140,55 135,52 L 130,48 Q 125,42 123,38 Z
M 170,25 Q 180,22 195,24 L 210,22 Q 225,20 240,25 L 250,28 Q 255,32 252,38 L 248,45 Q 245,50 240,55 L 235,60 Q 230,65 225,68 L 220,72 Q 215,75 210,72 L 200,68 Q 195,65 190,62 L 185,58 Q 180,55 178,50 L 175,42 Q 172,35 170,30 Z
M 255,35 Q 265,30 280,32 L 295,30 Q 310,28 320,35 L 325,42 Q 328,50 325,58 L 320,65 Q 315,70 308,68 L 300,62 Q 295,58 290,55 L 285,50 Q 278,45 272,48 L 268,52 Q 262,48 258,42 Z
M 105,70 Q 115,65 125,68 L 135,72 Q 140,78 135,85 L 128,92 Q 122,98 115,100 L 108,102 Q 100,105 95,100 L 88,92 Q 85,85 88,78 L 95,73 Z
M 275,105 Q 285,98 298,100 L 310,105 Q 318,110 315,118 L 308,125 Q 300,130 290,128 L 282,122 Q 275,118 275,112 Z
`;

function lonLatToXY(lon: number, lat: number): [number, number] {
  // Equirectangular: lon -180..180 → x 0..360, lat -90..90 → y 180..0
  const x = ((lon + 180) / 360) * 360;
  const y = ((90 - lat) / 180) * 180;
  return [x, y];
}

export default function GeoMap({ countries }: GeoMapProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const maxListeners = Math.max(...countries.map(c => c.listeners), 1);

  const dots = useMemo(() => {
    return countries
      .map(c => {
        const name = c.name;
        const coords = COUNTRY_COORDS[name];
        if (!coords) return null;
        const [x, y] = lonLatToXY(coords[0], coords[1]);
        const intensity = c.listeners / maxListeners;
        // Dot radius: 2.5 to 7 based on listener share
        const r = 2.5 + intensity * 4.5;
        return { ...c, x, y, r, intensity };
      })
      .filter(Boolean) as { name: string; flag: string; listeners: number; x: number; y: number; r: number; intensity: number }[];
  }, [countries, maxListeners]);

  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">🌍 Global Listener Map</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-500/60" />
            <span className="text-[9px] text-neutral-600">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-violet-400" />
            <span className="text-[9px] text-neutral-600">High</span>
          </div>
        </div>
      </div>

      <div className="relative bg-white/[0.01] rounded-xl border border-white/[0.04] overflow-hidden p-2">
        <svg
          viewBox="0 0 360 180"
          className="w-full h-auto"
          style={{ maxHeight: "280px" }}
        >
          {/* Grid lines */}
          {[0, 30, 60, 90, 120, 150, 180].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="360" y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="0.3" />
          ))}
          {[0, 60, 120, 180, 240, 300, 360].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" stroke="rgba(255,255,255,0.02)" strokeWidth="0.3" />
          ))}

          {/* Equator */}
          <line x1="0" y1="90" x2="360" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" strokeDasharray="4 4" />

          {/* Simplified continent outlines */}
          <path
            d={WORLD_PATH}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />

          {/* Listener dots */}
          {dots.map((dot, i) => {
            const isHovered = hoveredDot === dot.name;
            const opacity = visible ? (0.4 + dot.intensity * 0.6) : 0;
            const baseColor = `rgba(139, 92, 246, ${opacity})`;
            const glowColor = `rgba(139, 92, 246, ${opacity * 0.3})`;

            return (
              <g
                key={dot.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDot(dot.name)}
                onMouseLeave={() => setHoveredDot(null)}
              >
                {/* Pulse ring */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? dot.r * 2.5 : 0}
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="0.3"
                  className="transition-all duration-1000"
                  style={{
                    transitionDelay: `${i * 80}ms`,
                    animation: visible ? `geo-pulse 3s ease-in-out ${i * 0.3}s infinite` : "none",
                  }}
                />
                {/* Glow */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? dot.r * 1.8 : 0}
                  fill={glowColor}
                  className="transition-all duration-700"
                  style={{ transitionDelay: `${i * 80}ms` }}
                />
                {/* Main dot */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? (isHovered ? dot.r * 1.3 : dot.r) : 0}
                  fill={baseColor}
                  stroke={isHovered ? "rgba(139, 92, 246, 0.8)" : "rgba(139, 92, 246, 0.3)"}
                  strokeWidth={isHovered ? "0.8" : "0.4"}
                  className="transition-all duration-500"
                  style={{ transitionDelay: `${i * 80}ms`, filter: isHovered ? "drop-shadow(0 0 6px rgba(139,92,246,0.6))" : undefined }}
                />
                {/* Country label on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={dot.x - 30}
                      y={dot.y - dot.r - 16}
                      width="60"
                      height="13"
                      rx="2"
                      fill="rgba(0,0,0,0.85)"
                      stroke="rgba(139,92,246,0.3)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={dot.x}
                      y={dot.y - dot.r - 7}
                      textAnchor="middle"
                      fill="white"
                      fontSize="5"
                      fontWeight="700"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {dot.flag} {dot.name} · {fmt(dot.listeners)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Country count badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-lg px-2.5 py-1">
          <span className="text-[9px] text-neutral-400 font-semibold">{dots.length} countries mapped</span>
        </div>
      </div>
    </div>
  );
}
