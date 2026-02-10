"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useState, useCallback } from "react";

interface PlatformData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={800}>
        {payload.icon} {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#a3a3a3" fontSize={11}>
        {fmt(payload.value)} ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

export default function PlatformDistribution({
  spotifyStreams,
  youtubeViews,
  tiktokAudioViews,
}: {
  spotifyStreams: number;
  youtubeViews: number;
  tiktokAudioViews: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const data: PlatformData[] = [
    { name: "YouTube", value: youtubeViews, color: "#FF0000", icon: "▶" },
    { name: "TikTok Audio", value: tiktokAudioViews, color: "#00F2EA", icon: "♪" },
    { name: "Spotify", value: spotifyStreams, color: "#1DB954", icon: "●" },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Cross-Platform Distribution</p>
      <p className="text-[10px] text-neutral-600 mb-4">Total: <span className="text-white font-bold">{fmt(total)}</span> streams & views</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            dataKey="value"
            onMouseEnter={onPieEnter}
            strokeWidth={0}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} fillOpacity={0.85} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-neutral-400">
              {d.name} <span className="font-bold text-white">{((d.value / total) * 100).toFixed(0)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
