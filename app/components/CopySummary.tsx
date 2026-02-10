"use client";

import { useState, useCallback } from "react";

interface SummaryData {
  reportDate: string;
  listeners: number;
  listenersPrior: number | null;
  totalStreams: number;
  snsFootprint: number;
  snsFootprintPrior: number | null;
  tracks: { name: string; streams: number }[];
  ytVideos: { name: string; views: number }[];
  ytSubscribers: number;
  platforms: { platform: string; current: number }[];
  prMentions: number;
  prPerDay: number;
  sentimentPositive: number;
  sentimentNegative: number;
  sentimentNeutral: number;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function pctChange(current: number, prior: number | null): string {
  if (!prior) return "";
  const pct = ((current - prior) / prior * 100).toFixed(1);
  return ` (${Number(pct) >= 0 ? "+" : ""}${pct}%)`;
}

export function generateSummaryText(d: SummaryData): string {
  const lines: string[] = [];
  lines.push(`📊 SANTOS BRAVOS — Daily Report (${d.reportDate})`);
  lines.push("");
  lines.push("🎵 STREAMING");
  lines.push(`  Spotify Monthly Listeners: ${fmtNum(d.listeners)}${pctChange(d.listeners, d.listenersPrior)}`);
  lines.push(`  Total Cross-Platform Streams: ${fmtNum(d.totalStreams)}`);
  for (const t of d.tracks) {
    lines.push(`  ${t.name}: ${fmtNum(t.streams)} streams`);
  }
  lines.push("");
  lines.push("📺 YOUTUBE");
  lines.push(`  Subscribers: ${fmtNum(d.ytSubscribers)}`);
  for (const v of d.ytVideos) {
    lines.push(`  ${v.name}: ${fmtNum(v.views)} views`);
  }
  lines.push("");
  lines.push("📱 SOCIAL MEDIA");
  lines.push(`  Total SNS Footprint: ${fmtNum(d.snsFootprint)}${pctChange(d.snsFootprint, d.snsFootprintPrior)}`);
  for (const p of d.platforms) {
    lines.push(`  ${p.platform}: ${fmtNum(p.current)}`);
  }
  lines.push("");
  lines.push("📰 PR & SENTIMENT");
  lines.push(`  Media Mentions (7d): ${fmtNum(d.prMentions)} (${fmtNum(d.prPerDay)}/day)`);
  lines.push(`  Sentiment: ${d.sentimentPositive}% positive · ${d.sentimentNeutral}% neutral · ${d.sentimentNegative}% negative`);
  lines.push("");
  lines.push("— HYBE Latin America · Artist Intelligence Platform");
  return lines.join("\n");
}

export default function CopySummary({ data }: { data: SummaryData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = generateSummaryText(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 rounded-lg px-2.5 py-1.5 transition-all group"
      title="Copy executive summary to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span className="text-[10px] font-bold text-neutral-500 group-hover:text-violet-400 uppercase tracking-wider transition-colors hidden sm:inline">Summary</span>
        </>
      )}
    </button>
  );
}
