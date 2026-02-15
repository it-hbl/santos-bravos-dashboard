"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface SparklineData {
  listeners: number[];
  streams: number[];
  sns: number[];
  followers: number[];
  popularity: number[];
  spl: number[];
}

const EMPTY: SparklineData = {
  listeners: [],
  streams: [],
  sns: [],
  followers: [],
  popularity: [],
  spl: [],
};

/**
 * Fetches historical metric values from Supabase for sparkline rendering.
 * Returns arrays of numbers (ascending date order) for each key metric.
 * Uses up to the last 10 report dates for compact sparklines.
 */
export default function useHistoricalSparklines(): SparklineData {
  const [data, setData] = useState<SparklineData>(EMPTY);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: reports, error } = await supabase
          .from("daily_reports")
          .select("report_date, spotify_monthly_listeners, total_cross_platform_streams, total_sns_footprint, spotify_followers, spotify_popularity, spl")
          .order("report_date", { ascending: true })
          .limit(20);

        if (error || !reports || reports.length < 2) return;

        // Take the last 10 data points for compact sparklines
        const recent = reports.slice(-10);

        setData({
          listeners: recent.map((r: any) => r.spotify_monthly_listeners || 0),
          streams: recent.map((r: any) => r.total_cross_platform_streams || 0),
          sns: recent.map((r: any) => r.total_sns_footprint || 0),
          followers: recent.map((r: any) => r.spotify_followers || 0),
          popularity: recent.map((r: any) => r.spotify_popularity || 0),
          spl: recent.map((r: any) => r.spl || 0),
        });
      } catch (err) {
        console.error("Failed to fetch sparkline history:", err);
      }
    }
    fetch();
  }, []);

  return data;
}
