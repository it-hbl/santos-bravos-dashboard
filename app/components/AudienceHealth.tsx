"use client";

interface Props {
  listeners: number;
  streams: number;
  saves: number;
  playlistAdds: number;
  followers: number;
  streamsPerListener: number;
}

interface Metric {
  label: string;
  value: number;
  format: string;
  benchmark: number;
  benchmarkLabel: string;
  description: string;
  color: string;
}

function formatValue(v: number, fmt: string) {
  if (fmt === "%") return v.toFixed(1) + "%";
  if (fmt === "x") return v.toFixed(2) + "×";
  return v.toFixed(1);
}

function getRating(ratio: number): { label: string; emoji: string; color: string } {
  if (ratio >= 1.5) return { label: "Exceptional", emoji: "🔥", color: "text-emerald-400" };
  if (ratio >= 1.0) return { label: "Strong", emoji: "💪", color: "text-green-400" };
  if (ratio >= 0.7) return { label: "Good", emoji: "👍", color: "text-amber-400" };
  if (ratio >= 0.4) return { label: "Building", emoji: "📈", color: "text-orange-400" };
  return { label: "Needs Work", emoji: "⚠️", color: "text-red-400" };
}

export default function AudienceHealth({ listeners, streams, saves, playlistAdds, followers, streamsPerListener }: Props) {
  const metrics: Metric[] = [
    {
      label: "Follower Conversion",
      value: (followers / listeners) * 100,
      format: "%",
      benchmark: 20,
      benchmarkLabel: "20% industry avg",
      description: "Listeners who became followers",
      color: "from-emerald-500 to-green-600",
    },
    {
      label: "Save Rate",
      value: (saves / streams) * 100,
      format: "%",
      benchmark: 3.5,
      benchmarkLabel: "3.5% industry avg",
      description: "Streams that resulted in a save",
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Playlist Add Rate",
      value: (playlistAdds / streams) * 100,
      format: "%",
      benchmark: 3.0,
      benchmarkLabel: "3% industry avg",
      description: "Streams that led to playlist adds",
      color: "from-cyan-500 to-blue-600",
    },
    {
      label: "Loyalty Index",
      value: streamsPerListener,
      format: "x",
      benchmark: 3.5,
      benchmarkLabel: "3.5× industry avg",
      description: "Avg streams per unique listener",
      color: "from-amber-500 to-orange-600",
    },
  ];

  // Overall health score (average of ratio-to-benchmark, capped at 100)
  const overallScore = Math.min(
    100,
    (metrics.reduce((sum, m) => sum + (m.value / m.benchmark), 0) / metrics.length) * 50
  );
  const overallRating = getRating(overallScore / 50);

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Audience Health</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full bg-white/[0.06] ${overallRating.color} font-medium`}>
          {overallRating.emoji} {overallRating.label} — {overallScore.toFixed(0)}/100
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const ratio = m.value / m.benchmark;
          const rating = getRating(ratio);
          const barWidth = Math.min(100, ratio * 50);
          return (
            <div
              key={m.label}
              className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 relative overflow-hidden group hover:border-white/[0.08] transition-colors"
            >
              {/* Background fill */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${m.color} opacity-[0.04] group-hover:opacity-[0.07] transition-opacity`}
                style={{ width: `${barWidth}%` }}
              />
              <div className="relative">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">{m.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">{formatValue(m.value, m.format)}</span>
                  <span className={`text-xs font-medium ${rating.color}`}>{rating.emoji} {rating.label}</span>
                </div>
                {/* Benchmark bar */}
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-neutral-600">{m.description}</span>
                  <span className="text-[9px] text-neutral-500">{m.benchmarkLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
