"use client";

import { useMemo, useState, useEffect } from "react";

interface GeoMapProps {
  countries: { name: string; flag: string; listeners: number; code?: string }[];
}

/**
 * GeoMap — SVG world map with Natural Earth-inspired simplified outlines
 * and animated pulsing dots showing listener distribution.
 * Uses equirectangular projection with proper continent shapes.
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

// Simplified continent outlines in equirectangular projection (viewBox 0 0 800 400)
// lon: -180→180 maps to x: 0→800, lat: 90→-90 maps to y: 0→400
const CONTINENTS = [
  // North America
  "M 32,80 L 60,65 80,68 95,72 105,80 120,82 135,90 155,95 172,88 185,90 190,100 195,115 190,130 180,140 170,145 165,155 155,160 145,155 138,150 128,155 120,158 115,155 105,148 95,140 80,138 65,142 55,148 50,152 42,158 38,155 35,148 30,140 25,132 22,120 25,110 28,100 30,90 Z",
  // South America
  "M 140,165 L 148,162 158,165 168,168 175,178 178,188 182,200 185,215 188,228 192,242 195,255 196,268 194,280 190,290 185,298 178,308 168,315 158,318 150,312 142,305 138,295 132,282 128,268 126,252 124,238 122,222 120,210 118,200 120,190 125,180 132,172 Z",
  // Europe
  "M 350,62 L 355,58 365,55 378,56 390,60 398,65 405,70 408,78 405,85 398,90 392,95 385,92 378,88 370,85 365,82 358,80 352,78 348,72 Z",
  // Africa
  "M 355,120 L 365,115 378,112 392,115 400,120 408,125 415,135 420,148 425,162 428,178 425,195 420,210 412,225 405,238 395,248 385,258 375,262 365,258 355,250 348,240 342,225 338,210 335,195 335,180 338,165 342,150 345,138 348,128 Z",
  // Asia (mainland)
  "M 410,55 L 425,48 445,42 465,38 488,35 510,38 530,42 548,48 565,52 578,58 590,55 600,52 615,55 628,60 640,65 648,72 650,80 648,90 640,98 628,105 618,112 605,118 592,122 578,128 565,132 550,135 535,130 520,125 505,128 492,132 478,138 465,142 452,140 438,135 425,128 412,120 405,110 402,100 405,90 408,80 410,68 Z",
  // Southeast Asia / Indonesia
  "M 560,142 L 575,138 590,140 602,145 615,148 625,152 L 630,158 625,162 615,160 600,162 590,158 578,155 568,150 562,146 Z",
  // Australia
  "M 605,230 L 620,222 638,218 655,220 670,225 680,235 685,248 682,262 672,272 658,278 642,280 628,275 618,268 610,258 605,248 602,238 Z",
  // Japan/Korea peninsula hint
  "M 638,62 L 642,58 648,55 652,58 655,65 652,72 648,78 642,75 638,68 Z",
];

// Graticule lines for visual reference
const GRATICULES_H = [0, 66.5, 100, 133, 166.5, 200, 233, 266.5, 300, 333, 400].map(y => y);
const GRATICULES_V = [0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => x);

function lonLatToXY(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * 800;
  const y = ((90 - lat) / 180) * 400;
  return [x, y];
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function GeoMap({ countries }: GeoMapProps) {
  const [visible, setVisible] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const maxListeners = Math.max(...countries.map(c => c.listeners), 1);

  const dots = useMemo(() => {
    return countries
      .map(c => {
        const coords = COUNTRY_COORDS[c.name];
        if (!coords) return null;
        const [x, y] = lonLatToXY(coords[0], coords[1]);
        const intensity = c.listeners / maxListeners;
        const r = 4 + intensity * 8;
        return { ...c, x, y, r, intensity };
      })
      .filter(Boolean) as { name: string; flag: string; listeners: number; x: number; y: number; r: number; intensity: number }[];
  }, [countries, maxListeners]);

  // Connection lines between top 3 dots and all others
  const connections = useMemo(() => {
    if (dots.length < 2) return [];
    const sorted = [...dots].sort((a, b) => b.listeners - a.listeners);
    const hubs = sorted.slice(0, 3);
    const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
    hubs.forEach(hub => {
      sorted.slice(1, 8).forEach(target => {
        if (hub.name === target.name) return;
        lines.push({
          x1: hub.x, y1: hub.y,
          x2: target.x, y2: target.y,
          opacity: 0.04 + (target.intensity * 0.06),
        });
      });
    });
    return lines;
  }, [dots]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">🌍 Global Listener Map</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
            <span className="text-[9px] text-neutral-600">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-violet-400 shadow-lg shadow-violet-500/30" />
            <span className="text-[9px] text-neutral-600">High</span>
          </div>
          <span className="text-[9px] text-neutral-700 tabular-nums">{dots.length} countries</span>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-white/[0.01] to-transparent rounded-xl border border-white/[0.04] overflow-hidden">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-auto"
          style={{ maxHeight: "320px" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Radial gradient for dot glow */}
            <radialGradient id="dotGlow">
              <stop offset="0%" stopColor="rgba(139,92,246,0.4)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0)" />
            </radialGradient>
            {/* Subtle vignette */}
            <radialGradient id="vignette" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
            </radialGradient>
            {/* Pulse animation */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="800" height="400" fill="rgba(0,0,0,0.15)" rx="8" />

          {/* Graticule grid */}
          {GRATICULES_H.map((y, i) => (
            <line key={`h${i}`} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
          ))}
          {GRATICULES_V.map((x, i) => (
            <line key={`v${i}`} x1={x} y1="0" x2={x} y2="400" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
          ))}

          {/* Equator */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="8 6" />
          {/* Prime meridian */}
          <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="8 6" />

          {/* Continent outlines */}
          {CONTINENTS.map((path, i) => (
            <path
              key={i}
              d={path}
              fill="rgba(255,255,255,0.025)"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.8"
              strokeLinejoin="round"
              className={`transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          ))}

          {/* Connection lines between major markets */}
          {visible && connections.map((line, i) => (
            <line
              key={`conn${i}`}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={`rgba(139,92,246,${line.opacity})`}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className="transition-opacity duration-1000"
              style={{ transitionDelay: `${800 + i * 50}ms` }}
            />
          ))}

          {/* Listener dots */}
          {dots.map((dot, i) => {
            const isHovered = hoveredDot === dot.name;
            const opacity = visible ? (0.5 + dot.intensity * 0.5) : 0;

            return (
              <g
                key={dot.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDot(dot.name)}
                onMouseLeave={() => setHoveredDot(null)}
              >
                {/* Outer pulse ring */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? dot.r * 2.5 : 0}
                  fill="none"
                  stroke={`rgba(139,92,246,${opacity * 0.15})`}
                  strokeWidth="0.5"
                  className="transition-all duration-1000"
                  style={{
                    transitionDelay: `${i * 80}ms`,
                    animation: visible ? `geo-pulse 3s ease-in-out ${i * 0.3}s infinite` : "none",
                  }}
                />
                {/* Glow halo */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? dot.r * 1.8 : 0}
                  fill={`rgba(139,92,246,${opacity * 0.15})`}
                  className="transition-all duration-700"
                  style={{ transitionDelay: `${i * 80}ms` }}
                />
                {/* Main dot */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? (isHovered ? dot.r * 1.4 : dot.r) : 0}
                  fill={`rgba(139,92,246,${opacity})`}
                  stroke={isHovered ? "rgba(167,139,250,0.9)" : `rgba(139,92,246,${opacity * 0.6})`}
                  strokeWidth={isHovered ? "1.5" : "0.6"}
                  className="transition-all duration-500"
                  style={{
                    transitionDelay: `${i * 80}ms`,
                    filter: isHovered ? "drop-shadow(0 0 8px rgba(139,92,246,0.6))" : `drop-shadow(0 0 ${2 + dot.intensity * 4}px rgba(139,92,246,${0.2 + dot.intensity * 0.2}))`,
                  }}
                />
                {/* Inner bright dot */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={visible ? Math.max(1.5, dot.r * 0.35) : 0}
                  fill="rgba(255,255,255,0.7)"
                  className="transition-all duration-500"
                  style={{ transitionDelay: `${i * 80 + 200}ms` }}
                />

                {/* Hover tooltip */}
                {isHovered && (
                  <g className="pointer-events-none">
                    {/* Tooltip background */}
                    <rect
                      x={dot.x - 55}
                      y={dot.y - dot.r - 28}
                      width="110"
                      height="22"
                      rx="4"
                      fill="rgba(0,0,0,0.9)"
                      stroke="rgba(139,92,246,0.4)"
                      strokeWidth="0.8"
                    />
                    {/* Tooltip arrow */}
                    <polygon
                      points={`${dot.x - 4},${dot.y - dot.r - 6} ${dot.x + 4},${dot.y - dot.r - 6} ${dot.x},${dot.y - dot.r - 1}`}
                      fill="rgba(0,0,0,0.9)"
                    />
                    {/* Country name + listeners */}
                    <text
                      x={dot.x}
                      y={dot.y - dot.r - 14}
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {dot.flag} {dot.name}
                    </text>
                    <text
                      x={dot.x + 50}
                      y={dot.y - dot.r - 14}
                      textAnchor="end"
                      fill="#a78bfa"
                      fontSize="7.5"
                      fontWeight="800"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {fmt(dot.listeners)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Vignette overlay */}
          <rect width="800" height="400" fill="url(#vignette)" />
        </svg>
      </div>
    </div>
  );
}
