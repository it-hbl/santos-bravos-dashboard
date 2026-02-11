"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SourceData {
  name: string;
  count: number;
  type: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  "X (Twitter)": "#1DA1F2",
  "Twitter": "#1DA1F2",
  "Instagram": "#E1306C",
  "TikTok": "#00F2EA",
  "YouTube": "#FF0000",
  "Reddit": "#FF4500",
  "Facebook": "#1877F2",
  "News Sites": "#A78BFA",
  "Blogs": "#F59E0B",
};

const DEFAULT_COLORS = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#818CF8", "#67E8F9", "#FCD34D", "#FB923C"];

export default function SourceDonut({ sources }: { sources: SourceData[] }) {
  const total = sources.reduce((s, d) => s + d.count, 0);
  const data = sources.map((s, i) => ({
    name: s.name,
    value: s.count,
    pct: total > 0 ? ((s.count / total) * 100).toFixed(1) : "0",
    color: PLATFORM_COLORS[s.name] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  const topSource = data[0];

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
            paddingAngle={2}
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
            formatter={(value: number, name: string) => [`${value?.toLocaleString() ?? "—"} (${((value / total) * 100).toFixed(1)}%)`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="text-lg">📡</span>
          <p className="text-sm font-black tabular-nums text-white">{topSource?.pct}%</p>
          <p className="text-[8px] text-neutral-600 uppercase tracking-widest">{topSource?.name}</p>
        </div>
      </div>
    </div>
  );
}
