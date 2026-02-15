"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ActivityItem {
  id: string;
  type: "milestone" | "spike" | "trend" | "sentiment" | "release" | "social";
  title: string;
  detail: string;
  time: string;
  icon: string;
  color: string;
  severity: "info" | "positive" | "negative" | "neutral";
}

interface ActivityFeedProps {
  listeners: number;
  listenersPrior: number | null;
  tracks: { name: string; streams: number; prior: number | null }[];
  ytSubscribers: number;
  snsFootprint: number;
  snsPrior: number | null;
  prMentions: number;
  prPerDay: number;
  sentimentPositive: number;
  sentimentNegative: number;
  topHashtag: string | null;
  reportDate: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pctChange(current: number, prior: number | null): number | null {
  if (!prior || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

const TYPE_STYLES: Record<string, { gradient: string; glow: string }> = {
  milestone: { gradient: "from-amber-500/20 to-orange-500/10", glow: "shadow-amber-500/10" },
  spike: { gradient: "from-emerald-500/20 to-cyan-500/10", glow: "shadow-emerald-500/10" },
  trend: { gradient: "from-blue-500/20 to-indigo-500/10", glow: "shadow-blue-500/10" },
  sentiment: { gradient: "from-rose-500/20 to-pink-500/10", glow: "shadow-rose-500/10" },
  release: { gradient: "from-violet-500/20 to-purple-500/10", glow: "shadow-violet-500/10" },
  social: { gradient: "from-cyan-500/20 to-teal-500/10", glow: "shadow-cyan-500/10" },
};

export default function ActivityFeed({
  listeners,
  listenersPrior,
  tracks,
  ytSubscribers,
  snsFootprint,
  snsPrior,
  prMentions,
  prPerDay,
  sentimentPositive,
  sentimentNegative,
  topHashtag,
  reportDate,
}: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false);

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];
    const now = new Date();
    const hours = (offset: number) => {
      const d = new Date(now.getTime() - offset * 3600000);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    // Listener milestones
    const listenerPct = pctChange(listeners, listenersPrior);
    if (listeners >= 100000) {
      const milestone = listeners >= 500000 ? "500K" : listeners >= 250000 ? "250K" : "100K";
      const progress = listeners >= 500000 ? (listeners / 500000 * 100) : listeners >= 250000 ? (listeners / 500000 * 100) : (listeners / 250000 * 100);
      items.push({
        id: "listener-milestone",
        type: "milestone",
        title: `${fmt(listeners)} Monthly Listeners`,
        detail: progress >= 90 ? `🔥 ${progress.toFixed(0)}% to ${milestone} milestone!` : `Tracking toward ${milestone} milestone (${progress.toFixed(0)}%)`,
        time: hours(0.5),
        icon: "🎧",
        color: "text-spotify",
        severity: listenerPct && listenerPct > 0 ? "positive" : "info",
      });
    }

    // Track performance highlights
    const topTrack = [...tracks].sort((a, b) => b.streams - a.streams)[0];
    if (topTrack) {
      const tPct = pctChange(topTrack.streams, topTrack.prior);
      items.push({
        id: "top-track",
        type: "spike",
        title: `${topTrack.name}: ${fmt(topTrack.streams)} streams`,
        detail: tPct ? `${tPct > 0 ? "+" : ""}${tPct.toFixed(1)}% growth since last report` : "Leading track by total streams",
        time: hours(1),
        icon: "🎵",
        color: "text-emerald-400",
        severity: tPct && tPct > 3 ? "positive" : "info",
      });
    }

    // Fastest growing track
    const growingTracks = tracks.filter(t => t.prior).map(t => ({ ...t, pct: pctChange(t.streams, t.prior)! })).filter(t => t.pct > 0).sort((a, b) => b.pct - a.pct);
    if (growingTracks.length > 0 && growingTracks[0].name !== topTrack?.name) {
      const gt = growingTracks[0];
      items.push({
        id: "growing-track",
        type: "trend",
        title: `${gt.name} accelerating`,
        detail: `+${gt.pct.toFixed(1)}% growth — fastest rising track`,
        time: hours(1.5),
        icon: "📈",
        color: "text-blue-400",
        severity: "positive",
      });
    }

    // YouTube subscribers
    if (ytSubscribers >= 400000) {
      const target = 500000;
      const remaining = target - ytSubscribers;
      if (remaining > 0 && remaining < 100000) {
        items.push({
          id: "yt-milestone",
          type: "milestone",
          title: `YouTube: ${fmt(ytSubscribers)} subscribers`,
          detail: `${fmt(remaining)} away from 500K milestone 🎯`,
          time: hours(2),
          icon: "▶️",
          color: "text-red-400",
          severity: "positive",
        });
      }
    }

    // SNS footprint
    const snsPct = pctChange(snsFootprint, snsPrior);
    if (snsPct && Math.abs(snsPct) >= 1) {
      items.push({
        id: "sns-change",
        type: "social",
        title: `Social footprint: ${fmt(snsFootprint)}`,
        detail: `${snsPct > 0 ? "+" : ""}${snsPct.toFixed(1)}% across all platforms`,
        time: hours(3),
        icon: "📱",
        color: snsPct > 0 ? "text-cyan-400" : "text-amber-400",
        severity: snsPct > 0 ? "positive" : "negative",
      });
    }

    // PR & Media
    if (prPerDay > 0) {
      items.push({
        id: "pr-volume",
        type: "trend",
        title: `${fmt(prMentions)} media mentions`,
        detail: `Averaging ${fmt(prPerDay)} mentions/day this week`,
        time: hours(4),
        icon: "📰",
        color: "text-violet-400",
        severity: prPerDay >= 500 ? "positive" : "info",
      });
    }

    // Sentiment
    const netSentiment = sentimentPositive - sentimentNegative;
    items.push({
      id: "sentiment",
      type: "sentiment",
      title: `Net sentiment: +${netSentiment.toFixed(0)}`,
      detail: `${sentimentPositive.toFixed(0)}% positive · ${sentimentNegative.toFixed(0)}% negative${topHashtag ? ` · ${topHashtag} trending` : ""}`,
      time: hours(5),
      icon: netSentiment >= 10 ? "😊" : netSentiment >= 0 ? "😐" : "😟",
      color: netSentiment >= 10 ? "text-emerald-400" : netSentiment >= 0 ? "text-amber-400" : "text-red-400",
      severity: netSentiment >= 10 ? "positive" : netSentiment >= 0 ? "neutral" : "negative",
    });

    // Days since debut
    const debutDate = new Date("2026-01-24T12:00:00");
    const daysSinceDebut = Math.floor((now.getTime() - debutDate.getTime()) / 86400000);
    items.push({
      id: "debut-days",
      type: "release",
      title: `Day ${daysSinceDebut} since debut`,
      detail: `Santos Bravos debuted ${daysSinceDebut} days ago · Building momentum`,
      time: hours(6),
      icon: "🗓️",
      color: "text-fuchsia-400",
      severity: "info",
    });

    return items;
  }, [listeners, listenersPrior, tracks, ytSubscribers, snsFootprint, snsPrior, prMentions, prPerDay, sentimentPositive, sentimentNegative, topHashtag, reportDate]);

  const displayItems = expanded ? activities : activities.slice(0, 4);

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Activity Feed</h3>
          <span className="text-[9px] text-neutral-600 tabular-nums">{activities.length} events</span>
        </div>
        {activities.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-wider transition-colors"
          >
            {expanded ? "Show Less" : `Show All (${activities.length})`}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/20 via-white/[0.06] to-transparent" />

        <AnimatePresence mode="popLayout">
          {displayItems.map((item, i) => {
            const style = TYPE_STYLES[item.type] || TYPE_STYLES.trend;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`relative flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group`}
              >
                {/* Timeline dot */}
                <div className={`relative z-10 w-[14px] h-[14px] rounded-full bg-gradient-to-br ${style.gradient} border border-white/[0.1] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg ${style.glow}`}>
                  <div className="w-[6px] h-[6px] rounded-full bg-white/30" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm flex-shrink-0">{item.icon}</span>
                    <p className={`text-xs font-bold ${item.color} truncate`}>{item.title}</p>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{item.detail}</p>
                </div>

                {/* Time */}
                <span className="text-[9px] text-neutral-700 tabular-nums flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.time}
                </span>

                {/* Severity indicator */}
                <div className={`absolute right-3 top-3 w-1 h-1 rounded-full flex-shrink-0 ${
                  item.severity === "positive" ? "bg-emerald-400" :
                  item.severity === "negative" ? "bg-red-400" :
                  item.severity === "neutral" ? "bg-amber-400" :
                  "bg-neutral-600"
                }`} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
