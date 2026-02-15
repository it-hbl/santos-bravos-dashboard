"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { RELEASES } from "../lib/data";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

/**
 * Match release dates to chart date labels.
 * Chart dates are formatted like "Feb 8", so we convert release dates to the same format
 * and check if they fall within the chart's date range.
 */
function getReleaseAnnotations(chartDates: string[]) {
  if (!chartDates || chartDates.length === 0) return [];
  
  return RELEASES.map(r => {
    const rDate = new Date(r.date + "T12:00:00");
    // Format to match chart format: "Mon DD" e.g. "Feb 8"
    const formatted = rDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Check if this date exists in chart data
    if (chartDates.includes(formatted)) {
      return {
        date: formatted,
        label: r.trackName || r.name.replace("Santos Bravos ", ""),
        emoji: r.emoji,
        color: r.color,
      };
    }
    return null;
  }).filter(Boolean) as { date: string; label: string; emoji: string; color: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b]/95 backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-extrabold text-violet-400 tabular-nums">{fmt(payload[0].value)}</p>
      <p className="text-[10px] text-neutral-600">mentions</p>
    </div>
  );
};

const CustomDot = ({ cx, cy, payload, index }: any) => {
  if (!cx || !cy) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="#a78bfa"
      stroke="#18181b"
      strokeWidth={2}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    />
  );
};

export default function MentionsChart({ data }: { data: { date: string; mentions: number }[] }) {
  const maxMentions = Math.max(...data.map(d => d.mentions), 1);
  const avgMentions = data.length ? Math.round(data.reduce((s, d) => s + d.mentions, 0) / data.length) : 0;
  const peakDay = data.reduce((max, d) => d.mentions > max.mentions ? d : max, data[0]);
  const annotations = getReleaseAnnotations(data.map(d => d.date));

  return (
    <div className="space-y-3">
      {/* Mini stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-[10px] text-neutral-500">Avg: <span className="text-neutral-300 font-semibold">{fmt(avgMentions)}/day</span></span>
        </div>
        {peakDay && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-300" />
            <span className="text-[10px] text-neutral-500">Peak: <span className="text-neutral-300 font-semibold">{fmt(peakDay.mentions)}</span> ({peakDay.date})</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-52 group">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="mentionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mentionsStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#c4b5fd" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#525252" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#404040" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => fmt(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(167,139,250,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            {/* Release event annotations */}
            {annotations.map(a => (
              <ReferenceLine
                key={a.date}
                x={a.date}
                stroke={a.color}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeOpacity={0.6}
                label={{
                  value: `${a.emoji} ${a.label}`,
                  position: "top",
                  fill: a.color,
                  fontSize: 9,
                  fontWeight: 600,
                  offset: 8,
                }}
              />
            ))}
            {/* Average line */}
            <ReferenceLine
              y={avgMentions}
              stroke="#525252"
              strokeWidth={1}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              label={{
                value: `avg ${fmt(avgMentions)}`,
                position: "right",
                fill: "#525252",
                fontSize: 9,
              }}
            />
            <Area
              type="monotone"
              dataKey="mentions"
              stroke="url(#mentionsStroke)"
              strokeWidth={2.5}
              fill="url(#mentionsGradient)"
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 5, fill: "#a78bfa", stroke: "#18181b", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
