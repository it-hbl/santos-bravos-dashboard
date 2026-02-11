"use client";

interface Track {
  name: string;
  streams: number;
  listeners: number;
  saves: number;
}

function MiniGauge({ value, max, label, color, suffix = "" }: { value: number; max: number; label: string; color: string; suffix?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] text-neutral-500 uppercase tracking-wide">{label}</span>
          <span className={`text-[11px] font-bold ${color}`}>
            {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value.toFixed(1)}{suffix}
          </span>
        </div>
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[1.2s] ease-out"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color.includes("emerald") ? "#10b981" : color.includes("amber") ? "#f59e0b" : color.includes("violet") ? "#8b5cf6" : "#06b6d4"}, ${color.includes("emerald") ? "#34d399" : color.includes("amber") ? "#fbbf24" : color.includes("violet") ? "#a78bfa" : "#22d3ee"})` }}
          />
        </div>
      </div>
    </div>
  );
}

function getRating(streamsPerListener: number, saveRate: number): { label: string; emoji: string; color: string } {
  const score = (streamsPerListener / 3) * 50 + (saveRate / 10) * 50; // normalize to ~100
  if (score >= 70) return { label: "Excellent", emoji: "🔥", color: "text-emerald-400" };
  if (score >= 45) return { label: "Strong", emoji: "💪", color: "text-cyan-400" };
  if (score >= 25) return { label: "Good", emoji: "👍", color: "text-amber-400" };
  return { label: "Building", emoji: "📈", color: "text-neutral-400" };
}

export default function EngagementDepth({ tracks }: { tracks: Track[] }) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.04]">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3 font-semibold">📊 Engagement Depth</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tracks.map(t => {
          const spl = t.listeners > 0 ? t.streams / t.listeners : 0;
          const saveRate = t.streams > 0 ? (t.saves / t.streams) * 100 : 0;
          const rating = getRating(spl, saveRate);

          return (
            <div key={t.name} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t.name}</span>
                <span className={`text-[10px] font-semibold ${rating.color}`}>
                  {rating.emoji} {rating.label}
                </span>
              </div>
              <MiniGauge
                value={spl}
                max={3}
                label="Streams / Listener"
                color="text-cyan-400"
                suffix="×"
              />
              <MiniGauge
                value={saveRate}
                max={15}
                label="Save Rate"
                color="text-violet-400"
                suffix="%"
              />
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-neutral-600 mt-2">
        Streams/Listener measures replay depth (higher = more addictive). Save Rate = saves ÷ streams (higher = stronger intent to re-listen).
      </p>
    </div>
  );
}
