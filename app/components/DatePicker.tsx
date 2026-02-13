"use client";

import { useState, useEffect, useRef, useMemo } from "react";

interface DatePickerProps {
  selectedDate: string;
  availableDates: string[];
  onDateChange: (date: string) => void;
  loading?: boolean;
}

/** Build a 6-row calendar grid for a given month (Sun-Sat) */
function buildCalendarGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows: (Date | null)[][] = [];
  let day = 1 - startDay;
  for (let r = 0; r < 6; r++) {
    const row: (Date | null)[] = [];
    for (let c = 0; c < 7; c++, day++) {
      if (day >= 1 && day <= daysInMonth) {
        row.push(new Date(year, month, day));
      } else {
        row.push(null);
      }
    }
    // skip empty trailing rows
    if (row.every(d => d === null)) break;
    rows.push(row);
  }
  return rows;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function DatePicker({ selectedDate, availableDates, onDateChange, loading }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calendar month navigation state — start on the selected date's month
  const selDate = useMemo(() => new Date(selectedDate + "T12:00:00"), [selectedDate]);
  const [calYear, setCalYear] = useState(selDate.getFullYear());
  const [calMonth, setCalMonth] = useState(selDate.getMonth());

  // Reset calendar month when selected date changes
  useEffect(() => {
    const d = new Date(selectedDate + "T12:00:00");
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  }, [selectedDate]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  const sortedDates = useMemo(() => [...availableDates].sort(), [availableDates]);
  const availableSet = useMemo(() => new Set(sortedDates), [sortedDates]);
  const currentIdx = sortedDates.indexOf(selectedDate);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < sortedDates.length - 1;

  const goPrev = () => {
    if (hasPrev && !loading) onDateChange(sortedDates[currentIdx - 1]);
  };
  const goNext = () => {
    if (hasNext && !loading) onDateChange(sortedDates[currentIdx + 1]);
  };

  // Calendar month nav
  const goMonthPrev = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const goMonthNext = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const grid = useMemo(() => buildCalendarGrid(calYear, calMonth), [calYear, calMonth]);

  // Keyboard arrow navigation for date switching
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "[" || (e.key === "ArrowLeft" && e.altKey)) { e.preventDefault(); goPrev(); }
      if (e.key === "]" || (e.key === "ArrowRight" && e.altKey)) { e.preventDefault(); goNext(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  const today = useMemo(() => toISO(new Date()), []);

  return (
    <div ref={ref} className="relative flex items-center gap-0.5">
      {/* Prev date arrow */}
      {sortedDates.length > 1 && (
        <button
          onClick={goPrev}
          disabled={!hasPrev || loading}
          className="bg-white/[0.04] border border-white/[0.06] rounded-l-lg rounded-r-none px-1.5 py-1.5 hover:bg-white/[0.08] hover:border-violet-500/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed border-r-0"
          title="Previous report date ( [ )"
        >
          <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`bg-white/[0.04] border border-white/[0.06] ${sortedDates.length > 1 ? "rounded-none" : "rounded-lg"} px-2 sm:px-3 py-1.5 hover:bg-white/[0.08] hover:border-violet-500/30 transition-all flex items-center gap-1.5`}
      >
        {loading && (
          <svg className="animate-spin h-3 w-3 text-violet-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span className="text-[10px] text-white font-bold uppercase tracking-wider">
          📅 <span className="hidden sm:inline">Report: </span>{formatDisplay(selectedDate)}
        </span>
        <svg className={`w-3 h-3 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Next date arrow */}
      {sortedDates.length > 1 && (
        <button
          onClick={goNext}
          disabled={!hasNext || loading}
          className="bg-white/[0.04] border border-white/[0.06] rounded-r-lg rounded-l-none px-1.5 py-1.5 hover:bg-white/[0.08] hover:border-violet-500/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed border-l-0"
          title="Next report date ( ] )"
        >
          <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 z-[100] bg-neutral-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 min-w-[280px] overflow-hidden">
          {/* Month nav header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
            <button
              onClick={goMonthPrev}
              className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-bold text-white tracking-wide">
              {MONTHS[calMonth]} {calYear}
            </span>
            <button
              onClick={goMonthNext}
              className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[9px] text-neutral-600 font-semibold uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="px-2 pb-2">
            {grid.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7">
                {row.map((cell, ci) => {
                  if (!cell) return <div key={ci} className="p-0.5"><div className="w-8 h-8" /></div>;
                  const iso = toISO(cell);
                  const isAvailable = availableSet.has(iso);
                  const isSelected = iso === selectedDate;
                  const isToday = iso === today;

                  return (
                    <div key={ci} className="p-0.5">
                      <button
                        disabled={!isAvailable || loading}
                        onClick={() => {
                          if (isAvailable) {
                            onDateChange(iso);
                            setOpen(false);
                          }
                        }}
                        className={`
                          w-8 h-8 rounded-lg text-[11px] font-medium transition-all relative flex items-center justify-center
                          ${isSelected
                            ? "bg-violet-500/30 text-violet-200 font-bold ring-1 ring-violet-500/50"
                            : isAvailable
                              ? "text-white hover:bg-white/[0.08] hover:text-violet-300 cursor-pointer"
                              : "text-neutral-700 cursor-default"
                          }
                          ${isToday && !isSelected ? "ring-1 ring-white/20" : ""}
                        `}
                        title={isAvailable ? `View report: ${iso}` : isToday ? "Today (no report)" : undefined}
                      >
                        {cell.getDate()}
                        {/* Dot indicator for available dates */}
                        {isAvailable && !isSelected && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400/70" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer: report count + legend */}
          <div className="border-t border-white/[0.06] px-3 py-2 flex items-center justify-between">
            <span className="text-[9px] text-neutral-500">
              {sortedDates.length} report{sortedDates.length !== 1 ? "s" : ""} available
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] text-neutral-600">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70 inline-block" /> has data
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
