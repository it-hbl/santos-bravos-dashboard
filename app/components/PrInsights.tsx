"use client";

import { useMemo } from "react";

interface PrInsightsProps {
  totalMentions: number;
  perDay: number;
  uniqueAuthors: number;
  topCountries: { name: string; mentions: number; flag: string }[];
  topSources: { name: string; count: number; type: string }[];
  topKeyphrases: { phrase: string; count: number }[];
  timeSeries: { date: string; mentions: number }[];
  wow: { thisWeek: number; lastWeek: number; changePct: number } | null;
  sentimentPositive: number;
  sentimentNegative: number;
  sentimentNeutral: number;
  sentimentByPlatform: { name: string; volume: number; positive: number; negative: number; nss: number }[];
  topHashtags: { tag: string; count: number }[];
}

interface Insight {
  emoji: string;
  text: string;
  type: "positive" | "negative" | "neutral" | "info";
  priority: number;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n?.toLocaleString() ?? "—";
}

export default function PrInsights(props: PrInsightsProps) {
  const insights = useMemo(() => {
    const list: Insight[] = [];
    const {
      totalMentions, perDay, uniqueAuthors, topCountries, topSources,
      topKeyphrases, timeSeries, wow, sentimentPositive, sentimentNegative,
      sentimentNeutral, sentimentByPlatform, topHashtags,
    } = props;

    // 1. WoW trend
    if (wow) {
      const pct = wow.changePct;
      if (pct > 20) {
        list.push({ emoji: "🚀", text: `Mentions surged ${pct.toFixed(0)}% week-over-week — viral momentum detected`, type: "positive", priority: 10 });
      } else if (pct > 5) {
        list.push({ emoji: "📈", text: `Mentions up ${pct.toFixed(0)}% WoW (${fmt(wow.thisWeek)} vs ${fmt(wow.lastWeek)} prior)`, type: "positive", priority: 8 });
      } else if (pct < -20) {
        list.push({ emoji: "📉", text: `Mentions dropped ${Math.abs(pct).toFixed(0)}% WoW — attention declining`, type: "negative", priority: 10 });
      } else if (pct < -5) {
        list.push({ emoji: "⚠️", text: `Mentions down ${Math.abs(pct).toFixed(0)}% WoW — monitor closely`, type: "negative", priority: 8 });
      } else {
        list.push({ emoji: "➡️", text: `Mentions stable WoW (${pct > 0 ? "+" : ""}${pct.toFixed(1)}%)`, type: "neutral", priority: 3 });
      }
    }

    // 2. Spike detection in time series
    if (timeSeries.length >= 3) {
      const vals = timeSeries.map(d => d.mentions);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const maxVal = Math.max(...vals);
      const maxIdx = vals.indexOf(maxVal);
      if (maxVal > avg * 2 && avg > 0) {
        list.push({
          emoji: "⚡",
          text: `Spike on ${timeSeries[maxIdx].date}: ${fmt(maxVal)} mentions (${(maxVal / avg).toFixed(1)}× daily average)`,
          type: "info",
          priority: 9,
        });
      }
    }

    // 3. Top market dominance
    if (topCountries.length >= 2) {
      const top = topCountries[0];
      const totalCountryMentions = topCountries.reduce((s, c) => s + c.mentions, 0);
      const topPct = totalCountryMentions > 0 ? (top.mentions / totalCountryMentions * 100) : 0;
      if (topPct > 50) {
        list.push({
          emoji: top.flag || "🌍",
          text: `${top.name} dominates with ${topPct.toFixed(0)}% of geo-tagged mentions`,
          type: "info",
          priority: 6,
        });
      } else if (topPct > 30) {
        list.push({
          emoji: top.flag || "🌍",
          text: `${top.name} leads at ${topPct.toFixed(0)}%, followed by ${topCountries[1].name}`,
          type: "info",
          priority: 5,
        });
      }
    }

    // 4. Author reach ratio
    if (uniqueAuthors > 0 && totalMentions > 0) {
      const ratio = totalMentions / uniqueAuthors;
      if (ratio > 3) {
        list.push({
          emoji: "🔁",
          text: `High amplification: ${ratio.toFixed(1)} mentions per author — content is being reshared`,
          type: "positive",
          priority: 7,
        });
      } else if (ratio < 1.2) {
        list.push({
          emoji: "👥",
          text: `Broad reach: ${fmt(uniqueAuthors)} unique authors with low repeat (${ratio.toFixed(1)}×)`,
          type: "info",
          priority: 4,
        });
      }
    }

    // 5. Net sentiment assessment
    const nss = sentimentPositive - sentimentNegative;
    if (nss > 20) {
      list.push({ emoji: "💚", text: `Strong positive sentiment: Net +${nss.toFixed(0)} (${sentimentPositive.toFixed(0)}% pos vs ${sentimentNegative.toFixed(0)}% neg)`, type: "positive", priority: 7 });
    } else if (nss < -5) {
      list.push({ emoji: "🔴", text: `Negative sentiment alert: Net ${nss.toFixed(0)} — ${sentimentNegative.toFixed(0)}% negative`, type: "negative", priority: 9 });
    } else if (sentimentNeutral > 60) {
      list.push({ emoji: "😐", text: `${sentimentNeutral.toFixed(0)}% neutral sentiment — conversation is awareness-stage, not emotionally engaged yet`, type: "neutral", priority: 4 });
    }

    // 6. Platform with worst sentiment
    if (sentimentByPlatform.length >= 2) {
      const sorted = [...sentimentByPlatform].sort((a, b) => a.nss - b.nss);
      const worst = sorted[0];
      const best = sorted[sorted.length - 1];
      if (worst.nss < -10 && worst.volume > 10) {
        list.push({
          emoji: "⚠️",
          text: `${worst.name} has lowest sentiment (NSS ${worst.nss > 0 ? "+" : ""}${worst.nss.toFixed(0)}) — may need attention`,
          type: "negative",
          priority: 6,
        });
      }
      if (best.nss > 20 && best.volume > 10) {
        list.push({
          emoji: "⭐",
          text: `Best sentiment on ${best.name} (NSS +${best.nss.toFixed(0)}, ${fmt(best.volume)} mentions)`,
          type: "positive",
          priority: 5,
        });
      }
    }

    // 7. Top source insight
    if (topSources.length >= 1) {
      const top = topSources[0];
      const totalSourceMentions = topSources.reduce((s, src) => s + src.count, 0);
      const pct = totalSourceMentions > 0 ? (top.count / totalSourceMentions * 100) : 0;
      if (pct > 40) {
        list.push({
          emoji: "📰",
          text: `${top.name} drives ${pct.toFixed(0)}% of all source mentions — consider diversifying outreach`,
          type: "info",
          priority: 4,
        });
      }
    }

    // 8. Trending keyphrase
    if (topKeyphrases.length >= 1) {
      const top = topKeyphrases[0];
      list.push({
        emoji: "💬",
        text: `Top conversation topic: "${top.phrase}" (${fmt(top.count)} mentions)`,
        type: "info",
        priority: 3,
      });
    }

    // Sort by priority descending, take top 5
    list.sort((a, b) => b.priority - a.priority);
    return list.slice(0, 5);
  }, [props]);

  if (insights.length === 0) return null;

  const typeStyles = {
    positive: "border-emerald-500/20 bg-emerald-500/[0.04]",
    negative: "border-red-500/20 bg-red-500/[0.04]",
    neutral: "border-neutral-500/20 bg-neutral-500/[0.04]",
    info: "border-violet-500/20 bg-violet-500/[0.04]",
  };

  const dotStyles = {
    positive: "bg-emerald-400",
    negative: "bg-red-400",
    neutral: "bg-neutral-500",
    info: "bg-violet-400",
  };

  return (
    <div className="mb-5">
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🧠 Auto-Generated Insights</p>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-all hover:bg-white/[0.03] ${typeStyles[insight.type]}`}
          >
            <span className="text-sm mt-0.5 shrink-0">{insight.emoji}</span>
            <span className="text-[13px] text-neutral-300 leading-relaxed">{insight.text}</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ml-auto ${dotStyles[insight.type]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
