"use client";

import { useEffect, useState } from "react";

interface PerformanceMetric {
  label: string;
  /** 0-100 normalized score for this dimension */
  score: number;
  /** Weight (all weights are normalized internally) */
  weight: number;
  /** Color class */
  color: string;
  /** Optional section anchor to scroll to on click */
  sectionId?: string;
  /** Optional prior period score for comparison */
  priorScore?: number;
}

interface PerformanceScoreProps {
  metrics: PerformanceMetric[];
}

function getGrade(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: "Exceptional", color: "text-emerald-400", emoji: "🔥" };
  if (score >= 80) return { label: "Strong", color: "text-emerald-400", emoji: "💪" };
  if (score >= 70) return { label: "Good", color: "text-green-400", emoji: "✅" };
  if (score >= 60) return { label: "Solid", color: "text-lime-400", emoji: "👍" };
  if (score >= 50) return { label: "Average", color: "text-yellow-400", emoji: "📊" };
  if (score >= 40) return { label: "Below Avg", color: "text-amber-400", emoji: "⚠️" };
  return { label: "Needs Work", color: "text-red-400", emoji: "🚨" };
}

function getLetterGrade(score: number): { letter: string; color: string } {
  if (score >= 93) return { letter: "A+", color: "text-emerald-400" };
  if (score >= 85) return { letter: "A", color: "text-emerald-400" };
  if (score >= 78) return { letter: "B+", color: "text-green-400" };
  if (score >= 70) return { letter: "B", color: "text-green-400" };
  if (score >= 63) return { letter: "C+", color: "text-lime-400" };
  if (score >= 55) return { letter: "C", color: "text-yellow-400" };
  if (score >= 45) return { letter: "D+", color: "text-amber-400" };
  if (score >= 35) return { letter: "D", color: "text-amber-400" };
  return { letter: "F", color: "text-red-400" };
}

export default function PerformanceScore({ metrics }: PerformanceScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalWeight = metrics.reduce((s, m) => s + m.weight, 0);
  const compositeScore = Math.round(
    metrics.reduce((s, m) => s + (m.score * m.weight) / totalWeight, 0)
  );
  const grade = getGrade(compositeScore);
  const compositeLetterGrade = getLetterGrade(compositeScore);

  // Prior composite score (if any metrics have prior data)
  const hasPrior = metrics.some(m => m.priorScore != null);
  const priorComposite = hasPrior ? Math.round(
    metrics.reduce((s, m) => s + ((m.priorScore ?? m.score) * m.weight) / totalWeight, 0)
  ) : null;
  const compositeDelta = priorComposite != null ? compositeScore - priorComposite : null;

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnimatedScore(Math.round(eased * compositeScore));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [compositeScore]);

  // Arc parameters
  const size = 160;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r; // semicircle
  const progress = (animatedScore / 100) * circumference;

  // Score color for the arc
  const arcColor =
    compositeScore >= 80 ? "#34d399" :
    compositeScore >= 60 ? "#a3e635" :
    compositeScore >= 40 ? "#fbbf24" :
    "#f87171";

  return (
    <div className="glass-hybe rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[11px] font-black text-white">⚡</div>
        <h2 className="text-lg font-bold tracking-tight text-white">Performance Score</h2>
        <span className="text-[10px] text-neutral-600 uppercase tracking-widest ml-auto">Composite Index</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Score gauge */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`} className="overflow-visible">
            {/* Background arc */}
            <path
              d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
              fill="none"
              stroke={arcColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className={`text-sm font-black ${compositeLetterGrade.color} mb--0.5`}>{compositeLetterGrade.letter}</span>
            <span className="text-4xl font-black text-white tabular-nums">{animatedScore}</span>
            <span className={`text-xs font-bold ${grade.color}`}>{grade.emoji} {grade.label}</span>
            {compositeDelta != null && (
              <span className={`text-[10px] font-semibold mt-0.5 ${compositeDelta > 0 ? "text-emerald-400" : compositeDelta < 0 ? "text-red-400" : "text-neutral-500"}`}>
                {compositeDelta > 0 ? "↑" : compositeDelta < 0 ? "↓" : "→"}{Math.abs(compositeDelta)} vs prior
              </span>
            )}
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="flex-1 w-full space-y-2">
          {metrics.map((m) => {
            const isClickable = !!m.sectionId;
            const letterGrade = getLetterGrade(m.score);
            const delta = m.priorScore != null ? m.score - m.priorScore : null;
            const handleClick = () => {
              if (m.sectionId) {
                window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id: m.sectionId } }));
                const el = document.getElementById(m.sectionId);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            };
            return (
              <div
                key={m.label}
                className={`group rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-200 ${isClickable ? "cursor-pointer hover:bg-white/[0.03]" : ""}`}
                onClick={isClickable ? handleClick : undefined}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } } : undefined}
                title={isClickable ? `Go to ${m.label} — Grade: ${letterGrade.letter} (${m.score}/100)${delta != null ? `, ${delta >= 0 ? "+" : ""}${delta} vs prior` : ""}` : undefined}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[11px] transition-colors duration-200 flex items-center gap-1.5 ${isClickable ? "text-neutral-400 group-hover:text-white" : "text-neutral-400"}`}>
                    <span className={`text-[10px] font-black ${letterGrade.color} w-5 text-center`}>{letterGrade.letter}</span>
                    {m.label}
                    {isClickable && <span className="ml-0.5 opacity-0 group-hover:opacity-60 transition-opacity text-[9px]">→</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {delta != null && (
                      <span className={`text-[9px] font-semibold tabular-nums ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-neutral-600"}`}>
                        {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{Math.abs(delta)}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-white tabular-nums">{m.score}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden relative">
                  {m.priorScore != null && (
                    <div
                      className="absolute h-full rounded-full bg-white/[0.08] transition-all duration-1000 ease-out"
                      style={{ width: `${m.priorScore}%` }}
                    />
                  )}
                  <div
                    className={`h-full rounded-full ${m.color} transition-all duration-1000 ease-out relative z-10`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[9px] text-neutral-600 mt-3 text-center sm:text-left">
        Weighted composite of streaming growth, social reach, media presence, audience engagement, and milestone progress.
      </p>
    </div>
  );
}
