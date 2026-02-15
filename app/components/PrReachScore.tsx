"use client";

import { useEffect, useState } from "react";

interface Props {
  totalMentions: number;
  perDay: number;
  uniqueAuthors: number;
  topCountries: { code: string; name: string; mentions: number }[];
  positivePct: number;
  negativePct: number;
  wow?: { changePct: number } | null;
}

/**
 * PR Reach Score — composite 0-100 score measuring PR effectiveness.
 * Factors: mention volume, author diversity, sentiment health, geographic reach, momentum.
 */
export default function PrReachScore({
  totalMentions,
  perDay,
  uniqueAuthors,
  topCountries,
  positivePct,
  negativePct,
  wow,
}: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Calculate sub-scores (each 0-100)
  // 1. Volume score: log scale, 1000 mentions/week = 50, 10000 = 80, 50000 = 100
  const volumeScore = Math.min(100, Math.round((Math.log10(Math.max(totalMentions, 1)) / Math.log10(50000)) * 100));

  // 2. Author diversity: ratio of unique authors to mentions (higher = more organic)
  const authorRatio = uniqueAuthors / Math.max(totalMentions, 1);
  const diversityScore = Math.min(100, Math.round(authorRatio * 200)); // 0.5 ratio = 100

  // 3. Sentiment health: positive% - negative%, mapped to 0-100
  const netSentiment = positivePct - negativePct;
  const sentimentScore = Math.min(100, Math.max(0, Math.round(50 + netSentiment)));

  // 4. Geographic reach: more countries = better
  const geoScore = Math.min(100, Math.round((topCountries.length / 6) * 100));

  // 5. Momentum: WoW change, positive change = higher score
  const momentumScore = wow
    ? Math.min(100, Math.max(0, Math.round(50 + wow.changePct)))
    : 50;

  // Weighted composite
  const weights = { volume: 0.25, diversity: 0.15, sentiment: 0.25, geo: 0.15, momentum: 0.2 };
  const compositeScore = Math.round(
    volumeScore * weights.volume +
    diversityScore * weights.diversity +
    sentimentScore * weights.sentiment +
    geoScore * weights.geo +
    momentumScore * weights.momentum
  );

  const clampedScore = Math.min(100, Math.max(0, compositeScore));

  // Animate score on mount
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * clampedScore));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [clampedScore]);

  // Grade label
  const grade =
    clampedScore >= 80 ? { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500" } :
    clampedScore >= 60 ? { label: "Strong", color: "text-cyan-400", bg: "bg-cyan-500" } :
    clampedScore >= 40 ? { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500" } :
    { label: "Building", color: "text-red-400", bg: "bg-red-500" };

  // SVG ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const factors = [
    { label: "Volume", score: volumeScore, color: "bg-violet-500" },
    { label: "Diversity", score: diversityScore, color: "bg-cyan-500" },
    { label: "Sentiment", score: sentimentScore, color: "bg-emerald-500" },
    { label: "Reach", score: geoScore, color: "bg-amber-500" },
    { label: "Momentum", score: momentumScore, color: "bg-rose-500" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="url(#prScoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="prScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tabular-nums text-white">{animatedScore}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${grade.color}`}>{grade.label}</span>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="w-full space-y-2">
        {factors.map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[9px] text-neutral-500 w-16 text-right uppercase tracking-wider">{f.label}</span>
            <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
              <div
                className={`${f.color} h-full rounded-full transition-all duration-1000`}
                style={{ width: `${f.score}%`, opacity: 0.7 }}
              />
            </div>
            <span className="text-[9px] text-neutral-400 tabular-nums w-6 text-right font-bold">{f.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
