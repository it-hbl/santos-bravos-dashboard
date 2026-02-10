"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DaySentiment {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const pos = payload.find((p: any) => p.dataKey === "positive")?.value ?? 0;
  const neu = payload.find((p: any) => p.dataKey === "neutral")?.value ?? 0;
  const neg = payload.find((p: any) => p.dataKey === "negative")?.value ?? 0;
  const total = pos + neu + neg;
  return (
    <div className="bg-[#18181b]/95 backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl shadow-black/40 min-w-[140px]">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Positive
          </span>
          <span className="text-xs font-bold text-emerald-400 tabular-nums">{fmt(pos)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" /> Neutral
          </span>
          <span className="text-xs font-bold text-neutral-400 tabular-nums">{fmt(neu)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Negative
          </span>
          <span className="text-xs font-bold text-red-400 tabular-nums">{fmt(neg)}</span>
        </div>
        <div className="border-t border-white/[0.06] pt-1 mt-1 flex justify-between">
          <span className="text-[10px] text-neutral-500">Total</span>
          <span className="text-xs font-bold text-white tabular-nums">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
};

interface SentimentTimelineProps {
  data: DaySentiment[];
}

export default function SentimentTimeline({ data }: SentimentTimelineProps) {
  if (!data || data.length === 0) return null;

  // Calculate trend direction
  const firstHalf = data.slice(0, Math.ceil(data.length / 2));
  const secondHalf = data.slice(Math.ceil(data.length / 2));
  const avgFirst = firstHalf.reduce((s, d) => s + (d.total > 0 ? d.positive / d.total : 0), 0) / (firstHalf.length || 1);
  const avgSecond = secondHalf.reduce((s, d) => s + (d.total > 0 ? d.positive / d.total : 0), 0) / (secondHalf.length || 1);
  const trendUp = avgSecond >= avgFirst;

  return (
    <div className="space-y-3">
      {/* Trend indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
            {trendUp ? "↗ Positive trend improving" : "↘ Positive trend declining"}
          </span>
        </div>
      </div>

      {/* Stacked area chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} stackOffset="expand">
            <defs>
              <linearGradient id="sentPosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="sentNeuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7280" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6b7280" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="sentNegGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#525252" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#404040" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="positive"
              stackId="1"
              stroke="#34d399"
              strokeWidth={1.5}
              fill="url(#sentPosGrad)"
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="neutral"
              stackId="1"
              stroke="#6b7280"
              strokeWidth={1}
              fill="url(#sentNeuGrad)"
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="negative"
              stackId="1"
              stroke="#f87171"
              strokeWidth={1.5}
              fill="url(#sentNegGrad)"
              animationBegin={400}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        {[
          { label: "Positive", color: "bg-emerald-400" },
          { label: "Neutral", color: "bg-neutral-500" },
          { label: "Negative", color: "bg-red-400" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[10px] text-neutral-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
