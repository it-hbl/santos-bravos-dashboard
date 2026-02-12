"use client";

interface Track {
  name: string;
  totalStreams: number;
  releaseDate: string; // ISO date
  color: string;
  emoji: string;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function daysSince(dateStr: string, reportDate?: string): number {
  const release = new Date(dateStr + "T12:00:00");
  const now = reportDate ? new Date(reportDate + "T12:00:00") : new Date();
  return Math.max(1, Math.floor((now.getTime() - release.getTime()) / 86400000));
}

interface Props {
  tracks: { name: string; streams: number }[];
  reportDate?: string;
}

const TRACK_META: Record<string, { releaseDate: string; color: string; emoji: string; label: string }> = {
  "0%": { releaseDate: "2026-01-31", color: "#22c55e", emoji: "🟢", label: "0%" },
  "0% (Portuguese Version)": { releaseDate: "2026-02-03", color: "#06b6d4", emoji: "🔵", label: "0% PT" },
  "KAWASAKI": { releaseDate: "2026-02-07", color: "#ec4899", emoji: "🩷", label: "KAWASAKI" },
};

export default function ContentEfficiency({ tracks, reportDate }: Props) {
  // Parse reportDate from "February 9, 2026" to ISO
  let isoReport: string | undefined;
  if (reportDate) {
    try {
      const d = new Date(reportDate);
      if (!isNaN(d.getTime())) {
        isoReport = d.toISOString().split("T")[0];
      }
    } catch {}
  }

  const enriched = tracks
    .map((t) => {
      const meta = TRACK_META[t.name];
      if (!meta) return null;
      const days = daysSince(meta.releaseDate, isoReport);
      const streamsPerDay = t.streams / days;
      return {
        name: t.name,
        label: meta.label,
        streams: t.streams,
        days,
        streamsPerDay,
        color: meta.color,
        emoji: meta.emoji,
      };
    })
    .filter(Boolean) as {
    name: string;
    label: string;
    streams: number;
    days: number;
    streamsPerDay: number;
    color: string;
    emoji: string;
  }[];

  // Sort by streams/day descending
  enriched.sort((a, b) => b.streamsPerDay - a.streamsPerDay);

  const maxRate = Math.max(...enriched.map((t) => t.streamsPerDay));

  if (enriched.length === 0) return null;

  // Efficiency score: weighted by recency (newer tracks with high rate score higher)
  const bestEfficiency = enriched[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          ⚡ Content Efficiency
          <span className="text-[10px] text-neutral-500 font-normal">
            Streams per day since release
          </span>
        </h3>
        <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-0.5 text-violet-400 font-medium">
          🏆 {bestEfficiency.label} leads
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {enriched.map((t, i) => {
          const barPct = (t.streamsPerDay / maxRate) * 100;
          const rank = i + 1;
          return (
            <div
              key={t.name}
              className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
            >
              {/* Rank badge */}
              <div
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{
                  backgroundColor: rank === 1 ? t.color + "20" : "rgba(255,255,255,0.03)",
                  color: rank === 1 ? t.color : "#737373",
                  border: rank === 1 ? `1px solid ${t.color}40` : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                #{rank}
              </div>

              {/* Track name */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-xs font-semibold text-white">{t.label}</span>
                <span className="text-[10px] text-neutral-600">{t.days}d old</span>
              </div>

              {/* Main metric */}
              <p className="text-2xl font-black text-white" style={{ color: t.color }}>
                {fmt(Math.round(t.streamsPerDay))}
              </p>
              <p className="text-[10px] text-neutral-500 mb-3">streams / day</p>

              {/* Bar */}
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-[1.2s] ease-out"
                  style={{ width: `${barPct}%`, backgroundColor: t.color, opacity: 0.8 }}
                />
              </div>

              {/* Footer stats */}
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>Total: {fmt(t.streams)}</span>
                <span>{t.days} days</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
