"use client";
import { useEffect, useState } from "react";

interface Milestone {
  label: string;
  current: number;
  target: number;
  icon: string;
  color: string; // tailwind gradient from
  formatFn?: (n: number) => string;
}

function defaultFmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function MilestonesTracker({ milestones }: { milestones: Milestone[] }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="glass-hybe rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm font-black text-white">🎯</div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Milestones & Targets</h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em]">Strategic growth goals</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {milestones.map((m, i) => {
          const pct = Math.min((m.current / m.target) * 100, 100);
          const fmt = m.formatFn || defaultFmt;
          const remaining = m.target - m.current;
          const isComplete = pct >= 100;
          return (
            <div
              key={m.label}
              className={`bg-white/[0.02] rounded-xl p-4 border transition-all duration-500 ${
                isComplete ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-white/[0.04]"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.icon}</span>
                  <span className="text-xs font-semibold text-neutral-300">{m.label}</span>
                </div>
                {isComplete && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ REACHED</span>
                )}
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-xl font-extrabold text-white tabular-nums">{fmt(m.current)}</span>
                <span className="text-[10px] text-neutral-500 tabular-nums">/ {fmt(m.target)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-[1500ms] ease-out ${m.color}`}
                  style={{ width: animate ? `${pct}%` : "0%" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold tabular-nums ${pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-neutral-500"}`}>
                  {pct.toFixed(1)}%
                </span>
                {!isComplete && (
                  <span className="text-[9px] text-neutral-600 tabular-nums">
                    {fmt(remaining)} to go
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
