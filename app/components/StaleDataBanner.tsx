"use client";

import { useState, useEffect } from "react";

interface StaleDataBannerProps {
  reportDate: string;
  latestDate: string | null;
  onLoadLatest: () => void;
}

/**
 * Full-width dismissible warning banner when the displayed report is stale.
 * - 3–5 days old → amber warning
 * - 5+ days old → red warning
 * - Includes a button to jump to the latest available date
 * - Auto-updates the "X days ago" label every minute
 */
export default function StaleDataBanner({ reportDate, latestDate, onLoadLatest }: StaleDataBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [daysOld, setDaysOld] = useState(0);

  useEffect(() => {
    setDismissed(false); // reset on date change
  }, [reportDate]);

  useEffect(() => {
    function compute() {
      try {
        const d = new Date(reportDate + "T12:00:00");
        if (isNaN(d.getTime())) return;
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        setDaysOld(diff);
      } catch {}
    }
    compute();
    const iv = setInterval(compute, 60000);
    return () => clearInterval(iv);
  }, [reportDate]);

  if (dismissed || daysOld < 3) return null;

  const isViewingOldDate = latestDate && latestDate !== reportDate;
  const isSevere = daysOld >= 5;

  const bgColor = isSevere
    ? "bg-red-500/10 border-red-500/20"
    : "bg-amber-500/10 border-amber-500/20";
  const textColor = isSevere ? "text-red-400" : "text-amber-400";
  const iconColor = isSevere ? "text-red-400" : "text-amber-400";
  const btnColor = isSevere
    ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
    : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30";

  return (
    <div className={`${bgColor} border rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300`}>
      <span className={`text-lg ${iconColor} flex-shrink-0`}>{isSevere ? "🚨" : "⚠️"}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${textColor}`}>
          {isSevere ? "Data Significantly Outdated" : "Viewing Older Data"}
        </p>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          This report is from <span className={`font-bold ${textColor}`}>{reportDate}</span> — <span className="font-bold">{daysOld} days ago</span>.
          {isViewingOldDate && (
            <> A newer report (<span className="font-bold text-neutral-400">{latestDate}</span>) is available.</>
          )}
          {!isViewingOldDate && " No newer reports are available in the database."}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isViewingOldDate && (
          <button
            onClick={onLoadLatest}
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${btnColor}`}
          >
            Load Latest →
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-neutral-600 hover:text-neutral-400 transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
