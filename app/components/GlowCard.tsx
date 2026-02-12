"use client";

import { useRef, useCallback, ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string; // CSS color for the glow, e.g. "rgba(139, 92, 246, 0.15)"
  glowSize?: number;  // px radius of the glow
}

/**
 * GlowCard — A card wrapper with a mouse-tracking radial gradient glow.
 * The glow follows the cursor, creating a premium interactive feel.
 * Falls back gracefully (no glow) when JS is disabled or on touch devices.
 */
export default function GlowCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.12)",
  glowSize = 250,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !glowRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current.style.opacity = "1";
      glowRef.current.style.background = `radial-gradient(${glowSize}px circle at ${x}px ${y}px, ${glowColor}, transparent 70%)`;
    },
    [glowColor, glowSize]
  );

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow layer */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
