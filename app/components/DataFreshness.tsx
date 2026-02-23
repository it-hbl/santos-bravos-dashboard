"use client";

import { useState, useEffect } from "react";

interface DataFreshnessProps {
  reportDate: string; // e.g. "February 9, 2026"
}

export default function DataFreshness({ reportDate }: DataFreshnessProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  let parsed: Date | null = null;
  try {
    const d = new Date(reportDate);
    if (!isNaN(d.getTime())) parsed = d;
  } catch {}
  if (!parsed) return null;

  const reportStr = parsed.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  // If report is from today or yesterday, it's current — don't show any banner
  if (reportStr === todayStr || reportStr === yesterdayStr) return null;

  // Calculate how old
  const diffDays = Math.floor((now.getTime() - parsed.getTime()) / 86400000);
  const isStale = diffDays > 3;

  const lastRunLabel = diffDays <= 2
    ? "Last run: Yesterday"
    : `Last run: ${parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const config = isStale
    ? { bg: "bg-red-500/8", border: "border-red-500/25", text: "text-red-400", icon: "⚠️", label: "Report may be outdated" }
    : { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-400", icon: "⚠️", label: "Report may be outdated" };

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl px-4 py-3 flex items-center justify-between gap-3 print:hidden`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base flex-shrink-0">{config.icon}</span>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${config.text}`}>{config.label}</p>
          <p className="text-[10px] text-neutral-500">
            {lastRunLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
