"use client";

import { useMemo, useEffect, useState } from "react";

interface SpotlightMetric {
  label: string;
  current: number;
  prior: number | null;
  category: "streaming" | "social" | "youtube" | "media" | "virality" | "audience";
  sectionId?: string;
}

interface Props {
  metrics: SpotlightMetric[];
  reportDate: string;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const CATEGORY_CONFIG: Record<string, { emoji: string; gradient: string; glow: string; ring: string }> = {
  streaming: { emoji: "🎵", gradient: "from-emerald-500 to-green-400", glow: "shadow-emerald-500/30", ring: "ring-emerald-500/30" },
  social:    { emoji: "📱", gradient: "from-cyan-500 to-blue-400",    glow: "shadow-cyan-500/30",    ring: "ring-cyan-500/30" },
  youtube:   { emoji: "▶️", gradient: "from-red-500 to-rose-400",     glow: "shadow-red-500/30",     ring: "ring-red-500/30" },
  media:     { emoji: "📰", gradient: "from-violet-500 to-purple-400",glow: "shadow-violet-500/30",  ring: "ring-violet-500/30" },
  virality:  { emoji: "🔥", gradient: "from-orange-500 to-amber-400", glow: "shadow-orange-500/30",  ring: "ring-orange-500/30" },
  audience:  { emoji: "👥", gradient: "from-pink-500 to-fuchsia-400", glow: "shadow-pink-500/30",    ring: "ring-pink-500/30" },
};

function getHeadline(label: string, pct: number, isPositive: boolean): string {
  const absPct = Math.abs(pct).toFixed(1);
  if (isPositive) {
    if (pct >= 50) return `${label} surged +${absPct}% — breakout growth`;
    if (pct >= 20) return `${label} jumped +${absPct}% — strong momentum`;
    if (pct >= 10) return `${label} climbed +${absPct}% — solid growth`;
    return `${label} rose +${absPct}% — steady progress`;
  } else {
    if (pct <= -20) return `${label} dropped ${absPct}% — needs attention`;
    if (pct <= -10) return `${label} declined ${absPct}% — monitor closely`;
    return `${label} dipped ${absPct}% — minor pullback`;
  }
}

/**
 * MetricSpotlight — Highlights the single most noteworthy metric change
 * as a prominent "headline" card. Picks the metric with the largest
 * absolute percentage change, prioritizing positive spikes.
 */
export default function MetricSpotlight({ metrics, reportDate }: Props) {
  const [visible, setVisible] = useState(false);

  const spotlight = useMemo(() => {
    const scored = metrics
      .filter(m => m.prior != null && m.prior > 0)
      .map(m => {
        const pct = ((m.current - m.prior!) / m.prior!) * 100;
        // Score: prioritize larger absolute changes, with bonus for positive
        const score = Math.abs(pct) + (pct > 0 ? 5 : 0);
        return { ...m, pct, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0] || null;
  }, [metrics]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!spotlight) return null;

  const { label, current, prior, pct, category, sectionId } = spotlight;
  const isPositive = pct >= 0;
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.streaming;
  const headline = getHeadline(label, pct, isPositive);
  const absPct = Math.abs(pct).toFixed(1);

  // Generate mini bar chart (prior vs current)
  const maxVal = Math.max(current, prior!);
  const priorPct = (prior! / maxVal) * 100;
  const currentPct = (current / maxVal) * 100;

  const handleClick = () => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${sectionId ? "cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04]" : ""}`}
      onClick={sectionId ? handleClick : undefined}
      role={sectionId ? "button" : undefined}
      tabIndex={sectionId ? 0 : undefined}
      onKeyDown={sectionId ? (e) => { if (e.key === "Enter") handleClick(); } : undefined}
    >
      {/* Accent gradient bar at top */}
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Icon + Change badge */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl shadow-lg ${config.glow}`}>
              {config.emoji}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              isPositive 
                ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20" 
                : "bg-red-500/15 text-red-400 ring-1 ring-red-500/20"
            }`}>
              {isPositive ? "↑" : "↓"} {absPct}%
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-1">
              📌 Metric Spotlight · {reportDate}
            </p>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug mb-2">
              {headline}
            </h3>

            {/* Prior → Current comparison */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Prior</span>
                <span className="text-sm font-bold text-neutral-400 tabular-nums">{fmt(prior!)}</span>
              </div>
              <svg className="w-4 h-4 text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Current</span>
                <span className={`text-sm font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>{fmt(current)}</span>
              </div>
            </div>

            {/* Mini comparison bars */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-neutral-600 w-12 text-right">Prior</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${priorPct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-neutral-600 w-12 text-right">Now</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out delay-300 ${
                      isPositive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Click hint */}
          {sectionId && (
            <div className="hidden sm:flex items-center text-neutral-600 text-[9px] flex-shrink-0 mt-1">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
