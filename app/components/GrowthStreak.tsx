"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface StreakData {
  streak: number;
  direction: "up" | "down" | "flat";
  metric: string;
  emoji: string;
}

/**
 * GrowthStreak — Fetches all available report dates from Supabase,
 * computes consecutive growth/decline streaks across multiple metrics
 * (Spotify listeners, cross-platform streams, SNS footprint, YouTube subs,
 * Spotify followers, Spotify popularity), and renders the longest active
 * streak as a compact pill badge.
 */
export default function GrowthStreak() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStreak() {
      try {
        const { data: reports, error } = await supabase
          .from("daily_reports")
          .select("report_date, spotify_listeners, cross_platform_streams, total_sns_footprint, youtube_subscribers, spotify_followers, spotify_popularity")
          .order("report_date", { ascending: true });

        if (error || !reports || reports.length < 2) return;

        const metricConfigs: { key: string; label: string; emoji: string }[] = [
          { key: "spotify_listeners", label: "Listeners", emoji: "🟢" },
          { key: "cross_platform_streams", label: "Streams", emoji: "🎵" },
          { key: "total_sns_footprint", label: "SNS", emoji: "📱" },
          { key: "youtube_subscribers", label: "YT Subs", emoji: "▶️" },
          { key: "spotify_followers", label: "Followers", emoji: "💚" },
          { key: "spotify_popularity", label: "Popularity", emoji: "📊" },
        ];

        let bestStreak: StreakData | null = null;

        for (const cfg of metricConfigs) {
          let streak = 0;
          let direction: "up" | "down" | "flat" = "flat";

          for (let i = reports.length - 1; i > 0; i--) {
            const curr = (reports[i] as any)[cfg.key];
            const prev = (reports[i - 1] as any)[cfg.key];
            if (curr == null || prev == null) break;

            if (i === reports.length - 1) {
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

          if (streak >= 1 && (!bestStreak || streak > bestStreak.streak || (streak === bestStreak.streak && direction === "up"))) {
            bestStreak = { streak, direction, metric: cfg.label, emoji: cfg.emoji };
          }
        }

        if (!cancelled && bestStreak) {
          setData(bestStreak);
        }
      } catch {
        // Silently fail — this is a nice-to-have
      }
    }

    fetchStreak();
    return () => { cancelled = true; };
  }, []);

  if (!data || data.streak < 2) return null;

  const { streak, direction, metric, emoji: metricEmoji } = data;
  const fireEmoji = direction === "up" ? "🔥" : direction === "down" ? "📉" : "➡️";
  const color = direction === "up"
    ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
    : direction === "down"
    ? "bg-red-500/10 border-red-500/20 text-red-400"
    : "bg-neutral-500/10 border-neutral-500/20 text-neutral-400";
  const label = direction === "up" ? "growth" : direction === "down" ? "decline" : "flat";

  return (
    <span className={`text-[10px] border rounded-full px-3 py-1 font-medium ${color}`}>
      {fireEmoji} {metricEmoji} {metric}: {streak}-report {label} streak
    </span>
  );
}
