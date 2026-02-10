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

  return (
    <div className="h-44 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
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
    </div>
  );
}
