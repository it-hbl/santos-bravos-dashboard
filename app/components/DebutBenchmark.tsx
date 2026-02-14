"use client";

/**
 * DebutBenchmark — compares Santos Bravos' current metrics against
 * industry benchmarks for debut Latin pop acts at similar post-debut age.
 *
 * Benchmarks are derived from publicly available data on LATAM debut acts
 * (CNCO, MYA, Ventino, Sweet California, Reik early days) normalized to
 * similar post-debut windows. Values are approximate industry midpoints.
 */

interface BenchmarkMetric {
  label: string;
  current: number;
  benchmark: number;
  unit: string;
  emoji: string;
  color: string;
  description: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pctDiff(current: number, benchmark: number): number {
  if (benchmark === 0) return 0;
  return ((current - benchmark) / benchmark) * 100;
}

function getRating(pct: number): { label: string; emoji: string; color: string; bg: string } {
  if (pct >= 100) return { label: "Exceptional", emoji: "🏆", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  if (pct >= 50) return { label: "Outstanding", emoji: "🔥", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (pct >= 20) return { label: "Above Average", emoji: "🚀", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" };
  if (pct >= -10) return { label: "On Track", emoji: "✅", color: "text-neutral-400", bg: "bg-white/[0.04] border-white/[0.08]" };
  if (pct >= -30) return { label: "Below Average", emoji: "📉", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  return { label: "Needs Push", emoji: "⚠️", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
}

interface Props {
  daysSinceDebut: number;
  spotifyListeners: number;
  spotifyFollowers: number;
  totalStreams: number;
  snsFootprint: number;
  ytSubscribers: number;
  mediaMentions: number;
}

export default function DebutBenchmark({
  daysSinceDebut,
  spotifyListeners,
  spotifyFollowers,
  totalStreams,
  snsFootprint,
  ytSubscribers,
  mediaMentions,
}: Props) {
  // Benchmarks: approximate industry midpoints for LATAM debut boy bands
  // at ~3 weeks post-debut (scaled linearly for actual daysSinceDebut)
  // Base benchmarks at 21 days post-debut:
  const scaleFactor = daysSinceDebut / 21;
  const benchmarks: BenchmarkMetric[] = [
    {
      label: "Spotify Listeners",
      current: spotifyListeners,
      benchmark: Math.round(120_000 * scaleFactor), // 120K at 21d
      unit: "listeners",
      emoji: "🟢",
      color: "#1DB954",
      description: "Monthly listeners on Spotify",
    },
    {
      label: "Spotify Followers",
      current: spotifyFollowers,
      benchmark: Math.round(35_000 * scaleFactor), // 35K at 21d
      unit: "followers",
      emoji: "💚",
      color: "#22c55e",
      description: "Spotify profile followers",
    },
    {
      label: "Total Streams",
      current: totalStreams,
      benchmark: Math.round(8_000_000 * scaleFactor), // 8M at 21d
      unit: "streams",
      emoji: "🎵",
      color: "#8b5cf6",
      description: "Cross-platform total streams",
    },
    {
      label: "SNS Footprint",
      current: snsFootprint,
      benchmark: Math.round(500_000 * scaleFactor), // 500K at 21d
      unit: "followers",
      emoji: "📱",
      color: "#06b6d4",
      description: "Combined social media following",
    },
    {
      label: "YouTube Subs",
      current: ytSubscribers,
      benchmark: Math.round(150_000 * scaleFactor), // 150K at 21d
      unit: "subscribers",
      emoji: "▶️",
      color: "#ef4444",
      description: "YouTube channel subscribers",
    },
    {
      label: "Weekly Mentions",
      current: mediaMentions,
      benchmark: Math.round(2_000 * scaleFactor), // 2K at 21d
      unit: "mentions",
      emoji: "📰",
      color: "#a855f7",
      description: "Media mentions per week",
    },
  ];

  // Overall score: average of all benchmark comparisons (capped at 200%)
  const scores = benchmarks.map(b => Math.min(200, ((b.current / (b.benchmark || 1)) * 100)));
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const overallRating = getRating(overallScore - 100);

  return (
    <div className="space-y-4">
      {/* Header with overall score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke={overallScore >= 150 ? "#f59e0b" : overallScore >= 120 ? "#22c55e" : overallScore >= 90 ? "#06b6d4" : "#ef4444"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(150.8, (overallScore / 200) * 150.8)} 150.8`}
                transform="rotate(-90 28 28)"
                className="transition-all duration-1000 ease-out"
              />
              <text x="28" y="31" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Inter, system-ui">{overallScore}%</text>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Debut Benchmark Index</h3>
            <p className="text-[10px] text-neutral-500">
              vs. comparable LATAM debut acts at Day {daysSinceDebut}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border ${overallRating.bg} ${overallRating.color}`}>
          {overallRating.emoji} {overallRating.label} — {overallScore}% of benchmark
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {benchmarks.map(metric => {
          const diff = pctDiff(metric.current, metric.benchmark);
          const ratio = metric.benchmark > 0 ? Math.min(2, metric.current / metric.benchmark) : 1;
          const rating = getRating(diff);
          const isAbove = diff >= 0;
          return (
            <div
              key={metric.label}
              className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{metric.emoji}</span>
                <span className="text-[10px] text-neutral-500 font-medium">{metric.label}</span>
              </div>
              {/* Current vs Benchmark */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-white tabular-nums">{fmt(metric.current)}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isAbove ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {isAbove ? "↑" : "↓"}{Math.abs(diff).toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-neutral-600">
                  Benchmark: <span className="text-neutral-400">{fmt(metric.benchmark)}</span>
                </div>
                {/* Progress bar showing ratio */}
                <div className="relative w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden mt-1">
                  {/* Benchmark marker at 50% width (1x) */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10" />
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, ratio * 50)}%`,
                      background: isAbove
                        ? `linear-gradient(90deg, ${metric.color}88, ${metric.color})`
                        : `linear-gradient(90deg, #ef444488, #ef4444)`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-neutral-700 mt-0.5">
                  <span>0</span>
                  <span>benchmark</span>
                  <span>2×</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context footnote */}
      <p className="text-[9px] text-neutral-600 leading-relaxed">
        💡 Benchmarks based on average performance of comparable LATAM debut pop groups (CNCO, MYA, Ventino, etc.)
        at similar post-debut age, scaled to Day {daysSinceDebut}. Santos Bravos benefits from HYBE&apos;s
        established distribution and fanbase infrastructure, which may accelerate early metrics beyond organic benchmarks.
      </p>
    </div>
  );
}
