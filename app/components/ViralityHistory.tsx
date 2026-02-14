"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "../lib/supabase";

interface DataPoint {
  date: string;
  label: string;
  [key: string]: number | string;
}

type MetricMode = "audio_views" | "tiktok_creates" | "ig_creates";

const TRACKS = [
  { name: "0%", color: "#22c55e", short: "0%" },
  { name: "0% (Portuguese Version)", color: "#06b6d4", short: "0% PT" },
  { name: "KAWASAKI", color: "#ec4899", short: "KAWASAKI" },
];

const METRIC_MODES: { key: MetricMode; label: string; emoji: string; color: string }[] = [
  { key: "audio_views", label: "Audio Views", emoji: "🔊", color: "violet" },
  { key: "tiktok_creates", label: "TikTok Creates", emoji: "🎵", color: "cyan" },
  { key: "ig_creates", label: "IG Creates", emoji: "📸", color: "pink" },
];

// Maps TikTok/IG creates mode to create field for ratio computation
const CREATES_FIELD: Record<MetricMode, string> = {
  audio_views: "audio_views",
  tiktok_creates: "tiktok_creates",
  ig_creates: "ig_creates",
};

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function CustomTooltip({ active, payload, label, isRatio }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">{label}</p>
      {sorted.map((p: any) => {
        const track = TRACKS.find((t) => t.name === p.dataKey);
        const val = isRatio
          ? (p.value >= 100 ? p.value.toFixed(0) : p.value >= 10 ? p.value.toFixed(1) : p.value.toFixed(2))
          : fmt(p.value);
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-neutral-400">{track?.short || p.dataKey}:</span>
            <span className="font-bold text-white">{val}{isRatio ? " /1K streams" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ViralityHistory() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [streamData, setStreamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricMode, setMetricMode] = useState<MetricMode>("audio_views");
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [ratioMode, setRatioMode] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [viralityRes, streamsRes] = await Promise.all([
          supabase
            .from("track_metrics")
            .select("report_date, track_name, audio_views, tiktok_creates, ig_creates")
            .order("report_date", { ascending: true }),
          supabase
            .from("track_metrics")
            .select("report_date, track_name, spotify_streams")
            .order("report_date", { ascending: true }),
        ]);

        if (!viralityRes.error && viralityRes.data) setRawData(viralityRes.data);
        if (!streamsRes.error && streamsRes.data) setStreamData(streamsRes.data);
      } catch (err) {
        console.error("Failed to fetch virality history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!loading && rawData.length === 0) return null;

  // Build streams lookup for ratio mode: { date+track → spotify_streams }
  const streamsLookup = new Map<string, number>();
  for (const row of streamData) {
    if (row.spotify_streams > 0) {
      streamsLookup.set(`${row.report_date}|${row.track_name}`, row.spotify_streams);
    }
  }

  // Group by date for the current metric
  const byDate = new Map<string, Record<string, number>>();
  for (const row of rawData) {
    if (!byDate.has(row.report_date)) byDate.set(row.report_date, {});
    const rawValue = row[metricMode] || 0;

    if (ratioMode) {
      // Compute creates per 1K Spotify streams
      const streams = streamsLookup.get(`${row.report_date}|${row.track_name}`);
      if (streams && streams > 0) {
        byDate.get(row.report_date)![row.track_name] = parseFloat(((rawValue / streams) * 1000).toFixed(2));
      } else {
        byDate.get(row.report_date)![row.track_name] = 0;
      }
    } else {
      byDate.get(row.report_date)![row.track_name] = rawValue;
    }
  }

  const chartData: DataPoint[] = Array.from(byDate.entries()).map(([date, trackData]) => {
    const d = new Date(date + "T12:00:00");
    return {
      date,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...trackData,
    };
  });

  if (!loading && chartData.length < 2) return null;

  if (loading) {
    return (
      <div className="bg-white/[0.02] rounded-xl p-6 border border-white/[0.04] animate-pulse">
        <div className="h-4 w-52 bg-white/[0.05] rounded mb-4" />
        <div className="h-[220px] bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  // Compute growth per track for the active metric
  const first = chartData[0];
  const last = chartData[chartData.length - 1];
  const growthInfo = TRACKS.map((t) => {
    const start = (first[t.name] as number) || 0;
    const end = (last[t.name] as number) || 0;
    const growth = start > 0 ? ((end - start) / start) * 100 : 0;
    const added = end - start;
    return { ...t, start, end, growth, added };
  }).filter((t) => t.end > 0);

  const modeInfo = METRIC_MODES.find((m) => m.key === metricMode)!;
  const hasStreams = streamData.length > 0 && streamsLookup.size > 0;

  // Format value based on ratio mode
  const fmtValue = ratioMode
    ? (n: number) => n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)
    : fmt;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🔥 Audio Virality History
            <span className="text-[10px] text-neutral-500 font-normal">
              Cobrand · {modeInfo.emoji} {ratioMode ? `${modeInfo.label} per 1K Streams` : modeInfo.label} · {chartData.length} reports
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {/* Metric mode toggles */}
          {METRIC_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetricMode(m.key)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                metricMode === m.key
                  ? `border-${m.color}-500/40 text-${m.color}-300 bg-${m.color}-500/10`
                  : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
              }`}
              style={
                metricMode === m.key
                  ? {
                      borderColor: m.color === "violet" ? "#8b5cf640" : m.color === "cyan" ? "#06b6d440" : "#ec489940",
                      color: m.color === "violet" ? "#c4b5fd" : m.color === "cyan" ? "#67e8f9" : "#f9a8d4",
                      backgroundColor: m.color === "violet" ? "#8b5cf610" : m.color === "cyan" ? "#06b6d410" : "#ec489910",
                    }
                  : {}
              }
            >
              {m.emoji} {m.label}
            </button>
          ))}

          {/* Ratio mode toggle */}
          {hasStreams && (
            <>
              <div className="w-px h-4 bg-white/[0.06] self-center mx-1" />
              <button
                onClick={() => setRatioMode(!ratioMode)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                  ratioMode
                    ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                    : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
                }`}
                title="Show creates per 1K Spotify streams — normalizes for audience size to reveal true virality"
              >
                📊 per 1K Streams
              </button>
            </>
          )}

          <div className="w-px h-4 bg-white/[0.06] self-center mx-1" />

          {/* Track toggles */}
          <button
            onClick={() => setActiveTrack(null)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
              activeTrack === null
                ? "border-white/20 text-white bg-white/[0.08]"
                : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
            }`}
          >
            All
          </button>
          {TRACKS.map((t) => (
            <button
              key={t.name}
              onClick={() => setActiveTrack(activeTrack === t.name ? null : t.name)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                activeTrack === null || activeTrack === t.name
                  ? "border-white/20 text-white"
                  : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
              }`}
              style={
                activeTrack === null || activeTrack === t.name
                  ? { backgroundColor: t.color + "15", borderColor: t.color + "40" }
                  : {}
              }
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: t.color, opacity: activeTrack === null || activeTrack === t.name ? 1 : 0.3 }}
              />
              {t.short}
            </button>
          ))}
        </div>
      </div>

      {/* Growth badges */}
      <div className="flex flex-wrap gap-3">
        {growthInfo.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => setActiveTrack(activeTrack === t.name ? null : t.name)}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="text-[11px] text-neutral-400">{t.short}</span>
            <span className="text-[11px] font-bold text-white">{ratioMode ? fmtValue(t.end) : fmt(t.end)}{ratioMode ? "/1K" : ""}</span>
            {t.growth > 0 && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{t.growth.toFixed(1)}%
              </span>
            )}
            {t.added !== 0 && (
              <span className="text-[10px] text-neutral-600">
                {t.added > 0 ? "+" : ""}{fmt(t.added)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              {TRACKS.map((t) => (
                <linearGradient key={t.name} id={`grad-vir-${t.name.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={t.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={ratioMode ? fmtValue : fmt}
              width={55}
            />
            <Tooltip content={<CustomTooltip isRatio={ratioMode} />} />
            {TRACKS.map((t) =>
              activeTrack === null || activeTrack === t.name ? (
                <Area
                  key={t.name}
                  type="monotone"
                  dataKey={t.name}
                  stroke={t.color}
                  strokeWidth={2}
                  fill={`url(#grad-vir-${t.name.replace(/[^a-z]/gi, "")})`}
                  dot={{ fill: t.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#000" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  fillOpacity={activeTrack === t.name ? 0.8 : 0.5}
                  strokeOpacity={activeTrack !== null && activeTrack !== t.name ? 0.2 : 1}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
