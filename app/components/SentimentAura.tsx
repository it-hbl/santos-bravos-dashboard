"use client";

import { useMemo } from "react";

interface Props {
  positivePct: number;
  negativePct: number;
  neutralPct: number;
}

/**
 * SentimentAura — Renders a subtle ambient gradient overlay that shifts
 * color based on the current net sentiment score.
 *
 * - Very positive (net > +20): emerald/green aura
 * - Positive (net > +5): teal/cyan aura
 * - Neutral (-5 to +5): violet (default) aura
 * - Negative (net < -5): amber/warm aura
 * - Very negative (net < -20): red aura
 *
 * The overlay is absolutely positioned and pointer-events-none,
 * designed to sit inside the hero section as a background effect.
 */
export default function SentimentAura({ positivePct, negativePct, neutralPct }: Props) {
  const netSentiment = positivePct - negativePct;

  const { gradient, pulseColor, label, emoji } = useMemo(() => {
    if (netSentiment >= 20) {
      return {
        gradient: `radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.18), transparent 60%),
                   radial-gradient(ellipse at 80% 50%, rgba(52, 211, 153, 0.10), transparent 50%),
                   radial-gradient(ellipse at 20% 80%, rgba(6, 182, 212, 0.06), transparent 50%)`,
        pulseColor: "rgba(16, 185, 129, 0.08)",
        label: "Very Positive",
        emoji: "🌟",
      };
    }
    if (netSentiment >= 5) {
      return {
        gradient: `radial-gradient(ellipse at 50% 0%, rgba(20, 184, 166, 0.15), transparent 60%),
                   radial-gradient(ellipse at 80% 50%, rgba(6, 182, 212, 0.10), transparent 50%),
                   radial-gradient(ellipse at 20% 80%, rgba(124, 58, 237, 0.06), transparent 50%)`,
        pulseColor: "rgba(20, 184, 166, 0.06)",
        label: "Positive",
        emoji: "😊",
      };
    }
    if (netSentiment >= -5) {
      // Neutral — keep the default violet theme
      return {
        gradient: `radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.15), transparent 60%),
                   radial-gradient(ellipse at 80% 50%, rgba(6, 182, 212, 0.08), transparent 50%),
                   radial-gradient(ellipse at 20% 80%, rgba(236, 72, 153, 0.06), transparent 50%)`,
        pulseColor: "rgba(124, 58, 237, 0.06)",
        label: "Neutral",
        emoji: "😐",
      };
    }
    if (netSentiment >= -20) {
      return {
        gradient: `radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.15), transparent 60%),
                   radial-gradient(ellipse at 80% 50%, rgba(251, 191, 36, 0.08), transparent 50%),
                   radial-gradient(ellipse at 20% 80%, rgba(239, 68, 68, 0.06), transparent 50%)`,
        pulseColor: "rgba(245, 158, 11, 0.06)",
        label: "Cautious",
        emoji: "⚠️",
      };
    }
    return {
      gradient: `radial-gradient(ellipse at 50% 0%, rgba(239, 68, 68, 0.15), transparent 60%),
                 radial-gradient(ellipse at 80% 50%, rgba(220, 38, 38, 0.08), transparent 50%),
                 radial-gradient(ellipse at 20% 80%, rgba(245, 158, 11, 0.06), transparent 50%)`,
      pulseColor: "rgba(239, 68, 68, 0.08)",
      label: "Negative",
      emoji: "🔴",
    };
  }, [netSentiment]);

  return (
    <>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none z-0 transition-all duration-[2000ms] ease-in-out"
        style={{ background: gradient }}
      />
      {/* Subtle pulse ring */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none z-0 animate-sentiment-pulse"
        style={{ boxShadow: `inset 0 0 80px 20px ${pulseColor}` }}
      />
      {/* Sentiment mood indicator — tiny badge in top-right corner */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/[0.06]">
        <span className="text-[10px]">{emoji}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">{label} Mood</span>
        <span className="text-[9px] font-bold tabular-nums text-neutral-500">
          {netSentiment >= 0 ? "+" : ""}{netSentiment.toFixed(0)}
        </span>
      </div>
    </>
  );
}
