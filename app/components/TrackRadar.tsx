"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Track {
  name: string;
  spotifyStreams: number;
  dailyStreams: number;
  tiktokCreates: number;
  igCreates: number;
  saves: number;
}

interface TrackRadarProps {
  tracks: Track[];
}

// Normalize each dimension to 0-100 scale for radar comparison
function normalize(tracks: Track[]) {
  const dims: (keyof Omit<Track, "name">)[] = ["spotifyStreams", "dailyStreams", "tiktokCreates", "igCreates", "saves"];
  const labels: Record<string, string> = {
    spotifyStreams: "Total Streams",
    dailyStreams: "Daily Streams",
    tiktokCreates: "TikTok Creates",
    igCreates: "IG Creates",
    saves: "Daily Saves",
  };

  return dims.map((dim) => {
    const max = Math.max(...tracks.map((t) => t[dim]), 1);
    const point: Record<string, string | number> = { dimension: labels[dim] };
    tracks.forEach((t) => {
      point[t.name] = Math.round((t[dim] / max) * 100);
    });
    return point;
  });
}

const COLORS = ["#1DB954", "#06B6D4", "#F472B6"];

export default function TrackRadar({ tracks }: TrackRadarProps) {
  const data = normalize(tracks);

  return (
    <div className="w-full" style={{ height: 320 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#737373", fontSize: 10, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {tracks.map((t, i) => (
            <Radar
              key={t.name}
              name={t.name}
              dataKey={t.name}
              stroke={COLORS[i]}
              fill={COLORS[i]}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 10, color: "#a3a3a3" }}
            iconSize={8}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 11,
              color: "#e5e5e5",
            }}
            formatter={(value: number) => `${value}%`}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
