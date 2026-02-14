"use client";

import { CountUpValue } from "./AnimatedSection";
import { useState } from "react";

/**
 * Estimated Revenue Calculator
 * Uses industry-average per-stream rates to estimate revenue across platforms.
 * Rates: Spotify ~$0.004/stream, YouTube ~$0.002/view, TikTok ~$0.003/audio view
 * These are approximations — actual rates vary by region, ad type, and contract.
 *
 * Enhanced: per-track revenue breakdown, monthly/annual projections, revenue donut.
 */

interface TrackRevenue {
  name: string;
  spotifyStreams: number;
  dailyStreams: number;
  color: string;
}

interface RevenueEstimateProps {
  spotifyStreams: number;
  youtubeViews: number;
  tiktokAudioViews: number;
  spotifyStreamsPrior: number | null;
  youtubeViewsPrior: number | null;
  tiktokAudioViewsPrior: number | null;
  tracks?: TrackRevenue[];
  daysBetween?: number;
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

function fmtStreams(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/** Mini SVG donut for revenue share */
function RevenueDonut({ segments }: { segments: { color: string; pct: number; label: string }[] }) {
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 -rotate-90">
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circumference;
        const gap = circumference - dash;
        const strokeOffset = -offset;
        offset += dash;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={14}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={strokeOffset}
            className="transition-all duration-1000 ease-out"
            opacity={0.85}
          >
            <title>{seg.label}: {seg.pct.toFixed(1)}%</title>
          </circle>
        );
      })}
    </svg>
  );
}

export default function RevenueEstimate({
  spotifyStreams,
  youtubeViews,
  tiktokAudioViews,
  spotifyStreamsPrior,
  youtubeViewsPrior,
  tiktokAudioViewsPrior,
  tracks,
  daysBetween,
}: RevenueEstimateProps) {
  const [showProjections, setShowProjections] = useState(false);

  const platforms = [
    {
      name: "Spotify",
      icon: "🟢",
      streams: spotifyStreams,
      prior: spotifyStreamsPrior,
      rate: RATES.spotify,
      color: "text-[#1DB954]",
      barColor: "bg-[#1DB954]",
      hex: "#1DB954",
    },
    {
      name: "YouTube",
      icon: "▶️",
      streams: youtubeViews,
      prior: youtubeViewsPrior,
      rate: RATES.youtube,
      color: "text-red-400",
      barColor: "bg-red-400",
      hex: "#f87171",
    },
    {
      name: "TikTok",
      icon: "🎵",
      streams: tiktokAudioViews,
      prior: tiktokAudioViewsPrior,
      rate: RATES.tiktok,
      color: "text-cyan-400",
      barColor: "bg-cyan-400",
      hex: "#22d3ee",
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

  // Platform donut segments
  const platformSegments = platforms.map(p => ({
    color: p.hex,
    pct: totalRevenue > 0 ? (p.streams * p.rate / totalRevenue) * 100 : 0,
    label: p.name,
  }));

  // Per-track revenue (Spotify only — YouTube/TikTok aren't per-track)
  const trackRevenues = tracks?.map(t => ({
    ...t,
    revenue: t.spotifyStreams * RATES.spotify,
    dailyRevenue: t.dailyStreams * RATES.spotify,
  })).sort((a, b) => b.revenue - a.revenue);
  const maxTrackRevenue = trackRevenues ? Math.max(...trackRevenues.map(t => t.revenue)) : 0;

  // Daily revenue velocity for projections
  const dailyTotalRevenue = (() => {
    if (!hasPrior || !daysBetween || daysBetween <= 0) return null;
    return (totalRevenue - priorTotalRevenue) / daysBetween;
  })();

  const monthlyProjection = dailyTotalRevenue != null ? dailyTotalRevenue * 30 : null;
  const annualProjection = dailyTotalRevenue != null ? dailyTotalRevenue * 365 : null;

  return (
    <div className="space-y-5">
      {/* Top row: Total + Donut */}
      <div className="flex items-start gap-6">
        <div className="flex-1">
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
          {revenueDiff !== null && revenueDiff !== 0 && (
            <p className={`text-xs font-bold tabular-nums mt-1 ${revenueDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {revenueDiff >= 0 ? "+" : ""}{fmtUSD(revenueDiff)} <span className="text-[9px] text-neutral-600 font-normal">vs prior</span>
            </p>
          )}
          {dailyTotalRevenue != null && dailyTotalRevenue > 0 && (
            <p className="text-[10px] text-emerald-400/70 mt-1">
              ⚡ {fmtUSD(dailyTotalRevenue)}/day revenue velocity
            </p>
          )}
        </div>
        <div className="flex-shrink-0 relative">
          <RevenueDonut segments={platformSegments} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] text-neutral-500 font-medium">by platform</span>
          </div>
        </div>
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

      {/* Per-Track Spotify Revenue Breakdown */}
      {trackRevenues && trackRevenues.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[10px] text-neutral-500 mb-3 flex items-center gap-1.5">
            <span>🎵</span> <span className="font-medium text-neutral-400">Revenue by Track</span> <span className="text-neutral-600">(Spotify streams × $0.004)</span>
          </p>
          <div className="space-y-2.5">
            {trackRevenues.map((t, i) => {
              const barWidth = maxTrackRevenue > 0 ? (t.revenue / maxTrackRevenue) * 100 : 0;
              const totalTrackRev = trackRevenues.reduce((s, tr) => s + tr.revenue, 0);
              const share = totalTrackRev > 0 ? (t.revenue / totalTrackRev) * 100 : 0;
              return (
                <div key={t.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        i === 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-neutral-500"
                      }`}>#{i + 1}</span>
                      <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">{t.name}</span>
                      <span className="text-[9px] text-neutral-600 tabular-nums">{fmtStreams(t.spotifyStreams)} streams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums text-emerald-400">{fmtUSD(t.revenue)}</span>
                      <span className="text-[9px] text-neutral-600 tabular-nums w-10 text-right">{share.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${barWidth}%`, opacity: 0.7, backgroundColor: t.color }}
                    />
                  </div>
                  {t.dailyStreams > 0 && (
                    <p className="text-[9px] text-neutral-600 mt-0.5 tabular-nums">
                      ⚡ {fmtUSD(t.dailyRevenue)}/day · {fmtStreams(t.dailyStreams)} streams/day
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue Projections Toggle */}
      {dailyTotalRevenue != null && dailyTotalRevenue > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => setShowProjections(!showProjections)}
            className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            <span>{showProjections ? "▾" : "▸"}</span>
            <span className="font-medium">📈 Revenue Projections at Current Velocity</span>
          </button>
          {showProjections && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                <p className="text-[9px] text-neutral-500 mb-1">30-Day Projection</p>
                <p className="text-lg font-black text-emerald-400 tabular-nums">
                  <CountUpValue value={monthlyProjection!} formatFn={fmtUSD} />
                </p>
                <p className="text-[9px] text-neutral-600">incremental revenue</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                <p className="text-[9px] text-neutral-500 mb-1">Annual Projection</p>
                <p className="text-lg font-black text-emerald-400 tabular-nums">
                  <CountUpValue value={annualProjection!} formatFn={fmtUSD} />
                </p>
                <p className="text-[9px] text-neutral-600">at current rate</p>
              </div>
              {trackRevenues && trackRevenues.length > 0 && (
                <div className="col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                  <p className="text-[9px] text-neutral-500 mb-2">Per-Track Monthly Projection (Spotify)</p>
                  <div className="space-y-1.5">
                    {trackRevenues.filter(t => t.dailyRevenue > 0).map(t => (
                      <div key={t.name} className="flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400">{t.name}</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: t.color }}>
                          {fmtUSD(t.dailyRevenue * 30)}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[9px] text-neutral-700 italic leading-relaxed">
        💡 Based on industry-average per-stream rates. Actual revenue depends on region, ad rates, and contract terms. Spotify ~$0.003–0.005, YouTube ~$0.001–0.003, TikTok ~$0.002–0.004 per play.
      </p>
    </div>
  );
}
