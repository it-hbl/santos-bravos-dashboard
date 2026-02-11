"use client";

import { useState } from "react";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pctStr(current: number, prior: number | null): string | null {
  if (prior === null || prior === 0) return null;
  const pct = ((current - prior) / prior) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function delta(current: number, prior: number | null): number | null {
  if (prior === null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

interface AnalystNoteProps {
  reportDate: string;
  spotifyListeners: { current: number; prior: number | null };
  tracks: { name: string; current: number; prior: number | null }[];
  ytSubscribers: number;
  snsTotal: { current: number; prior: number | null };
  totalStreams: { current: number; prior: number | null };
  mentionVolume: number;
  sentimentPositive: number;
  sentimentNegative: number;
  topMarket: string;
  dailyTopTrack: { name: string; streams: number } | null;
}

function generateNote(props: AnalystNoteProps): string {
  const {
    reportDate, spotifyListeners, tracks, ytSubscribers, snsTotal,
    totalStreams, mentionVolume, sentimentPositive, sentimentNegative,
    topMarket, dailyTopTrack,
  } = props;

  const parts: string[] = [];

  // Opening
  const listDelta = delta(spotifyListeners.current, spotifyListeners.prior);
  if (listDelta !== null) {
    const direction = listDelta >= 0 ? "grew" : "declined";
    parts.push(
      `Santos Bravos ${direction} Spotify Monthly Listeners by ${Math.abs(listDelta).toFixed(1)}% to ${fmt(spotifyListeners.current)} as of ${reportDate}.`
    );
  } else {
    parts.push(`Santos Bravos sits at ${fmt(spotifyListeners.current)} Spotify Monthly Listeners as of ${reportDate}.`);
  }

  // Track performance
  const sorted = [...tracks]
    .map(t => ({ ...t, pct: delta(t.current, t.prior) }))
    .filter(t => t.pct !== null)
    .sort((a, b) => b.pct! - a.pct!);

  if (sorted.length > 0) {
    const fastest = sorted[0];
    const streamTotal = totalStreams.current;
    parts.push(
      `"${fastest.name}" leads growth at ${pctStr(fastest.current, fastest.prior)}, with cumulative cross-platform streams reaching ${fmt(streamTotal)}.`
    );
  }

  // Daily snapshot
  if (dailyTopTrack) {
    parts.push(
      `In the latest 24-hour window, "${dailyTopTrack.name}" topped daily plays with ${fmt(dailyTopTrack.streams)} streams.`
    );
  }

  // Social
  const snsDelta = delta(snsTotal.current, snsTotal.prior);
  if (snsDelta !== null) {
    parts.push(
      `The group's total social footprint ${snsDelta >= 0 ? "expanded" : "contracted"} ${Math.abs(snsDelta).toFixed(1)}% to ${fmt(snsTotal.current)} across all platforms, with YouTube subscribers at ${fmt(ytSubscribers)}.`
    );
  }

  // PR & Sentiment
  if (mentionVolume > 0) {
    const netSentiment = sentimentPositive - sentimentNegative;
    const sentLabel = netSentiment > 15 ? "strongly positive" : netSentiment > 5 ? "positive" : netSentiment > -5 ? "neutral" : "negative";
    parts.push(
      `Media coverage totaled ${fmt(mentionVolume)} mentions with ${sentLabel} sentiment (${sentimentPositive}% positive vs ${sentimentNegative}% negative).`
    );
  }

  // Geo
  if (topMarket) {
    parts.push(`${topMarket} continues to be the dominant streaming market.`);
  }

  // Closing assessment
  const overallPositive = (listDelta ?? 0) >= 0 && (snsDelta ?? 0) >= 0;
  if (overallPositive) {
    parts.push("Overall trajectory remains healthy across streaming and social metrics.");
  } else {
    parts.push("The team should monitor closely for areas showing deceleration.");
  }

  return parts.join(" ");
}

export default function AnalystNote(props: AnalystNoteProps) {
  const [expanded, setExpanded] = useState(false);
  const note = generateNote(props);

  // Show first ~200 chars when collapsed
  const previewLength = 200;
  const needsTruncate = note.length > previewLength;
  const displayText = expanded || !needsTruncate ? note : note.slice(0, previewLength).replace(/\s\S*$/, "") + "…";

  return (
    <div className="glass-hybe rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-[11px] font-black text-white">📝</div>
        <h2 className="text-lg font-bold tracking-tight text-white">Analyst Note</h2>
        <span className="text-[10px] text-neutral-600 uppercase tracking-widest ml-auto">Auto-Generated Summary</span>
      </div>
      <div className="relative">
        <p className="text-sm leading-relaxed text-neutral-300 italic">
          &ldquo;{displayText}&rdquo;
        </p>
        {needsTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-violet-400 hover:text-violet-300 mt-2 font-semibold uppercase tracking-wider transition-colors"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
}
