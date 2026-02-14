"use client";

import { useEffect, useState } from "react";

interface HeroScoreBadgeProps {
  score: number; // 0-100 weighted composite
}

function getGrade(score: number): { label: string; color: string; ringColor: string } {
  if (score >= 90) return { label: "Exceptional", color: "text-emerald-400", ringColor: "#34d399" };
  if (score >= 80) return { label: "Strong", color: "text-emerald-400", ringColor: "#34d399" };
  if (score >= 70) return { label: "Good", color: "text-green-400", ringColor: "#4ade80" };
  if (score >= 60) return { label: "Solid", color: "text-lime-400", ringColor: "#a3e635" };
  if (score >= 50) return { label: "Average", color: "text-yellow-400", ringColor: "#facc15" };
  if (score >= 40) return { label: "Below Avg", color: "text-amber-400", ringColor: "#fbbf24" };
  return { label: "Needs Work", color: "text-red-400", ringColor: "#f87171" };
}

export default function HeroScoreBadge({ score }: HeroScoreBadgeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setAnimatedScore(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const grade = getGrade(score);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <button
      onClick={() => {
        const el = document.getElementById("score");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="group relative flex-shrink-0 cursor-pointer"
      title={`Performance Score: ${score}/100 — ${grade.label}. Click to see breakdown.`}
    >
      <svg width="68" height="68" viewBox="0 0 68 68" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="34" cy="34" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="4"
        />
        {/* Score ring */}
        <circle
          cx="34" cy="34" r={radius}
          fill="none"
          stroke={grade.ringColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 6px ${grade.ringColor}60)` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className={`text-lg font-black tabular-nums ${grade.color} group-hover:scale-110 transition-transform`}>
          {animatedScore}
        </span>
        <span className="text-[7px] text-neutral-500 uppercase tracking-wider font-bold leading-none mt-[-1px]">
          {grade.label}
        </span>
      </div>
    </button>
  );
}
