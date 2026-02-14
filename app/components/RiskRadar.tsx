"use client";

import { useState } from "react";

interface RiskItem {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: string;
  emoji: string;
  sectionId?: string;
}

interface RiskRadarProps {
  listeners: { current: number; prior?: number };
  tracks: { name: string; current: number; prior?: number }[];
  ytViews: { name: string; current: number; prior?: number }[];
  snsFootprint: { current: number; prior?: number };
  sentiment: { positive: number; negative: number; neutral: number };
  geoConcentration: { top1Pct: number; top3Pct: number };
  mentions?: { current: number; wowChangePct?: number };
  dailyStreams?: { name: string; streams: number; listeners: number }[];
}

function pctChange(current: number, prior?: number): number | null {
  if (!prior || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/** Compute an overall risk score 0-100 (100 = highest risk) */
function computeRiskScore(risks: RiskItem[]): number {
  if (risks.length === 0) return 0;
  const weights = { high: 30, medium: 15, low: 5 };
  const raw = risks.reduce((sum, r) => sum + weights[r.severity], 0);
  return Math.min(100, raw);
}

function getRiskLevel(score: number): { label: string; emoji: string; color: string; bgColor: string } {
  if (score >= 60) return { label: "Critical", emoji: "🔴", color: "text-red-400", bgColor: "from-red-500/20 to-red-600/10" };
  if (score >= 40) return { label: "Elevated", emoji: "🟠", color: "text-orange-400", bgColor: "from-orange-500/20 to-amber-600/10" };
  if (score >= 20) return { label: "Moderate", emoji: "🟡", color: "text-amber-400", bgColor: "from-amber-500/20 to-yellow-600/10" };
  if (score > 0) return { label: "Low", emoji: "🟢", color: "text-emerald-400", bgColor: "from-emerald-500/20 to-green-600/10" };
  return { label: "Clear", emoji: "✅", color: "text-emerald-400", bgColor: "from-emerald-500/20 to-green-600/10" };
}

function scrollToSection(id?: string) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    // Dispatch auto-expand event
    window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { sectionId: id } }));
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }
}

export default function RiskRadar({
  listeners,
  tracks,
  ytViews,
  snsFootprint,
  sentiment,
  geoConcentration,
  mentions,
  dailyStreams,
}: RiskRadarProps) {
  const [expanded, setExpanded] = useState(false);
  const risks: RiskItem[] = [];

  // 1. Declining listeners
  const listenerGrowth = pctChange(listeners.current, listeners.prior);
  if (listenerGrowth !== null && listenerGrowth < 0) {
    risks.push({
      title: "Spotify Listeners Declining",
      description: `Down ${Math.abs(listenerGrowth).toFixed(1)}% (${fmt(listeners.current)} → was ${fmt(listeners.prior!)})`,
      severity: listenerGrowth < -10 ? "high" : listenerGrowth < -5 ? "medium" : "low",
      category: "Streaming",
      emoji: "📉",
      sectionId: "business",
    });
  }

  // 2. Track growth stalling
  for (const t of tracks) {
    const growth = pctChange(t.current, t.prior);
    if (growth !== null && growth < 2) {
      risks.push({
        title: `${t.name} Stream Growth Stalling`,
        description: growth <= 0
          ? `Flat or declining at ${fmt(t.current)}`
          : `Only +${growth.toFixed(1)}% growth — momentum slowing`,
        severity: growth <= 0 ? "high" : "low",
        category: "Streaming",
        emoji: "⏸️",
        sectionId: "charts",
      });
    }
  }

  // 3. YouTube declining
  for (const v of ytViews) {
    const growth = pctChange(v.current, v.prior);
    if (growth !== null && growth < 0) {
      risks.push({
        title: `${v.name} YT Views Down`,
        description: `${growth.toFixed(1)}% decline — check content visibility`,
        severity: growth < -15 ? "high" : "medium",
        category: "YouTube",
        emoji: "🔴",
        sectionId: "business",
      });
    }
  }

  // 4. SNS footprint declining
  const snsGrowth = pctChange(snsFootprint.current, snsFootprint.prior);
  if (snsGrowth !== null && snsGrowth < 0) {
    risks.push({
      title: "SNS Footprint Shrinking",
      description: `Down ${Math.abs(snsGrowth).toFixed(1)}% across social platforms`,
      severity: snsGrowth < -5 ? "high" : "medium",
      category: "Social",
      emoji: "📱",
      sectionId: "social",
    });
  }

  // 5. Negative sentiment
  const netSentiment = sentiment.positive - sentiment.negative;
  if (netSentiment < 0) {
    risks.push({
      title: "Net Negative Sentiment",
      description: `Negative (${sentiment.negative.toFixed(0)}%) exceeds positive (${sentiment.positive.toFixed(0)}%) — investigate causes`,
      severity: netSentiment < -15 ? "high" : "medium",
      category: "Sentiment",
      emoji: "😟",
      sectionId: "sentiment",
    });
  } else if (sentiment.negative > 20) {
    risks.push({
      title: "Elevated Negative Sentiment",
      description: `${sentiment.negative.toFixed(0)}% negative mentions — monitor for emerging issues`,
      severity: sentiment.negative > 30 ? "high" : "low",
      category: "Sentiment",
      emoji: "⚠️",
      sectionId: "sentiment",
    });
  }

  // 6. Geographic concentration
  if (geoConcentration.top1Pct > 50) {
    risks.push({
      title: "High Market Concentration",
      description: `Top market = ${geoConcentration.top1Pct.toFixed(0)}% of listeners — diversification needed`,
      severity: geoConcentration.top1Pct > 65 ? "high" : "medium",
      category: "Geography",
      emoji: "🗺️",
      sectionId: "geo",
    });
  }
  if (geoConcentration.top3Pct > 80) {
    risks.push({
      title: "Top 3 Markets Dominate",
      description: `${geoConcentration.top3Pct.toFixed(0)}% of listeners in just 3 countries`,
      severity: "low",
      category: "Geography",
      emoji: "🌐",
      sectionId: "geo",
    });
  }

  // 7. Media momentum declining
  if (mentions?.wowChangePct !== undefined && mentions.wowChangePct < -15) {
    risks.push({
      title: "Media Buzz Declining",
      description: `${mentions.wowChangePct.toFixed(0)}% WoW drop in mentions — PR push may be needed`,
      severity: mentions.wowChangePct < -30 ? "high" : "medium",
      category: "PR",
      emoji: "📰",
      sectionId: "pr",
    });
  }

  // 8. Low replay depth
  if (dailyStreams) {
    for (const t of dailyStreams) {
      if (t.listeners > 0 && t.streams / t.listeners < 1.2) {
        risks.push({
          title: `Low Replay Depth: ${t.name}`,
          description: `${(t.streams / t.listeners).toFixed(2)}× streams/listener — below healthy threshold`,
          severity: "low",
          category: "Engagement",
          emoji: "🔁",
          sectionId: "daily",
        });
      }
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  if (risks.length === 0) return null;

  const highCount = risks.filter(r => r.severity === "high").length;
  const medCount = risks.filter(r => r.severity === "medium").length;
  const lowCount = risks.filter(r => r.severity === "low").length;
  const riskScore = computeRiskScore(risks);
  const riskLevel = getRiskLevel(riskScore);

  const severityColors = {
    high: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-300", label: "HIGH", hoverBorder: "hover:border-red-500/50" },
    medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300", label: "MEDIUM", hoverBorder: "hover:border-amber-500/50" },
    low: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300", label: "WATCH", hoverBorder: "hover:border-blue-500/50" },
  };

  // Show max 4 by default, expand to show all
  const visibleRisks = expanded ? risks : risks.slice(0, 4);
  const hasMore = risks.length > 4;

  return (
    <div className="space-y-4">
      {/* Risk Score Gauge + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Gauge */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${riskLevel.bgColor} border border-white/[0.06] min-w-[220px]`}>
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
              {/* Background arc */}
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/[0.06]" />
              {/* Score arc */}
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                stroke={riskScore >= 60 ? "#ef4444" : riskScore >= 40 ? "#f97316" : riskScore >= 20 ? "#f59e0b" : "#10b981"}
                strokeDasharray={`${(riskScore / 100) * 125.6} 125.6`}
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${riskLevel.color}`}>
              {riskScore}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{riskLevel.emoji} {riskLevel.label}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Risk Score · {risks.length} item{risks.length !== 1 ? "s" : ""} detected
            </p>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              🛡️ Risk Radar
              <span className="text-[10px] text-neutral-500 font-normal">Auto-detected watch items</span>
            </h3>
            <div className="flex items-center gap-2">
              {highCount > 0 && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                  {highCount} HIGH
                </span>
              )}
              {medCount > 0 && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {medCount} MED
                </span>
              )}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400">
                {risks.length} total
              </span>
            </div>
          </div>
          {/* Stacked severity bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04]">
            {highCount > 0 && (
              <div
                className="bg-red-500/70 transition-all duration-700"
                style={{ width: `${(highCount / risks.length) * 100}%` }}
                title={`${highCount} high severity`}
              />
            )}
            {medCount > 0 && (
              <div
                className="bg-amber-500/70 transition-all duration-700"
                style={{ width: `${(medCount / risks.length) * 100}%` }}
                title={`${medCount} medium severity`}
              />
            )}
            {lowCount > 0 && (
              <div
                className="bg-blue-500/70 transition-all duration-700"
                style={{ width: `${(lowCount / risks.length) * 100}%` }}
                title={`${lowCount} low severity`}
              />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            {highCount > 0 && <span className="text-[9px] text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> High</span>}
            {medCount > 0 && <span className="text-[9px] text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Medium</span>}
            {lowCount > 0 && <span className="text-[9px] text-blue-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Watch</span>}
          </div>
        </div>
      </div>

      {/* Risk Cards — clickable to jump to relevant section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {visibleRisks.map((risk, i) => {
          const colors = severityColors[risk.severity];
          return (
            <button
              key={i}
              onClick={() => scrollToSection(risk.sectionId)}
              className={`${colors.bg} ${colors.border} ${colors.hoverBorder} border rounded-xl p-3.5 transition-all hover:scale-[1.02] hover:shadow-lg text-left group cursor-pointer`}
              title={risk.sectionId ? `Click to view ${risk.category} section` : undefined}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-lg">{risk.emoji}</span>
                <div className="flex items-center gap-1.5">
                  {risk.sectionId && (
                    <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  )}
                  <span className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded ${colors.badge}`}>
                    {colors.label}
                  </span>
                </div>
              </div>
              <p className={`text-xs font-bold ${colors.text} mb-1 group-hover:text-white transition-colors`}>{risk.title}</p>
              <p className="text-[10px] text-neutral-400 leading-relaxed">{risk.description}</p>
              <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[8px] text-neutral-600 uppercase tracking-wider">{risk.category}</span>
                {risk.sectionId && (
                  <span className="text-[8px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    View section →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center py-2 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {expanded ? `Show less ↑` : `Show ${risks.length - 4} more risks ↓`}
        </button>
      )}
    </div>
  );
}
