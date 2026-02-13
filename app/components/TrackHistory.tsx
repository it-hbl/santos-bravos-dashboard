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
  ReferenceLine,
} from "recharts";
import { RELEASES } from "../lib/data";
import { supabase } from "../lib/supabase";

interface TrackPoint {
  date: string;
  label: string;
  [trackName: string]: number | string;
}

interface TrackMeta {
  name: string;
  color: string;
  gradient: [string, string];
}

const TRACK_COLORS: TrackMeta[] = [
  { name: "0%", color: "#22c55e", gradient: ["#22c55e", "#15803d"] },
  { name: "0% (Portuguese Version)", color: "#06b6d4", gradient: ["#06b6d4", "#0e7490"] },
  { name: "KAWASAKI", color: "#ec4899", gradient: ["#ec4899", "#be185d"] },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function shortName(name: string) {
  if (name === "0% (Portuguese Version)") return "0% PT";
  return name;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => {
        const meta = TRACK_COLORS.find((t) => t.name === p.dataKey);
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-neutral-400">{shortName(p.dataKey)}:</span>
            <span className="font-bold text-white">{fmt(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackHistory() {
  const [data, setData] = useState<TrackPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState<string | null>(null); // null = show all
  const [viewMode, setViewMode] = useState<"cumulative" | "daily">("cumulative");

  useEffect(() => {
    async function fetchTrackHistory() {
      try {
        const { data: tracks, error } = await supabase
          .from("track_metrics")
          .select("report_date, track_name, spotify_streams")
          .order("report_date", { ascending: true });

        if (error || !tracks || tracks.length === 0) {
          setLoading(false);
          return;
        }

        // Group by date
        const byDate = new Map<string, Record<string, number>>();
        for (const t of tracks) {
          if (!byDate.has(t.report_date)) byDate.set(t.report_date, {});
          byDate.get(t.report_date)![t.track_name] = t.spotify_streams || 0;
        }

        const points: TrackPoint[] = Array.from(byDate.entries()).map(([date, trackData]) => {
          const d = new Date(date + "T12:00:00");
          return {
            date,
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            ...trackData,
          };
        });

        setData(points);
      } catch (err) {
        console.error("Failed to fetch track history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrackHistory();
  }, []);

  if (!loading && data.length < 2) return null;

  if (loading) {
    return (
      <div className="bg-white/[0.02] rounded-xl p-6 border border-white/[0.04] animate-pulse">
        <div className="h-4 w-48 bg-white/[0.05] rounded mb-4" />
        <div className="h-[220px] bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  // Compute daily rate data (streams gained per day between consecutive reports)
  const dailyRateData: TrackPoint[] = data.length >= 2 ? data.slice(1).map((point, i) => {
    const prev = data[i];
    const daysBetween = Math.max(1, Math.round(
      (new Date(point.date + "T12:00:00").getTime() - new Date(prev.date + "T12:00:00").getTime()) / 86400000
    ));
    const rates: Record<string, number | string> = { date: point.date, label: point.label };
    for (const t of TRACK_COLORS) {
      const curr = (point[t.name] as number) || 0;
      const prevVal = (prev[t.name] as number) || 0;
      rates[t.name] = curr > 0 && prevVal > 0 ? Math.round((curr - prevVal) / daysBetween) : 0;
    }
    return rates as TrackPoint;
  }) : [];

  const chartData = viewMode === "daily" ? dailyRateData : data;

  // Compute growth per track
  const first = data[0];
  const last = data[data.length - 1];
  const growthInfo = TRACK_COLORS.map((t) => {
    const start = (first[t.name] as number) || 0;
    const end = (last[t.name] as number) || 0;
    const growth = start > 0 ? ((end - start) / start) * 100 : 0;
    const added = end - start;
    return { ...t, start, end, growth, added };
  }).filter((t) => t.end > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🎵 Track Stream Growth
            <span className="text-[10px] text-neutral-500 font-normal">
              Spotify {viewMode === "daily" ? "daily rate" : "cumulative"} · {data.length} reports
            </span>
          </h3>
        </div>

        {/* View mode + Track toggles */}
        <div className="flex flex-wrap gap-1.5">
          {dailyRateData.length > 0 && (
            <>
              <button
                onClick={() => setViewMode("cumulative")}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                  viewMode === "cumulative"
                    ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                    : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
                }`}
              >
                📊 Cumulative
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                  viewMode === "daily"
                    ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                    : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
                }`}
              >
                ⚡ Daily Rate
              </button>
              <div className="w-px h-4 bg-white/[0.06] self-center mx-1" />
            </>
          )}
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
          {TRACK_COLORS.map((t) => (
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
              {shortName(t.name)}
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
            <span className="text-[11px] text-neutral-400">{shortName(t.name)}</span>
            <span className="text-[11px] font-bold text-white">{fmt(t.end)}</span>
            {t.growth > 0 && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{t.growth.toFixed(1)}%
              </span>
            )}
            <span className="text-[10px] text-neutral-600">+{fmt(t.added)}</span>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              {TRACK_COLORS.map((t) => (
                <linearGradient key={t.name} id={`grad-${t.name.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={fmt}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Release date reference lines (cumulative mode only) */}
            {viewMode === "cumulative" && data.length > 0 && RELEASES.filter(r => r.trackName).map((r) => {
              const d = new Date(r.date + "T12:00:00");
              const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              // Only show if the date falls within our data range
              const match = data.find(p => p.label === label);
              if (!match) return null;
              return (
                <ReferenceLine
                  key={r.id}
                  x={label}
                  stroke={r.color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: `${r.emoji} ${r.trackName === "0% (Portuguese Version)" ? "0% PT" : r.trackName}`,
                    position: "top",
                    fill: r.color,
                    fontSize: 9,
                    fontWeight: 600,
                  }}
                />
              );
            })}
            {TRACK_COLORS.map((t) =>
              activeTrack === null || activeTrack === t.name ? (
                <Area
                  key={t.name}
                  type="monotone"
                  dataKey={t.name}
                  stroke={t.color}
                  strokeWidth={2}
                  fill={`url(#grad-${t.name.replace(/[^a-z]/gi, "")})`}
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
