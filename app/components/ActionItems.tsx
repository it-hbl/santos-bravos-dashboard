"use client";

import { useMemo } from "react";

interface ActionItem {
  priority: "high" | "medium" | "low";
  category: string;
  emoji: string;
  title: string;
  description: string;
  metric?: string;
}

interface Props {
  listeners: number;
  listenersPrior: number | null;
  totalStreams: number;
  snsFootprint: number;
  snsFootprintPrior: number | null;
  ytSubscribers: number;
  sentimentPositive: number;
  sentimentNegative: number;
  mentionVolume: number;
  tracks: { name: string; current: number; prior: number | null }[];
  ytVideos: { name: string; current: number; prior: number | null }[];
  geoTop: { name: string; listeners: number }[];
  dailyTopTrack: { name: string; streams: number } | null;
  spotifyFollowers: number;
  spotifyPopularity: number;
}

const PRIORITY_CONFIG = {
  high: { bg: "bg-red-500/8", border: "border-red-500/20", badge: "bg-red-500/20 text-red-400", dot: "bg-red-400" },
  medium: { bg: "bg-amber-500/6", border: "border-amber-500/15", badge: "bg-amber-500/20 text-amber-400", dot: "bg-amber-400" },
  low: { bg: "bg-cyan-500/5", border: "border-cyan-500/15", badge: "bg-cyan-500/20 text-cyan-400", dot: "bg-cyan-400" },
};

function pct(current: number, prior: number | null): number | null {
  if (prior == null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

export default function ActionItems(props: Props) {
  const actions = useMemo(() => {
    const items: ActionItem[] = [];

    // 1. Declining listener growth → push playlisting
    const listenerGrowth = pct(props.listeners, props.listenersPrior);
    if (listenerGrowth !== null && listenerGrowth < 2) {
      items.push({
        priority: listenerGrowth < 0 ? "high" : "medium",
        category: "Streaming",
        emoji: "🎧",
        title: "Accelerate playlist pitching",
        description: `Spotify listener growth is ${listenerGrowth < 0 ? "declining" : "slowing"} at ${listenerGrowth.toFixed(1)}%. Pitch top-performing tracks to editorial playlists and activate user-generated playlist campaigns.`,
        metric: `${listenerGrowth.toFixed(1)}% growth`,
      });
    }

    // 2. High-performing track → double down
    const fastestTrack = [...props.tracks].sort((a, b) => {
      const pa = pct(a.current, a.prior) ?? 0;
      const pb = pct(b.current, b.prior) ?? 0;
      return pb - pa;
    })[0];
    if (fastestTrack) {
      const growth = pct(fastestTrack.current, fastestTrack.prior);
      if (growth !== null && growth > 10) {
        items.push({
          priority: "medium",
          category: "Content",
          emoji: "🚀",
          title: `Double down on ${fastestTrack.name}`,
          description: `${fastestTrack.name} is growing at +${growth.toFixed(1)}% — create behind-the-scenes content, TikTok challenges, and push for playlist adds while momentum is hot.`,
          metric: `+${growth.toFixed(1)}%`,
        });
      }
    }

    // 3. Negative sentiment elevated → monitor & respond
    const netSentiment = props.sentimentPositive - props.sentimentNegative;
    if (props.sentimentNegative > 20) {
      items.push({
        priority: "high",
        category: "PR",
        emoji: "🛡️",
        title: "Monitor negative sentiment",
        description: `Negative sentiment is at ${props.sentimentNegative.toFixed(1)}% — investigate top negative mentions, prepare response strategy, and consider positive content push.`,
        metric: `${props.sentimentNegative.toFixed(1)}% negative`,
      });
    } else if (netSentiment > 10) {
      items.push({
        priority: "low",
        category: "PR",
        emoji: "💚",
        title: "Leverage positive sentiment",
        description: `Net sentiment is +${netSentiment.toFixed(0)} — share fan testimonials, amplify positive press, and engage with top positive creators.`,
        metric: `Net +${netSentiment.toFixed(0)}`,
      });
    }

    // 4. Geographic concentration → expand markets
    if (props.geoTop.length >= 3) {
      const topTotal = props.geoTop.reduce((s, c) => s + c.listeners, 0);
      const topMarket = props.geoTop[0];
      const topShare = topTotal > 0 ? (topMarket.listeners / topTotal) * 100 : 0;
      if (topShare > 40) {
        items.push({
          priority: "medium",
          category: "Marketing",
          emoji: "🌎",
          title: `Diversify beyond ${topMarket.name}`,
          description: `${topMarket.name} accounts for ${topShare.toFixed(0)}% of top-market listeners. Invest in localized content and ads for emerging markets to reduce geographic concentration.`,
          metric: `${topShare.toFixed(0)}% concentration`,
        });
      }
    }

    // 5. YouTube approaching milestones → activate community
    if (props.ytSubscribers > 0) {
      const nextMilestone = props.ytSubscribers < 500_000 ? 500_000 : 1_000_000;
      const remaining = nextMilestone - props.ytSubscribers;
      const pctComplete = (props.ytSubscribers / nextMilestone) * 100;
      if (pctComplete > 85 && pctComplete < 100) {
        const label = nextMilestone >= 1_000_000 ? "1M" : "500K";
        items.push({
          priority: "high",
          category: "YouTube",
          emoji: "🎯",
          title: `Push for ${label} YouTube subscribers`,
          description: `Only ${remaining.toLocaleString()} subscribers away from ${label}. Run a subscriber drive campaign — pin a comment, create a countdown, and cross-promote from other platforms.`,
          metric: `${pctComplete.toFixed(1)}% there`,
        });
      }
    }

    // 6. SNS footprint declining → social strategy
    const snsGrowth = pct(props.snsFootprint, props.snsFootprintPrior);
    if (snsGrowth !== null && snsGrowth < 1) {
      items.push({
        priority: snsGrowth < 0 ? "high" : "medium",
        category: "Social",
        emoji: "📱",
        title: "Revitalize social media strategy",
        description: `SNS footprint growth is ${snsGrowth < 0 ? "declining" : "stagnating"} at ${snsGrowth.toFixed(1)}%. Increase posting frequency, try new formats (Reels, Shorts), and run engagement campaigns.`,
        metric: `${snsGrowth.toFixed(1)}% growth`,
      });
    }

    // 7. Low Spotify popularity → discovery issue
    if (props.spotifyPopularity < 50 && props.spotifyPopularity > 0) {
      items.push({
        priority: "low",
        category: "Discovery",
        emoji: "🔍",
        title: "Improve Spotify discovery signals",
        description: `Spotify Popularity Index is ${props.spotifyPopularity}/100 — below the visibility threshold. Focus on save rates, playlist adds, and consistent daily streams to boost algorithmic recommendations.`,
        metric: `SPL ${props.spotifyPopularity}/100`,
      });
    }

    // 8. Follower conversion opportunity
    if (props.listeners > 0 && props.spotifyFollowers > 0) {
      const conversionRate = (props.spotifyFollowers / props.listeners) * 100;
      if (conversionRate < 20) {
        items.push({
          priority: "low",
          category: "Engagement",
          emoji: "🔔",
          title: "Boost listener-to-follower conversion",
          description: `Only ${conversionRate.toFixed(1)}% of listeners follow the artist. Add follow CTAs to social posts, use Spotify Canvas, and release content consistently to convert passive listeners.`,
          metric: `${conversionRate.toFixed(1)}% conversion`,
        });
      }
    }

    // 9. Fastest-growing YT video → boost further
    const fastestVideo = [...props.ytVideos].sort((a, b) => {
      const pa = pct(a.current, a.prior) ?? 0;
      const pb = pct(b.current, b.prior) ?? 0;
      return pb - pa;
    })[0];
    if (fastestVideo) {
      const growth = pct(fastestVideo.current, fastestVideo.prior);
      if (growth !== null && growth > 20) {
        items.push({
          priority: "medium",
          category: "YouTube",
          emoji: "▶️",
          title: `Promote ${fastestVideo.name} on YouTube`,
          description: `${fastestVideo.name} views are surging at +${growth.toFixed(1)}%. Run YouTube ads, optimize SEO metadata, and create reaction/behind-the-scenes companion content.`,
          metric: `+${growth.toFixed(1)}%`,
        });
      }
    }

    // Sort by priority
    const order = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => order[a.priority] - order[b.priority]);
    return items.slice(0, 6); // Cap at 6
  }, [props]);

  if (actions.length === 0) return null;

  const highCount = actions.filter(a => a.priority === "high").length;
  const medCount = actions.filter(a => a.priority === "medium").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-sm">⚡</div>
          <h2 className="text-lg font-bold tracking-tight text-white">Recommended Actions</h2>
        </div>
        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
              {highCount} urgent
            </span>
          )}
          {medCount > 0 && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
              {medCount} suggested
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, i) => {
          const config = PRIORITY_CONFIG[action.priority];
          return (
            <div
              key={i}
              className={`${config.bg} ${config.border} border rounded-xl p-4 hover:scale-[1.01] transition-transform duration-200 group`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{action.emoji}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.badge}`}>
                    {action.priority}
                  </span>
                </div>
                {action.metric && (
                  <span className="text-[10px] font-mono text-neutral-500 tabular-nums">{action.metric}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-white/90">{action.title}</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">{action.description}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                <span className="text-[9px] text-neutral-600 uppercase tracking-wider">{action.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}