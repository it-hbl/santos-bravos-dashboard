"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "../lib/supabase";

interface DataPoint {
  date: string;
  label: string;
  [member: string]: number | string;
}

interface MemberMeta {
  name: string;
  label: string;
  color: string;
  emoji: string;
}

const MEMBERS: MemberMeta[] = [
  { name: "Kenneth Lavíll", label: "Kenneth", color: "#8b5cf6", emoji: "💜" },
  { name: "Kauê Penna", label: "Kauê", color: "#06b6d4", emoji: "💎" },
  { name: "Alejandro Aramburu", label: "Alejandro", color: "#ec4899", emoji: "🩷" },
  { name: "Drew Venegas", label: "Drew", color: "#f59e0b", emoji: "🔥" },
  { name: "Gabi Bermúdez", label: "Gabi", color: "#10b981", emoji: "💚" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-neutral-400 font-medium mb-2">{label}</p>
      {payload
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .map((p: any) => {
          const meta = MEMBERS.find((m) => m.name === p.dataKey);
          return (
            <div key={p.dataKey} className="flex items-center gap-2 text-xs py-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-neutral-400">{meta?.emoji} {meta?.label || p.dataKey}:</span>
              <span className="font-bold text-white">{fmt(p.value)}</span>
              <span className="text-neutral-500 text-[10px]">
                ({((p.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          );
        })}
      <div className="border-t border-white/10 mt-1.5 pt-1.5 flex justify-between text-xs">
        <span className="text-neutral-400">Total</span>
        <span className="font-bold text-white">{fmt(total)}</span>
      </div>
    </div>
  );
}

export default function MemberHistory() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(MEMBERS.map((m) => [m.name, true]))
  );

  useEffect(() => {
    async function load() {
      try {
        const { data: allDates } = await supabase
          .from("daily_reports")
          .select("report_date")
          .order("report_date", { ascending: true });

        if (!allDates || allDates.length < 2) {
          setLoading(false);
          return;
        }

        const dates = allDates.map((d: any) => d.report_date);

        const { data: members } = await supabase
          .from("member_followers")
          .select("report_date, member_name, followers")
          .in("report_date", dates)
          .order("report_date", { ascending: true });

        if (!members || members.length === 0) {
          setLoading(false);
          return;
        }

        // Group by date
        const byDate: Record<string, Record<string, number>> = {};
        for (const row of members) {
          if (!byDate[row.report_date]) byDate[row.report_date] = {};
          byDate[row.report_date][row.member_name] = row.followers;
        }

        const points: DataPoint[] = dates
          .filter((d: string) => byDate[d])
          .map((d: string) => {
            const dt = new Date(d + "T12:00:00");
            return {
              date: d,
              label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              ...byDate[d],
            };
          });

        setData(points);
      } catch (e) {
        console.error("MemberHistory fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-48 bg-white/5 rounded" />
        <div className="h-[220px] bg-white/[0.02] rounded-xl" />
      </div>
    );
  }

  if (data.length < 2) return null;

  const toggleMember = (key: string) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const first = data[0];
  const last = data[data.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">
            👥 Member Follower Growth Over Time
          </h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Per-member Instagram followers across all report dates
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MEMBERS.map((m) => {
            const isActive = active[m.name];
            const firstVal = (first[m.name] as number) || 0;
            const lastVal = (last[m.name] as number) || 0;
            const pctChange = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;
            return (
              <button
                key={m.name}
                onClick={() => toggleMember(m.name)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "bg-white/[0.03] text-neutral-500 hover:bg-white/[0.06] border-transparent"
                }`}
                style={isActive ? { borderColor: m.color } : undefined}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? m.color : "#525252" }}
                />
                {m.emoji} {m.label}
                {isActive && pctChange !== 0 && (
                  <span className={pctChange > 0 ? "text-emerald-400" : "text-red-400"}>
                    {pctChange > 0 ? "↑" : "↓"}
                    {Math.abs(pctChange).toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            {MEMBERS.map((m) => (
              <linearGradient key={m.name} id={`member-grad-${m.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#737373", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: "#737373", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          {MEMBERS.map((m) =>
            active[m.name] ? (
              <Area
                key={m.name}
                type="monotone"
                dataKey={m.name}
                stroke={m.color}
                strokeWidth={2}
                fill={`url(#member-grad-${m.label})`}
                dot={{ r: 3, fill: m.color, stroke: "#0a0a0a", strokeWidth: 2 }}
                activeDot={{ r: 5, stroke: m.color, strokeWidth: 2, fill: "#0a0a0a" }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            ) : null
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
