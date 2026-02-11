"use client";

import { useEffect, useState } from "react";

interface FunnelStep {
  label: string;
  value: number;
  color: string;
  icon: string;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function AudienceFunnel({
  listeners,
  streams,
  saves,
  playlistAdds,
  followers,
}: {
  listeners: number;
  streams: number;
  saves: number;
  playlistAdds: number;
  followers: number;
}) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const steps: FunnelStep[] = [
    { label: "Listeners", value: listeners, color: "#1DB954", icon: "👂" },
    { label: "Streams", value: streams, color: "#22D3EE", icon: "🎵" },
    { label: "Saves", value: saves, color: "#A78BFA", icon: "💾" },
    { label: "Playlist Adds", value: playlistAdds, color: "#F59E0B", icon: "📋" },
    { label: "Followers", value: followers, color: "#EC4899", icon: "❤️" },
  ];

  const maxValue = steps[0].value;

  return (
    <div className="mt-5 pt-5 border-t border-white/[0.05]">
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-4">
        Audience Conversion Funnel
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          // Minimum 12% width so small values are visible
          const displayWidth = Math.max(widthPct, 12);
          const conversionRate =
            i > 0 ? ((step.value / steps[i - 1].value) * 100).toFixed(1) : null;

          return (
            <div key={step.label}>
              <div className="flex items-center gap-3">
                {/* Label */}
                <div className="w-24 sm:w-28 flex-shrink-0 text-right">
                  <span className="text-[10px] text-neutral-500">
                    {step.icon} {step.label}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex-1 relative">
                  <div className="w-full bg-white/[0.03] rounded-lg h-9 overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-1000 ease-out"
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
                <div className="w-16 flex-shrink-0 text-right">
                  {conversionRate !== null ? (
                    <span className="text-[10px] font-semibold text-neutral-500 tabular-nums">
                      {conversionRate}%
                    </span>
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
                  <div className="w-16 flex-shrink-0" />
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
            {listeners > 0 ? ((followers / listeners) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="w-px h-6 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-[9px] text-neutral-600 uppercase">Save Rate</p>
          <p className="text-sm font-extrabold text-violet-400">
            {streams > 0 ? ((saves / streams) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="w-px h-6 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-[9px] text-neutral-600 uppercase">Streams / Listener</p>
          <p className="text-sm font-extrabold text-amber-400">
            {listeners > 0 ? (streams / listeners).toFixed(1) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
