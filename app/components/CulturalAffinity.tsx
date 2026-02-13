"use client";

import { useState, useEffect } from "react";

interface AffinityData {
  topKeyphrases: { phrase: string; count: number }[];
  topHashtags: { tag: string; count: number }[];
  totalMentions: number;
  sentiment: { positive: number; negative: number; neutral: number };
}

// Category mapping for keyphrases → cultural themes
const THEME_ICONS: Record<string, string> = {
  music: "🎵", kpop: "🎤", latin: "🌎", dance: "💃", fashion: "👗",
  debut: "⭐", concert: "🎪", viral: "🔥", fan: "💜", hybe: "🏢",
  default: "✨",
};

function getThemeIcon(phrase: string): string {
  const lower = phrase.toLowerCase();
  if (lower.includes("music") || lower.includes("song") || lower.includes("track")) return THEME_ICONS.music;
  if (lower.includes("kpop") || lower.includes("k-pop") || lower.includes("korean")) return THEME_ICONS.kpop;
  if (lower.includes("latin") || lower.includes("latam") || lower.includes("latino")) return THEME_ICONS.latin;
  if (lower.includes("dance") || lower.includes("choreo")) return THEME_ICONS.dance;
  if (lower.includes("fashion") || lower.includes("style") || lower.includes("outfit")) return THEME_ICONS.fashion;
  if (lower.includes("debut") || lower.includes("launch") || lower.includes("release")) return THEME_ICONS.debut;
  if (lower.includes("concert") || lower.includes("tour") || lower.includes("show")) return THEME_ICONS.concert;
  if (lower.includes("viral") || lower.includes("tiktok") || lower.includes("trend")) return THEME_ICONS.viral;
  if (lower.includes("fan") || lower.includes("army") || lower.includes("fandom")) return THEME_ICONS.fan;
  if (lower.includes("hybe") || lower.includes("label") || lower.includes("industry")) return THEME_ICONS.hybe;
  return THEME_ICONS.default;
}

// Color palette for affinity bars
const BAR_COLORS = [
  "from-violet-500 to-purple-400",
  "from-cyan-500 to-blue-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-yellow-400",
  "from-emerald-500 to-green-400",
  "from-indigo-500 to-blue-400",
  "from-fuchsia-500 to-pink-400",
  "from-teal-500 to-cyan-400",
];

export default function CulturalAffinity() {
  const [data, setData] = useState<AffinityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAffinity() {
      try {
        const res = await fetch("/api/meltwater/affinity");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (json.live && json.data) {
          setData(json.data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAffinity();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-10 bg-white/[0.03] rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !data || (!data.topKeyphrases?.length && !data.topHashtags?.length)) {
    return null; // Gracefully hidden when no data
  }

  const maxCount = data.topKeyphrases[0]?.count || 1;
  const netSentiment = data.sentiment.positive - data.sentiment.negative;

  return (
    <div className="space-y-5">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-wider">
          🌐 {data.totalMentions.toLocaleString()} cultural mentions
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          netSentiment > 10 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" :
          netSentiment > 0 ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" :
          "bg-red-500/10 border border-red-500/20 text-red-300"
        }`}>
          {netSentiment > 0 ? "💚" : "⚠️"} Net sentiment +{netSentiment.toFixed(0)}%
        </span>
      </div>

      {/* Cultural themes / keyphrases */}
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🎭 Cultural Themes</p>
        <div className="space-y-2">
          {data.topKeyphrases.slice(0, 8).map((kp, i) => {
            const pct = (kp.count / maxCount) * 100;
            const color = BAR_COLORS[i % BAR_COLORS.length];
            return (
              <div key={kp.phrase} className="group">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getThemeIcon(kp.phrase)}</span>
                    <span className="text-xs text-neutral-300 group-hover:text-white transition-colors capitalize">
                      {kp.phrase}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 tabular-nums font-medium">
                    {kp.count.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cultural hashtags */}
      {data.topHashtags.length > 0 && (
        <div className="pt-4 border-t border-white/[0.05]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🏷️ Cultural Hashtags</p>
          <div className="flex flex-wrap gap-2">
            {data.topHashtags.slice(0, 10).map((ht, i) => (
              <span
                key={ht.tag}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all hover:scale-105"
                style={{
                  backgroundColor: `rgba(139, 92, 246, ${0.05 + (1 - i / 10) * 0.12})`,
                  borderColor: `rgba(139, 92, 246, ${0.1 + (1 - i / 10) * 0.2})`,
                  color: `rgba(196, 181, 253, ${0.6 + (1 - i / 10) * 0.4})`,
                }}
              >
                {ht.tag} <span className="text-neutral-600 ml-1">{ht.count.toLocaleString()}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
