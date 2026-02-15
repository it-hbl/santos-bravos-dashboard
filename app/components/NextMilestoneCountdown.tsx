"use client";

import { useState, useEffect, useMemo } from "react";

interface MilestoneTarget {
  label: string;
  current: number;
  target: number;
  emoji: string;
  dailyGrowth: number | null; // estimated daily growth rate
  color: string; // hex color
}

interface Props {
  milestones: MilestoneTarget[];
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 100_000) return (n / 1_000).toFixed(0) + "K";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/**
 * NextMilestoneCountdown — shows the closest achievable milestone
 * with an animated progress ring, estimated countdown, and live-ticking
 * projected counter.
 */
export default function NextMilestoneCountdown({ milestones }: Props) {
  const [tick, setTick] = useState(0);

  // Find the closest incomplete milestone by days-to-target
  const closest = useMemo(() => {
    const incomplete = milestones
      .filter(m => m.current < m.target && m.dailyGrowth && m.dailyGrowth > 0)
      .map(m => {
        const remaining = m.target - m.current;
        const daysToTarget = remaining / (m.dailyGrowth || 1);
        const pct = (m.current / m.target) * 100;
        return { ...m, remaining, daysToTarget, pct };
      })
      .sort((a, b) => a.daysToTarget - b.daysToTarget);
    return incomplete[0] || null;
  }, [milestones]);

  // Tick every second for the live counter effect
  useEffect(() => {
    if (!closest) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [closest]);

  if (!closest) return null;

  const { label, current, target, emoji, dailyGrowth, color, remaining, daysToTarget, pct } = closest;

  // Calculate live "projected current" based on growth rate + elapsed seconds
  const growthPerSecond = (dailyGrowth || 0) / 86400;
  const projectedCurrent = current + growthPerSecond * tick;
  const projectedPct = Math.min(100, (projectedCurrent / target) * 100);
  const projectedRemaining = Math.max(0, target - projectedCurrent);

  // ETA breakdown
  const totalHours = Math.max(0, daysToTarget * 24 - (tick / 3600));
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);
  const minutes = Math.floor((totalHours * 60) % 60);

  // Progress ring
  const ringSize = 52;
  const strokeWidth = 4;
  const r = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - projectedPct / 100);

  // Urgency level
  const urgency = days <= 7 ? "imminent" : days <= 30 ? "soon" : days <= 90 ? "steady" : "distant";
  const urgencyConfig = {
    imminent: { bg: "bg-emerald-500/[0.06]", border: "border-emerald-500/20", badge: "🔥 Imminent", badgeColor: "text-emerald-400 bg-emerald-500/15" },
    soon: { bg: "bg-cyan-500/[0.04]", border: "border-cyan-500/15", badge: "🚀 On Track", badgeColor: "text-cyan-400 bg-cyan-500/15" },
    steady: { bg: "bg-amber-500/[0.04]", border: "border-amber-500/15", badge: "📈 Steady", badgeColor: "text-amber-400 bg-amber-500/15" },
    distant: { bg: "bg-neutral-500/[0.03]", border: "border-white/[0.06]", badge: "🗓️ Long-term", badgeColor: "text-neutral-400 bg-white/[0.06]" },
  }[urgency];

  return (
    <div className={`${urgencyConfig.bg} border ${urgencyConfig.border} rounded-xl p-4 transition-all duration-500`}>
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} className="-rotate-90">
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={r}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
            />
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={r}
              fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-white tabular-nums">{projectedPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Next Milestone</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${urgencyConfig.badgeColor}`}>
              {urgencyConfig.badge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <span className="text-sm font-bold text-white truncate">{label}</span>
            <span className="text-sm font-extrabold tabular-nums" style={{ color }}>
              {fmtCompact(target)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px]">
            <span className="text-neutral-500">
              Now: <span className="text-white font-semibold tabular-nums">{fmtCompact(projectedCurrent)}</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-500">
              Remaining: <span className="text-neutral-300 font-semibold tabular-nums">{fmt(Math.round(projectedRemaining))}</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-500">
              +<span className="text-neutral-300 font-medium tabular-nums">{fmt(Math.round(dailyGrowth || 0))}</span>/day
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-1">
            {days > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-white tabular-nums leading-none">{days}</span>
                <span className="text-[8px] text-neutral-600 uppercase tracking-wider">days</span>
              </div>
            )}
            {days > 0 && <span className="text-neutral-700 text-sm font-bold mx-0.5">:</span>}
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-white tabular-nums leading-none">{hours.toString().padStart(2, "0")}</span>
              <span className="text-[8px] text-neutral-600 uppercase tracking-wider">hrs</span>
            </div>
            <span className="text-neutral-700 text-sm font-bold mx-0.5">:</span>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-white tabular-nums leading-none">{minutes.toString().padStart(2, "0")}</span>
              <span className="text-[8px] text-neutral-600 uppercase tracking-wider">min</span>
            </div>
          </div>
          <p className="text-[9px] text-neutral-600 mt-1">est. time to target</p>
        </div>
      </div>
    </div>
  );
}
