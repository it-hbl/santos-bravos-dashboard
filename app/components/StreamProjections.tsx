"use client";

interface Track {
  name: string;
  currentStreams: number;
  priorStreams: number | null;
  periodDays: number;
}

interface StreamProjectionsProps {
  tracks: Track[];
  dailyStreams: { name: string; streams: number }[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function shortName(name: string) {
  if (name === "0% (Portuguese Version)") return "0% PT";
  return name;
}

// Find the next round milestone above current
function nextMilestone(current: number): { target: number; label: string } {
  const thresholds = [
    { val: 1_000_000, label: "1M" },
    { val: 2_000_000, label: "2M" },
    { val: 3_000_000, label: "3M" },
    { val: 5_000_000, label: "5M" },
    { val: 7_500_000, label: "7.5M" },
    { val: 10_000_000, label: "10M" },
    { val: 15_000_000, label: "15M" },
    { val: 20_000_000, label: "20M" },
    { val: 25_000_000, label: "25M" },
    { val: 50_000_000, label: "50M" },
    { val: 100_000_000, label: "100M" },
  ];
  for (const t of thresholds) {
    if (current < t.val) return { target: t.val, label: t.label };
  }
  return { target: current * 2, label: fmt(current * 2) };
}

function daysUntil(current: number, target: number, dailyRate: number): number | null {
  if (dailyRate <= 0) return null;
  const remaining = target - current;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / dailyRate);
}

function projectedDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const TRACK_COLORS: Record<string, { bg: string; text: string; bar: string; ring: string }> = {
  "0%": { bg: "bg-emerald-500/10", text: "text-emerald-400", bar: "bg-emerald-500", ring: "ring-emerald-500/30" },
  "0% (Portuguese Version)": { bg: "bg-cyan-500/10", text: "text-cyan-400", bar: "bg-cyan-500", ring: "ring-cyan-500/30" },
  "KAWASAKI": { bg: "bg-pink-500/10", text: "text-pink-400", bar: "bg-pink-500", ring: "ring-pink-500/30" },
};

const DEFAULT_COLOR = { bg: "bg-violet-500/10", text: "text-violet-400", bar: "bg-violet-500", ring: "ring-violet-500/30" };

export default function StreamProjections({ tracks, dailyStreams }: StreamProjectionsProps) {
  // Build enriched data
  const enriched = tracks.map(t => {
    const daily = dailyStreams.find(d => d.name === t.name);
    const dailyRate24h = daily?.streams ?? 0;

    // Period-based daily rate (cumulative growth / days)
    const periodRate = t.priorStreams != null && t.periodDays > 0
      ? (t.currentStreams - t.priorStreams) / t.periodDays
      : 0;

    // Use the higher of 24h rate or period average as the "velocity"
    const velocity = Math.max(dailyRate24h, periodRate);

    const milestone = nextMilestone(t.currentStreams);
    const days = daysUntil(t.currentStreams, milestone.target, velocity);
    const pct = Math.min(100, (t.currentStreams / milestone.target) * 100);

    // Monthly projection at current rate
    const monthlyProjection = t.currentStreams + velocity * 30;

    return {
      ...t,
      dailyRate24h,
      periodRate: Math.round(periodRate),
      velocity: Math.round(velocity),
      milestone,
      daysToMilestone: days,
      projDate: days != null && days > 0 ? projectedDate(days) : null,
      pct,
      monthlyProjection,
      colors: TRACK_COLORS[t.name] || DEFAULT_COLOR,
    };
  });

  if (enriched.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-bold text-white">🚀 Stream Velocity & Projections</span>
        <span className="text-[10px] text-neutral-500">Daily run rates → next milestone ETA</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {enriched.map(t => {
          const c = t.colors;
          const paceLabel = t.daysToMilestone === null ? "No data"
            : t.daysToMilestone === 0 ? "🎉 Reached!"
            : t.daysToMilestone <= 14 ? "🔥 Imminent"
            : t.daysToMilestone <= 30 ? "🚀 On track"
            : t.daysToMilestone <= 90 ? "📈 Steady"
            : "🐢 Long road";

          return (
            <div
              key={t.name}
              className={`bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-300 group`}
            >
              {/* Track name */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${c.bar}`} />
                  <span className="text-sm font-bold text-white">{shortName(t.name)}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                  {paceLabel}
                </span>
              </div>

              {/* Current + daily velocity */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Current</p>
                  <p className={`text-base font-extrabold ${c.text}`}>{fmt(t.currentStreams)}</p>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Daily Velocity</p>
                  <p className="text-base font-extrabold text-white">
                    +{fmt(t.velocity)}<span className="text-[9px] text-neutral-500">/day</span>
                  </p>
                </div>
              </div>

              {/* 24h vs period rate comparison */}
              {t.dailyRate24h > 0 && t.periodRate > 0 && (
                <div className="flex items-center gap-3 mb-3 text-[10px]">
                  <span className="text-neutral-500">24h: <span className="text-white font-semibold">{fmt(t.dailyRate24h)}</span></span>
                  <span className="text-neutral-600">|</span>
                  <span className="text-neutral-500">{t.periodDays}d avg: <span className="text-white font-semibold">{fmt(t.periodRate)}</span></span>
                  {t.dailyRate24h > t.periodRate * 1.1 && (
                    <span className="text-emerald-400 font-semibold">↑ Accelerating</span>
                  )}
                  {t.dailyRate24h < t.periodRate * 0.9 && (
                    <span className="text-amber-400 font-semibold">↓ Slowing</span>
                  )}
                </div>
              )}

              {/* Milestone progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-400">
                    Next: <span className="text-white font-bold">{t.milestone.label} streams</span>
                  </span>
                  <span className={`font-bold ${c.text}`}>{t.pct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-[2s] ease-out`}
                    style={{ width: `${t.pct}%`, opacity: 0.8 }}
                  />
                </div>
                {t.daysToMilestone != null && t.daysToMilestone > 0 && t.projDate && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">
                      📅 Est. <span className="text-neutral-300 font-medium">{t.projDate}</span>
                    </span>
                    <span className="text-neutral-500">
                      {t.daysToMilestone}d remaining
                    </span>
                  </div>
                )}
                {t.daysToMilestone === 0 && (
                  <p className="text-emerald-400 text-[10px] font-bold">✅ Milestone reached!</p>
                )}
              </div>

              {/* 30-day projection */}
              <div className="mt-3 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500">30-day projection</span>
                  <span className="text-white font-bold">{fmt(t.monthlyProjection)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
