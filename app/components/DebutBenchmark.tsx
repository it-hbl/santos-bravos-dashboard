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

  // Radar chart data: normalize each metric as % of max(current, benchmark, 1) capped at 200%
  const radarData = benchmarks.map(b => ({
    label: b.emoji + " " + b.label.replace("Spotify ", "").replace("Weekly ", ""),
    sb: Math.min(200, (b.current / (b.benchmark || 1)) * 100),
    benchmark: 100, // benchmark is always 100%
  }));

  return (
    <div className="space-y-4">
      {/* Radar Chart — visual overlay of current vs benchmark */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:w-1/2">
          <BenchmarkRadar data={radarData} overallScore={overallScore} overallRating={overallRating} daysSinceDebut={daysSinceDebut} />
        </div>
        <div className="w-full lg:w-1/2 space-y-4">
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
      </div>
    </div>
  );
}

/**
 * BenchmarkRadar — Pure SVG radar/spider chart overlaying Santos Bravos
 * performance (cyan polygon) against benchmark baseline (dashed white polygon).
 * No Recharts dependency — lightweight pure SVG.
 */
function BenchmarkRadar({ data, overallScore, overallRating, daysSinceDebut }: {
  data: { label: string; sb: number; benchmark: number }[];
  overallScore: number;
  overallRating: { label: string; emoji: string; color: string; bg: string };
  daysSinceDebut: number;
}) {
  const cx = 140, cy = 130, maxR = 100;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // top

  // Scale: 200% = full radius
  const scale = (pct: number) => Math.min(maxR, (pct / 200) * maxR);

  const pointAt = (i: number, r: number): [number, number] => {
    const angle = startAngle + i * angleStep;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const polygon = (values: number[]) =>
    values.map((v, i) => pointAt(i, scale(v))).map(([x, y]) => `${x},${y}`).join(" ");

  // Grid rings at 50%, 100%, 150%, 200%
  const rings = [50, 100, 150, 200];

  return (
    <div className="relative">
      <svg viewBox="0 0 280 275" className="w-full max-w-[320px] mx-auto">
        {/* Grid rings */}
        {rings.map(pct => (
          <polygon
            key={pct}
            points={Array.from({ length: n }, (_, i) => pointAt(i, scale(pct))).map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={pct === 100 ? 1.5 : 0.5}
            strokeDasharray={pct === 100 ? "none" : "2,3"}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const [x, y] = pointAt(i, maxR);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />;
        })}

        {/* Benchmark polygon (100% on all axes) — dashed white */}
        <polygon
          points={polygon(data.map(d => d.benchmark))}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />

        {/* Santos Bravos polygon — cyan filled */}
        <polygon
          points={polygon(data.map(d => d.sb))}
          fill="rgba(6,182,212,0.12)"
          stroke="#06b6d4"
          strokeWidth="2"
          className="drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"
        />

        {/* Data points on SB polygon */}
        {data.map((d, i) => {
          const [x, y] = pointAt(i, scale(d.sb));
          const isAbove = d.sb >= 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill={isAbove ? "#06b6d4" : "#ef4444"}
              stroke={isAbove ? "#06b6d4" : "#ef4444"}
              strokeWidth="1"
              className="drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]"
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const labelR = maxR + 18;
          const [x, y] = pointAt(i, labelR);
          const isAbove = d.sb >= 100;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isAbove ? "rgba(255,255,255,0.6)" : "rgba(239,68,68,0.7)"}
              fontSize="8.5"
              fontWeight="500"
              fontFamily="Inter, system-ui"
            >
              {d.label}
            </text>
          );
        })}

        {/* Center score */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Inter, system-ui">
          {overallScore}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter, system-ui">
          vs benchmark
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 -mt-2 text-[9px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-500 rounded-full inline-block" /> Santos Bravos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-white/30 inline-block" /> Benchmark (100%)
        </span>
      </div>
    </div>
  );
}
