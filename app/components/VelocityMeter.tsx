"use client";

import { useMemo } from "react";

interface Props {
  timeSeries: { date: string; mentions: number }[];
}

/**
 * VelocityMeter — Shows whether mention velocity is accelerating or decelerating.
 * Uses linear regression slope on the last 7 days to compute direction + strength.
 * Displays as an animated needle gauge with color-coded status.
 */
export default function VelocityMeter({ timeSeries }: Props) {
  const analysis = useMemo(() => {
    if (!timeSeries || timeSeries.length < 3) return null;

    const data = timeSeries.map((d, i) => ({ x: i, y: d.mentions }));
    const n = data.length;

    // Linear regression: slope = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (const d of data) {
      sumX += d.x;
      sumY += d.y;
      sumXY += d.x * d.y;
      sumX2 += d.x * d.x;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    // Normalize slope as % of average daily volume
    const slopePct = avgY > 0 ? (slope / avgY) * 100 : 0;

    // Acceleration: compare slope of first half vs second half
    const mid = Math.floor(n / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);

    const avgFirst = firstHalf.reduce((s, d) => s + d.y, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, d) => s + d.y, 0) / secondHalf.length;

    // Peak and trough
    const peak = data.reduce((max, d) => d.y > max.y ? d : max, data[0]);
    const trough = data.reduce((min, d) => d.y < min.y ? d : min, data[0]);
    const peakDay = timeSeries[peak.x]?.date || "";
    const troughDay = timeSeries[trough.x]?.date || "";
    const volatility = avgY > 0 ? ((peak.y - trough.y) / avgY) * 100 : 0;

    // Classify velocity
    let status: "surging" | "accelerating" | "steady" | "decelerating" | "declining";
    let color: string, bgColor: string, needleAngle: number, emoji: string;

    if (slopePct > 15) {
      status = "surging"; color = "text-emerald-300"; bgColor = "from-emerald-500/20 to-emerald-500/5";
      emoji = "🚀"; needleAngle = -70;
    } else if (slopePct > 3) {
      status = "accelerating"; color = "text-emerald-400"; bgColor = "from-emerald-500/15 to-emerald-500/5";
      emoji = "📈"; needleAngle = -40;
    } else if (slopePct > -3) {
      status = "steady"; color = "text-neutral-400"; bgColor = "from-neutral-500/15 to-neutral-500/5";
      emoji = "➡️"; needleAngle = 0;
    } else if (slopePct > -15) {
      status = "decelerating"; color = "text-amber-400"; bgColor = "from-amber-500/15 to-amber-500/5";
      emoji = "📉"; needleAngle = 40;
    } else {
      status = "declining"; color = "text-red-400"; bgColor = "from-red-500/15 to-red-500/5";
      emoji = "⚠️"; needleAngle = 70;
    }

    return {
      slope, slopePct, avgY, avgFirst, avgSecond, status, color, bgColor,
      needleAngle, emoji, peak: peak.y, trough: trough.y, peakDay, troughDay, volatility,
    };
  }, [timeSeries]);

  if (!analysis) return null;

  // SVG gauge
  const cx = 100, cy = 90, r = 70;
  const startAngle = -150, endAngle = -30; // semicircle arc
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Arc path
  const arcStart = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
  const arcEnd = { x: cx + r * Math.cos(toRad(endAngle)), y: cy + r * Math.sin(toRad(endAngle)) };
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  // Needle angle: map analysis.needleAngle (-70..+70) to arc range (-150..-30)
  const mappedAngle = -90 + analysis.needleAngle * (60 / 70);
  const needleEnd = {
    x: cx + (r - 15) * Math.cos(toRad(mappedAngle)),
    y: cy + (r - 15) * Math.sin(toRad(mappedAngle)),
  };

  // Gradient stops for the arc
  const gradientId = "velocity-arc-grad";

  return (
    <div className={`bg-gradient-to-br ${analysis.bgColor} rounded-xl p-4 border border-white/[0.04]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{analysis.emoji}</span>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">Mention Velocity</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${analysis.color}`}>
          {analysis.status}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-2">
        <svg viewBox="0 10 200 100" width="180" height="95">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="25%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#737373" />
              <stop offset="75%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
          {/* Colored arc */}
          <path d={arcPath} fill="none" stroke={`url(#${gradientId})`} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
          {/* Needle */}
          <line
            x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y}
            stroke="white" strokeWidth="2" strokeLinecap="round"
            style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r="4" fill="white" opacity="0.9" />
          {/* Labels */}
          <text x="30" y="100" fontSize="7" fill="#737373" textAnchor="middle">DECLINE</text>
          <text x="100" y="28" fontSize="7" fill="#737373" textAnchor="middle">STEADY</text>
          <text x="170" y="100" fontSize="7" fill="#737373" textAnchor="middle">SURGE</text>
        </svg>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Slope</p>
          <p className={`text-xs font-bold tabular-nums ${analysis.slopePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {analysis.slopePct >= 0 ? "+" : ""}{analysis.slopePct.toFixed(1)}%/day
          </p>
        </div>
        <div>
          <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Avg/Day</p>
          <p className="text-xs font-bold tabular-nums text-neutral-300">
            {Math.round(analysis.avgY).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Volatility</p>
          <p className={`text-xs font-bold tabular-nums ${analysis.volatility > 50 ? "text-amber-400" : "text-neutral-400"}`}>
            {analysis.volatility.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-3 pt-2 border-t border-white/[0.05]">
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          {analysis.status === "surging" && `Mentions are surging rapidly — velocity up ${analysis.slopePct.toFixed(0)}% per day. Peak: ${analysis.peakDay} (${analysis.peak.toLocaleString()}).`}
          {analysis.status === "accelerating" && `Momentum is building — daily mentions trending upward at ${analysis.slopePct.toFixed(1)}%/day.`}
          {analysis.status === "steady" && `Mention volume is stable with minimal day-over-day change (${analysis.slopePct > 0 ? "+" : ""}${analysis.slopePct.toFixed(1)}%/day).`}
          {analysis.status === "decelerating" && `Volume is tapering off — daily mentions down ${Math.abs(analysis.slopePct).toFixed(1)}%/day. Consider a content push.`}
          {analysis.status === "declining" && `Significant decline in mention velocity (${analysis.slopePct.toFixed(1)}%/day). Investigate and consider intervention.`}
        </p>
      </div>
    </div>
  );
}
