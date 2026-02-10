"use client";

import { useEffect, useState } from "react";

interface GrowthItem {
  label: string;
  category: "spotify" | "youtube" | "sns";
  pct: number;
}

interface GrowthVelocityProps {
  items: GrowthItem[];
}

const categoryColors: Record<string, { bar: string; text: string; bg: string; label: string }> = {
  spotify: { bar: "bg-[#1DB954]", text: "text-[#1DB954]", bg: "bg-[#1DB954]/10", label: "Spotify" },
  youtube: { bar: "bg-[#FF0000]", text: "text-[#FF0000]", bg: "bg-[#FF0000]/10", label: "YouTube" },
  sns: { bar: "bg-[#00F2EA]", text: "text-[#00F2EA]", bg: "bg-[#00F2EA]/10", label: "SNS" },
};

export default function GrowthVelocity({ items }: GrowthVelocityProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Sort by absolute growth descending
  const sorted = [...items].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const maxAbs = Math.max(...sorted.map(i => Math.abs(i.pct)), 1);

  return (
    <div className="space-y-2">
      {/* Category legend */}
      <div className="flex items-center gap-4 mb-3">
        {Object.entries(categoryColors).map(([key, c]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${c.bar}`} />
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-medium">{c.label}</span>
          </div>
        ))}
      </div>

      {sorted.map((item, i) => {
        const c = categoryColors[item.category];
        const widthPct = Math.min((Math.abs(item.pct) / maxAbs) * 100, 100);
        const isPositive = item.pct >= 0;

        return (
          <div key={item.label} className="group">
            <div className="flex items-center gap-3">
              {/* Label */}
              <span className="text-[11px] text-neutral-400 group-hover:text-neutral-300 transition-colors w-[140px] sm:w-[180px] truncate flex-shrink-0">
                {item.label}
              </span>

              {/* Bar container */}
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-white/[0.03] rounded-full h-[18px] overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isPositive ? c.bar : "bg-red-500"} ${isPositive ? "opacity-80" : "opacity-60"}`}
                    style={{
                      width: animated ? `${widthPct}%` : "0%",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                  {/* Percentage inside bar */}
                  {widthPct > 25 && (
                    <span
                      className="absolute inset-y-0 flex items-center text-[10px] font-bold text-white/90 tabular-nums pl-2.5"
                      style={{ opacity: animated ? 1 : 0, transition: `opacity 0.5s ${i * 60 + 500}ms` }}
                    >
                      {isPositive ? "+" : ""}{item.pct.toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Percentage outside bar (for small bars) */}
                {widthPct <= 25 && (
                  <span
                    className={`text-[11px] font-bold tabular-nums flex-shrink-0 ${isPositive ? c.text : "text-red-400"}`}
                    style={{ opacity: animated ? 1 : 0, transition: `opacity 0.5s ${i * 60 + 500}ms` }}
                  >
                    {isPositive ? "+" : ""}{item.pct.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
