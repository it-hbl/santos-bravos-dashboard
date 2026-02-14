"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { useState, useCallback } from "react";

interface Props {
  positive: number;
  negative: number;
  neutral: number;
}

/* Custom active shape — expands the hovered segment outward with a glow */
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <defs>
        <filter id={`glow-${fill.replace("#", "")}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter={`url(#glow-${fill.replace("#", "")})`}
        style={{ transition: "all 0.3s ease" }}
      />
    </g>
  );
}

export default function SentimentDonut({ positive, negative, neutral }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = [
    { name: "Positive", value: positive, color: "#34d399", emoji: "😊", label: "Positive" },
    { name: "Neutral", value: neutral, color: "#525252", emoji: "😐", label: "Neutral" },
    { name: "Negative", value: negative, color: "#f87171", emoji: "😟", label: "Negative" },
  ];

  const netScore = Math.round(positive - negative);
  const scoreLabel = netScore > 0 ? `+${netScore}` : `${netScore}`;
  const scoreColor = netScore > 15 ? "#34d399" : netScore > 0 ? "#a3e635" : netScore > -15 ? "#fbbf24" : "#f87171";

  const emoji = positive >= neutral && positive >= negative ? "😊"
    : negative >= neutral ? "😟" : "😐";

  const onPieEnter = useCallback((_: any, index: number) => setActiveIndex(index), []);
  const onPieLeave = useCallback(() => setActiveIndex(null), []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Donut */}
      <div className="h-52 w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={ActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex !== null && activeIndex !== i ? 0.35 : 1}
                  style={{ transition: "opacity 0.3s ease" }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-lg">{emoji}</span>
            <p className="text-lg font-black tabular-nums" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="text-[8px] text-neutral-600 uppercase tracking-widest">Net Score</p>
          </div>
        </div>
      </div>

      {/* Interactive legend */}
      <div className="flex items-center justify-center gap-4 text-[11px]">
        {data.map((entry, i) => (
          <button
            key={entry.name}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/[0.04]"
            style={{
              opacity: activeIndex !== null && activeIndex !== i ? 0.4 : 1,
              background: activeIndex === i ? `${entry.color}10` : undefined,
              outline: activeIndex === i ? `1px solid ${entry.color}30` : "1px solid transparent",
            }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
              style={{
                background: entry.color,
                boxShadow: activeIndex === i ? `0 0 6px ${entry.color}80` : "none",
                transform: activeIndex === i ? "scale(1.3)" : "scale(1)",
              }}
            />
            <span className="text-neutral-400">{entry.emoji} {entry.label}</span>
            <span className="font-bold tabular-nums" style={{ color: entry.color }}>
              {entry.value.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
