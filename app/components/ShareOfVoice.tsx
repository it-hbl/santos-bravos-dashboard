"use client";

import { useMemo, useEffect, useState } from "react";

interface SOVData {
  sb: { totalMentions: number; uniqueAuthors: number; sentimentNet: number };
  hl: { totalMentions: number; uniqueAuthors: number; sentimentNet: number };
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function Gauge({ pct, label, color }: { pct: number; label: string; color: string }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const filled = circ * (Math.min(pct, 100) / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black tabular-nums text-white">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-[9px] text-neutral-500 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

function ComparisonBar({ label, sbValue, totalValue, color }: { label: string; sbValue: number; totalValue: number; color: string }) {
  const pct = totalValue > 0 ? (sbValue / totalValue) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold tabular-nums">{fmt(sbValue)}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-500 tabular-nums">{fmt(totalValue)}</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function ShareOfVoice() {
  const [data, setData] = useState<SOVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSOV() {
      try {
        const res = await fetch("/api/meltwater");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!json.live || !json.data?.hybeLatin) {
          setLoading(false);
          return;
        }
        const pr = json.data.prMedia;
        const hl = json.data.hybeLatin;
        const fs = json.data.fanSentiment;
        setData({
          sb: {
            totalMentions: pr.totalMentions,
            uniqueAuthors: pr.uniqueAuthors,
            sentimentNet: (fs.positive?.pct ?? 0) - (fs.negative?.pct ?? 0),
          },
          hl: {
            totalMentions: hl.totalMentions,
            uniqueAuthors: hl.uniqueAuthors,
            sentimentNet: (hl.sentiment?.positive ?? 0) - (hl.sentiment?.negative ?? 0),
          },
        });
      } catch {
        // silently fail — component won't render
      } finally {
        setLoading(false);
      }
    }
    fetchSOV();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-24 bg-white/[0.04] rounded-xl" />
        <div className="h-4 bg-white/[0.04] rounded w-3/4" />
      </div>
    );
  }

  if (!data) return null;

  const mentionSOV = data.hl.totalMentions > 0
    ? (data.sb.totalMentions / data.hl.totalMentions) * 100
    : 0;
  const authorSOV = data.hl.uniqueAuthors > 0
    ? (data.sb.uniqueAuthors / data.hl.uniqueAuthors) * 100
    : 0;

  const sovColor = mentionSOV > 50 ? "#22c55e" : mentionSOV > 30 ? "#a78bfa" : "#f59e0b";
  const rating = mentionSOV > 60 ? "Dominant" : mentionSOV > 40 ? "Leading" : mentionSOV > 25 ? "Strong" : mentionSOV > 15 ? "Growing" : "Emerging";
  const ratingEmoji = mentionSOV > 60 ? "👑" : mentionSOV > 40 ? "🔥" : mentionSOV > 25 ? "💪" : mentionSOV > 15 ? "📈" : "🌱";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <Gauge pct={mentionSOV} label="Share of Voice" color={sovColor} />
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">{ratingEmoji}</span>
              <span className="text-sm font-bold text-white">{rating}</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Santos Bravos captures <span className="text-white font-semibold">{mentionSOV.toFixed(1)}%</span> of all HYBE Latin America media conversation
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03]">
              <span>🎤</span>
              <span className="text-neutral-400">SB:</span>
              <span className={data.sb.sentimentNet > 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {data.sb.sentimentNet > 0 ? "+" : ""}{data.sb.sentimentNet.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03]">
              <span>🏢</span>
              <span className="text-neutral-400">HYBE:</span>
              <span className={data.hl.sentimentNet > 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {data.hl.sentimentNet > 0 ? "+" : ""}{data.hl.sentimentNet.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <ComparisonBar label="Mentions" sbValue={data.sb.totalMentions} totalValue={data.hl.totalMentions} color="#a78bfa" />
        <ComparisonBar label="Unique Authors" sbValue={data.sb.uniqueAuthors} totalValue={data.hl.uniqueAuthors} color="#67e8f9" />
      </div>
    </div>
  );
}
