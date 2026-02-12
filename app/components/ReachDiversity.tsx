"use client";

import { useEffect, useState, useRef } from "react";

interface Country {
  name: string;
  listeners: number;
  flag: string;
}

interface ReachDiversityProps {
  data: Country[];
}

/**
 * Reach Diversity Index — measures how evenly distributed listeners are across countries.
 * Uses inverse normalized HHI (Herfindahl-Hirschman Index):
 *   HHI = sum of (market_share_i)^2
 *   Normalized: (1 - HHI) / (1 - 1/N) * 100
 *   0 = all listeners in one country, 100 = perfectly even distribution
 */
export default function ReachDiversity({ data }: ReachDiversityProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const total = data.reduce((s, c) => s + c.listeners, 0);
  if (total === 0 || data.length < 2) return null;

  // Compute HHI
  const shares = data.map(c => c.listeners / total);
  const hhi = shares.reduce((s, sh) => s + sh * sh, 0);
  const n = data.length;
  // Normalized diversity: 0 (monopoly) → 100 (perfectly even)
  const diversity = Math.round(((1 - hhi) / (1 - 1 / n)) * 100);

  // Rating
  const getRating = (score: number) => {
    if (score >= 80) return { label: "Highly Diversified", emoji: "🌍", color: "text-emerald-400", bg: "bg-emerald-500" };
    if (score >= 60) return { label: "Well Diversified", emoji: "🌎", color: "text-cyan-400", bg: "bg-cyan-500" };
    if (score >= 40) return { label: "Moderately Concentrated", emoji: "📊", color: "text-amber-400", bg: "bg-amber-500" };
    if (score >= 20) return { label: "Concentrated", emoji: "📍", color: "text-orange-400", bg: "bg-orange-500" };
    return { label: "Highly Concentrated", emoji: "🎯", color: "text-red-400", bg: "bg-red-500" };
  };

  const rating = getRating(diversity);

  // Top 3 markets with share %
  const top3 = data
    .slice(0, 3)
    .map(c => ({ ...c, pct: ((c.listeners / total) * 100).toFixed(1) }));

  // Concentration ratio (top 3 share)
  const cr3 = top3.reduce((s, c) => s + parseFloat(c.pct), 0);

  // Animated entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokePct = animated ? (diversity / 100) * circumference : 0;

  return (
    <div ref={ref} className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.04]">
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-4">
        Reach Diversity Index
      </p>

      <div className="flex items-center gap-6">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* Background track */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="8"
            />
            {/* Diversity arc */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={diversity >= 60 ? "#10B981" : diversity >= 40 ? "#F59E0B" : "#EF4444"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokePct}
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black tabular-nums ${rating.color}`}>
              {animated ? diversity : 0}
            </span>
            <span className="text-[9px] text-neutral-600">/100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">{rating.emoji}</span>
            <span className={`text-sm font-bold ${rating.color}`}>{rating.label}</span>
          </div>

          {/* Top 3 concentration */}
          <div className="space-y-1.5">
            {top3.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-600 w-4 text-right font-bold">{i + 1}</span>
                <span className="text-xs">{c.flag}</span>
                <span className="text-xs text-neutral-300 flex-1 truncate">{c.name}</span>
                <span className="text-[10px] font-bold text-neutral-400 tabular-nums">{c.pct}%</span>
              </div>
            ))}
          </div>

          {/* CR3 summary */}
          <div className="pt-2 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-600 uppercase tracking-wider">Top 3 Concentration</span>
              <span className={`text-xs font-bold tabular-nums ${cr3 > 75 ? "text-amber-400" : "text-emerald-400"}`}>
                {cr3.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/[0.04] rounded-full h-1 mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${cr3 > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: animated ? `${cr3}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
