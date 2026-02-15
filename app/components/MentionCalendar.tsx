"use client";

import { useMemo, useState } from "react";

interface MentionCalendarProps {
  /** Daily time series: [{date: "Feb 3", mentions: 850}, ...] */
  timeSeries: { date: string; mentions: number }[];
  /** Selected range label like "7d" | "14d" | "30d" */
  rangeLabel?: string;
}

/** Interpolate between two colors at t (0-1) */
function lerpColor(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number): string {
  return `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
}

/** 5-step intensity scale: transparent → deep violet → bright violet → cyan */
function intensityColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "rgba(139, 92, 246, 0.06)";
  const t = Math.min(value / max, 1);
  if (t < 0.25) return lerpColor(139, 92, 246, 139, 92, 246, t * 4); // faint violet
  if (t < 0.5) return `rgba(139, 92, 246, ${0.25 + t * 0.5})`; // medium violet  
  if (t < 0.75) return lerpColor(139, 92, 246, 124, 58, 237, (t - 0.5) * 4); // violet-600
  return lerpColor(124, 58, 237, 6, 182, 212, (t - 0.75) * 4); // → cyan
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MentionCalendar({ timeSeries, rangeLabel }: MentionCalendarProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { cells, max, avg, peak, quiet } = useMemo(() => {
    if (!timeSeries?.length) return { cells: [], max: 0, avg: 0, peak: null, quiet: null };

    const maxVal = Math.max(...timeSeries.map(d => d.mentions), 1);
    const avgVal = Math.round(timeSeries.reduce((s, d) => s + d.mentions, 0) / timeSeries.length);
    
    // Find peak and quietest days
    let peakDay = timeSeries[0];
    let quietDay = timeSeries[0];
    for (const d of timeSeries) {
      if (d.mentions > peakDay.mentions) peakDay = d;
      if (d.mentions < quietDay.mentions) quietDay = d;
    }

    return {
      cells: timeSeries,
      max: maxVal,
      avg: avgVal,
      peak: peakDay,
      quiet: quietDay,
    };
  }, [timeSeries]);

  if (cells.length === 0) return null;

  // Arrange into weeks (columns) with days (rows) — GitHub style
  // Each column = 1 week, rows = days of week
  const numWeeks = Math.ceil(cells.length / 7);
  const weeks: (typeof cells[0] | null)[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    const week: (typeof cells[0] | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      week.push(idx < cells.length ? cells[idx] : null);
    }
    weeks.push(week);
  }

  const cellSize = 28;
  const cellGap = 3;

  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">📅</span>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">
            Mention Activity
          </p>
          {rangeLabel && (
            <span className="text-[9px] text-neutral-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
              {rangeLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[9px] text-neutral-500">
          {peak && (
            <span>
              Peak: <span className="text-violet-400 font-bold">{fmt(peak.mentions)}</span> ({peak.date})
            </span>
          )}
          <span>
            Avg: <span className="text-neutral-400 font-bold">{fmt(avg)}</span>/day
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col flex-shrink-0" style={{ gap: cellGap }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className="text-[8px] text-neutral-600 font-medium flex items-center justify-end pr-1.5"
              style={{ height: cellSize, lineHeight: `${cellSize}px` }}
            >
              {i % 2 === 0 ? label : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: cellGap }}>
            {week.map((cell, di) => {
              const globalIdx = wi * 7 + di;
              const isHovered = hoveredIdx === globalIdx;
              const isPeak = cell && peak && cell.mentions === peak.mentions && cell.date === peak.date;

              return (
                <div
                  key={di}
                  className="relative rounded-[4px] transition-all duration-150 cursor-default"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell ? intensityColor(cell.mentions, max) : "transparent",
                    transform: isHovered ? "scale(1.25)" : "scale(1)",
                    zIndex: isHovered ? 10 : 1,
                    boxShadow: isPeak
                      ? "0 0 8px rgba(124, 58, 237, 0.5)"
                      : isHovered
                        ? "0 0 6px rgba(139, 92, 246, 0.3)"
                        : "none",
                    border: isPeak ? "1px solid rgba(124, 58, 237, 0.5)" : "1px solid transparent",
                  }}
                  onMouseEnter={() => setHoveredIdx(globalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && cell && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                      <div className="bg-neutral-900/95 border border-white/10 rounded-lg px-3 py-2 text-center shadow-xl backdrop-blur whitespace-nowrap">
                        <p className="text-[10px] text-neutral-400">{cell.date}</p>
                        <p className="text-sm font-bold text-white tabular-nums">{fmt(cell.mentions)}</p>
                        <p className="text-[9px] text-neutral-500">mentions</p>
                        {/* Comparison to avg */}
                        {avg > 0 && (
                          <p className={`text-[9px] font-medium mt-0.5 ${
                            cell.mentions > avg * 1.2 ? "text-emerald-400" :
                            cell.mentions < avg * 0.8 ? "text-red-400" : "text-neutral-500"
                          }`}>
                            {cell.mentions > avg
                              ? `+${((cell.mentions / avg - 1) * 100).toFixed(0)}% vs avg`
                              : cell.mentions < avg
                                ? `${((cell.mentions / avg - 1) * 100).toFixed(0)}% vs avg`
                                : "≈ average"
                            }
                          </p>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="w-2 h-2 bg-neutral-900/95 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-1.5 text-[9px] text-neutral-500">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <div
              key={t}
              className="rounded-[3px]"
              style={{
                width: 12,
                height: 12,
                backgroundColor: intensityColor(t * max, max),
              }}
            />
          ))}
          <span>More</span>
        </div>
        {quiet && peak && quiet.date !== peak.date && (
          <span className="text-[9px] text-neutral-600">
            Quietest: {quiet.date} ({fmt(quiet.mentions)})
          </span>
        )}
      </div>
    </div>
  );
}
