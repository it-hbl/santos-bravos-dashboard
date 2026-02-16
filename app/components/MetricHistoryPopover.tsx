"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  /** Column name in daily_reports table */
  dbColumn: string;
  /** For track metrics: track name */
  trackName?: string;
  /** For youtube metrics: video name */
  videoName?: string;
  /** Display label */
  label: string;
  /** Current value (shown in header) */
  current: number;
  /** Children = the clickable trigger element */
  children: React.ReactNode;
}

interface HistoryPoint {
  date: string;
  label: string;
  value: number;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function MiniAreaChart({ data }: { data: HistoryPoint[] }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const w = 280;
  const h = 80;
  const padY = 4;
  const padX = 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2);
    const y = padY + (1 - (d.value - min) / range) * (h - padY * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x},${h} L ${points[0].x},${h} Z`;

  const isGrowing = values[values.length - 1] >= values[0];
  const color = isGrowing ? "#34d399" : "#f87171";

  // Find min/max points for annotation
  const maxPt = points.reduce((a, b) => (a.value >= b.value ? a : b));
  const minPt = points.reduce((a, b) => (a.value <= b.value ? a : b));

  return (
    <svg width={w} height={h + 16} viewBox={`0 0 ${w} ${h + 16}`} className="w-full">
      <defs>
        <linearGradient id="mhp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill="url(#mhp-grad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots at endpoints */}
      <circle cx={points[0].x} cy={points[0].y} r={2.5} fill={color} opacity={0.5} />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={color} />
      {/* Max annotation */}
      <text x={maxPt.x} y={maxPt.y - 6} textAnchor="middle" fill={color} fontSize="8" fontWeight="700" opacity={0.8}>
        {fmt(maxPt.value)}
      </text>
      {/* X axis labels */}
      <text x={points[0].x} y={h + 12} textAnchor="start" fill="#737373" fontSize="7">
        {data[0].label}
      </text>
      <text x={points[points.length - 1].x} y={h + 12} textAnchor="end" fill="#737373" fontSize="7">
        {data[data.length - 1].label}
      </text>
    </svg>
  );
}

// Simple cache to avoid re-fetching on repeated opens
const historyCache = new Map<string, HistoryPoint[]>();

export default function MetricHistoryPopover({ dbColumn, trackName, videoName, label, current, children }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<HistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cacheKey = `${dbColumn}:${trackName || ""}:${videoName || ""}`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  const fetchHistory = useCallback(async () => {
    if (historyCache.has(cacheKey)) {
      setData(historyCache.get(cacheKey)!);
      return;
    }
    setLoading(true);
    try {
      let points: HistoryPoint[] = [];

      if (trackName) {
        // Fetch from track_metrics
        const col = dbColumn === "spotify_streams" ? "spotify_streams" : dbColumn;
        const { data: rows } = await supabase
          .from("track_metrics")
          .select(`report_date, ${col}`)
          .eq("track_name", trackName)
          .order("report_date", { ascending: true });
        if (rows) {
          points = rows.map((r: any) => {
            const d = new Date(r.report_date + "T12:00:00");
            return {
              date: r.report_date,
              label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: r[col] || 0,
            };
          }).filter(p => p.value > 0);
        }
      } else if (videoName) {
        // Fetch from youtube_videos
        const { data: rows } = await supabase
          .from("youtube_videos")
          .select("report_date, views")
          .eq("video_name", videoName)
          .order("report_date", { ascending: true });
        if (rows) {
          points = rows.map((r: any) => {
            const d = new Date(r.report_date + "T12:00:00");
            return {
              date: r.report_date,
              label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: r.views || 0,
            };
          }).filter(p => p.value > 0);
        }
      } else {
        // Fetch from daily_reports
        const { data: rows } = await supabase
          .from("daily_reports")
          .select(`report_date, ${dbColumn}`)
          .order("report_date", { ascending: true });
        if (rows) {
          points = rows.map((r: any) => {
            const d = new Date(r.report_date + "T12:00:00");
            return {
              date: r.report_date,
              label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: r[dbColumn] || 0,
            };
          }).filter(p => p.value > 0);
        }
      }

      historyCache.set(cacheKey, points);
      setData(points);
    } catch (err) {
      console.error("MetricHistoryPopover fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, dbColumn, trackName, videoName]);

  const toggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next && !data) fetchHistory();
  }, [open, data, fetchHistory]);

  // Compute stats
  const stats = data && data.length >= 2 ? (() => {
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const totalGrowth = first > 0 ? ((last - first) / first) * 100 : 0;
    const maxVal = Math.max(...data.map(d => d.value));
    const minVal = Math.min(...data.map(d => d.value));
    // Average daily change
    const daysBetween = Math.max(1, Math.round(
      (new Date(data[data.length - 1].date + "T12:00:00").getTime() - new Date(data[0].date + "T12:00:00").getTime()) / 86400000
    ));
    const dailyAvg = (last - first) / daysBetween;
    return { totalGrowth, maxVal, minVal, dailyAvg, reports: data.length };
  })() : null;

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={toggle}
        className="cursor-pointer hover:bg-white/[0.04] rounded px-1 -mx-1 transition-colors"
        title="Click to view historical trend"
        aria-label={`View history for ${label}`}
      >
        {children}
      </button>

      {open && (
        <div
          className="absolute z-[200] bottom-full mb-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-[300px] bg-black/95 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/[0.06]">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-white tabular-nums">{fmt(current)}</p>
          </div>

          {/* Chart area */}
          <div className="px-3 py-3">
            {loading && (
              <div className="h-[96px] flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            )}
            {!loading && data && data.length >= 2 && (
              <MiniAreaChart data={data} />
            )}
            {!loading && data && data.length < 2 && (
              <p className="text-[10px] text-neutral-600 text-center py-6">Not enough historical data yet</p>
            )}
          </div>

          {/* Stats footer */}
          {stats && (
            <div className="px-3 py-2 border-t border-white/[0.06] grid grid-cols-3 gap-2">
              <div>
                <p className="text-[8px] text-neutral-600 uppercase">Total Growth</p>
                <p className={`text-[10px] font-bold tabular-nums ${stats.totalGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stats.totalGrowth >= 0 ? "+" : ""}{stats.totalGrowth.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[8px] text-neutral-600 uppercase">Avg/Day</p>
                <p className={`text-[10px] font-bold tabular-nums ${stats.dailyAvg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stats.dailyAvg >= 0 ? "+" : ""}{fmt(Math.round(stats.dailyAvg))}
                </p>
              </div>
              <div>
                <p className="text-[8px] text-neutral-600 uppercase">Reports</p>
                <p className="text-[10px] font-bold tabular-nums text-neutral-300">{stats.reports}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
