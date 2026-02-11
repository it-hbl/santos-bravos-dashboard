"use client";

interface Highlight {
  emoji: string;
  text: string;
  type: "positive" | "negative" | "neutral";
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

function pctChange(current: number, prior: number | null): number | null {
  if (prior === null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

interface HighlightsProps {
  spotifyListeners: { current: number; prior: number | null };
  tracks: { name: string; current: number; prior: number | null }[];
  ytVideos: { name: string; current: number; prior: number | null }[];
  snsTotal: { current: number; prior: number | null };
  totalStreams: { current: number; prior: number | null };
  dailyTopTrack: { name: string; streams: number } | null;
  mentionVolume: number;
  sentimentPositivePct: number;
  topMarket: string;
}

export default function KeyHighlights({
  spotifyListeners,
  tracks,
  ytVideos,
  snsTotal,
  totalStreams,
  dailyTopTrack,
  mentionVolume,
  sentimentPositivePct,
  topMarket,
}: HighlightsProps) {
  const highlights: Highlight[] = [];

  // Spotify listeners growth
  const listenerPct = pctChange(spotifyListeners.current, spotifyListeners.prior);
  if (listenerPct !== null) {
    highlights.push({
      emoji: listenerPct >= 0 ? "📈" : "📉",
      text: `Spotify Monthly Listeners ${listenerPct >= 0 ? "up" : "down"} ${Math.abs(listenerPct).toFixed(1)}% to ${fmt(spotifyListeners.current)}`,
      type: listenerPct >= 0 ? "positive" : "negative",
    });
  }

  // Find biggest YT mover
  const ytChanges = ytVideos
    .map(v => ({ ...v, pct: pctChange(v.current, v.prior) }))
    .filter(v => v.pct !== null)
    .sort((a, b) => Math.abs(b.pct!) - Math.abs(a.pct!));
  if (ytChanges.length > 0 && ytChanges[0].pct !== null) {
    const top = ytChanges[0];
    const shortName = top.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, "").trim();
    highlights.push({
      emoji: "🎬",
      text: `${shortName} YouTube views ${top.pct! >= 0 ? "surged" : "dropped"} ${Math.abs(top.pct!).toFixed(1)}% (${fmt(top.current)} total)`,
      type: top.pct! >= 5 ? "positive" : top.pct! < 0 ? "negative" : "neutral",
    });
  }

  // Find biggest track stream mover
  const trackChanges = tracks
    .map(t => ({ ...t, pct: pctChange(t.current, t.prior) }))
    .filter(t => t.pct !== null)
    .sort((a, b) => Math.abs(b.pct!) - Math.abs(a.pct!));
  if (trackChanges.length > 0 && trackChanges[0].pct !== null) {
    const top = trackChanges[0];
    highlights.push({
      emoji: "🎵",
      text: `"${top.name}" streams grew ${Math.abs(top.pct!).toFixed(1)}% — fastest growing track`,
      type: top.pct! >= 0 ? "positive" : "negative",
    });
  }

  // SNS footprint
  const snsPct = pctChange(snsTotal.current, snsTotal.prior);
  if (snsPct !== null) {
    highlights.push({
      emoji: "🌐",
      text: `Total SNS footprint at ${fmt(snsTotal.current)} (+${fmt(snsTotal.current - (snsTotal.prior || 0))} this period)`,
      type: snsPct >= 0 ? "positive" : "negative",
    });
  }

  // Daily top track
  if (dailyTopTrack) {
    highlights.push({
      emoji: "⚡",
      text: `${dailyTopTrack.name} leads daily streams with ${fmt(dailyTopTrack.streams)} in 24h`,
      type: "neutral",
    });
  }

  // Meltwater PR
  if (mentionVolume > 0) {
    highlights.push({
      emoji: "📰",
      text: `${fmt(mentionVolume)} media mentions this week — sentiment ${sentimentPositivePct}% positive`,
      type: sentimentPositivePct >= 25 ? "positive" : sentimentPositivePct >= 15 ? "neutral" : "negative",
    });
  }

  // Top market
  if (topMarket) {
    highlights.push({
      emoji: "🌎",
      text: `${topMarket} remains the #1 streaming market`,
      type: "neutral",
    });
  }

  const typeColors = {
    positive: "border-emerald-500/20 bg-emerald-500/[0.04]",
    negative: "border-red-500/20 bg-red-500/[0.04]",
    neutral: "border-white/[0.06] bg-white/[0.02]",
  };

  const textColors = {
    positive: "text-emerald-300",
    negative: "text-red-300",
    neutral: "text-neutral-300",
  };

  return (
    <section className="glass-hybe rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-[11px] font-black text-white">⚡</div>
        <h2 className="text-lg font-bold tracking-tight text-white">Key Highlights</h2>
        <span className="text-[10px] text-neutral-600 uppercase tracking-widest ml-auto">Executive Summary</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {highlights.map((h, i) => (
          <div
            key={i}
            className={`rounded-xl border px-3 py-2.5 transition-all hover:scale-[1.01] ${typeColors[h.type]}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">{h.emoji}</span>
              <p className={`text-xs leading-relaxed ${textColors[h.type]}`}>{h.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
