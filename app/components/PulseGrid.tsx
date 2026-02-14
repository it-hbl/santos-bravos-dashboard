"use client";

import { useMemo } from "react";

interface PulseMetric {
  label: string;
  emoji: string;
  /** Percentage change — null means no prior data */
  pct: number | null;
  /** Optional override color for metrics without a %. e.g. sentiment net */
  status?: "green" | "amber" | "red" | "neutral";
}

interface Props {
  metrics: PulseMetric[];
}

function getStatus(pct: number | null, override?: "green" | "amber" | "red" | "neutral"): { color: string; bg: string; ring: string; label: string } {
  if (override) {
    const map = {
      green:   { color: "bg-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30", label: "Strong" },
      amber:   { color: "bg-amber-400",   bg: "bg-amber-500/10",   ring: "ring-amber-500/30",   label: "Watch" },
      red:     { color: "bg-red-400",      bg: "bg-red-500/10",     ring: "ring-red-500/30",     label: "Alert" },
      neutral: { color: "bg-neutral-500",  bg: "bg-white/[0.03]",   ring: "ring-white/10",       label: "No Data" },
    };
    return map[override];
  }
  if (pct === null) return { color: "bg-neutral-500", bg: "bg-white/[0.03]", ring: "ring-white/10", label: "No Data" };
  if (pct >= 5)   return { color: "bg-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30", label: `+${pct.toFixed(1)}%` };
  if (pct >= 0)   return { color: "bg-emerald-400/60", bg: "bg-emerald-500/5", ring: "ring-emerald-500/20", label: `+${pct.toFixed(1)}%` };
  if (pct >= -5)  return { color: "bg-amber-400", bg: "bg-amber-500/10", ring: "ring-amber-500/30", label: `${pct.toFixed(1)}%` };
  return              { color: "bg-red-400", bg: "bg-red-500/10", ring: "ring-red-500/30", label: `${pct.toFixed(1)}%` };
}

export default function PulseGrid({ metrics }: Props) {
  const items = useMemo(() => metrics.map(m => ({
    ...m,
    status: getStatus(m.pct, m.status),
  })), [metrics]);

  if (items.length === 0) return null;

  // Count statuses for summary
  const greens = items.filter(i => i.status.color.includes("emerald")).length;
  const ambers = items.filter(i => i.status.color.includes("amber")).length;
  const reds = items.filter(i => i.status.color.includes("red")).length;

  const overallLabel = reds >= 3 ? "⚠️ Multiple alerts" : ambers >= 3 ? "👀 Mixed signals" : greens >= items.length * 0.7 ? "✅ Healthy" : "📊 Stable";

  return (
    <div className="mb-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em]">System Pulse</span>
          <span className="text-[10px] text-neutral-600">{overallLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-neutral-600">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> {greens}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> {ambers}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> {reds}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`group relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg ${item.status.bg} ring-1 ${item.status.ring} transition-all hover:scale-105 hover:ring-2 cursor-default`}
            title={`${item.label}: ${item.status.label}`}
          >
            {/* Dot */}
            <div className={`w-2.5 h-2.5 rounded-full ${item.status.color} transition-all group-hover:scale-125 ${item.status.color.includes("emerald") ? "group-hover:shadow-[0_0_8px_rgba(52,211,153,0.5)]" : item.status.color.includes("red") ? "group-hover:shadow-[0_0_8px_rgba(248,113,113,0.5)]" : item.status.color.includes("amber") ? "group-hover:shadow-[0_0_8px_rgba(251,191,36,0.5)]" : ""}`} />
            {/* Emoji */}
            <span className="text-[11px] leading-none">{item.emoji}</span>
            {/* Label */}
            <span className="text-[8px] text-neutral-500 text-center leading-tight truncate w-full group-hover:text-neutral-300 transition-colors">{item.label}</span>
            {/* Tooltip — percentage on hover */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {item.status.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
