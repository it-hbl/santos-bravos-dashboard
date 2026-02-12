"use client";

import { useState } from "react";

interface Change {
  metric: string;
  current: number;
  prior: number;
  pctChange: number;
  category: "streaming" | "social" | "youtube" | "virality" | "pr";
  sectionId?: string;
}

interface NotableChangesProps {
  changes: Change[];
  threshold?: number; // minimum absolute % change to show
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  streaming: { emoji: "🎧", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  social: { emoji: "📱", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  youtube: { emoji: "▶️", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  virality: { emoji: "🔥", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  pr: { emoji: "📰", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
};

export default function NotableChanges({ changes, threshold = 5 }: NotableChangesProps) {
  const [expanded, setExpanded] = useState(false);

  // Filter and sort by absolute % change descending
  const notable = changes
    .filter(c => Math.abs(c.pctChange) >= threshold && c.prior > 0)
    .sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));

  if (notable.length === 0) return null;

  const topChanges = expanded ? notable : notable.slice(0, 4);
  const hasMore = notable.length > 4;

  // Determine overall mood
  const positiveCount = notable.filter(c => c.pctChange > 0).length;
  const mood = positiveCount > notable.length / 2
    ? { label: "Momentum Building", emoji: "🚀", color: "text-emerald-400" }
    : positiveCount === notable.length / 2
    ? { label: "Mixed Signals", emoji: "⚖️", color: "text-amber-400" }
    : { label: "Watch Closely", emoji: "👀", color: "text-red-400" };

  return (
    <section className="glass-hybe rounded-2xl p-5 print:break-inside-avoid">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs font-black text-white">⚡</div>
          <div>
            <h2 className="text-sm font-bold text-white">Notable Changes</h2>
            <p className="text-[10px] text-neutral-500">
              {notable.length} metric{notable.length !== 1 ? "s" : ""} moved &gt;{threshold}% · <span className={mood.color}>{mood.emoji} {mood.label}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600 tabular-nums">{positiveCount}↑ {notable.length - positiveCount}↓</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topChanges.map((c, i) => {
          const config = CATEGORY_CONFIG[c.category] || CATEGORY_CONFIG.streaming;
          const isPositive = c.pctChange > 0;
          const absPct = Math.abs(c.pctChange);
          const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
          const changeBg = isPositive ? "bg-emerald-500/10" : "bg-red-500/10";

          return (
            <button
              key={`${c.metric}-${i}`}
              onClick={() => {
                if (c.sectionId) {
                  document.getElementById(c.sectionId)?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className={`${config.bg} border ${config.border} rounded-xl p-3 text-left transition-all hover:scale-[1.02] hover:shadow-lg group ${c.sectionId ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-neutral-500 truncate flex-1 pr-2">{config.emoji} {c.metric}</span>
                <span className={`text-[10px] font-bold ${changeColor} ${changeBg} px-1.5 py-0.5 rounded tabular-nums flex-shrink-0`}>
                  {isPositive ? "+" : ""}{c.pctChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-lg font-extrabold ${config.color} tabular-nums`}>{fmt(c.current)}</span>
                <span className="text-[10px] text-neutral-600 tabular-nums">from {fmt(c.prior)}</span>
              </div>
              {/* Change magnitude bar */}
              <div className="mt-2 w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(absPct * 2, 100)}%`, opacity: 0.7 }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {expanded ? "Show less ↑" : `Show ${notable.length - 4} more changes ↓`}
        </button>
      )}
    </section>
  );
}
