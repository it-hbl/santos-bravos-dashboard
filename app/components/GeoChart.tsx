"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function GeoChart({ data, color }: { data: { name: string; listeners: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString()}
          contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff" }}
        />
        <Bar dataKey="listeners" fill={color} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
