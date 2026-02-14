"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface QuickShareData {
  reportDate: string;
  listeners: number;
  totalStreams: number;
  snsFootprint: number;
  ytSubscribers: number;
  prMentions: number;
  sentimentNet: number;
  selectedDate?: string;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n?.toLocaleString() ?? "—";
}

function generateQuickText(d: QuickShareData): string {
  const lines = [
    `🎤 Santos Bravos — ${d.reportDate}`,
    "",
    `🎧 ${fmtNum(d.listeners)} Spotify Listeners`,
    `🎵 ${fmtNum(d.totalStreams)} Total Streams`,
    `📱 ${fmtNum(d.snsFootprint)} SNS Followers`,
    `▶️ ${fmtNum(d.ytSubscribers)} YT Subscribers`,
    `📰 ${fmtNum(d.prMentions)} Media Mentions`,
    `${d.sentimentNet >= 0 ? "😊" : "😟"} Sentiment: ${d.sentimentNet >= 0 ? "+" : ""}${d.sentimentNet.toFixed(0)} net`,
    "",
  ];
  const url = typeof window !== "undefined"
    ? `${window.location.origin}${d.selectedDate && d.selectedDate !== "2026-02-09" ? `?date=${d.selectedDate}` : ""}`
    : "https://santos-bravos-dashboard.vercel.app";
  lines.push(`📊 ${url}`);
  return lines.join("\n");
}

const CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    emoji: "💬",
    color: "hover:bg-emerald-500/20 hover:border-emerald-500/30",
    buildUrl: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    emoji: "✈️",
    color: "hover:bg-sky-500/20 hover:border-sky-500/30",
    buildUrl: (text: string) => `https://t.me/share/url?url=${encodeURIComponent("https://santos-bravos-dashboard.vercel.app")}&text=${encodeURIComponent(text)}`,
  },
  {
    key: "x",
    label: "X / Twitter",
    emoji: "🐦",
    color: "hover:bg-neutral-500/20 hover:border-neutral-500/30",
    buildUrl: (text: string) => {
      // Twitter has 280 char limit — trim to essentials
      const short = text.split("\n").filter(l => l.startsWith("🎤") || l.startsWith("🎧") || l.startsWith("🎵") || l.startsWith("📊")).join(" · ");
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(short)}`;
    },
  },
  {
    key: "email",
    label: "Email",
    emoji: "📧",
    color: "hover:bg-amber-500/20 hover:border-amber-500/30",
    buildUrl: (text: string) => {
      const firstLine = text.split("\n")[0] || "Santos Bravos Report";
      return `mailto:?subject=${encodeURIComponent(firstLine)}&body=${encodeURIComponent(text)}`;
    },
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    emoji: "💼",
    color: "hover:bg-blue-500/20 hover:border-blue-500/30",
    buildUrl: (text: string) => {
      const url = text.split("\n").find(l => l.startsWith("📊"))?.replace("📊 ", "") || "https://santos-bravos-dashboard.vercel.app";
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    },
  },
];

export default function QuickShare({ data }: { data: QuickShareData }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const text = generateQuickText(data);

  const handleCopy = useCallback(async () => {
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
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 rounded-lg px-2.5 py-1.5 transition-all group"
        title="Quick share to WhatsApp, Telegram, X"
      >
        <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-[10px] font-bold text-neutral-500 group-hover:text-violet-400 uppercase tracking-wider transition-colors hidden sm:inline">Share</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-hybe rounded-xl border border-white/[0.08] shadow-2xl shadow-black/40 z-[60] p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold px-1">Quick Share</p>

          {/* Preview */}
          <div className="bg-white/[0.03] rounded-lg p-2.5 text-[11px] text-neutral-400 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto font-mono">
            {text}
          </div>

          {/* Channel buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {CHANNELS.map(ch => (
              <a
                key={ch.key}
                href={ch.buildUrl(text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 transition-all text-neutral-400 hover:text-white ${ch.color}`}
              >
                <span className="text-sm">{ch.emoji}</span>
                <span className="text-[10px] font-semibold">{ch.label}</span>
              </a>
            ))}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 transition-all text-neutral-400 hover:text-white hover:bg-violet-500/20 hover:border-violet-500/30"
            >
              <span className="text-sm">{copied ? "✅" : "📋"}</span>
              <span className="text-[10px] font-semibold">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
