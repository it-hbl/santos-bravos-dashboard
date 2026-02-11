"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

interface GeoTreemapProps {
  data: { name: string; listeners: number; flag: string }[];
}

const COLORS = [
  "#7C3AED", "#6366F1", "#818CF8", "#A78BFA", "#C4B5FD",
  "#8B5CF6", "#6D28D9", "#5B21B6", "#4C1D95", "#DDD6FE",
];

function CustomContent(props: any) {
  const { x, y, width, height, name, flag, listeners, index } = props;
  if (width < 30 || height < 20) return null;

  const color = COLORS[index % COLORS.length];
  const showFlag = width > 50 && height > 40;
  const showCount = width > 60 && height > 55;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={color}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={2}
        className="transition-opacity hover:opacity-80"
      />
      {showFlag && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCount ? 10 : 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.min(width / 3, height / 3, 28)}
        >
          {flag}
        </text>
      )}
      {width > 45 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (showFlag ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={Math.min(11, width / 8)}
          fontWeight={700}
        >
          {name}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 22}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.7)"
          fontSize={9}
        >
          {listeners >= 1000 ? (listeners / 1000).toFixed(1) + "K" : listeners.toLocaleString()}
        </text>
      )}
    </g>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const total = d._total || 1;
  const pct = ((d.listeners / total) * 100).toFixed(1);
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-bold text-white">{d.flag} {d.name}</p>
      <p className="text-xs text-neutral-400 mt-1">
        <span className="text-violet-400 font-bold">{d.listeners.toLocaleString()}</span> listeners · <span className="text-cyan-400 font-semibold">{pct}%</span> of top 10
      </p>
    </div>
  );
}

export default function GeoTreemap({ data }: GeoTreemapProps) {
  const total = data.reduce((s, c) => s + c.listeners, 0);
  const treemapData = data.map((c, i) => ({
    ...c,
    size: c.listeners,
    index: i,
    _total: total,
  }));

  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          content={<CustomContent />}
          animationDuration={800}
          animationEasing="ease-out"
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
