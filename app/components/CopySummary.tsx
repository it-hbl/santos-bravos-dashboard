"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

function pctChange(current: number, prior: number | null): string {
  if (!prior) return "";
  const pct = ((current - prior) / prior * 100).toFixed(1);
  return ` (${Number(pct) >= 0 ? "+" : ""}${pct}%)`;
}

function pctBadge(current: number, prior: number | null): string {
  if (!prior) return "";
  const pct = ((current - prior) / prior * 100).toFixed(1);
  return `${Number(pct) >= 0 ? "↑" : "↓"}${Math.abs(Number(pct))}%`;
}

/** Full chat-style summary with emojis — good for WhatsApp, Telegram, Slack */
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

/** Concise one-liner for quick executive paste */
function generateExecutiveOneLiner(d: SummaryData): string {
  const listenerDelta = pctBadge(d.listeners, d.listenersPrior);
  const snsDelta = pctBadge(d.snsFootprint, d.snsFootprintPrior);
  const netSent = d.sentimentPositive - d.sentimentNegative;
  const sentLabel = netSent >= 0 ? `+${netSent}` : `${netSent}`;
  const topTrack = d.tracks.length > 0
    ? d.tracks.reduce((a, b) => b.streams > a.streams ? b : a)
    : null;

  let text = `Santos Bravos ${d.reportDate} → `;
  text += `${fmtNum(d.listeners)} listeners${listenerDelta ? ` ${listenerDelta}` : ""} · `;
  text += `${fmtNum(d.totalStreams)} streams · `;
  text += `${fmtNum(d.snsFootprint)} SNS${snsDelta ? ` ${snsDelta}` : ""} · `;
  text += `${fmtNum(d.ytSubscribers)} YT subs · `;
  text += `${fmtNum(d.prMentions)} mentions · `;
  text += `Sent ${sentLabel}`;
  if (topTrack) text += ` · Top: ${topTrack.name} (${fmtNum(topTrack.streams)})`;
  return text;
}

/** Markdown table for email/docs/Notion */
function generateTableSummary(d: SummaryData): string {
  const lines: string[] = [];
  lines.push(`## Santos Bravos — ${d.reportDate}`);
  lines.push("");
  lines.push("### Key Metrics");
  lines.push("");
  lines.push("| Metric | Value | Change |");
  lines.push("|--------|------:|-------:|");
  lines.push(`| Spotify Listeners | ${fmtNum(d.listeners)} | ${pctBadge(d.listeners, d.listenersPrior) || "—"} |`);
  lines.push(`| Cross-Platform Streams | ${fmtNum(d.totalStreams)} | — |`);
  lines.push(`| SNS Footprint | ${fmtNum(d.snsFootprint)} | ${pctBadge(d.snsFootprint, d.snsFootprintPrior) || "—"} |`);
  lines.push(`| YouTube Subscribers | ${fmtNum(d.ytSubscribers)} | — |`);
  lines.push(`| Media Mentions (7d) | ${fmtNum(d.prMentions)} | ${fmtNum(d.prPerDay)}/day |`);
  lines.push(`| Net Sentiment | +${(d.sentimentPositive - d.sentimentNegative).toFixed(0)} | ${d.sentimentPositive}% pos / ${d.sentimentNegative}% neg |`);
  lines.push("");
  lines.push("### Tracks (Spotify Streams)");
  lines.push("");
  lines.push("| Track | Streams |");
  lines.push("|-------|--------:|");
  for (const t of d.tracks) {
    lines.push(`| ${t.name} | ${fmtNum(t.streams)} |`);
  }
  lines.push("");
  lines.push("### YouTube");
  lines.push("");
  lines.push("| Video | Views |");
  lines.push("|-------|------:|");
  for (const v of d.ytVideos) {
    lines.push(`| ${v.name} | ${fmtNum(v.views)} |`);
  }
  lines.push("");
  lines.push("### Social Media");
  lines.push("");
  lines.push("| Platform | Followers |");
  lines.push("|----------|----------:|");
  for (const p of d.platforms) {
    lines.push(`| ${p.platform} | ${fmtNum(p.current)} |`);
  }
  lines.push("");
  lines.push("*HYBE Latin America · Artist Intelligence Platform*");
  return lines.join("\n");
}

type Format = "chat" | "executive" | "table";

const FORMAT_OPTIONS: { id: Format; icon: string; label: string; desc: string }[] = [
  { id: "chat", icon: "💬", label: "Chat", desc: "Full summary with emojis" },
  { id: "executive", icon: "⚡", label: "One-liner", desc: "Concise executive paste" },
  { id: "table", icon: "📋", label: "Table", desc: "Markdown table for docs" },
];

export default function CopySummary({ data }: { data: SummaryData }) {
  const [copied, setCopied] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<Format | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const copyFormat = useCallback(async (format: Format) => {
    let text: string;
    switch (format) {
      case "executive":
        text = generateExecutiveOneLiner(data);
        break;
      case "table":
        text = generateTableSummary(data);
        break;
      default:
        text = generateSummaryText(data);
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    setCopied(true);
    setCopiedFormat(format);
    setMenuOpen(false);
    setTimeout(() => {
      setCopied(false);
      setCopiedFormat(null);
    }, 2000);
  }, [data]);

  const handleClick = useCallback(() => {
    if (copied) return;
    setMenuOpen((prev) => !prev);
  }, [copied]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 rounded-lg px-2.5 py-1.5 transition-all group"
        title="Copy executive summary to clipboard"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {copiedFormat === "executive" ? "Copied!" : copiedFormat === "table" ? "Copied!" : "Copied!"}
            </span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span className="text-[10px] font-bold text-neutral-500 group-hover:text-violet-400 uppercase tracking-wider transition-colors hidden sm:inline">Summary</span>
            <svg className={`w-2.5 h-2.5 text-neutral-600 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-black/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-semibold">Copy Summary As</p>
          </div>
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => copyFormat(opt.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors group/item"
            >
              <span className="text-sm">{opt.icon}</span>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-300 group-hover/item:text-white transition-colors">{opt.label}</p>
                <p className="text-[9px] text-neutral-600 group-hover/item:text-neutral-400 transition-colors">{opt.desc}</p>
              </div>
              <svg className="w-3 h-3 text-neutral-700 group-hover/item:text-violet-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          ))}
          {/* Preview hint */}
          <div className="px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-[8px] text-neutral-700 text-center">Click to copy · Paste anywhere</p>
          </div>
        </div>
      )}
    </div>
  );
}
