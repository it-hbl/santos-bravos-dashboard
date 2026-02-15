"use client";

import { useMemo } from "react";

interface Platform {
  name: string;
  current: number;
  prior: number | null;
  color: string;
  emoji: string;
}

interface Props {
  platforms: Platform[];
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/**
 * PlatformGrowthRace — Animated horizontal bar chart ranking platforms
 * by growth rate. Bars are proportional to growth %, sorted from highest
 * to lowest, with smooth CSS transitions for rank changes.
 * Shows absolute follower gain + percentage on each bar.
 */
export default function PlatformGrowthRace({ platforms }: Props) {
  const ranked = useMemo(() => {
    const withGrowth = platforms
      .filter(p => p.prior != null && p.prior > 0)
      .map(p => {
        const growth = ((p.current - p.prior!) / p.prior!) * 100;
        const gain = p.current - p.prior!;
        return { ...p, growth, gain };
      })
      .sort((a, b) => b.growth - a.growth);

    if (withGrowth.length === 0) return [];

    const maxGrowth = Math.max(...withGrowth.map(p => Math.abs(p.growth)), 0.1);
    return withGrowth.map((p, i) => ({
      ...p,
      rank: i + 1,
      barWidth: Math.max(8, (Math.abs(p.growth) / maxGrowth) * 100),
    }));
  }, [platforms]);

  if (ranked.length === 0) return null;

  const leader = ranked[0];
  const leaderAhead = ranked.length > 1
    ? (leader.growth - ranked[1].growth).toFixed(1)
    : null;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">
          🏁 Growth Race — Period over Period
        </p>
        {leaderAhead && (
          <span className="text-[9px] text-neutral-600">
            {leader.emoji} leads by +{leaderAhead}pp
          </span>
        )}
      </div>
      <div className="space-y-2">
        {ranked.map((p, i) => (
          <div
            key={p.name}
            className="group relative flex items-center gap-3 transition-all duration-700 ease-out"
            style={{
              transform: `translateY(0)`,
              transitionDelay: `${i * 50}ms`,
            }}
          >
            {/* Rank badge */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
              ${i === 0 ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30" : "bg-white/[0.03] text-neutral-600"}
            `}>
              {p.rank}
            </div>

            {/* Platform info */}
            <div className="w-20 flex-shrink-0">
              <span className="text-xs font-semibold text-white">{p.emoji} {p.name}</span>
            </div>

            {/* Bar */}
            <div className="flex-1 min-w-0">
              <div className="relative h-7 rounded-lg overflow-hidden bg-white/[0.02]">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out flex items-center"
                  style={{
                    width: `${p.barWidth}%`,
                    background: `linear-gradient(90deg, ${p.color}33, ${p.color}88)`,
                    boxShadow: i === 0 ? `0 0 20px ${p.color}22` : undefined,
                  }}
                >
                  {/* Inner shimmer for leader */}
                  {i === 0 && (
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${p.color}22 50%, transparent 100%)`,
                        animation: "shimmer 2.5s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>
                {/* Label on bar */}
                <div className="absolute inset-0 flex items-center px-3 justify-between">
                  <span className={`text-[10px] font-bold tabular-nums ${p.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {p.growth >= 0 ? "+" : ""}{p.growth.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-neutral-500 tabular-nums">
                    {p.gain >= 0 ? "+" : ""}{fmt(Math.abs(p.gain))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer insight */}
      <div className="mt-3 flex items-center gap-2 text-[9px] text-neutral-600">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/50" />
        <span>
          {leader.emoji} <strong className="text-neutral-400">{leader.name}</strong> growing fastest at +{leader.growth.toFixed(1)}% ({fmt(leader.gain)} new followers)
        </span>
      </div>
    </div>
  );
}
