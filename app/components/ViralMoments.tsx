"use client";

import { RELEASES } from "../lib/data";

interface TimeSeriesPoint {
  date: string;
  mentions: number;
}

interface ViralMomentsProps {
  timeSeries: TimeSeriesPoint[];
  threshold?: number; // multiplier over average to consider "viral" (default 1.5x)
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/** Try to match a spike date to a known release event */
function matchRelease(dateStr: string): { name: string; emoji: string } | null {
  // Parse the date string (could be "Feb 7", "Feb 07", etc.)
  const currentYear = new Date().getFullYear();
  const parsed = new Date(`${dateStr}, ${currentYear}`);
  if (isNaN(parsed.getTime())) return null;

  for (const r of RELEASES) {
    const releaseDate = new Date(r.date + "T12:00:00");
    const diffDays = Math.abs(
      Math.round((parsed.getTime() - releaseDate.getTime()) / 86400000)
    );
    // Match if within 1 day of release
    if (diffDays <= 1) {
      return { name: r.name, emoji: r.emoji };
    }
  }
  return null;
}

const INTENSITY_COLORS = [
  { min: 1.5, bg: "bg-amber-500/15", border: "border-amber-500/25", text: "text-amber-400", label: "Spike", dot: "bg-amber-400" },
  { min: 2.0, bg: "bg-orange-500/15", border: "border-orange-500/25", text: "text-orange-400", label: "Surge", dot: "bg-orange-400" },
  { min: 3.0, bg: "bg-rose-500/15", border: "border-rose-500/25", text: "text-rose-400", label: "Viral", dot: "bg-rose-400" },
  { min: 5.0, bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/25", text: "text-fuchsia-400", label: "🔥 Viral", dot: "bg-fuchsia-400" },
];

function getIntensity(multiplier: number) {
  for (let i = INTENSITY_COLORS.length - 1; i >= 0; i--) {
    if (multiplier >= INTENSITY_COLORS[i].min) return INTENSITY_COLORS[i];
  }
  return INTENSITY_COLORS[0];
}

export default function ViralMoments({ timeSeries, threshold = 1.5 }: ViralMomentsProps) {
  if (!timeSeries || timeSeries.length < 3) return null;

  const avg = timeSeries.reduce((s, d) => s + d.mentions, 0) / timeSeries.length;
  if (avg === 0) return null;

  // Find spike days
  const spikes = timeSeries
    .map((d) => ({
      ...d,
      multiplier: d.mentions / avg,
      release: matchRelease(d.date),
    }))
    .filter((d) => d.multiplier >= threshold)
    .sort((a, b) => b.multiplier - a.multiplier);

  if (spikes.length === 0) return null;

  const maxMentions = Math.max(...timeSeries.map((d) => d.mentions));

  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">
          ⚡ Viral Moments
        </p>
        <span className="text-[9px] text-neutral-600">
          {spikes.length} spike{spikes.length !== 1 ? "s" : ""} above {threshold}× avg ({Math.round(avg)}/day)
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/40 via-rose-500/30 to-transparent" />

        <div className="space-y-2.5">
          {spikes.slice(0, 5).map((spike, i) => {
            const intensity = getIntensity(spike.multiplier);
            const barWidth = (spike.mentions / maxMentions) * 100;

            return (
              <div key={spike.date} className="flex items-start gap-3 pl-0 group">
                {/* Timeline dot */}
                <div className="relative flex-shrink-0 mt-1.5">
                  <div className={`w-[15px] h-[15px] rounded-full ${intensity.dot} ring-2 ring-black/50 flex items-center justify-center`}>
                    <span className="text-[7px] font-black text-black">{i + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${intensity.bg} border ${intensity.border} rounded-lg p-2.5 transition-all group-hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-200">{spike.date}</span>
                      {spike.release && (
                        <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                          {spike.release.emoji} {spike.release.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold ${intensity.text}`}>
                        {intensity.label} · {spike.multiplier.toFixed(1)}×
                      </span>
                    </div>
                  </div>

                  {/* Mention count + bar */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-extrabold tabular-nums ${intensity.text}`}>
                      {fmt(spike.mentions)}
                    </span>
                    <span className="text-[9px] text-neutral-600">mentions</span>
                    <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden ml-1">
                      <div
                        className={`h-full rounded-full ${intensity.dot} transition-all duration-700`}
                        style={{ width: `${barWidth}%`, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      {spikes.length > 0 && (
        <div className="mt-3 px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            💡 Peak day was <span className="text-white font-medium">{spikes[0].date}</span> with{" "}
            <span className="text-white font-medium">{fmt(spikes[0].mentions)}</span> mentions
            ({spikes[0].multiplier.toFixed(1)}× average)
            {spikes[0].release && (
              <>, coinciding with the <span className="text-violet-400 font-medium">{spikes[0].release.name}</span> release</>
            )}.
            {spikes.filter(s => s.release).length > 1 && (
              <> {spikes.filter(s => s.release).length} of {spikes.length} spikes align with release events.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
