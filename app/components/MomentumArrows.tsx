"use client";

/**
 * MomentumArrows — Three compact directional indicators showing
 * the trajectory of the three key pillars: Streaming, Social, and Media.
 * Each arrow rotates based on growth rate to show direction at a glance.
 */

interface Pillar {
  label: string;
  emoji: string;
  pctChange: number | null;
  color: string;
  glowColor: string;
}

function getArrowRotation(pct: number | null): number {
  if (pct == null) return 0; // flat/unknown
  if (pct >= 10) return -45;  // strong up
  if (pct >= 3) return -25;   // up
  if (pct >= 0.5) return -10; // slight up
  if (pct > -0.5) return 0;   // flat
  if (pct > -3) return 10;    // slight down
  if (pct > -10) return 25;   // down
  return 45;                   // strong down
}

function getMomentumLabel(pct: number | null): string {
  if (pct == null) return "No data";
  if (pct >= 10) return "Surging";
  if (pct >= 3) return "Growing";
  if (pct >= 0.5) return "Rising";
  if (pct > -0.5) return "Stable";
  if (pct > -3) return "Softening";
  if (pct > -10) return "Declining";
  return "Dropping";
}

function getColor(pct: number | null): string {
  if (pct == null) return "text-neutral-500";
  if (pct >= 3) return "text-emerald-400";
  if (pct >= 0.5) return "text-emerald-400/70";
  if (pct > -0.5) return "text-neutral-400";
  if (pct > -3) return "text-amber-400/70";
  return "text-red-400";
}

export default function MomentumArrows({
  streamingPct,
  socialPct,
  mediaPct,
}: {
  streamingPct: number | null;
  socialPct: number | null;
  mediaPct: number | null;
}) {
  const pillars: Pillar[] = [
    { label: "Streaming", emoji: "🎵", pctChange: streamingPct, color: "from-green-500 to-emerald-400", glowColor: "#10B981" },
    { label: "Social", emoji: "📱", pctChange: socialPct, color: "from-cyan-500 to-blue-400", glowColor: "#06B6D4" },
    { label: "Media", emoji: "📰", pctChange: mediaPct, color: "from-violet-500 to-purple-400", glowColor: "#8B5CF6" },
  ];

  // Don't render if no data at all
  if (pillars.every(p => p.pctChange == null)) return null;

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
      {pillars.map((p) => {
        const rotation = getArrowRotation(p.pctChange);
        const label = getMomentumLabel(p.pctChange);
        const colorClass = getColor(p.pctChange);

        return (
          <div
            key={p.label}
            className="flex items-center gap-1.5 group"
            title={`${p.label}: ${p.pctChange != null ? (p.pctChange >= 0 ? "+" : "") + p.pctChange.toFixed(1) + "%" : "N/A"} — ${label}`}
          >
            <span className="text-[10px]">{p.emoji}</span>
            <div className="relative">
              <svg
                className={`w-4 h-4 ${colorClass} transition-transform duration-700 ease-out`}
                style={{ transform: `rotate(${rotation}deg)` }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <span className={`text-[10px] font-medium ${colorClass} hidden sm:inline`}>
              {label}
            </span>
            {p.pctChange != null && (
              <span className={`text-[9px] tabular-nums ${colorClass} opacity-60`}>
                {p.pctChange >= 0 ? "+" : ""}{p.pctChange.toFixed(1)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
