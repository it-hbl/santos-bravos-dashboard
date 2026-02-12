"use client";

import { useState, useEffect } from "react";

export interface Mover {
  label: string;
  pct: number;
  emoji: string;
}

/**
 * TopMoverBadge — auto-rotating badge cycling through the top N fastest-growing metrics.
 * Shows metric name, growth %, and a subtle crossfade transition every 3 seconds.
 */
export default function TopMoverBadge({ movers }: { movers: Mover[] }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (movers.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % movers.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [movers.length]);

  if (movers.length === 0) return null;

  const m = movers[idx];
  const isPositive = m.pct >= 0;

  return (
    <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 overflow-hidden">
      <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-medium whitespace-nowrap">
        🔥 Top Mover
      </span>
      <div className="w-px h-3 bg-white/10" />
      <div
        className={`flex items-center gap-1.5 transition-all duration-300 ${
          fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <span className="text-xs">{m.emoji}</span>
        <span className="text-[11px] text-white font-semibold whitespace-nowrap">{m.label}</span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            isPositive
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10"
          }`}
        >
          {isPositive ? "+" : ""}{m.pct.toFixed(1)}%
        </span>
      </div>
      {movers.length > 1 && (
        <div className="flex gap-0.5 ml-1">
          {movers.map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                i === idx ? "bg-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
