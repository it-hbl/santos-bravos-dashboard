"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b]/95 backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-[11px] text-neutral-400">{p.name}:</span>
          <span className="text-[11px] font-bold text-white tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-white/[0.06] mt-2 pt-1.5">
        <span className="text-[10px] text-neutral-500">Total: </span>
        <span className="text-[11px] font-bold text-violet-400 tabular-nums">
          {fmt(payload.reduce((s: number, p: any) => s + p.value, 0))}
        </span>
      </div>
    </div>
  );
};

interface Track {
  name: string;
  tiktokCreates: number;
  igCreates: number;
  views: number;
}

export default function ViralityChart({ tracks }: { tracks: Track[] }) {
  const data = tracks.map(t => ({
    name: t.name,
    TikTok: t.tiktokCreates,
    Instagram: t.igCreates,
    total: t.tiktokCreates + t.igCreates,
  }));

  const totalCreates = tracks.reduce((s, t) => s + t.tiktokCreates + t.igCreates, 0);
  const totalTT = tracks.reduce((s, t) => s + t.tiktokCreates, 0);
  const ttPct = totalCreates ? Math.round((totalTT / totalCreates) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Mini stats */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F2EA]" />
          <span className="text-[10px] text-neutral-500">
            TikTok: <span className="text-neutral-300 font-semibold">{fmt(totalTT)}</span>
            <span className="text-neutral-600 ml-1">({ttPct}%)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E1306C]" />
          <span className="text-[10px] text-neutral-500">
            Instagram: <span className="text-neutral-300 font-semibold">{fmt(totalCreates - totalTT)}</span>
            <span className="text-neutral-600 ml-1">({100 - ttPct}%)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-neutral-600">Total Creates:</span>
          <span className="text-[10px] font-bold text-violet-400">{fmt(totalCreates)}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={85}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar
              dataKey="TikTok"
              stackId="creates"
              fill="#00F2EA"
              radius={[0, 0, 0, 0]}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              name="TikTok Creates"
            />
            <Bar
              dataKey="Instagram"
              stackId="creates"
              fill="#E1306C"
              radius={[0, 4, 4, 0]}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
              name="IG Creates"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
