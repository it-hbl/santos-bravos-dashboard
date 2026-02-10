"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold">{label}</p>
      <p className="font-mono">{payload[0].value.toLocaleString()}</p>
    </div>
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Spotify Streams */}
      <div className="glass rounded-xl p-5">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Spotify Total Streams</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={spotifyTracks} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={70} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="streams" radius={[0, 6, 6, 0]}>
              {spotifyTracks.map((_, i) => (
                <Cell key={i} fill="#1DB954" fillOpacity={1 - i * 0.2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YouTube Views */}
      <div className="glass rounded-xl p-5">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">YouTube Views</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={youtubeVideos} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#a3a3a3", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="views" radius={[0, 6, 6, 0]}>
              {youtubeVideos.map((_, i) => (
                <Cell key={i} fill="#FF0000" fillOpacity={1 - i * 0.15} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Streams */}
      <div className="glass rounded-xl p-5">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Daily Streams (SFA)</p>
        <div className="space-y-4 mt-2">
          {dailyStreams.map((t) => {
            const pct = (t.streams / dailyStreams[0].streams) * 100;
            return (
              <div key={t.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-300">{t.name}</span>
                  <span className="font-mono text-spotify">{fmt(t.streams)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-spotify rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
