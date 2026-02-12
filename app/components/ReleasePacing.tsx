"use client";

import { useMemo, useState } from "react";
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

interface Track {
  name: string;
  releaseDate: string; // ISO date
  currentStreams: number;
  dailyRate: number; // streams per day from daily snapshot or computed
}

interface Props {
  tracks: Track[];
  reportDate: string; // current report date
}

const COLORS: Record<string, { color: string; label: string }> = {
  "0%": { color: "#22c55e", label: "0%" },
  "0% (Portuguese Version)": { color: "#06b6d4", label: "0% PT" },
  "KAWASAKI": { color: "#ec4899", label: "KAWASAKI" },
};

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">Day {label}</p>
      {payload
        .filter((p: any) => p.value != null)
        .sort((a: any, b: any) => b.value - a.value)
        .map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-neutral-400">{COLORS[p.dataKey]?.label || p.dataKey}:</span>
            <span className="font-bold text-white">{fmt(p.value)}</span>
          </div>
        ))}
    </div>
  );
}

export default function ReleasePacing({ tracks, reportDate }: Props) {
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  const { chartData, maxDay, trackInfo } = useMemo(() => {
    // Calculate days since release and daily velocity for each track
    const info = tracks.map((t) => {
      const age = daysBetween(t.releaseDate, reportDate);
      // Estimate cumulative growth curve using daily rate
      // We know the endpoint (currentStreams at day=age)
      // Use a slight S-curve: first day is ~60% of avg rate, ramps up
      const avgRate = age > 0 ? t.currentStreams / age : t.dailyRate;
      return { ...t, age, avgRate };
    });

    const maxD = Math.max(...info.map((t) => t.age), 1);

    // Build data points for each day from 0 to maxDay
    const points: Record<string, any>[] = [];
    for (let d = 0; d <= maxD; d++) {
      const point: Record<string, any> = { day: d };
      for (const t of info) {
        if (d > t.age) {
          // Track didn't exist this long ago — don't plot
          point[t.name] = undefined;
        } else if (d === 0) {
          point[t.name] = 0;
        } else if (d === t.age) {
          point[t.name] = t.currentStreams;
        } else {
          // Interpolate with slight S-curve (sigmoid ease)
          const ratio = d / t.age;
          // Smoothstep for natural growth curve
          const smooth = ratio * ratio * (3 - 2 * ratio);
          point[t.name] = Math.round(t.currentStreams * smooth);
        }
      }
      points.push(point);
    }

    return { chartData: points, maxDay: maxD, trackInfo: info };
  }, [tracks, reportDate]);

  if (tracks.length === 0) return null;

  // Find the fastest track (highest streams/day)
  const fastest = [...trackInfo].sort((a, b) => b.avgRate - a.avgRate)[0];

  return (
    <div className="space-y-4">
      {/* Track pacing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {trackInfo
          .sort((a, b) => b.avgRate - a.avgRate)
          .map((t, i) => {
            const c = COLORS[t.name];
            const isFastest = t.name === fastest.name;
            return (
              <div
                key={t.name}
                className={`bg-white/[0.02] rounded-xl p-3 border transition-all cursor-default ${
                  hoveredTrack === t.name
                    ? "border-white/20 bg-white/[0.04]"
                    : "border-white/[0.04]"
                }`}
                onMouseEnter={() => setHoveredTrack(t.name)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c?.color }} />
                    <span className="text-xs font-bold text-white">{c?.label || t.name}</span>
                  </div>
                  {isFastest && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      🏎️ Fastest
                    </span>
                  )}
                  {i > 0 && !isFastest && (
                    <span className="text-[9px] text-neutral-600">#{i + 1}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase">Day</p>
                    <p className="text-sm font-extrabold text-white">{t.age}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase">Total</p>
                    <p className="text-sm font-extrabold" style={{ color: c?.color }}>{fmt(t.currentStreams)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase">Avg/Day</p>
                    <p className="text-sm font-extrabold text-white">{fmt(Math.round(t.avgRate))}</p>
                  </div>
                </div>
                {/* Pace bar relative to fastest */}
                <div className="mt-2">
                  <div className="w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (t.avgRate / fastest.avgRate) * 100)}%`,
                        backgroundColor: c?.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Line chart */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false}
              label={{ value: "Days since release", position: "insideBottom", offset: -2, style: { fill: "#525252", fontSize: 9 } }}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmt}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Milestone reference lines */}
            <ReferenceLine y={1000000} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" label={{ value: "1M", position: "right", fill: "#525252", fontSize: 9 }} />
            <ReferenceLine y={5000000} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" label={{ value: "5M", position: "right", fill: "#525252", fontSize: 9 }} />
            {tracks.map((t) => {
              const c = COLORS[t.name];
              const isActive = hoveredTrack === null || hoveredTrack === t.name;
              return (
                <Line
                  key={t.name}
                  type="monotone"
                  dataKey={t.name}
                  stroke={c?.color || "#888"}
                  strokeWidth={isActive ? 2.5 : 1}
                  strokeOpacity={isActive ? 1 : 0.2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#000" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[9px] text-neutral-600 mt-2 text-center">
          Cumulative Spotify streams normalized from release date (Day 0). Steeper slope = faster accumulation.
        </p>
      </div>
    </div>
  );
}
