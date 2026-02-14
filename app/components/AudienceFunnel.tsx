"use client";

import { useEffect, useState } from "react";

interface FunnelStep {
  label: string;
  value: number;
  prior: number | null;
  color: string;
  icon: string;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

function pctChange(current: number, prior: number): number {
  if (!prior || prior === 0) return 0;
  return ((current - prior) / prior) * 100;
}

export default function AudienceFunnel({
  listeners,
  streams,
  saves,
  playlistAdds,
  followers,
  priorListeners = null,
  priorStreams = null,
  priorSaves = null,
  priorPlaylistAdds = null,
  priorFollowers = null,
}: {
  listeners: number;
  streams: number;
  saves: number;
  playlistAdds: number;
  followers: number;
  priorListeners?: number | null;
  priorStreams?: number | null;
  priorSaves?: number | null;
  priorPlaylistAdds?: number | null;
  priorFollowers?: number | null;
}) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const steps: FunnelStep[] = [
    { label: "Listeners", value: listeners, prior: priorListeners, color: "#1DB954", icon: "👂" },
    { label: "Streams", value: streams, prior: priorStreams, color: "#22D3EE", icon: "🎵" },
    { label: "Saves", value: saves, prior: priorSaves, color: "#A78BFA", icon: "💾" },
    { label: "Playlist Adds", value: playlistAdds, prior: priorPlaylistAdds, color: "#F59E0B", icon: "📋" },
    { label: "Followers", value: followers, prior: priorFollowers, color: "#EC4899", icon: "❤️" },
  ];

  const maxValue = Math.max(steps[0].value, ...(steps.map(s => s.prior ?? 0)));

  // Compute current and prior conversion rates for the summary
  const currentListenerToFollower = listeners > 0 ? (followers / listeners) * 100 : 0;
  const priorListenerToFollower = (priorListeners && priorFollowers && priorListeners > 0) ? (priorFollowers / priorListeners) * 100 : null;
  const currentSaveRate = streams > 0 ? (saves / streams) * 100 : 0;
  const priorSaveRate = (priorStreams && priorSaves && priorStreams > 0) ? (priorSaves / priorStreams) * 100 : null;
  const currentSPL = listeners > 0 ? streams / listeners : 0;
  const priorSPL = (priorListeners && priorStreams && priorListeners > 0) ? priorStreams / priorListeners : null;

  return (
    <div className="mt-5 pt-5 border-t border-white/[0.05]">
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-4">
        Audience Conversion Funnel
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          const displayWidth = Math.max(widthPct, 12);
          const priorWidthPct = (step.prior && maxValue > 0) ? (step.prior / maxValue) * 100 : 0;
          const priorDisplayWidth = priorWidthPct > 0 ? Math.max(priorWidthPct, 12) : 0;
          const conversionRate =
            i > 0 ? ((step.value / steps[i - 1].value) * 100).toFixed(1) : null;
          const priorConversionRate =
            i > 0 && steps[i - 1].prior && step.prior
              ? ((step.prior / steps[i - 1].prior!) * 100).toFixed(1)
              : null;
          const change = step.prior ? pctChange(step.value, step.prior) : null;

          // Detect funnel bottlenecks: biggest drop-off between steps
          const dropOff = i > 0 ? (1 - step.value / steps[i - 1].value) * 100 : 0;
          const isBottleneck = i > 0 && dropOff > 80; // >80% drop-off

          return (
            <div key={step.label}>
              <div className="flex items-center gap-3">
                {/* Label */}
                <div className="w-24 sm:w-28 flex-shrink-0 text-right">
                  <span className="text-[10px] text-neutral-500">
                    {step.icon} {step.label}
                  </span>
                  {change !== null && change !== 0 && (
                    <span
                      className={`ml-1 text-[9px] font-semibold ${
                        change > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {change > 0 ? "↑" : "↓"}
                      {Math.abs(change).toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Bar */}
                <div className="flex-1 relative">
                  <div className="w-full bg-white/[0.03] rounded-lg h-9 overflow-hidden relative">
                    {/* Ghost bar: prior period */}
                    {priorDisplayWidth > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out"
                        style={{
                          width: animated ? `${priorDisplayWidth}%` : "0%",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          borderLeft: `2px dashed rgba(255,255,255,0.12)`,
                          transitionDelay: `${i * 120}ms`,
                        }}
                      />
                    )}
                    {/* Current bar */}
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-1000 ease-out relative z-10"
                      style={{
                        width: animated ? `${displayWidth}%` : "0%",
                        backgroundColor: step.color + "22",
                        borderLeft: `3px solid ${step.color}`,
                        transitionDelay: `${i * 120}ms`,
                      }}
                    >
                      <span
                        className="text-sm font-extrabold tabular-nums"
                        style={{ color: step.color }}
                      >
                        {fmt(step.value)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversion rate badge */}
                <div className="w-20 flex-shrink-0 text-right">
                  {conversionRate !== null ? (
                    <div>
                      <span className={`text-[10px] font-semibold tabular-nums ${isBottleneck ? "text-amber-400" : "text-neutral-500"}`}>
                        {isBottleneck && "⚠ "}{conversionRate}%
                      </span>
                      {priorConversionRate !== null && (
                        <span className="text-[8px] text-neutral-600 block">
                          was {priorConversionRate}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-700">—</span>
                  )}
                </div>
              </div>

              {/* Arrow connector */}
              {i < steps.length - 1 && (
                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-28 flex-shrink-0" />
                  <div className="flex-1 flex justify-center">
                    <div className="text-neutral-700 text-[10px]">↓</div>
                  </div>
                  <div className="w-20 flex-shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall conversion summary */}
      <div className="mt-4 flex items-center justify-center gap-6 py-2 bg-white/[0.015] rounded-lg">
        <div className="text-center">
          <p className="text-[9px] text-neutral-600 uppercase">Listener → Follower</p>
          <p className="text-sm font-extrabold text-pink-400">
            {currentListenerToFollower.toFixed(1)}%
          </p>
          {priorListenerToFollower !== null && (
            <p className={`text-[8px] ${currentListenerToFollower > priorListenerToFollower ? "text-emerald-500" : "text-red-400"}`}>
              was {priorListenerToFollower.toFixed(1)}%
            </p>
          )}
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-[9px] text-neutral-600 uppercase">Save Rate</p>
          <p className="text-sm font-extrabold text-violet-400">
            {currentSaveRate.toFixed(1)}%
          </p>
          {priorSaveRate !== null && (
            <p className={`text-[8px] ${currentSaveRate > priorSaveRate ? "text-emerald-500" : "text-red-400"}`}>
              was {priorSaveRate.toFixed(1)}%
            </p>
          )}
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-[9px] text-neutral-600 uppercase">Streams / Listener</p>
          <p className="text-sm font-extrabold text-amber-400">
            {currentSPL.toFixed(1)}
          </p>
          {priorSPL !== null && (
            <p className={`text-[8px] ${currentSPL > priorSPL ? "text-emerald-500" : "text-red-400"}`}>
              was {priorSPL.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
