"use client";

import { useMemo } from "react";

interface Win {
  emoji: string;
  title: string;
  detail: string;
  category: "streaming" | "social" | "media" | "milestone" | "engagement";
}

interface WeeklyWinsProps {
  listeners: { current: number; prior: number | null };
  followers: number;
  tracks: { name: string; current: number; prior: number | null }[];
  ytViews: { name: string; current: number; prior: number | null }[];
  ytSubscribers: number;
  snsFootprint: { current: number; prior: number | null };
  totalStreams: number;
  mentions: number;
  sentiment: { positive: number; negative: number };
  audienceStats: { streamsPerListener: number; saves: number; streams: number };
}

/** round-number milestones to check */
const ROUND_MILESTONES = [
  100_000, 200_000, 250_000, 300_000, 400_000, 500_000, 750_000,
  1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000, 5_000_000,
  7_500_000, 10_000_000, 15_000_000, 20_000_000, 25_000_000, 50_000_000,
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function crossedMilestone(current: number, prior: number | null): number | null {
  if (!prior) return null;
  for (let i = ROUND_MILESTONES.length - 1; i >= 0; i--) {
    const m = ROUND_MILESTONES[i];
    if (current >= m && prior < m) return m;
  }
  return null;
}

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  social: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  media: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  milestone: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  engagement: "from-pink-500/20 to-pink-500/5 border-pink-500/30",
};

export default function WeeklyWins(props: WeeklyWinsProps) {
  const wins = useMemo(() => {
    const w: Win[] = [];

    // Listener milestones
    const listenerMs = crossedMilestone(props.listeners.current, props.listeners.prior);
    if (listenerMs) {
      w.push({
        emoji: "🎧",
        title: `Crossed ${fmt(listenerMs)} Spotify Listeners`,
        detail: `Now at ${fmt(props.listeners.current)}`,
        category: "milestone",
      });
    }

    // Track stream milestones
    for (const t of props.tracks) {
      const ms = crossedMilestone(t.current, t.prior);
      if (ms) {
        w.push({
          emoji: "💿",
          title: `${t.name} crossed ${fmt(ms)} streams`,
          detail: `Now at ${fmt(t.current)}`,
          category: "milestone",
        });
      }
    }

    // YT view milestones
    for (const v of props.ytViews) {
      const ms = crossedMilestone(v.current, v.prior);
      if (ms) {
        w.push({
          emoji: "▶️",
          title: `${v.name} crossed ${fmt(ms)} YT views`,
          detail: `Now at ${fmt(v.current)}`,
          category: "milestone",
        });
      }
    }

    // SNS footprint milestone
    const snsMs = crossedMilestone(props.snsFootprint.current, props.snsFootprint.prior);
    if (snsMs) {
      w.push({
        emoji: "📱",
        title: `SNS Footprint crossed ${fmt(snsMs)}`,
        detail: `Now at ${fmt(props.snsFootprint.current)}`,
        category: "milestone",
      });
    }

    // Big growth wins (>10% growth in period)
    if (props.listeners.prior && props.listeners.current > 0) {
      const growth = ((props.listeners.current - props.listeners.prior) / props.listeners.prior) * 100;
      if (growth > 10) {
        w.push({
          emoji: "📈",
          title: `Spotify Listeners up ${growth.toFixed(1)}%`,
          detail: `${fmt(props.listeners.prior)} → ${fmt(props.listeners.current)}`,
          category: "streaming",
        });
      }
    }

    // Fastest growing track
    const trackGrowths = props.tracks
      .filter(t => t.prior && t.prior > 0)
      .map(t => ({ name: t.name, growth: ((t.current - t.prior!) / t.prior!) * 100 }))
      .sort((a, b) => b.growth - a.growth);
    if (trackGrowths[0] && trackGrowths[0].growth > 15) {
      w.push({
        emoji: "🚀",
        title: `${trackGrowths[0].name} growing at ${trackGrowths[0].growth.toFixed(0)}%`,
        detail: "Fastest growing track this period",
        category: "streaming",
      });
    }

    // YT Subscribers near milestone
    const ytMs = crossedMilestone(props.ytSubscribers, props.ytSubscribers - 10_000); // approximate
    if (props.ytSubscribers >= 450_000) {
      w.push({
        emoji: "🏆",
        title: `${fmt(props.ytSubscribers)} YouTube subscribers`,
        detail: props.ytSubscribers >= 500_000 ? "Silver Play Button achieved! 🥈" : `${fmt(500_000 - props.ytSubscribers)} to Silver Play Button`,
        category: "social",
      });
    }

    // Strong sentiment
    const netSentiment = props.sentiment.positive - props.sentiment.negative;
    if (netSentiment > 15) {
      w.push({
        emoji: "💚",
        title: `Net sentiment at +${netSentiment.toFixed(0)}%`,
        detail: "Overwhelmingly positive fan reception",
        category: "media",
      });
    }

    // High media volume
    if (props.mentions > 5000) {
      w.push({
        emoji: "📰",
        title: `${fmt(props.mentions)} media mentions this period`,
        detail: "Strong media presence",
        category: "media",
      });
    }

    // High engagement (SPL > 5)
    if (props.audienceStats.streamsPerListener > 5) {
      w.push({
        emoji: "🔁",
        title: `${props.audienceStats.streamsPerListener.toFixed(1)}× streams per listener`,
        detail: "Exceptional replay depth — fans keep coming back",
        category: "engagement",
      });
    }

    // High save rate
    const saveRate = props.audienceStats.streams > 0 ? (props.audienceStats.saves / props.audienceStats.streams) * 100 : 0;
    if (saveRate > 5) {
      w.push({
        emoji: "💾",
        title: `${saveRate.toFixed(1)}% save rate`,
        detail: "Well above 3.5% industry average — strong catalog longevity signal",
        category: "engagement",
      });
    }

    return w;
  }, [props]);

  if (wins.length === 0) return null;

  return (
    <div className="glass-hybe rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏅</span>
        <h3 className="text-lg font-bold text-white">Weekly Wins</h3>
        <span className="text-xs text-white/40 bg-white/5 rounded-full px-2 py-0.5">{wins.length} {wins.length === 1 ? "win" : "wins"}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {wins.map((win, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${CATEGORY_COLORS[win.category]}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{win.emoji}</span>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm leading-tight">{win.title}</p>
                <p className="text-white/50 text-xs mt-1">{win.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
