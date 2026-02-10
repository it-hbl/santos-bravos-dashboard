"use client";

import { useEffect, useState } from "react";

interface SentimentGaugeProps {
  positive: number; // percentage
  negative: number; // percentage
  neutral: number;  // percentage
}

export default function SentimentGauge({ positive, negative, neutral }: SentimentGaugeProps) {
  // Net Sentiment Score: ranges from -100 (all negative) to +100 (all positive)
  const nss = positive - negative;
  const [animatedNss, setAnimatedNss] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const to = nss;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedNss(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [nss]);

  // Arc geometry: 180° arc from -100 to +100
  const cx = 120, cy = 110, r = 90;
  // angle: -100 → π (left), 0 → π/2 (top), +100 → 0 (right)
  const valueAngle = Math.PI - ((animatedNss + 100) / 200) * Math.PI;

  // Needle endpoint
  const needleLen = 70;
  const nx = cx + needleLen * Math.cos(valueAngle);
  const ny = cy - needleLen * Math.sin(valueAngle);

  // Arc path helper
  function arcPath(startAngle: number, endAngle: number, radius: number) {
    const x1 = cx + radius * Math.cos(Math.PI - startAngle);
    const y1 = cy - radius * Math.sin(Math.PI - startAngle);
    const x2 = cx + radius * Math.cos(Math.PI - endAngle);
    const y2 = cy - radius * Math.sin(Math.PI - endAngle);
    const sweep = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${sweep} 1 ${x2} ${y2}`;
  }

  // Color based on NSS
  const color = nss >= 15 ? "#34d399" : nss >= 5 ? "#a7f3d0" : nss >= -5 ? "#9ca3af" : nss >= -15 ? "#fca5a5" : "#f87171";
  const label = nss >= 15 ? "Very Positive" : nss >= 5 ? "Positive" : nss >= -5 ? "Neutral" : nss >= -15 ? "Negative" : "Very Negative";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 130" className="w-full max-w-[220px]">
        {/* Background arc segments */}
        <path d={arcPath(0, Math.PI / 5, r)} stroke="#f87171" strokeWidth="8" fill="none" opacity="0.15" strokeLinecap="round" />
        <path d={arcPath(Math.PI / 5, 2 * Math.PI / 5, r)} stroke="#fbbf24" strokeWidth="8" fill="none" opacity="0.15" strokeLinecap="round" />
        <path d={arcPath(2 * Math.PI / 5, 3 * Math.PI / 5, r)} stroke="#9ca3af" strokeWidth="8" fill="none" opacity="0.15" strokeLinecap="round" />
        <path d={arcPath(3 * Math.PI / 5, 4 * Math.PI / 5, r)} stroke="#86efac" strokeWidth="8" fill="none" opacity="0.15" strokeLinecap="round" />
        <path d={arcPath(4 * Math.PI / 5, Math.PI, r)} stroke="#34d399" strokeWidth="8" fill="none" opacity="0.15" strokeLinecap="round" />

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />

        {/* Score text */}
        <text x={cx} y={cy - 20} textAnchor="middle" className="text-2xl font-black" fill={color} fontSize="28">
          {animatedNss >= 0 ? "+" : ""}{Math.round(animatedNss)}
        </text>

        {/* Labels */}
        <text x={30} y={cy + 18} textAnchor="middle" fill="#6b7280" fontSize="9">-100</text>
        <text x={210} y={cy + 18} textAnchor="middle" fill="#6b7280" fontSize="9">+100</text>
      </svg>
      <div className="text-center -mt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
        <p className="text-[9px] text-neutral-600 mt-0.5">Net Sentiment Score (NSS)</p>
      </div>
    </div>
  );
}
