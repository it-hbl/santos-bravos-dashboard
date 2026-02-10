"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  positive: number;
  negative: number;
  neutral: number;
}

export default function SentimentDonut({ positive, negative, neutral }: Props) {
  const data = [
    { name: "Positive", value: positive, color: "#34d399" },
    { name: "Neutral", value: neutral, color: "#525252" },
    { name: "Negative", value: negative, color: "#f87171" },
  ];

  // Net sentiment score: positive - negative (range: -100 to +100)
  const netScore = Math.round(positive - negative);
  const scoreLabel = netScore > 0 ? `+${netScore}` : `${netScore}`;
  const scoreColor = netScore > 15 ? "#34d399" : netScore > 0 ? "#a3e635" : netScore > -15 ? "#fbbf24" : "#f87171";

  // Determine dominant sentiment emoji
  const emoji = positive >= neutral && positive >= negative ? "😊"
    : negative >= neutral ? "😟" : "😐";

  return (
    <div className="h-52 flex items-center justify-center relative">
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
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="text-lg">{emoji}</span>
          <p className="text-lg font-black tabular-nums" style={{ color: scoreColor }}>{scoreLabel}</p>
          <p className="text-[8px] text-neutral-600 uppercase tracking-widest">Net Score</p>
        </div>
      </div>
    </div>
  );
}
