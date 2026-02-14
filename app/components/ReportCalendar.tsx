"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";

/**
 * ReportCalendar — GitHub-contribution-style heatmap calendar showing
 * which days have report data and Spotify listener count by color intensity.
 * Gives executives an instant view of data coverage and peak performance days.
 */

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

interface DayData {
  date: string;
  listeners: number;
  streams: number;
}

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

export default function ReportCalendar() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const { data: reports, error } = await supabase
          .from("daily_reports")
          .select("report_date, spotify_listeners, cross_platform_streams")
          .order("report_date", { ascending: true });

        if (error || !reports || reports.length < 1) {
          setLoading(false);
          return;
        }
        if (!cancelled) {
          setData(
            reports.map((r: any) => ({
              date: r.report_date,
              listeners: r.spotify_listeners || 0,
              streams: r.cross_platform_streams || 0,
            }))
          );
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const { cells, weeks, monthLabels, maxListeners, minListeners } = useMemo(() => {
    if (data.length === 0)
      return { cells: [], weeks: [], monthLabels: [], maxListeners: 0, minListeners: 0 };

    const dataMap = new Map(data.map((d) => [d.date, d]));

    // Build calendar from first report date to today (or last report date, whichever is later)
    const firstDate = new Date(data[0].date + "T12:00:00");
    const lastDate = new Date(data[data.length - 1].date + "T12:00:00");
    const today = new Date();
    const endDate = lastDate > today ? lastDate : today;

    // Start from Sunday of the first week
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const allCells: { date: string; dayOfWeek: number; weekIndex: number; data: DayData | null; isFuture: boolean }[] = [];
    const labels: { label: string; weekIndex: number }[] = [];
    let weekIndex = 0;
    let lastMonth = -1;
    const current = new Date(startDate);

    while (current <= endDate || current.getDay() !== 0) {
      const dateStr = current.toISOString().split("T")[0];
      const dayOfWeek = current.getDay();
      const isFuture = current > today;

      if (dayOfWeek === 0 && weekIndex > 0) weekIndex++;
      if (dayOfWeek === 0 || allCells.length === 0) {
        // Check for new month label
        if (current.getMonth() !== lastMonth) {
          lastMonth = current.getMonth();
          labels.push({
            label: current.toLocaleDateString("en-US", { month: "short" }),
            weekIndex,
          });
        }
      }

      allCells.push({
        date: dateStr,
        dayOfWeek,
        weekIndex,
        data: dataMap.get(dateStr) || null,
        isFuture,
      });

      current.setDate(current.getDate() + 1);
      if (current > endDate && current.getDay() === 0) break;
    }

    const maxL = Math.max(...data.map((d) => d.listeners), 1);
    const minL = Math.min(...data.map((d) => d.listeners));

    // Group by week
    const weeksArr: typeof allCells[] = [];
    for (const cell of allCells) {
      if (!weeksArr[cell.weekIndex]) weeksArr[cell.weekIndex] = [];
      weeksArr[cell.weekIndex].push(cell);
    }

    return {
      cells: allCells,
      weeks: weeksArr.filter(Boolean),
      monthLabels: labels,
      maxListeners: maxL,
      minListeners: minL,
    };
  }, [data]);

  if (!loading && data.length < 2) return null;

  if (loading) {
    return (
      <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.04] animate-pulse">
        <div className="h-4 w-40 bg-white/[0.05] rounded mb-3" />
        <div className="h-[100px] bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  function getColor(d: DayData | null, isFuture: boolean): string {
    if (isFuture) return "rgba(255,255,255,0.01)";
    if (!d) return "rgba(255,255,255,0.03)";
    const t = maxListeners > minListeners
      ? (d.listeners - minListeners) / (maxListeners - minListeners)
      : 0.5;
    // Violet scale: from muted to bright
    if (t >= 0.8) return "rgba(139, 92, 246, 0.9)";   // violet-500
    if (t >= 0.6) return "rgba(139, 92, 246, 0.65)";
    if (t >= 0.4) return "rgba(139, 92, 246, 0.45)";
    if (t >= 0.2) return "rgba(139, 92, 246, 0.3)";
    return "rgba(139, 92, 246, 0.15)";
  }

  const cellSize = 14;
  const gap = 3;
  const totalWidth = weeks.length * (cellSize + gap) + 30;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          📅 Report Coverage Calendar
          <span className="text-[10px] text-neutral-500 font-normal">
            {data.length} reports · Spotify Listeners intensity
          </span>
        </h3>
        <div className="flex items-center gap-1.5 text-[9px] text-neutral-600">
          <span>Less</span>
          {[0.15, 0.3, 0.45, 0.65, 0.9].map((opacity, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 10,
                height: 10,
                backgroundColor: `rgba(139, 92, 246, ${opacity})`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide relative">
        <svg
          width={totalWidth}
          height={7 * (cellSize + gap) + 20}
          className="block"
        >
          {/* Month labels */}
          {monthLabels.map((ml, i) => (
            <text
              key={i}
              x={30 + ml.weekIndex * (cellSize + gap)}
              y={10}
              fill="#525252"
              fontSize={9}
              fontFamily="Inter, system-ui"
            >
              {ml.label}
            </text>
          ))}

          {/* Day labels */}
          {[1, 3, 5].map((d) => (
            <text
              key={d}
              x={0}
              y={18 + d * (cellSize + gap) + cellSize / 2 + 3}
              fill="#404040"
              fontSize={9}
              fontFamily="Inter, system-ui"
            >
              {DAY_NAMES[d]}
            </text>
          ))}

          {/* Day cells */}
          {weeks.map((week, wi) =>
            week.map((cell) => (
              <rect
                key={cell.date}
                x={30 + wi * (cellSize + gap)}
                y={18 + cell.dayOfWeek * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={3}
                fill={getColor(cell.data, cell.isFuture)}
                stroke={hoveredDay?.date === cell.date ? "rgba(255,255,255,0.4)" : "transparent"}
                strokeWidth={1}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={(e) => {
                  if (cell.data) {
                    setHoveredDay(cell.data);
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                  }
                }}
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))
          )}
        </svg>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none bg-neutral-900/95 border border-white/10 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm transform -translate-x-1/2 -translate-y-full -mt-2"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <p className="text-[10px] text-neutral-400 font-medium">
              {new Date(hoveredDay.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-[9px] text-neutral-600">Listeners</span>
                <p className="text-xs font-bold text-violet-400 tabular-nums">{fmt(hoveredDay.listeners)}</p>
              </div>
              <div>
                <span className="text-[9px] text-neutral-600">Streams</span>
                <p className="text-xs font-bold text-emerald-400 tabular-nums">{fmt(hoveredDay.streams)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-4 text-[10px] text-neutral-500">
        <span>
          📊 Peak: <span className="text-violet-400 font-semibold">
            {fmt(maxListeners)}
          </span> listeners on{" "}
          <span className="text-neutral-400">
            {data.length > 0
              ? new Date(
                  data.reduce((a, b) => (b.listeners > a.listeners ? b : a)).date + "T12:00:00"
                ).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—"}
          </span>
        </span>
        <span className="text-neutral-700">·</span>
        <span>
          Coverage: <span className="text-neutral-400 font-semibold">{data.length} days</span> with data
        </span>
      </div>
    </div>
  );
}
