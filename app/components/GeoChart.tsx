"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-white">{label}</p>
      <p className="text-sm font-mono text-cyan-400">{payload[0]?.value?.toLocaleString() ?? "—"} listeners</p>
    </div>
  );
};

export function GeoProgressBars({ data, color = "#8B5CF6" }: { data: { name: string; listeners: number; flag?: string; priorListeners?: number | null }[]; color?: string }) {
  const max = data[0]?.listeners || 1;
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = (item.listeners / max) * 100;
        const prior = item.priorListeners;
        const hasGrowth = prior != null && prior > 0;
        const change = hasGrowth ? item.listeners - prior! : 0;
        const changePct = hasGrowth ? ((change / prior!) * 100).toFixed(1) : null;
        return (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-600 w-4 text-right font-mono">{i + 1}</span>
                {item.flag && <span className="text-sm">{item.flag}</span>}
                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{item.name}</span>
                {changePct !== null && change !== 0 && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${change > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {change > 0 ? '↑' : '↓'}{Math.abs(Number(changePct))}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasGrowth && change !== 0 && (
                  <span className={`text-[9px] tabular-nums ${change > 0 ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                    {change > 0 ? '+' : ''}{fmt(change)}
                  </span>
                )}
                <span className="text-sm font-bold tabular-nums text-white">{fmt(item.listeners)}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function GeoChart({ data, color }: { data: { name: string; listeners: number }[]; color: string }) {
  const COLORS = ["#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6"];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} vertical strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#a3a3a3", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
        <Bar dataKey="listeners" radius={[0, 8, 8, 0]} animationDuration={1200} animationEasing="ease-out">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={1 - i * 0.12} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
