"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function SocialChart({ data }: { data: { platform: string; followers: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="platform" tick={{ fill: "#a3a3a3", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(v: number) => fmt(v)}
          contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff" }}
        />
        <Bar dataKey="followers" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
