"use client";

import { useState, useEffect, useRef } from "react";

interface DatePickerProps {
  selectedDate: string;
  availableDates: string[];
  onDateChange: (date: string) => void;
  loading?: boolean;
}

export default function DatePicker({ selectedDate, availableDates, onDateChange, loading }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const formatOption = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 sm:px-3 py-1.5 hover:bg-white/[0.08] hover:border-violet-500/30 transition-all flex items-center gap-1.5"
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

      {open && (
        <div className="absolute right-0 top-full mt-1 z-[100] bg-neutral-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 py-1 min-w-[220px] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] font-semibold">Select Report Date</p>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => {
                  onDateChange(date);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                  date === selectedDate
                    ? "bg-violet-500/20 text-violet-300 font-bold"
                    : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span>{formatOption(date)}</span>
                {date === selectedDate && (
                  <span className="text-violet-400 text-[10px]">●</span>
                )}
              </button>
            ))}
          </div>
          {availableDates.length === 0 && (
            <p className="px-3 py-4 text-[10px] text-neutral-600 text-center">No reports available</p>
          )}
        </div>
      )}
    </div>
  );
}
