"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

interface WowData {
  thisWeek: number;
  lastWeek: number;
  change: number;
  changePct: number;
  thisWeekSeries: { day: string; mentions: number }[];
  lastWeekSeries: { day: string; mentions: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b]/95 backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[10px] text-neutral-400">{p.name}:</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: p.color }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function WowComparison({ data }: { data: WowData }) {
  // Merge series by day index for grouped bar chart
  const maxLen = Math.max(data.thisWeekSeries.length, data.lastWeekSeries.length);
  const merged = [];
  for (let i = 0; i < maxLen; i++) {
    merged.push({
      day: data.thisWeekSeries[i]?.day || data.lastWeekSeries[i]?.day || `Day ${i + 1}`,
      "This Week": data.thisWeekSeries[i]?.mentions || 0,
      "Last Week": data.lastWeekSeries[i]?.mentions || 0,
    });
  }

  const isPositive = data.changePct >= 0;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">Week-over-Week Comparison</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neutral-600" />
            <span className="text-[10px] text-neutral-500">Last Week: <span className="text-neutral-300 font-semibold">{fmt(data.lastWeek)}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-[10px] text-neutral-500">This Week: <span className="text-neutral-300 font-semibold">{fmt(data.thisWeek)}</span></span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
            {isPositive ? "↑" : "↓"} {Math.abs(data.changePct)}% WoW
          </span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={merged} barGap={2} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#525252" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#404040" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => fmt(v)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar dataKey="Last Week" fill="#525252" radius={[4, 4, 0, 0]} animationDuration={1200} />
            <Bar dataKey="This Week" fill="#a78bfa" radius={[4, 4, 0, 0]} animationDuration={1200} animationBegin={300} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
