"use client";

import { useState } from "react";

const sources = [
  { key: "sb", label: "Supabase", icon: "🗄️", desc: "Primary database — all metrics stored here", live: true },
  { key: "cm", label: "Chartmetric", icon: "📊", desc: "Spotify listeners, popularity, track streams", live: false },
  { key: "yt", label: "YouTube Data API", icon: "▶️", desc: "Video views, likes, comments, subscribers", live: false },
  { key: "mw", label: "Meltwater", icon: "📰", desc: "PR mentions, sentiment, hashtags, entities", live: false },
] as const;

export default function DataSourcesStatus() {
  const [open, setOpen] = useState(false);

  return (
    <div className="print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors mx-auto group"
      >
        <span className="uppercase tracking-[0.15em] font-medium">Data Sources</span>
        <span className="tabular-nums font-bold text-emerald-500">Supabase</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {sources.map((src) => (
            <div
              key={src.key}
              className={`rounded-xl p-3 border transition-all ${
                src.live
                  ? "bg-emerald-500/[0.04] border-emerald-500/20"
                  : "bg-white/[0.02] border-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{src.icon}</span>
                <span className="text-xs font-bold text-white">{src.label}</span>
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${src.live ? "bg-emerald-500 animate-pulse-slow" : "bg-neutral-600"}`} />
              </div>
              <p className="text-[9px] text-neutral-600 mb-1.5">{src.desc}</p>
              <span className={`text-[9px] font-semibold uppercase tracking-wider ${src.live ? "text-emerald-400" : "text-neutral-600"}`}>
                {src.live ? "Connected" : "Via Agent"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
