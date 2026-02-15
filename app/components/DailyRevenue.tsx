"use client";

/**
 * DailyRevenue — estimated daily revenue per track from Spotify streams.
 * Uses industry-average payout rate ($0.004/stream) to compute daily revenue,
 * total daily revenue, and projected monthly/annual run rates.
 */

interface Track {
  name: string;
  streams: number;
}

const SPOTIFY_RATE = 0.004; // avg $/stream

function fmt(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}

export default function DailyRevenue({ tracks }: { tracks: Track[] }) {
  if (!tracks || tracks.length === 0) return null;

  const totalStreams = tracks.reduce((s, t) => s + t.streams, 0);
  const dailyRevenue = totalStreams * SPOTIFY_RATE;
  const monthlyProjection = dailyRevenue * 30;
  const annualProjection = dailyRevenue * 365;

  const trackRevenues = tracks
    .map(t => ({
      name: t.name,
      streams: t.streams,
      revenue: t.streams * SPOTIFY_RATE,
      share: totalStreams > 0 ? (t.streams / totalStreams) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topTrack = trackRevenues[0];

  return (
    <div className="mt-4 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs">💵</span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">
            Estimated Daily Revenue (Spotify)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-emerald-400 tabular-nums">
            {fmt(dailyRevenue)}
          </span>
          <span className="text-[9px] text-neutral-600">/day</span>
        </div>
      </div>

      {/* Per-track breakdown */}
      <div className="space-y-2 mb-3">
        {trackRevenues.map((t, i) => {
          const barWidth = topTrack.revenue > 0 ? (t.revenue / topTrack.revenue) * 100 : 0;
          return (
            <div key={t.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-[9px]">👑</span>}
                  <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
                    {t.name}
                  </span>
                  <span className="text-[9px] text-neutral-600 tabular-nums">
                    {t.share.toFixed(0)}%
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 tabular-nums">
                  {fmt(t.revenue)}
                </span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-500/60 rounded-full transition-all duration-1000"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Projections */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-neutral-600">30d</span>
          <span className="text-[10px] font-semibold text-neutral-400 tabular-nums">{fmt(monthlyProjection)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-neutral-600">1yr</span>
          <span className="text-[10px] font-semibold text-neutral-400 tabular-nums">{fmt(annualProjection)}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[8px] text-neutral-700">@ $0.004/stream avg</span>
      </div>
    </div>
  );
}
