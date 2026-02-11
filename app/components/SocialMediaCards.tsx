"use client";

import { motion } from "framer-motion";

interface Platform {
  platform: string;
  metric: string;
  current: number;
  prior: number | null;
  color: string;
  icon: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function MiniSparkline({ prior, current, color }: { prior: number; current: number; color: string }) {
  // Generate 7-point trend
  const points: number[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const base = prior + (current - prior) * (t * t * (3 - 2 * t));
    const noise = base * (Math.sin(i * 2.5) * 0.006);
    points.push(base + noise);
  }
  points[6] = current;

  const min = Math.min(...points) * 0.998;
  const max = Math.max(...points) * 1.002;
  const range = max - min || 1;
  const w = 60, h = 24;
  const pathD = points
    .map((v, i) => {
      const x = (i / 6) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathD + ` L${w},${h} L0,${h} Z`}
        fill={`url(#spark-${color.replace("#", "")})`}
      />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((current - min) / range) * h} r="2" fill={color} />
    </svg>
  );
}

const PLATFORM_EMOJIS: Record<string, string> = {
  YouTube: "📺",
  TikTok: "🎵",
  Instagram: "📸",
  Weverse: "💚",
};

export default function SocialMediaCards({
  platforms,
  totalFootprint,
}: {
  platforms: Platform[];
  totalFootprint: { current: number; prior: number | null };
}) {
  const maxFollowers = Math.max(...platforms.map((p) => p.current));

  return (
    <div className="space-y-4">
      {/* Total footprint header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <div>
            <p className="text-xs text-neutral-400">Total SNS Footprint</p>
            <p className="text-xl font-black text-white tabular-nums">{fmt(totalFootprint.current)}</p>
          </div>
        </div>
        {totalFootprint.prior != null && totalFootprint.prior > 0 && (
          <div className="text-right">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                totalFootprint.current >= totalFootprint.prior
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}
            >
              {totalFootprint.current >= totalFootprint.prior ? "+" : ""}
              {(((totalFootprint.current - totalFootprint.prior) / totalFootprint.prior) * 100).toFixed(1)}%
            </span>
            <p className="text-[9px] text-neutral-600 mt-0.5">
              vs prior: {fmt(totalFootprint.prior)}
            </p>
          </div>
        )}
      </div>

      {/* Platform cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {platforms.map((p, i) => {
          const growth =
            p.prior && p.prior > 0
              ? ((p.current - p.prior) / p.prior) * 100
              : null;
          const share = ((p.current / totalFootprint.current) * 100).toFixed(1);

          return (
            <motion.div
              key={p.platform}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.1] rounded-xl p-4 transition-all duration-300 cursor-default relative overflow-hidden"
            >
              {/* Background bar showing share of total */}
              <div
                className="absolute inset-y-0 left-0 opacity-[0.04] transition-all duration-500"
                style={{
                  width: `${(p.current / maxFollowers) * 100}%`,
                  backgroundColor: p.color,
                }}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Platform icon circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}22, ${p.color}08)`,
                      border: `1px solid ${p.color}33`,
                    }}
                  >
                    {PLATFORM_EMOJIS[p.platform] || p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{p.platform}</p>
                    <p className="text-[10px] text-neutral-500">{p.metric}</p>
                  </div>
                </div>

                {/* Sparkline */}
                {p.prior != null && (
                  <MiniSparkline prior={p.prior} current={p.current} color={p.color} />
                )}
              </div>

              <div className="relative z-10 mt-3 flex items-end justify-between">
                <div>
                  <p className="text-lg font-black tabular-nums" style={{ color: p.color }}>
                    {fmt(p.current)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {growth !== null && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          growth >= 0
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-red-400 bg-red-500/10"
                        }`}
                      >
                        {growth >= 0 ? "+" : ""}
                        {growth.toFixed(1)}%
                      </span>
                    )}
                    {p.prior != null && (
                      <span className="text-[9px] text-neutral-600">
                        +{fmt(p.current - (p.prior ?? 0))} new
                      </span>
                    )}
                  </div>
                </div>

                {/* Share of total */}
                <div className="text-right">
                  <p className="text-[10px] text-neutral-500">{share}% of total</p>
                  <div className="w-20 h-1.5 bg-white/[0.05] rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${share}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
