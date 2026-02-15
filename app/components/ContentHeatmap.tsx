"use client";

import { useMemo } from "react";

interface Track {
  name: string;
  metrics: Record<string, number>;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/** Interpolate between two hex colors */
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `rgb(${rr}, ${rg}, ${rb})`;
}

const METRIC_LABELS: Record<string, string> = {
  totalStreams: "Total Streams",
  dailyStreams: "Daily Streams",
  dailySaves: "Daily Saves",
  tiktokCreates: "TikTok Creates",
  igCreates: "IG Creates",
  ytViews: "YT Views",
};

const METRIC_ORDER = ["totalStreams", "dailyStreams", "dailySaves", "tiktokCreates", "igCreates", "ytViews"];

export default function ContentHeatmap({ tracks }: { tracks: Track[] }) {
  // For each metric, compute min/max across tracks for normalization
  const ranges = useMemo(() => {
    const r: Record<string, { min: number; max: number }> = {};
    for (const key of METRIC_ORDER) {
      const vals = tracks.map(t => t.metrics[key] ?? 0);
      r[key] = { min: Math.min(...vals), max: Math.max(...vals) };
    }
    return r;
  }, [tracks]);

  // Normalize value to 0-1
  function norm(key: string, val: number): number {
    const { min, max } = ranges[key];
    if (max === min) return 0.5;
    return (val - min) / (max - min);
  }

  // Color: dark purple (low) → bright violet (mid) → cyan (high)
  function cellColor(key: string, val: number): string {
    const t = norm(key, val);
    if (t < 0.5) return lerpColor("#1e1b4b", "#7c3aed", t * 2); // indigo-950 → violet-600
    return lerpColor("#7c3aed", "#06b6d4", (t - 0.5) * 2); // violet-600 → cyan-500
  }

  // Track colors for row labels
  const trackColors = ["#22c55e", "#06b6d4", "#ec4899"];

  // Find leader for each metric
  const leaders = useMemo(() => {
    const l: Record<string, string> = {};
    for (const key of METRIC_ORDER) {
      let best = tracks[0];
      for (const t of tracks) {
        if ((t.metrics[key] ?? 0) > (best.metrics[key] ?? 0)) best = t;
      }
      l[key] = best.name;
    }
    return l;
  }, [tracks]);

  if (!tracks.length) return null;

  return (
    <div className="glass-hybe rounded-2xl p-5 mt-4">
      <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
        <span className="text-base">🔥</span> Content Performance Heatmap
      </h3>

      {/* Desktop: grid table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-separate" style={{ borderSpacing: "3px" }}>
          <thead>
            <tr>
              <th className="text-left text-neutral-500 font-medium px-2 py-1.5 w-32">Track</th>
              {METRIC_ORDER.map(key => (
                <th key={key} className="text-center text-neutral-500 font-medium px-2 py-1.5 whitespace-nowrap">
                  {METRIC_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, i) => (
              <tr key={track.name}>
                <td className="px-2 py-1.5 font-semibold whitespace-nowrap" style={{ color: trackColors[i % trackColors.length] }}>
                  {track.name}
                </td>
                {METRIC_ORDER.map(key => {
                  const val = track.metrics[key] ?? 0;
                  const isLeader = leaders[key] === track.name && val > 0;
                  return (
                    <td
                      key={key}
                      className="text-center px-3 py-2.5 rounded-lg font-mono font-bold text-white/90 relative transition-transform hover:scale-105 cursor-default"
                      style={{
                        background: cellColor(key, val),
                        boxShadow: isLeader ? `0 0 12px ${cellColor(key, val)}40` : undefined,
                      }}
                      title={`${track.name}: ${val.toLocaleString()} ${METRIC_LABELS[key]}`}
                    >
                      {fmt(val)}
                      {isLeader && (
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-500/90 text-black font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                          👑
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-neutral-500">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <div
              key={t}
              className="w-5 h-2.5 rounded-sm"
              style={{ background: t < 0.5 ? lerpColor("#1e1b4b", "#7c3aed", t * 2) : lerpColor("#7c3aed", "#06b6d4", (t - 0.5) * 2) }}
            />
          ))}
        </div>
        <span>High</span>
        <span className="ml-2">👑 = Leader</span>
      </div>
    </div>
  );
}
