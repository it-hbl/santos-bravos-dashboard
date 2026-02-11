"use client";

import { useState, useCallback } from "react";

interface ExportData {
  reportDate: string;
  listeners: number;
  listenersPrior: number | null;
  spotifyFollowers: number;
  spotifyPopularity: number;
  totalStreams: number;
  spl: number;
  tracks: { name: string; streams: number; prior: number | null }[];
  ytVideos: { name: string; views: number; prior: number | null }[];
  ytSubscribers: number;
  dailyStreams: { name: string; streams: number; listeners: number; saves: number }[];
  platforms: { platform: string; current: number; prior: number | null }[];
  snsFootprint: number;
  snsFootprintPrior: number | null;
  members: { name: string; handle: string; followers: number }[];
  geoCountries: { name: string; listeners: number }[];
  geoCities: { name: string; listeners: number }[];
  audienceStats: { listeners: number; streams: number; saves: number; playlistAdds: number; followers: number; streamsPerListener: number };
  prMentions: number;
  prPerDay: number;
  uniqueAuthors: number;
  sentimentPositive: number;
  sentimentNegative: number;
  sentimentNeutral: number;
  topHashtags: { tag: string; count: number }[];
}

function escCSV(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

function pctChange(current: number, prior: number | null): string {
  if (!prior) return "";
  return ((current - prior) / prior * 100).toFixed(2) + "%";
}

function generateCSV(d: ExportData): string {
  const rows: string[][] = [];

  rows.push(["Santos Bravos — Daily Report", d.reportDate]);
  rows.push(["Generated", new Date().toISOString()]);
  rows.push([]);

  // Spotify overview
  rows.push(["SPOTIFY OVERVIEW"]);
  rows.push(["Metric", "Current", "Prior", "Change %"]);
  rows.push(["Monthly Listeners", String(d.listeners), d.listenersPrior ? String(d.listenersPrior) : "", pctChange(d.listeners, d.listenersPrior)]);
  rows.push(["Followers", String(d.spotifyFollowers), "", ""]);
  rows.push(["Popularity Index", String(d.spotifyPopularity), "", ""]);
  rows.push(["Streams Per Listener (28d)", d.spl.toFixed(3), "", ""]);
  rows.push(["Total Cross-Platform Streams", String(d.totalStreams), "", ""]);
  rows.push([]);

  // Tracks
  rows.push(["TRACK STREAMS (Spotify)"]);
  rows.push(["Track", "Streams", "Prior", "Change %"]);
  for (const t of d.tracks) {
    rows.push([t.name, String(t.streams), t.prior ? String(t.prior) : "", pctChange(t.streams, t.prior)]);
  }
  rows.push([]);

  // Daily streams
  rows.push(["DAILY STREAMS (Spotify for Artists, 24h)"]);
  rows.push(["Track", "Streams", "Listeners", "Saves"]);
  for (const t of d.dailyStreams) {
    rows.push([t.name, String(t.streams), String(t.listeners), String(t.saves)]);
  }
  rows.push([]);

  // YouTube
  rows.push(["YOUTUBE"]);
  rows.push(["Video", "Views", "Prior", "Change %"]);
  for (const v of d.ytVideos) {
    rows.push([v.name, String(v.views), v.prior ? String(v.prior) : "", pctChange(v.views, v.prior)]);
  }
  rows.push(["Subscribers", String(d.ytSubscribers), "", ""]);
  rows.push([]);

  // Social media
  rows.push(["SOCIAL MEDIA (SNS)"]);
  rows.push(["Platform", "Current", "Prior", "Change %"]);
  for (const p of d.platforms) {
    rows.push([p.platform, String(p.current), p.prior ? String(p.prior) : "", pctChange(p.current, p.prior)]);
  }
  rows.push(["Total Footprint", String(d.snsFootprint), d.snsFootprintPrior ? String(d.snsFootprintPrior) : "", pctChange(d.snsFootprint, d.snsFootprintPrior)]);
  rows.push([]);

  // Members
  rows.push(["BAND MEMBER FOLLOWERS (Instagram)"]);
  rows.push(["Member", "Handle", "Followers"]);
  for (const m of d.members) {
    rows.push([m.name, m.handle, String(m.followers)]);
  }
  rows.push([]);

  // Geo
  rows.push(["GEOGRAPHIC — TOP COUNTRIES"]);
  rows.push(["Country", "Listeners"]);
  for (const c of d.geoCountries) {
    rows.push([c.name, String(c.listeners)]);
  }
  rows.push([]);
  rows.push(["GEOGRAPHIC — TOP CITIES"]);
  rows.push(["City", "Listeners"]);
  for (const c of d.geoCities) {
    rows.push([c.name, String(c.listeners)]);
  }
  rows.push([]);

  // Audience
  rows.push(["AUDIENCE STATS (28 Days)"]);
  rows.push(["Metric", "Value"]);
  rows.push(["Listeners", String(d.audienceStats.listeners)]);
  rows.push(["Streams", String(d.audienceStats.streams)]);
  rows.push(["Saves", String(d.audienceStats.saves)]);
  rows.push(["Playlist Adds", String(d.audienceStats.playlistAdds)]);
  rows.push(["Followers", String(d.audienceStats.followers)]);
  rows.push(["Streams/Listener", d.audienceStats.streamsPerListener.toFixed(3)]);
  rows.push([]);

  // PR & Sentiment
  rows.push(["PR & MEDIA (Meltwater, 7d)"]);
  rows.push(["Metric", "Value"]);
  rows.push(["Total Mentions", String(d.prMentions)]);
  rows.push(["Mentions/Day", String(d.prPerDay)]);
  rows.push(["Unique Authors", String(d.uniqueAuthors)]);
  rows.push(["Sentiment — Positive", d.sentimentPositive + "%"]);
  rows.push(["Sentiment — Neutral", d.sentimentNeutral + "%"]);
  rows.push(["Sentiment — Negative", d.sentimentNegative + "%"]);
  rows.push([]);

  // Hashtags
  rows.push(["TOP HASHTAGS"]);
  rows.push(["Hashtag", "Count"]);
  for (const h of d.topHashtags) {
    rows.push([h.tag, String(h.count)]);
  }

  return rows.map(r => r.map(escCSV).join(",")).join("\n");
}

export default function ExportCSV({ data }: { data: ExportData }) {
  const [exported, setExported] = useState(false);

  const handleExport = useCallback(() => {
    const csv = generateCSV(data);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateSlug = data.reportDate.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");
    a.download = `santos-bravos-report-${dateSlug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }, [data]);

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/30 rounded-lg px-2.5 py-1.5 transition-all group"
      title="Export all data as CSV"
    >
      {exported ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider hidden sm:inline">Done!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] font-bold text-neutral-500 group-hover:text-emerald-400 uppercase tracking-wider transition-colors hidden sm:inline">CSV</span>
        </>
      )}
    </button>
  );
}
