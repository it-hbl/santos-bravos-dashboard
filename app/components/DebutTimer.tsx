"use client";

import { useState, useEffect } from "react";

const DEBUT_DATE = new Date("2026-01-24T12:00:00");

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function DebutTimer() {
  const [elapsed, setElapsed] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function update() {
      const diff = Date.now() - DEBUT_DATE.getTime();
      if (diff < 0) return;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed({ days, hours, minutes, seconds });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!elapsed) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-neutral-600 uppercase tracking-wider">Since debut</span>
      <div className="flex items-center gap-1 font-mono">
        <span className="text-xs font-black text-violet-400 tabular-nums">
          {elapsed.days}
        </span>
        <span className="text-[8px] text-neutral-600">d</span>
        <span className="text-xs font-bold text-neutral-400 tabular-nums">
          {pad(elapsed.hours)}
        </span>
        <span className="text-[8px] text-neutral-600">:</span>
        <span className="text-xs font-bold text-neutral-400 tabular-nums">
          {pad(elapsed.minutes)}
        </span>
        <span className="text-[8px] text-neutral-600">:</span>
        <span className="text-xs font-bold text-neutral-400 tabular-nums animate-pulse">
          {pad(elapsed.seconds)}
        </span>
      </div>
    </div>
  );
}
