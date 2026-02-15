"use client";

import { ReactNode } from "react";

interface GrowthGlowProps {
  children: ReactNode;
  /** Growth percentage — positive = green glow, negative = red glow, null/0 = no glow */
  growthPct: number | null;
  /** Intensity multiplier (default 1) */
  intensity?: number;
  className?: string;
}

/**
 * GrowthGlow — wraps a section card with an animated gradient border
 * that reflects growth direction:
 *   - Strong growth (>5%): vibrant green animated border
 *   - Moderate growth (1-5%): subtle green border
 *   - Flat (-1% to 1%): neutral/dim border
 *   - Moderate decline (-5% to -1%): subtle red border
 *   - Strong decline (<-5%): vibrant red animated border
 *
 * Uses CSS background trick for animated gradient borders.
 */
export default function GrowthGlow({
  children,
  growthPct,
  intensity = 1,
  className = "",
}: GrowthGlowProps) {
  if (growthPct == null) return <div className={className}>{children}</div>;

  const abs = Math.abs(growthPct);
  const isPositive = growthPct >= 0;

  // Determine glow tier
  let tier: "strong" | "moderate" | "flat" = "flat";
  if (abs > 5) tier = "strong";
  else if (abs > 1) tier = "moderate";

  // CSS classes for different tiers
  const glowClasses: Record<string, Record<string, string>> = {
    strong: {
      positive: "growth-glow-strong-positive",
      negative: "growth-glow-strong-negative",
    },
    moderate: {
      positive: "growth-glow-moderate-positive",
      negative: "growth-glow-moderate-negative",
    },
    flat: {
      positive: "growth-glow-flat",
      negative: "growth-glow-flat",
    },
  };

  const glowClass = tier === "flat"
    ? glowClasses.flat.positive
    : glowClasses[tier][isPositive ? "positive" : "negative"];

  return (
    <div className={`${glowClass} ${className}`} style={{ "--glow-intensity": intensity } as React.CSSProperties}>
      {children}
    </div>
  );
}
