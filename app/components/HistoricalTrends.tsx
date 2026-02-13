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
  ReferenceLine,
} from "recharts";
import { supabase } from "../lib/supabase";

interface DataPoint {
  date: string;
  label: string;
  listeners: number;
  streams: number;
  sns: number;
  followers: number;
  mentions: number;
  netSentiment: number;
}

const METRICS = [
  { key: "listeners", label: "Spotify Listeners", color: "#22c55e", format: formatK, axis: "left" as const },
  { key: "streams", label: "Cross-Platform Streams", color: "#8b5cf6", format: formatM, axis: "right" as const },
  { key: "sns", label: "SNS Footprint", color: "#06b6d4", format: formatK, axis: "left" as const },
  { key: "followers", label: "Spotify Followers", color: "#f59e0b", format: formatK, axis: "left" as const },
  { key: "mentions", label: "PR Mentions", color: "#a78bfa", format: formatK, axis: "left" as const },
  { key: "netSentiment", label: "Net Sentiment", color: "#f472b6", format: formatSent, axis: "left" as const },
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

function formatSent(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(0);
}

function CustomTooltip({ active, payload, label, normalized, rawData }: any) {
  if (!active || !payload?.length) return null;
  // Find matching raw data point for showing absolute values alongside %
  const rawPoint = rawData?.find((d: DataPoint) => d.label === label);
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => {
        const metric = METRICS.find((m) => m.key === p.dataKey);
        const rawVal = rawPoint ? rawPoint[p.dataKey as keyof DataPoint] : null;
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-neutral-400">{metric?.label}:</span>
            {normalized ? (
              <span className="font-bold text-white">
                <span className={p.value >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {p.value >= 0 ? "+" : ""}{p.value.toFixed(2)}%
                </span>
                {rawVal != null && (
                  <span className="text-neutral-500 font-normal ml-1.5">
                    ({metric?.format(rawVal as number)})
                  </span>
                )}
              </span>
            ) : (
              <span className="font-bold text-white">
                {metric?.format(p.value) ?? p.value}
              </span>
            )}
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
    new Set(["listeners", "streams", "sns", "followers", "mentions"])
  );
  const [normalizedView, setNormalizedView] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const [
          { data: reports, error },
          { data: prData },
          { data: sentData },
        ] = await Promise.all([
          supabase
            .from("daily_reports")
            .select("report_date, spotify_monthly_listeners, total_cross_platform_streams, total_sns_footprint, spotify_followers")
            .order("report_date", { ascending: true }),
          supabase
            .from("pr_media")
            .select("report_date, total_mentions")
            .order("report_date", { ascending: true }),
          supabase
            .from("fan_sentiment")
            .select("report_date, positive_pct, negative_pct")
            .order("report_date", { ascending: true }),
        ]);

        if (error || !reports || reports.length === 0) {
          setLoading(false);
          return;
        }

        // Build lookup maps for PR and sentiment by date
        const prByDate: Record<string, number> = {};
        (prData || []).forEach((r: any) => {
          prByDate[r.report_date] = r.total_mentions || 0;
        });
        const sentByDate: Record<string, number> = {};
        (sentData || []).forEach((r: any) => {
          sentByDate[r.report_date] = (r.positive_pct || 0) - (r.negative_pct || 0);
        });

        const points: DataPoint[] = reports.map((r: any) => {
          const d = new Date(r.report_date + "T12:00:00");
          return {
            date: r.report_date,
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            listeners: r.spotify_monthly_listeners || 0,
            streams: r.total_cross_platform_streams || 0,
            sns: r.total_sns_footprint || 0,
            followers: r.spotify_followers || 0,
            mentions: prByDate[r.report_date] || 0,
            netSentiment: sentByDate[r.report_date] || 0,
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

  // Compute normalized (% change from baseline) data
  const normalizedData = data.map((d) => ({
    ...d,
    label: d.label,
    listeners: first.listeners > 0 ? ((d.listeners - first.listeners) / first.listeners) * 100 : 0,
    streams: first.streams > 0 ? ((d.streams - first.streams) / first.streams) * 100 : 0,
    sns: first.sns > 0 ? ((d.sns - first.sns) / first.sns) * 100 : 0,
    followers: first.followers > 0 ? ((d.followers - first.followers) / first.followers) * 100 : 0,
    mentions: first.mentions > 0 ? ((d.mentions - first.mentions) / first.mentions) * 100 : 0,
    netSentiment: first.netSentiment !== 0 ? ((d.netSentiment - first.netSentiment) / Math.abs(first.netSentiment)) * 100 : 0,
  }));

  const chartData = normalizedView ? normalizedData : data;

  // Per-metric growth summary
  const growthSummary = METRICS.filter(m => activeMetrics.has(m.key)).map(m => {
    const firstVal = first[m.key as keyof DataPoint] as number;
    const lastVal = last[m.key as keyof DataPoint] as number;
    const pct = firstVal > 0 ? ((lastVal - firstVal) / firstVal * 100).toFixed(1) : null;
    return { ...m, pct, positive: pct !== null && parseFloat(pct) >= 0 };
  });

  // Check if we need dual axes (streams scale >> others)
  const hasRightAxis = activeMetrics.has("streams") && !normalizedView;
  const hasLeftAxis = Array.from(activeMetrics).some(k => k !== "streams") || normalizedView;

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
          {/* Per-metric growth badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            {growthSummary.map(g => g.pct !== null && (
              <span key={g.key} className="text-[9px] flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                <span className="text-neutral-500">{g.label.replace("Cross-Platform ", "").replace("Spotify ", "")}:</span>
                <span className={g.positive ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {g.positive ? "+" : ""}{g.pct}%
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Normalized toggle */}
          <button
            onClick={() => setNormalizedView(v => !v)}
            className={`text-[9px] px-2 py-0.5 rounded-full border transition-all font-medium ${
              normalizedView
                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                : "border-white/[0.06] text-neutral-500 hover:text-neutral-400"
            }`}
            title="Normalize all metrics to % change from first data point — makes different scales directly comparable"
          >
            {normalizedView ? "📊 % Change View" : "📊 % Change"}
          </button>
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
      </div>

      {/* Chart */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: hasRightAxis ? 10 : 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false}
            />
            {/* Left Y-axis: listeners/sns/followers (or all if normalized) */}
            {hasLeftAxis && (
              <YAxis
                yAxisId="left"
                tick={{ fill: "#737373", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => normalizedView ? `${v >= 0 ? "+" : ""}${v.toFixed(1)}%` : formatK(v)}
                width={normalizedView ? 55 : 50}
              />
            )}
            {/* Right Y-axis: streams (only in absolute view) */}
            {hasRightAxis && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#8b5cf680", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatM(v)}
                width={50}
              />
            )}
            {/* Zero reference line in normalized view */}
            {normalizedView && (
              <ReferenceLine yAxisId="left" y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            )}
            <Tooltip content={<CustomTooltip normalized={normalizedView} rawData={data} />} />
            {METRICS.map((m) =>
              activeMetrics.has(m.key) ? (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  yAxisId={normalizedView ? "left" : (m.axis === "right" && hasRightAxis ? "right" : "left")}
                  stroke={m.color}
                  strokeWidth={2.5}
                  dot={{ fill: m.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#000" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
        {/* Axis legend */}
        {hasRightAxis && !normalizedView && (
          <div className="flex justify-between px-2 mt-1">
            <span className="text-[8px] text-neutral-600">← Listeners · SNS · Followers</span>
            <span className="text-[8px] text-violet-500/50">Streams →</span>
          </div>
        )}
        {normalizedView && (
          <p className="text-[8px] text-neutral-600 text-center mt-1">
            All metrics normalized to % change from {first.label} baseline — compare growth rates directly
          </p>
        )}
      </div>
    </div>
  );
}
