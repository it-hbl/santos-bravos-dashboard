"use client";

/**
 * TopLoadingBar — A slim, animated progress bar at the very top of the viewport
 * (like YouTube/GitHub) that appears during data loading transitions.
 * Uses a CSS-only indeterminate animation with the brand violet gradient.
 */

import { useEffect, useState } from "react";

interface TopLoadingBarProps {
  loading: boolean;
}

export default function TopLoadingBar({ loading }: TopLoadingBarProps) {
  const [visible, setVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setFinishing(false);
    } else if (visible) {
      // When loading stops, play the "finish" animation then hide
      setFinishing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setFinishing(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] overflow-hidden print:hidden"
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className={`h-full transition-all duration-300 ${
          finishing
            ? "w-full opacity-0"
            : "animate-top-loading-bar opacity-100"
        }`}
        style={{
          background: "linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #8b5cf6, transparent)",
          backgroundSize: "200% 100%",
        }}
      />
      {/* Glow effect */}
      {!finishing && (
        <div
          className="absolute top-0 right-0 h-full w-24 animate-top-loading-bar"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4))",
            filter: "blur(3px)",
          }}
        />
      )}
    </div>
  );
}
