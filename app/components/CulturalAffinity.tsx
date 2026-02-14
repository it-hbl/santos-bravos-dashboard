"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AffinityData {
  topKeyphrases: { phrase: string; count: number }[];
  topHashtags: { tag: string; count: number }[];
  totalMentions: number;
  uniqueAuthors: number;
  sentiment: { positive: number; negative: number; neutral: number };
  timeSeries: { date: string; mentions: number }[];
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

const SENTIMENT_COLORS = ["#34d399", "#6b7280", "#f87171"]; // green, gray, red

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="text-neutral-400 mb-1">{label}</p>
      <p className="text-fuchsia-300 font-bold">{payload[0]?.value?.toLocaleString()} mentions</p>
    </div>
  );
}

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
  const sentimentData = [
    { name: "Positive", value: data.sentiment.positive },
    { name: "Neutral", value: data.sentiment.neutral },
    { name: "Negative", value: data.sentiment.negative },
  ];
  const avgPerDay = data.timeSeries.length > 0
    ? Math.round(data.totalMentions / data.timeSeries.length)
    : 0;
  const peakDay = data.timeSeries.length > 0
    ? data.timeSeries.reduce((max, d) => d.mentions > max.mentions ? d : max, data.timeSeries[0])
    : null;

  return (
    <div className="space-y-5">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-wider">
          🌐 {data.totalMentions.toLocaleString()} cultural mentions
        </span>
        {data.uniqueAuthors > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">
            👥 {data.uniqueAuthors.toLocaleString()} authors
          </span>
        )}
        {avgPerDay > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            📊 {avgPerDay.toLocaleString()}/day avg
          </span>
        )}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          netSentiment > 10 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" :
          netSentiment > 0 ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" :
          "bg-red-500/10 border border-red-500/20 text-red-300"
        }`}>
          {netSentiment > 0 ? "💚" : "⚠️"} Net sentiment {netSentiment > 0 ? "+" : ""}{netSentiment.toFixed(0)}%
        </span>
      </div>

      {/* Time Series + Sentiment Donut Row */}
      {(data.timeSeries.length >= 2 || sentimentData.some(d => d.value > 0)) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Area chart - cultural mention volume over time */}
          {data.timeSeries.length >= 2 && (
            <div className="sm:col-span-2 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">📈 Daily Cultural Volume</p>
                {peakDay && (
                  <span className="text-[9px] text-fuchsia-400/70">Peak: {peakDay.date} ({peakDay.mentions.toLocaleString()})</span>
                )}
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="culturalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#d946ef" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#525252", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="mentions"
                      stroke="#d946ef"
                      strokeWidth={2}
                      fill="url(#culturalGrad)"
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sentiment donut */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex flex-col items-center justify-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-2">💜 Cultural Sentiment</p>
            <div className="h-[90px] w-[90px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {sentimentData.map((_, i) => (
                      <Cell key={i} fill={SENTIMENT_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-black tabular-nums ${netSentiment > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {netSentiment > 0 ? "+" : ""}{netSentiment.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              {sentimentData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS[i] }} />
                  <span className="text-[8px] text-neutral-500">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <a
                key={ht.tag}
                href={`https://x.com/search?q=${encodeURIComponent(ht.tag)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: `rgba(139, 92, 246, ${0.05 + (1 - i / 10) * 0.12})`,
                  borderColor: `rgba(139, 92, 246, ${0.1 + (1 - i / 10) * 0.2})`,
                  color: `rgba(196, 181, 253, ${0.6 + (1 - i / 10) * 0.4})`,
                }}
              >
                {ht.tag} <span className="text-neutral-600 ml-1">{ht.count.toLocaleString()}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
