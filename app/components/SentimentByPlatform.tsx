"use client";

interface PlatformSentiment {
  name: string;
  icon: string;
  color: string;
  volume: number;
  positive: number;
  negative: number;
  neutral: number;
  nss: number;
}

export default function SentimentByPlatform({ platforms }: { platforms: PlatformSentiment[] }) {
  if (!platforms || platforms.length === 0) return null;

  // Sort by volume descending
  const sorted = [...platforms].sort((a, b) => b.volume - a.volume);
  const maxVol = sorted[0]?.volume || 1;
  const bestNss = sorted.reduce((best, p) => (p.nss > best.nss ? p : best), sorted[0]);
  const worstNss = sorted.reduce((worst, p) => (p.nss < worst.nss ? p : worst), sorted[0]);

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-4">
        📊 Sentiment by Platform
      </p>

      <div className="space-y-3">
        {sorted.map((p) => {
          const isBest = sorted.length > 1 && p.name === bestNss.name;
          const isWorst = sorted.length > 1 && p.name === worstNss.name && worstNss.nss < 0;

          return (
            <div
              key={p.name}
              className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
            >
              {/* Header: icon + name + volume + NSS badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{p.icon}</span>
                <span className="text-sm font-medium text-neutral-200 flex-1">{p.name}</span>
                <span className="text-[9px] text-neutral-500 tabular-nums">
                  {p.volume.toLocaleString()} mentions
                </span>
                <span
                  className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                    p.nss > 5
                      ? "bg-emerald-500/15 text-emerald-400"
                      : p.nss < -5
                      ? "bg-red-500/15 text-red-400"
                      : "bg-neutral-500/15 text-neutral-400"
                  }`}
                >
                  {p.nss > 0 ? "+" : ""}{p.nss}
                </span>
                {isBest && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full">
                    💚 Best
                  </span>
                )}
                {isWorst && (
                  <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">
                    ⚠️ Watch
                  </span>
                )}
              </div>

              {/* Stacked sentiment bar */}
              <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04]">
                {p.positive > 0 && (
                  <div
                    className="bg-emerald-500 transition-all duration-700"
                    style={{ width: `${p.positive}%` }}
                    title={`Positive: ${p.positive}%`}
                  />
                )}
                {p.neutral > 0 && (
                  <div
                    className="bg-neutral-600 transition-all duration-700"
                    style={{ width: `${p.neutral}%` }}
                    title={`Neutral: ${p.neutral}%`}
                  />
                )}
                {p.negative > 0 && (
                  <div
                    className="bg-red-500 transition-all duration-700"
                    style={{ width: `${p.negative}%` }}
                    title={`Negative: ${p.negative}%`}
                  />
                )}
              </div>

              {/* Legend row */}
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-emerald-400 tabular-nums">😊 {p.positive}%</span>
                  <span className="text-[9px] text-neutral-500 tabular-nums">😐 {p.neutral}%</span>
                  <span className="text-[9px] text-red-400 tabular-nums">😟 {p.negative}%</span>
                </div>
                {/* Volume bar */}
                <div className="w-16 bg-white/[0.04] rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(p.volume / maxVol) * 100}%`,
                      backgroundColor: p.color,
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary insight */}
      {sorted.length >= 2 && (
        <div className="mt-3 px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            💡 <span className="text-emerald-400 font-medium">{bestNss.name}</span> has the highest
            net sentiment ({bestNss.nss > 0 ? "+" : ""}{bestNss.nss})
            {worstNss.nss < bestNss.nss && (
              <>, while <span className="text-amber-400 font-medium">{worstNss.name}</span> trails
              at {worstNss.nss > 0 ? "+" : ""}{worstNss.nss}</>
            )}.
            {sorted[0].name !== bestNss.name && (
              <> {sorted[0].name} leads in volume ({sorted[0].volume.toLocaleString()}).</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
