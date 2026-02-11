"use client";

import { useState, useEffect } from "react";

interface DataFreshnessProps {
  reportDate: string; // e.g. "February 9, 2026"
}

function parseReportDate(dateStr: string): Date | null {
  try {
    // Handle "February 9, 2026" format
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    return null;
  } catch {
    return null;
  }
}

function getRelativeTime(diffMs: number): string {
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

type Severity = "fresh" | "aging" | "stale" | "critical";

function getSeverity(hoursOld: number): Severity {
  if (hoursOld < 12) return "fresh";
  if (hoursOld < 24) return "aging";
  if (hoursOld < 72) return "stale";
  return "critical";
}

const severityConfig: Record<Severity, { bg: string; border: string; text: string; icon: string; label: string }> = {
  fresh: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400", icon: "✅", label: "Data is current" },
  aging: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-400", icon: "⏳", label: "Data is aging" },
  stale: { bg: "bg-orange-500/8", border: "border-orange-500/25", text: "text-orange-400", icon: "⚠️", label: "Data is stale" },
  critical: { bg: "bg-red-500/8", border: "border-red-500/25", text: "text-red-400", icon: "🚨", label: "Data is outdated" },
};

export default function DataFreshness({ reportDate }: DataFreshnessProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const parsed = parseReportDate(reportDate);
  if (!parsed) return null;

  // Set report date to end of day (23:59) since report covers the full day
  const reportEndOfDay = new Date(parsed);
  reportEndOfDay.setHours(23, 59, 59, 999);

  const diffMs = now.getTime() - reportEndOfDay.getTime();
  if (diffMs < 0) return null; // report date is in the future

  const hoursOld = diffMs / 3600000;
  const severity = getSeverity(hoursOld);

  // Don't show banner when data is fresh
  if (severity === "fresh") return null;

  const config = severityConfig[severity];
  const relativeTime = getRelativeTime(diffMs);

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl px-4 py-3 flex items-center justify-between gap-3 print:hidden`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base flex-shrink-0">{config.icon}</span>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${config.text}`}>{config.label}</p>
          <p className="text-[10px] text-neutral-500">
            Report data from <span className="text-neutral-400 font-medium">{reportDate}</span> — last updated{" "}
            <span className={`font-semibold ${config.text}`}>{relativeTime}</span>
          </p>
        </div>
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider ${config.text} flex-shrink-0 px-2 py-1 rounded-md ${config.bg}`}>
        {Math.floor(hoursOld)}h old
      </div>
    </div>
  );
}
