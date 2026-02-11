"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { supabase } from "../lib/supabase";

interface DataPoint {
  date: string;
  label: string;
  listeners: number;
  streams: number;
  sns: number;
  followers: number;
}

const METRICS = [
  { key: "listeners", label: "Spotify Listeners", color: "#22c55e", format: formatK },
  { key: "streams", label: "Cross-Platform Streams", color: "#8b5cf6", format: formatM },
  { key: "sns", label: "SNS Footprint", color: "#06b6d4", format: formatK },
  { key: "followers", label: "Spotify Followers", color: "#f59e0b", format: formatK },
] as const;

function formatK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function formatM(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => {
        const metric = METRICS.find((m) => m.key === p.dataKey);
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-neutral-400">{metric?.label}:</span>
            <span className="font-bold text-white">
              {metric?.format(p.value) ?? p.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function HistoricalTrends() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(
    new Set(["listeners", "streams", "sns", "followers"])
  );

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: reports, error } = await supabase
          .from("daily_reports")
          .select(
            "report_date, spotify_monthly_listeners, total_cross_platform_streams, total_sns_footprint, spotify_followers"
          )
          .order("report_date", { ascending: true });

        if (error || !reports || reports.length === 0) {
          setLoading(false);
          return;
        }

        const points: DataPoint[] = reports.map((r: any) => {
          const d = new Date(r.report_date + "T12:00:00");
          return {
            date: r.report_date,
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            listeners: r.spotify_monthly_listeners || 0,
            streams: r.total_cross_platform_streams || 0,
            sns: r.total_sns_footprint || 0,
            followers: r.spotify_followers || 0,
          };
        });

        setData(points);
      } catch (err) {
        console.error("Failed to fetch historical data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Don't render if less than 2 data points
  if (!loading && data.length < 2) return null;

  if (loading) {
    return (
      <div className="bg-white/[0.02] rounded-xl p-6 border border-white/[0.04] animate-pulse">
        <div className="h-4 w-40 bg-white/[0.05] rounded mb-4" />
        <div className="h-[250px] bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  // Calculate growth from first to last data point
  const first = data[0];
  const last = data[data.length - 1];
  const growthPct = first.listeners > 0
    ? (((last.listeners - first.listeners) / first.listeners) * 100).toFixed(1)
    : "—";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            📈 Historical Growth
            <span className="text-[10px] text-neutral-500 font-normal">
              {data.length} report{data.length !== 1 ? "s" : ""} · {first.label} → {last.label}
            </span>
          </h3>
          {growthPct !== "—" && (
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Listener growth over period:{" "}
              <span className={parseFloat(growthPct) >= 0 ? "text-emerald-400" : "text-red-400"}>
                {parseFloat(growthPct) >= 0 ? "+" : ""}{growthPct}%
              </span>
            </p>
          )}
        </div>

        {/* Metric toggles */}
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
                activeMetrics.has(m.key)
                  ? "border-white/20 text-white"
                  : "border-white/[0.05] text-neutral-600 hover:text-neutral-400"
              }`}
              style={
                activeMetrics.has(m.key)
                  ? { backgroundColor: m.color + "15", borderColor: m.color + "40" }
                  : {}
              }
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: m.color, opacity: activeMetrics.has(m.key) ? 1 : 0.3 }}
              />
              {m.label.replace("Cross-Platform ", "").replace("Spotify ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatK(v)}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            {METRICS.map((m) =>
              activeMetrics.has(m.key) ? (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={{ fill: m.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#000" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
