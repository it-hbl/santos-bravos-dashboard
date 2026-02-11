"use client";

import { useState } from "react";
import { useLiveData } from "./LiveDataProvider";

const sources = [
  { key: "cm", label: "Chartmetric", icon: "📊", desc: "Spotify listeners, popularity, track streams" },
  { key: "yt", label: "YouTube Data API", icon: "▶️", desc: "Video views, likes, comments, subscribers" },
  { key: "mw", label: "Meltwater", icon: "📰", desc: "PR mentions, sentiment, hashtags, entities" },
] as const;

export default function DataSourcesStatus() {
  const { isLive, isYouTubeLive, isMeltwaterLive, chartmetric, youtube, meltwater, loading } = useLiveData();
  const [open, setOpen] = useState(false);

  const statusMap: Record<string, { live: boolean; fetchedAt: string | null }> = {
    cm: { live: isLive, fetchedAt: chartmetric?.fetchedAt ?? null },
    yt: { live: isYouTubeLive, fetchedAt: youtube?.fetchedAt ?? null },
    mw: { live: isMeltwaterLive, fetchedAt: meltwater?.fetchedAt ?? null },
  };

  const liveCount = [isLive, isYouTubeLive, isMeltwaterLive].filter(Boolean).length;

  return (
    <div className="print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors mx-auto group"
      >
        <span className="uppercase tracking-[0.15em] font-medium">Data Sources</span>
        <span className={`tabular-nums font-bold ${liveCount === 3 ? "text-emerald-500" : liveCount > 0 ? "text-amber-500" : "text-neutral-600"}`}>
          {loading ? "..." : `${liveCount}/3 Live`}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {sources.map((src) => {
            const s = statusMap[src.key];
            const time = s.fetchedAt
              ? new Date(s.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : null;
            return (
              <div
                key={src.key}
                className={`rounded-xl p-3 border transition-all ${
                  s.live
                    ? "bg-emerald-500/[0.04] border-emerald-500/20"
                    : "bg-white/[0.02] border-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{src.icon}</span>
                  <span className="text-xs font-bold text-white">{src.label}</span>
                  <div
                    className={`ml-auto w-1.5 h-1.5 rounded-full ${
                      loading ? "bg-yellow-500 animate-pulse" : s.live ? "bg-emerald-500 animate-pulse-slow" : "bg-neutral-600"
                    }`}
                  />
                </div>
                <p className="text-[9px] text-neutral-600 mb-1.5">{src.desc}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider ${
                      loading ? "text-yellow-500" : s.live ? "text-emerald-400" : "text-neutral-600"
                    }`}
                  >
                    {loading ? "Connecting…" : s.live ? "Live" : "Fallback"}
                  </span>
                  {time && (
                    <span className="text-[9px] text-neutral-600 tabular-nums">{time}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
