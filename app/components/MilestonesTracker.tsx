"use client";
import { useEffect, useState, useRef } from "react";

interface Milestone {
  label: string;
  current: number;
  target: number;
  prior?: number | null;       // value at priorDate
  priorDaysAgo?: number;       // how many days between prior and current report
  icon: string;
  color: string; // tailwind gradient from
  formatFn?: (n: number) => string;
}

function defaultFmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
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

          // Calculate projected completion date based on growth velocity
          let projectedDate: string | null = null;
          let daysToTarget: number | null = null;
          let dailyGrowth: number | null = null;
          const periodDays = m.priorDaysAgo ?? 5; // default 5 days between reports
          if (!isComplete && m.prior != null && m.prior > 0 && m.current > m.prior) {
            dailyGrowth = (m.current - m.prior) / periodDays;
            daysToTarget = Math.ceil(remaining / dailyGrowth);
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysToTarget);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            projectedDate = `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}, ${targetDate.getFullYear()}`;
          }
          // Pace label
          let paceLabel: string | null = null;
          let paceColor = "text-neutral-500";
          if (daysToTarget !== null) {
            if (daysToTarget <= 30) { paceLabel = "🔥 On fire"; paceColor = "text-emerald-400"; }
            else if (daysToTarget <= 90) { paceLabel = "🚀 Strong pace"; paceColor = "text-emerald-400"; }
            else if (daysToTarget <= 180) { paceLabel = "📈 Steady"; paceColor = "text-amber-400"; }
            else if (daysToTarget <= 365) { paceLabel = "🐢 Slow"; paceColor = "text-orange-400"; }
            else { paceLabel = "⏳ Long road"; paceColor = "text-neutral-500"; }
          }
          const isAlmostThere = pct >= 90 && !isComplete;
          return (
            <div
              key={m.label}
              className={`relative bg-white/[0.02] rounded-xl p-4 border transition-all duration-500 overflow-hidden ${
                isComplete
                  ? "border-emerald-500/30 bg-emerald-500/[0.03] milestone-complete"
                  : isAlmostThere
                  ? "border-amber-500/30 milestone-almost"
                  : "border-white/[0.04]"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Celebration particles for completed milestones */}
              {isComplete && animate && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  {Array.from({ length: 12 }).map((_, pi) => (
                    <span
                      key={pi}
                      className="milestone-particle"
                      style={{
                        left: `${10 + (pi * 7.5) % 80}%`,
                        animationDelay: `${pi * 120}ms`,
                        backgroundColor: pi % 3 === 0 ? "#34d399" : pi % 3 === 1 ? "#a78bfa" : "#f59e0b",
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Almost-there pulsing ring */}
              {isAlmostThere && (
                <div className="absolute inset-0 rounded-xl border-2 border-amber-400/20 animate-pulse pointer-events-none" />
              )}
              <div className="relative flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-base ${isComplete ? "milestone-icon-bounce" : ""}`}>{m.icon}</span>
                  <span className="text-xs font-semibold text-neutral-300">{m.label}</span>
                </div>
                {isComplete && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full milestone-shimmer">✓ REACHED</span>
                )}
                {isAlmostThere && (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">🔥 ALMOST</span>
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
              {/* Projected completion date */}
              {!isComplete && projectedDate && dailyGrowth !== null && (
                <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-semibold ${paceColor}`}>{paceLabel}</span>
                    <span className="text-[9px] text-neutral-600">·</span>
                    <span className="text-[9px] text-neutral-500 tabular-nums">+{fmt(Math.round(dailyGrowth))}/day</span>
                  </div>
                  <span className="text-[9px] font-semibold text-violet-400 tabular-nums" title={`Estimated at current growth rate (~${daysToTarget} days)`}>
                    📅 {projectedDate}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
