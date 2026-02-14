"use client";

import { useMemo } from "react";

interface Track {
  name: string;
  spotifyStreams: number;
  priorStreams: number | null;
  dailyStreams: number;
  tiktokCreates: number;
  igCreates: number;
  saves: number;
  listeners: number;
  releaseDate: string; // ISO
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function score(tracks: Track[]) {
  return tracks.map(t => {
    const age = Math.max(1, Math.floor((Date.now() - new Date(t.releaseDate + "T12:00:00").getTime()) / 86400000));

    // 1. Streaming Velocity (0-100): daily streams normalized by age expectation
    // Newer tracks get a bonus for high daily rates
    const dailyRate = t.dailyStreams;
    const velocityRaw = dailyRate / (age < 7 ? 30000 : age < 14 ? 50000 : 80000);
    const velocity = clamp(velocityRaw * 100, 0, 100);

    // 2. Virality Score (0-100): combined TikTok + IG creates relative to streams
    const totalCreates = t.tiktokCreates + t.igCreates;
    const createsPerKStreams = t.spotifyStreams > 0 ? (totalCreates / t.spotifyStreams) * 1000 : 0;
    const virality = clamp(createsPerKStreams * 2, 0, 100); // 50 creates/1K = 100

    // 3. Growth Acceleration (0-100): period-over-period stream growth %
    let acceleration = 50; // neutral
    if (t.priorStreams && t.priorStreams > 0) {
      const growthPct = ((t.spotifyStreams - t.priorStreams) / t.priorStreams) * 100;
      acceleration = clamp(growthPct * 2, 0, 100); // 50% growth = 100
    }

    // 4. Engagement Depth (0-100): saves/streams ratio + streams/listener
    const saveRate = t.dailyStreams > 0 ? (t.saves / t.dailyStreams) * 100 : 0;
    const replayDepth = t.listeners > 0 ? t.dailyStreams / t.listeners : 0;
    const engagement = clamp((saveRate * 8) + (replayDepth * 20), 0, 100);

    // Weighted composite
    const composite = Math.round(
      velocity * 0.30 +
      virality * 0.25 +
      acceleration * 0.25 +
      engagement * 0.20
    );

    return {
      name: t.name,
      composite,
      dimensions: [
        { label: "Velocity", value: Math.round(velocity), color: "bg-emerald-500", glow: "shadow-emerald-500/30" },
        { label: "Virality", value: Math.round(virality), color: "bg-purple-500", glow: "shadow-purple-500/30" },
        { label: "Growth", value: Math.round(acceleration), color: "bg-cyan-500", glow: "shadow-cyan-500/30" },
        { label: "Depth", value: Math.round(engagement), color: "bg-amber-500", glow: "shadow-amber-500/30" },
      ],
      age,
    };
  }).sort((a, b) => b.composite - a.composite);
}

function gradeLabel(s: number) {
  if (s >= 85) return { label: "🔥 On Fire", color: "text-emerald-400" };
  if (s >= 70) return { label: "🚀 Strong", color: "text-cyan-400" };
  if (s >= 55) return { label: "💪 Solid", color: "text-violet-400" };
  if (s >= 40) return { label: "📈 Building", color: "text-amber-400" };
  return { label: "🌱 Early", color: "text-neutral-400" };
}

export default function TrackMomentum({ tracks }: { tracks: Track[] }) {
  const scored = useMemo(() => score(tracks), [tracks]);

  if (scored.length === 0) return null;

  const colors = ["from-emerald-500/20 to-emerald-500/5", "from-violet-500/20 to-violet-500/5", "from-pink-500/20 to-pink-500/5"];
  const rings = ["ring-emerald-500/30", "ring-violet-500/30", "ring-pink-500/30"];
  const textColors = ["text-emerald-400", "text-violet-400", "text-pink-400"];

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-3">
        Composite momentum index — velocity, virality, growth acceleration & engagement depth
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scored.map((t, i) => {
          const grade = gradeLabel(t.composite);
          return (
            <div
              key={t.name}
              className={`relative rounded-xl bg-gradient-to-br ${colors[i] || colors[2]} border border-white/[0.06] p-4 transition-all hover:border-white/[0.12] hover:-translate-y-0.5`}
            >
              {/* Rank badge */}
              {i === 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5 text-emerald-400 font-bold">
                  #1 🏆
                </span>
              )}

              {/* Score circle */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`relative w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full ring-2 ${rings[i] || rings[2]} bg-black/30`}>
                  <svg className="absolute inset-0" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" className="text-white/[0.06]" strokeWidth="3" />
                    <circle
                      cx="28" cy="28" r="24" fill="none"
                      className={textColors[i] || textColors[2]}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(t.composite / 100) * 150.8} 150.8`}
                      transform="rotate(-90 28 28)"
                      style={{ transition: "stroke-dasharray 1s ease-out" }}
                    />
                  </svg>
                  <span className={`text-lg font-black tabular-nums ${textColors[i] || textColors[2]}`}>
                    {t.composite}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{t.name}</p>
                  <p className={`text-[11px] font-semibold ${grade.color}`}>{grade.label}</p>
                  <p className="text-[10px] text-neutral-500">Day {t.age} post-release</p>
                </div>
              </div>

              {/* Dimension bars */}
              <div className="space-y-1.5">
                {t.dimensions.map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-neutral-500 w-12 text-right tabular-nums">{d.label}</span>
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${d.value}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-neutral-400 tabular-nums w-5 text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
