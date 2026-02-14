"use client";

/**
 * PlatformSync — measures how synchronized growth is across platforms.
 * A high sync score means all platforms are growing together (healthy).
 * A low score means growth is concentrated on one platform (risky).
 * Uses coefficient of variation of growth rates across platforms.
 */

interface PlatformGrowth {
  name: string;
  emoji: string;
  color: string;
  growthPct: number;
}

function getGrade(score: number): { label: string; emoji: string; color: string; bg: string; desc: string } {
  if (score >= 80) return { label: "Highly Synced", emoji: "🎯", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Growth is well-distributed across all platforms — low platform risk." };
  if (score >= 60) return { label: "Well Synced", emoji: "✅", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", desc: "Most platforms growing together with minor variation." };
  if (score >= 40) return { label: "Moderate", emoji: "⚖️", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", desc: "Some platform imbalance — investigate lagging channels." };
  if (score >= 20) return { label: "Imbalanced", emoji: "⚠️", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", desc: "Growth concentrated on few platforms — diversification needed." };
  return { label: "Disconnected", emoji: "🔴", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", desc: "Platforms growing at very different rates — strategic misalignment." };
}

function fmt(n: number): string {
  return n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
}

interface Props {
  platforms: PlatformGrowth[];
}

export default function PlatformSync({ platforms }: Props) {
  // Filter to platforms with non-null growth data
  const valid = platforms.filter(p => p.growthPct !== null && !isNaN(p.growthPct));
  if (valid.length < 2) return null;

  // Calculate sync score using inverse coefficient of variation
  // CV = std_dev / mean — lower CV = more synchronized
  const rates = valid.map(p => p.growthPct);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize: CV of 0 = 100 score (perfect sync), CV of 2+ = 0 score
  const cv = Math.abs(mean) > 0.1 ? stdDev / Math.abs(mean) : stdDev > 0.1 ? 2 : 0;
  const rawScore = Math.max(0, Math.min(100, (1 - cv / 2) * 100));
  const score = Math.round(rawScore);
  const grade = getGrade(score);

  // Sort by growth rate descending
  const sorted = [...valid].sort((a, b) => b.growthPct - a.growthPct);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];
  const gap = fastest.growthPct - slowest.growthPct;

  // Determine if all are growing, mixed, or all declining
  const allGrowing = valid.every(p => p.growthPct > 0);
  const allDeclining = valid.every(p => p.growthPct < 0);
  const direction = allGrowing ? "📈 All Growing" : allDeclining ? "📉 All Declining" : "↕️ Mixed";
  const dirColor = allGrowing ? "text-emerald-400" : allDeclining ? "text-red-400" : "text-amber-400";

  // Arc for gauge
  const arcLength = 150.8; // 2πr for r=24
  const filled = (score / 100) * arcLength;
  const arcColor = score >= 80 ? "#22c55e" : score >= 60 ? "#06b6d4" : score >= 40 ? "#f59e0b" : score >= 20 ? "#f97316" : "#ef4444";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mini gauge */}
          <div className="relative flex-shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
              <circle
                cx="26" cy="26" r="22"
                fill="none"
                stroke={arcColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${filled * (22/24)} ${arcLength}`}
                transform="rotate(-90 26 26)"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 4px ${arcColor}80)` }}
              />
              <text x="26" y="29" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Inter, system-ui">{score}</text>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Cross-Platform Sync</h3>
            <p className="text-[10px] text-neutral-500">
              How evenly growth is distributed across platforms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${grade.bg} ${grade.color}`}>
            {grade.emoji} {grade.label}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] ${dirColor}`}>
            {direction}
          </span>
        </div>
      </div>

      {/* Platform growth bars */}
      <div className="space-y-2.5">
        {sorted.map((p, i) => {
          const maxAbs = Math.max(...valid.map(v => Math.abs(v.growthPct)), 1);
          const barWidth = (Math.abs(p.growthPct) / maxAbs) * 100;
          const isPositive = p.growthPct >= 0;
          const isFastest = i === 0;
          const isSlowest = i === sorted.length - 1;
          return (
            <div key={p.name} className="group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm w-5 text-center">{p.emoji}</span>
                <span className="text-xs text-neutral-400 flex-1">{p.name}</span>
                {isFastest && <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">FASTEST</span>}
                {isSlowest && sorted.length > 2 && <span className="text-[8px] font-bold text-neutral-600 bg-white/[0.04] px-1.5 py-0.5 rounded-full">SLOWEST</span>}
                <span className={`text-xs font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {fmt(p.growthPct)}
                </span>
              </div>
              <div className="ml-7 w-auto bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background: isPositive
                      ? `linear-gradient(90deg, ${p.color}66, ${p.color})`
                      : `linear-gradient(90deg, #ef444466, #ef4444)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap insight */}
      <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
        <span className="text-sm">📊</span>
        <div className="flex-1">
          <p className="text-[10px] text-neutral-400">
            <span className="text-white font-semibold">{gap.toFixed(1)}pp gap</span> between fastest ({fastest.emoji} {fastest.name}) and slowest ({slowest.emoji} {slowest.name}).
            {" "}<span className="text-neutral-500">{grade.desc}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
