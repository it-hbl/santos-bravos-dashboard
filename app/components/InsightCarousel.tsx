"use client";

import { useEffect, useState, useMemo } from "react";

interface Insight {
  emoji: string;
  text: string;
  category: string;
  color: string; // tailwind text color
}

interface InsightCarouselProps {
  listeners: number;
  listenersPrior: number | null;
  tracks: { name: string; streams: number; prior: number | null }[];
  ytVideos: { name: string; views: number; prior: number | null }[];
  snsFootprint: number;
  snsPrior: number | null;
  topCountry: { name: string; flag: string; pct: number } | null;
  prMentions: number;
  prPerDay: number;
  netSentiment: number;
  topHashtag: string | null;
}

function pctChange(current: number, prior: number | null): number | null {
  if (prior === null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function InsightCarousel(props: InsightCarouselProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const insights = useMemo(() => {
    const items: Insight[] = [];

    // Listener growth
    const listGrowth = pctChange(props.listeners, props.listenersPrior);
    if (listGrowth !== null && listGrowth > 0) {
      items.push({
        emoji: "🎧",
        text: `Spotify listeners grew ${listGrowth.toFixed(1)}% to ${fmt(props.listeners)}`,
        category: "Streaming",
        color: "text-emerald-400",
      });
    }

    // Fastest growing track
    const trackGrowths = props.tracks
      .map(t => ({ name: t.name, pct: pctChange(t.streams, t.prior) }))
      .filter(t => t.pct !== null && t.pct > 0)
      .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
    if (trackGrowths.length > 0) {
      items.push({
        emoji: "🚀",
        text: `${trackGrowths[0].name} is the fastest-growing track at +${trackGrowths[0].pct!.toFixed(1)}%`,
        category: "Tracks",
        color: "text-violet-400",
      });
    }

    // Top track by volume
    const topTrack = [...props.tracks].sort((a, b) => b.streams - a.streams)[0];
    if (topTrack) {
      items.push({
        emoji: "💿",
        text: `${topTrack.name} leads with ${fmt(topTrack.streams)} total Spotify streams`,
        category: "Streaming",
        color: "text-green-400",
      });
    }

    // Fastest growing YT video
    const ytGrowths = props.ytVideos
      .map(v => ({ name: v.name, pct: pctChange(v.views, v.prior) }))
      .filter(v => v.pct !== null && v.pct > 0)
      .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
    if (ytGrowths.length > 0) {
      items.push({
        emoji: "▶️",
        text: `${ytGrowths[0].name} is surging on YouTube at +${ytGrowths[0].pct!.toFixed(1)}%`,
        category: "YouTube",
        color: "text-red-400",
      });
    }

    // SNS footprint
    const snsPct = pctChange(props.snsFootprint, props.snsPrior);
    if (snsPct !== null) {
      items.push({
        emoji: "📱",
        text: `Social media footprint ${snsPct >= 0 ? "grew" : "decreased"} ${Math.abs(snsPct).toFixed(1)}% to ${fmt(props.snsFootprint)}`,
        category: "Social",
        color: "text-cyan-400",
      });
    }

    // Top country
    if (props.topCountry) {
      items.push({
        emoji: props.topCountry.flag,
        text: `${props.topCountry.name} drives ${props.topCountry.pct.toFixed(0)}% of your listener base`,
        category: "Geography",
        color: "text-amber-400",
      });
    }

    // PR mentions
    if (props.prMentions > 0) {
      items.push({
        emoji: "📰",
        text: `${fmt(props.prMentions)} media mentions this week — ${fmt(props.prPerDay)} per day`,
        category: "PR & Media",
        color: "text-violet-400",
      });
    }

    // Sentiment
    if (props.netSentiment > 5) {
      items.push({
        emoji: "💚",
        text: `Net sentiment is +${props.netSentiment.toFixed(0)} — public reception is positive`,
        category: "Sentiment",
        color: "text-emerald-400",
      });
    } else if (props.netSentiment < -5) {
      items.push({
        emoji: "⚠️",
        text: `Net sentiment is ${props.netSentiment.toFixed(0)} — worth monitoring`,
        category: "Sentiment",
        color: "text-red-400",
      });
    }

    // Top hashtag
    if (props.topHashtag) {
      items.push({
        emoji: "#️⃣",
        text: `${props.topHashtag} is the top trending hashtag`,
        category: "Social",
        color: "text-pink-400",
      });
    }

    return items;
  }, [props]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % insights.length);
        setVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, [insights.length]);

  if (insights.length === 0) return null;

  const insight = insights[index % insights.length];

  return (
    <div className="w-full flex items-center justify-center py-2">
      <div
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all duration-400 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        <span className="text-base flex-shrink-0">{insight.emoji}</span>
        <span className={`text-xs font-medium ${insight.color}`}>{insight.text}</span>
        <span className="text-[9px] text-neutral-600 uppercase tracking-wider flex-shrink-0 hidden sm:inline">
          {insight.category}
        </span>
        {/* Dot pagination */}
        <div className="flex gap-1 ml-2 flex-shrink-0">
          {insights.map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                i === index % insights.length ? "bg-white/50" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
