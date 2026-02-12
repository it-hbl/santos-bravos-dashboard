"use client";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

interface Track {
  name: string;
  tiktokCreates: number;
  igCreates: number;
  spotifyStreams: number;
}

export default function ViralityRatio({ tracks }: { tracks: Track[] }) {
  const data = tracks.map(t => {
    const totalCreates = (t.tiktokCreates ?? 0) + (t.igCreates ?? 0);
    const ratio = t.spotifyStreams > 0 ? (totalCreates / t.spotifyStreams) * 1000 : 0;
    return { ...t, totalCreates, ratio };
  }).sort((a, b) => b.ratio - a.ratio);

  const maxRatio = Math.max(...data.map(d => d.ratio), 1);

  const getRating = (ratio: number) => {
    if (ratio >= 50) return { label: "🔥 Hyper-viral", color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" };
    if (ratio >= 20) return { label: "🚀 Highly viral", color: "text-violet-400", bg: "bg-violet-500/20", border: "border-violet-500/30" };
    if (ratio >= 10) return { label: "💪 Strong", color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/30" };
    if (ratio >= 5) return { label: "👍 Good", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
    return { label: "📈 Building", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" };
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">Virality Ratio</p>
        <span className="text-[9px] text-neutral-600">Creates per 1K Spotify Streams</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.map((t, i) => {
          const rating = getRating(t.ratio);
          return (
            <div
              key={t.name}
              className={`relative bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] transition-all duration-300 hover:border-white/[0.08] overflow-hidden ${i === 0 ? "ring-1 ring-violet-500/20" : ""}`}
            >
              {/* Background bar */}
              <div
                className="absolute inset-0 opacity-[0.04] transition-all duration-1000 ease-out"
                style={{
                  background: `linear-gradient(90deg, ${i === 0 ? "#a78bfa" : i === 1 ? "#22d3ee" : "#f472b6"} ${(t.ratio / maxRatio) * 100}%, transparent ${(t.ratio / maxRatio) * 100}%)`,
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  {i === 0 && <span className="text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-medium">Most Viral</span>}
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`text-2xl font-black tabular-nums ${rating.color}`}>
                    {t.ratio.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-neutral-500">per 1K streams</span>
                </div>
                <div className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full ${rating.bg} ${rating.color} border ${rating.border}`}>
                  {rating.label}
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.04] flex justify-between text-[9px] text-neutral-500">
                  <span>{fmt(t.totalCreates)} creates</span>
                  <span>{fmt(t.spotifyStreams)} streams</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
