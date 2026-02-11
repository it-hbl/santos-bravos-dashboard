"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useState } from "react";

interface Track {
  name: string;
  streams: number;
  listeners: number;
  saves: number;
}

const METRICS = [
  { key: "streams" as const, label: "Streams", color: "#1DB954" },
  { key: "listeners" as const, label: "Listeners", color: "#8B5CF6" },
  { key: "saves" as const, label: "Saves", color: "#F59E0B" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

export default function DailyComparisonChart({ tracks }: { tracks: Track[] }) {
  const [activeMetric, setActiveMetric] = useState<"streams" | "listeners" | "saves">("streams");

  const metricInfo = METRICS.find((m) => m.key === activeMetric)!;
  const data = tracks.map((t) => ({
    name: t.name.length > 12 ? t.name.slice(0, 12) + "…" : t.name,
    fullName: t.name,
    value: t[activeMetric],
  }));

  const barColors = ["#1DB954", "#8B5CF6", "#EC4899"];

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">
          Track Comparison — Daily ({metricInfo.label})
        </p>
        <div className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
                activeMetric === m.key
                  ? "text-white bg-white/[0.08] border border-white/[0.12]"
                  : "text-neutral-600 hover:text-neutral-400 border border-transparent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => fmt(v)}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
              contentStyle={{
                background: "rgba(15,15,20,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "10px 14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#fff", fontWeight: 700, fontSize: 12, marginBottom: 4 }}
              formatter={(value: number) => [fmt(value), metricInfo.label]}
              labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName ?? _label}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
              {data.map((_, i) => (
                <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
