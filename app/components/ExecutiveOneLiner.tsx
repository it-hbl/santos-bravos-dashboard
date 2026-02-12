"use client";

import { useMemo } from "react";
import { RELEASES } from "../lib/data";

interface Props {
  reportDate: string;
  listeners: number;
  listenersPrior: number | null;
  totalStreams: number;
  totalStreamsPrior: number | null;
  snsFootprint: number;
  snsFootprintPrior: number | null;
  ytSubscribers: number;
  mentionVolume: number;
  sentimentPositive: number;
  sentimentNegative: number;
  tracks: { name: string; current: number; prior: number | null }[];
  ytVideos: { name: string; current: number; prior: number | null }[];
  dailyTopTrack: { name: string; streams: number } | null;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pctChange(current: number, prior: number | null): number | null {
  if (prior == null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

export default function ExecutiveOneLiner({
  reportDate,
  listeners,
  listenersPrior,
  totalStreams,
  totalStreamsPrior,
  snsFootprint,
  snsFootprintPrior,
  ytSubscribers,
  mentionVolume,
  sentimentPositive,
  sentimentNegative,
  tracks,
  ytVideos,
  dailyTopTrack,
}: Props) {
  const summary = useMemo(() => {
    // Days since debut
    const debutDate = new Date(RELEASES[0].date + "T12:00:00");
    const refDate = (() => {
      try {
        const d = new Date(reportDate);
        return isNaN(d.getTime()) ? new Date() : d;
      } catch {
        return new Date();
      }
    })();
    const daysSinceDebut = Math.max(0, Math.round((refDate.getTime() - debutDate.getTime()) / 86400000));

    // Find biggest mover (highest abs % change across tracks + YT)
    let biggestMover: { name: string; pct: number; type: "track" | "yt" } | null = null;
    for (const t of tracks) {
      const pct = pctChange(t.current, t.prior);
      if (pct !== null && (biggestMover === null || Math.abs(pct) > Math.abs(biggestMover.pct))) {
        biggestMover = { name: t.name, pct, type: "track" };
      }
    }
    for (const v of ytVideos) {
      const pct = pctChange(v.current, v.prior);
      if (pct !== null && (biggestMover === null || Math.abs(pct) > Math.abs(biggestMover.pct))) {
        biggestMover = { name: v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, "").trim(), pct, type: "yt" };
      }
    }

    // Listener change
    const listenerPct = pctChange(listeners, listenersPrior);

    // Net sentiment
    const netSentiment = sentimentPositive - sentimentNegative;

    // Build parts
    const parts: string[] = [];

    // Day X
    parts.push(`Day ${daysSinceDebut}`);

    // Listeners
    if (listenerPct !== null) {
      parts.push(`${fmt(listeners)} listeners (${listenerPct >= 0 ? "+" : ""}${listenerPct.toFixed(1)}%)`);
    } else {
      parts.push(`${fmt(listeners)} listeners`);
    }

    // Total streams
    parts.push(`${fmt(totalStreams)} cross-platform streams`);

    // Biggest mover
    if (biggestMover) {
      const dir = biggestMover.pct >= 0 ? "+" : "";
      const suffix = biggestMover.type === "yt" ? " YT" : "";
      parts.push(`${biggestMover.name}${suffix} leading at ${dir}${biggestMover.pct.toFixed(1)}%`);
    }

    // Sentiment
    parts.push(`sentiment net ${netSentiment >= 0 ? "+" : ""}${netSentiment.toFixed(0)}`);

    return parts;
  }, [reportDate, listeners, listenersPrior, totalStreams, tracks, ytVideos, sentimentPositive, sentimentNegative]);

  // Color the Day X and the biggest mover
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] sm:text-xs text-neutral-400 mb-4 -mt-1">
      <span className="text-violet-400 font-bold">{summary[0]}</span>
      <span className="text-neutral-600">·</span>
      <span>{summary[1]}</span>
      <span className="text-neutral-600">·</span>
      <span>{summary[2]}</span>
      {summary[3] && (
        <>
          <span className="text-neutral-600">·</span>
          <span className="text-cyan-400 font-medium">{summary[3]}</span>
        </>
      )}
      {summary[4] && (
        <>
          <span className="text-neutral-600">·</span>
          <span className={summary[4].includes("+") ? "text-emerald-400" : "text-red-400"}>
            {summary[4]}
          </span>
        </>
      )}
    </div>
  );
}
