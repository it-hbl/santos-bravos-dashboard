"use client";

import { CountUpValue } from "./AnimatedSection";

/**
 * Estimated Revenue Calculator
 * Uses industry-average per-stream rates to estimate revenue across platforms.
 * Rates: Spotify ~$0.004/stream, YouTube ~$0.002/view, TikTok ~$0.003/audio view
 * These are approximations — actual rates vary by region, ad type, and contract.
 */

interface RevenueEstimateProps {
  spotifyStreams: number;
  youtubeViews: number;
  tiktokAudioViews: number;
  spotifyStreamsPrior: number | null;
  youtubeViewsPrior: number | null;
  tiktokAudioViewsPrior: number | null;
}

const RATES = {
  spotify: 0.004,
  youtube: 0.002,
  tiktok: 0.003,
};

function fmtUSD(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}

export default function RevenueEstimate({
  spotifyStreams,
  youtubeViews,
  tiktokAudioViews,
  spotifyStreamsPrior,
  youtubeViewsPrior,
  tiktokAudioViewsPrior,
}: RevenueEstimateProps) {
  const platforms = [
    {
      name: "Spotify",
      icon: "🟢",
      streams: spotifyStreams,
      prior: spotifyStreamsPrior,
      rate: RATES.spotify,
      color: "text-[#1DB954]",
      barColor: "bg-[#1DB954]",
    },
    {
      name: "YouTube",
      icon: "▶️",
      streams: youtubeViews,
      prior: youtubeViewsPrior,
      rate: RATES.youtube,
      color: "text-red-400",
      barColor: "bg-red-400",
    },
    {
      name: "TikTok",
      icon: "🎵",
      streams: tiktokAudioViews,
      prior: tiktokAudioViewsPrior,
      rate: RATES.tiktok,
      color: "text-cyan-400",
      barColor: "bg-cyan-400",
    },
  ];

  const totalRevenue = platforms.reduce((sum, p) => sum + p.streams * p.rate, 0);
  const priorTotalRevenue = platforms.reduce((sum, p) => {
    if (p.prior == null) return sum;
    return sum + p.prior * p.rate;
  }, 0);
  const hasPrior = platforms.some(p => p.prior != null);
  const revenueGrowth = hasPrior && priorTotalRevenue > 0
    ? ((totalRevenue - priorTotalRevenue) / priorTotalRevenue * 100)
    : null;
  const revenueDiff = hasPrior ? totalRevenue - priorTotalRevenue : null;

  const maxRevenue = Math.max(...platforms.map(p => p.streams * p.rate));

  return (
    <div className="space-y-4">
      {/* Total Estimated Revenue */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tabular-nums">
              <CountUpValue value={totalRevenue} formatFn={fmtUSD} />
            </span>
            {revenueGrowth !== null && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                revenueGrowth >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
              }`}>
                {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-500 mt-0.5">Estimated total revenue across all platforms</p>
        </div>
        {revenueDiff !== null && revenueDiff !== 0 && (
          <div className="text-right">
            <p className={`text-sm font-bold tabular-nums ${revenueDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {revenueDiff >= 0 ? "+" : ""}{fmtUSD(revenueDiff)}
            </p>
            <p className="text-[9px] text-neutral-600">vs prior period</p>
          </div>
        )}
      </div>

      {/* Per-Platform Breakdown */}
      <div className="space-y-3">
        {platforms.map(p => {
          const revenue = p.streams * p.rate;
          const share = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
          const barWidth = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
          const priorRevenue = p.prior != null ? p.prior * p.rate : null;
          const pctChange = priorRevenue != null && priorRevenue > 0
            ? ((revenue - priorRevenue) / priorRevenue * 100)
            : null;

          return (
            <div key={p.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{p.icon}</span>
                  <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">{p.name}</span>
                  <span className="text-[9px] text-neutral-600">@ ${p.rate.toFixed(3)}/stream</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold tabular-nums ${p.color}`}>{fmtUSD(revenue)}</span>
                  <span className="text-[9px] text-neutral-600 tabular-nums w-10 text-right">{share.toFixed(0)}%</span>
                  {pctChange !== null && (
                    <span className={`text-[9px] font-semibold tabular-nums ${pctChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.barColor} transition-all duration-1000 ease-out`}
                  style={{ width: `${barWidth}%`, opacity: 0.7 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-neutral-700 italic leading-relaxed">
        💡 Based on industry-average per-stream rates. Actual revenue depends on region, ad rates, and contract terms. Spotify ~$0.003–0.005, YouTube ~$0.001–0.003, TikTok ~$0.002–0.004 per play.
      </p>
    </div>
  );
}
