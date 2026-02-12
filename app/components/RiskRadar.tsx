"use client";

interface RiskItem {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: string;
  emoji: string;
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
  const risks: RiskItem[] = [];

  // 1. Declining metrics
  const listenerGrowth = pctChange(listeners.current, listeners.prior);
  if (listenerGrowth !== null && listenerGrowth < 0) {
    risks.push({
      title: "Spotify Listeners Declining",
      description: `Down ${Math.abs(listenerGrowth).toFixed(1)}% (${fmt(listeners.current)} → was ${fmt(listeners.prior!)})`,
      severity: listenerGrowth < -10 ? "high" : listenerGrowth < -5 ? "medium" : "low",
      category: "Streaming",
      emoji: "📉",
    });
  }

  // 2. Any track losing streams (unusual for cumulative, but check growth stalling)
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
    });
  }

  // 5. Negative sentiment outweighing positive
  const netSentiment = sentiment.positive - sentiment.negative;
  if (netSentiment < 0) {
    risks.push({
      title: "Net Negative Sentiment",
      description: `Negative (${sentiment.negative.toFixed(0)}%) exceeds positive (${sentiment.positive.toFixed(0)}%) — investigate causes`,
      severity: netSentiment < -15 ? "high" : "medium",
      category: "Sentiment",
      emoji: "😟",
    });
  } else if (sentiment.negative > 20) {
    risks.push({
      title: "Elevated Negative Sentiment",
      description: `${sentiment.negative.toFixed(0)}% negative mentions — monitor for emerging issues`,
      severity: sentiment.negative > 30 ? "high" : "low",
      category: "Sentiment",
      emoji: "⚠️",
    });
  }

  // 6. Geographic concentration risk
  if (geoConcentration.top1Pct > 50) {
    risks.push({
      title: "High Market Concentration",
      description: `Top market = ${geoConcentration.top1Pct.toFixed(0)}% of listeners — diversification needed`,
      severity: geoConcentration.top1Pct > 65 ? "high" : "medium",
      category: "Geography",
      emoji: "🗺️",
    });
  }
  if (geoConcentration.top3Pct > 80) {
    risks.push({
      title: "Top 3 Markets Dominate",
      description: `${geoConcentration.top3Pct.toFixed(0)}% of listeners in just 3 countries`,
      severity: "low",
      category: "Geography",
      emoji: "🌐",
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
    });
  }

  // 8. Low replay depth (streams/listener < 1.2)
  if (dailyStreams) {
    for (const t of dailyStreams) {
      if (t.listeners > 0 && t.streams / t.listeners < 1.2) {
        risks.push({
          title: `Low Replay Depth: ${t.name}`,
          description: `${(t.streams / t.listeners).toFixed(2)}× streams/listener — below healthy threshold`,
          severity: "low",
          category: "Engagement",
          emoji: "🔁",
        });
      }
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  if (risks.length === 0) return null;

  const severityColors = {
    high: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-300", label: "HIGH" },
    medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300", label: "MEDIUM" },
    low: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300", label: "WATCH" },
  };

  const highCount = risks.filter(r => r.severity === "high").length;
  const medCount = risks.filter(r => r.severity === "medium").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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

      {/* Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {risks.map((risk, i) => {
          const colors = severityColors[risk.severity];
          return (
            <div
              key={i}
              className={`${colors.bg} ${colors.border} border rounded-xl p-3.5 transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-lg">{risk.emoji}</span>
                <span className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded ${colors.badge}`}>
                  {colors.label}
                </span>
              </div>
              <p className={`text-xs font-bold ${colors.text} mb-1`}>{risk.title}</p>
              <p className="text-[10px] text-neutral-400 leading-relaxed">{risk.description}</p>
              <div className="mt-2 pt-2 border-t border-white/[0.05]">
                <span className="text-[8px] text-neutral-600 uppercase tracking-wider">{risk.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
