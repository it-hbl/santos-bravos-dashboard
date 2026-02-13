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
  [videoName: string]: number | string;
}

interface VideoMeta {
  name: string;
  shortName: string;
  color: string;
}

const VIDEO_COLORS: VideoMeta[] = [
  { name: "0% Official MV", shortName: "0% MV", color: "#ef4444" },
  { name: "0% Debut Visualizer", shortName: "Visualizer", color: "#f97316" },
  { name: "0% (Portuguese) Lyric Video", shortName: "0% PT", color: "#06b6d4" },
  { name: "KAWASAKI Performance Video", shortName: "KAWASAKI", color: "#ec4899" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function getShortName(name: string) {
  return VIDEO_COLORS.find((v) => v.name === name)?.shortName || name;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">{label}</p>
      {payload
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-neutral-400">{getShortName(p.dataKey)}:</span>
            <span className="font-bold text-white">{fmt(p.value)}</span>
          </div>
        ))}
    </div>
  );
}

export default function YouTubeHistory() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: rows, error } = await supabase
          .from("youtube_videos")
          .select("report_date, video_name, views")
          .order("report_date", { ascending: true });

        if (error || !rows || rows.length === 0) {
          setLoading(false);
          return;
        }

        const byDate = new Map<string, Record<string, number>>();
        for (const r of rows) {
          if (!byDate.has(r.report_date)) byDate.set(r.report_date, {});
          byDate.get(r.report_date)![r.video_name] = r.views || 0;
        }

        const points: DataPoint[] = Array.from(byDate.entries()).map(([date, videoData]) => {
          const d = new Date(date + "T12:00:00");
          return {
            date,
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            ...videoData,
          };
        });

        setData(points);
      } catch (err) {
        console.error("Failed to fetch YouTube history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
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

  const first = data[0];
  const last = data[data.length - 1];
  const growthInfo = VIDEO_COLORS.map((v) => {
    const start = (first[v.name] as number) || 0;
    const end = (last[v.name] as number) || 0;
    const growth = start > 0 ? ((end - start) / start) * 100 : 0;
    const added = end - start;
    return { ...v, start, end, growth, added };
  }).filter((v) => v.end > 0);

  // Total views across all videos
  const totalViews = growthInfo.reduce((s, v) => s + v.end, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            ▶️ YouTube View Growth
            <span className="text-[10px] text-neutral-500 font-normal">
              Cumulative views · {data.length} reports · {fmt(totalViews)} total
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveVideo(null)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
              activeVideo === null
                ? "border-white/20 text-white bg-white/[0.08]"
                : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
            }`}
          >
            All
          </button>
          {VIDEO_COLORS.map((v) => (
            <button
              key={v.name}
              onClick={() => setActiveVideo(activeVideo === v.name ? null : v.name)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                activeVideo === null || activeVideo === v.name
                  ? "border-white/20 text-white"
                  : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
              }`}
              style={
                activeVideo === null || activeVideo === v.name
                  ? { backgroundColor: v.color + "15", borderColor: v.color + "40" }
                  : {}
              }
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: v.color, opacity: activeVideo === null || activeVideo === v.name ? 1 : 0.3 }}
              />
              {v.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Growth badges */}
      <div className="flex flex-wrap gap-3">
        {growthInfo.map((v) => (
          <div
            key={v.name}
            className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => setActiveVideo(activeVideo === v.name ? null : v.name)}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
            <span className="text-[11px] text-neutral-400">{v.shortName}</span>
            <span className="text-[11px] font-bold text-white">{fmt(v.end)}</span>
            {v.growth > 0 && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{v.growth.toFixed(1)}%
              </span>
            )}
            <span className="text-[10px] text-neutral-600">+{fmt(v.added)}</span>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              {VIDEO_COLORS.map((v) => (
                <linearGradient key={v.name} id={`yt-grad-${v.shortName.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={v.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={v.color} stopOpacity={0.02} />
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
            {VIDEO_COLORS.map((v) =>
              activeVideo === null || activeVideo === v.name ? (
                <Area
                  key={v.name}
                  type="monotone"
                  dataKey={v.name}
                  stroke={v.color}
                  strokeWidth={2}
                  fill={`url(#yt-grad-${v.shortName.replace(/[^a-z]/gi, "")})`}
                  dot={{ fill: v.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#000" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  fillOpacity={activeVideo === v.name ? 0.8 : 0.5}
                  strokeOpacity={activeVideo !== null && activeVideo !== v.name ? 0.2 : 1}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
