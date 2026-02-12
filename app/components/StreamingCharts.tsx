"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const total = payload[0]?.payload?._total;
  const sharePct = total ? ((value / total) * 100).toFixed(1) : null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold">{label}</p>
      <p className="font-mono">{value?.toLocaleString() ?? "—"}</p>
      {sharePct && <p className="text-[10px] text-neutral-400 mt-0.5">{sharePct}% of total</p>}
    </div>
  );
};

/** Inline label renderer for horizontal bar charts */
const InlineLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dy={4}
      fill="#a3a3a3"
      fontSize={11}
      fontFamily="monospace"
      fontWeight={600}
    >
      {fmt(value)}
    </text>
  );
};

export default function StreamingCharts({
  spotifyTracks,
  youtubeVideos,
  dailyStreams,
}: {
  spotifyTracks: { name: string; streams: number }[];
  youtubeVideos: { name: string; views: number }[];
  dailyStreams: { name: string; streams: number }[];
}) {
  const spotifyTotal = spotifyTracks.reduce((s, t) => s + t.streams, 0);
  const ytTotal = youtubeVideos.reduce((s, v) => s + v.views, 0);
  const dailyTotal = dailyStreams.reduce((s, t) => s + t.streams, 0);

  // Enrich data with totals for tooltip share %
  const spotifyData = spotifyTracks.map(t => ({ ...t, _total: spotifyTotal }));
  const ytData = youtubeVideos.map(v => ({ ...v, _total: ytTotal }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Spotify Streams */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Spotify Total Streams</p>
          <span className="text-[10px] font-bold text-spotify tabular-nums">{fmt(spotifyTotal)}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={spotifyData} layout="vertical" margin={{ right: 50 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={70} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="streams" radius={[0, 6, 6, 0]} animationDuration={1200} animationEasing="ease-out">
              {spotifyData.map((_, i) => (
                <Cell key={i} fill="#1DB954" fillOpacity={1 - i * 0.2} />
              ))}
              <LabelList dataKey="streams" content={<InlineLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YouTube Views */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">YouTube Views</p>
          <span className="text-[10px] font-bold text-ytred tabular-nums">{fmt(ytTotal)}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ytData} layout="vertical" margin={{ right: 50 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#a3a3a3", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="views" radius={[0, 6, 6, 0]} animationDuration={1200} animationEasing="ease-out">
              {ytData.map((_, i) => (
                <Cell key={i} fill="#FF0000" fillOpacity={1 - i * 0.15} />
              ))}
              <LabelList dataKey="views" content={<InlineLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Streams */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Daily Streams (SFA)</p>
          <span className="text-[10px] font-bold text-spotify tabular-nums">{fmt(dailyTotal)}</span>
        </div>
        <div className="space-y-4 mt-2">
          {dailyStreams.map((t) => {
            const pct = dailyStreams[0]?.streams ? (t.streams / dailyStreams[0].streams) * 100 : 0;
            const sharePct = dailyTotal > 0 ? ((t.streams / dailyTotal) * 100).toFixed(0) : "0";
            return (
              <div key={t.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-300">{t.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-600 tabular-nums">{sharePct}%</span>
                    <span className="font-mono text-spotify">{fmt(t.streams)}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-spotify rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
