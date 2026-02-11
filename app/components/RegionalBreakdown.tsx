"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CountUpValue } from "./AnimatedSection";

interface Country {
  name: string;
  listeners: number;
  flag: string;
}

interface RegionDef {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  countries: string[];
}

const REGIONS: RegionDef[] = [
  {
    name: "LATAM Core",
    color: "#8B5CF6",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    emoji: "🟣",
    countries: ["Mexico", "Peru", "Chile", "Colombia", "Argentina"],
  },
  {
    name: "LATAM Growth",
    color: "#06B6D4",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    emoji: "🔵",
    countries: ["Brazil", "Guatemala", "Ecuador", "Bolivia", "Paraguay", "Dominican Republic", "Venezuela", "Honduras", "El Salvador", "Costa Rica", "Panama", "Uruguay"],
  },
  {
    name: "International",
    color: "#F59E0B",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    emoji: "🟡",
    countries: ["United States", "Spain", "Japan", "South Korea", "France", "Germany", "United Kingdom", "Italy", "Canada", "Australia", "Philippines", "Indonesia", "India", "Portugal"],
  },
];

function classifyCountries(countries: Country[]) {
  const result = REGIONS.map(region => {
    const matched = countries.filter(c => region.countries.includes(c.name));
    const unmatched = countries.filter(
      c => !REGIONS.some(r => r.countries.includes(c.name))
    );
    return {
      ...region,
      countries: matched,
      listeners: matched.reduce((s, c) => s + c.listeners, 0),
    };
  });

  // Add any unmatched countries to International
  const allMatched = new Set(REGIONS.flatMap(r => r.countries));
  const unmatched = countries.filter(c => !allMatched.has(c.name));
  result[2].countries = [...result[2].countries, ...unmatched];
  result[2].listeners += unmatched.reduce((s, c) => s + c.listeners, 0);

  return result;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function RegionalBreakdown({ data }: { data: Country[] }) {
  const regions = classifyCountries(data);
  const total = regions.reduce((s, r) => s + r.listeners, 0);
  const pieData = regions.filter(r => r.listeners > 0).map(r => ({
    name: r.name,
    value: r.listeners,
    color: r.color,
    pct: ((r.listeners / total) * 100).toFixed(1),
  }));

  // Find dominant region
  const dominant = regions.reduce((a, b) => (a.listeners > b.listeners ? a : b));
  const dominantPct = ((dominant.listeners / total) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">Strategic Regional Breakdown</p>
        <span className="text-[9px] bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-0.5 text-neutral-500">
          {dominantPct}% {dominant.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Donut */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full" style={{ height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={800}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,15,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                  formatter={(value: number, name: string) => [fmt(value) + " listeners", name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-1">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[9px] text-neutral-500">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region cards */}
        {regions.map(region => (
          <div
            key={region.name}
            className={`${region.bgColor} border ${region.borderColor} rounded-xl p-3 space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{region.emoji} {region.name}</span>
              <span className="text-[10px] font-semibold" style={{ color: region.color }}>
                {total > 0 ? ((region.listeners / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <p className="text-lg font-extrabold text-white">
              <CountUpValue value={region.listeners} />
            </p>
            <div className="space-y-1">
              {region.countries.slice(0, 4).map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">{c.flag} {c.name}</span>
                  <span className="text-[10px] font-semibold text-neutral-300">{fmt(c.listeners)}</span>
                </div>
              ))}
              {region.countries.length > 4 && (
                <span className="text-[9px] text-neutral-600">+{region.countries.length - 4} more</span>
              )}
              {region.countries.length === 0 && (
                <span className="text-[9px] text-neutral-600 italic">No data in this region</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
