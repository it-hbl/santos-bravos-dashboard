"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface StreakData {
  streak: number;
  direction: "up" | "down" | "flat";
  metric: string;
}

/**
 * GrowthStreak — Fetches all available report dates from Supabase,
 * computes consecutive growth/decline streaks for Spotify listeners,
 * and renders a compact pill badge.
 */
export default function GrowthStreak() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStreak() {
      try {
        const { data: reports, error } = await supabase
          .from("daily_reports")
          .select("report_date, spotify_listeners")
          .order("report_date", { ascending: true });

        if (error || !reports || reports.length < 2) return;

        // Compute consecutive growth streak from the latest date backwards
        let streak = 0;
        let direction: "up" | "down" | "flat" = "flat";

        for (let i = reports.length - 1; i > 0; i--) {
          const curr = reports[i].spotify_listeners;
          const prev = reports[i - 1].spotify_listeners;
          if (curr == null || prev == null) break;

          if (i === reports.length - 1) {
            // Determine initial direction
            if (curr > prev) direction = "up";
            else if (curr < prev) direction = "down";
            else direction = "flat";
          }

          if (direction === "up" && curr > prev) {
            streak++;
          } else if (direction === "down" && curr < prev) {
            streak++;
          } else {
            break;
          }
        }

        if (!cancelled && streak >= 1) {
          setData({ streak, direction, metric: "Listeners" });
        }
      } catch {
        // Silently fail — this is a nice-to-have
      }
    }

    fetchStreak();
    return () => { cancelled = true; };
  }, []);

  if (!data || data.streak < 2) return null;

  const { streak, direction } = data;
  const emoji = direction === "up" ? "🔥" : direction === "down" ? "📉" : "➡️";
  const color = direction === "up"
    ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
    : direction === "down"
    ? "bg-red-500/10 border-red-500/20 text-red-400"
    : "bg-neutral-500/10 border-neutral-500/20 text-neutral-400";
  const label = direction === "up" ? "growth streak" : direction === "down" ? "decline streak" : "flat";

  return (
    <span className={`text-[10px] border rounded-full px-3 py-1 font-medium ${color}`}>
      {emoji} {streak}-report {label}
    </span>
  );
}
