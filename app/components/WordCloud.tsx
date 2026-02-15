"use client";

/**
 * WordCloud — Interactive word cloud for trending keyphrases.
 * Replaces flat bar lists with a visually engaging, size-weighted cloud.
 * Each word is sized by mention count, colored with a violet→cyan gradient,
 * and shows a tooltip with exact count on hover.
 */

import { useMemo, useState } from "react";

interface Phrase {
  phrase: string;
  count: number;
}

interface Props {
  phrases: Phrase[];
  maxItems?: number;
}

// Deterministic pseudo-random based on string hash
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const COLORS = [
  "text-violet-400",
  "text-violet-300",
  "text-indigo-400",
  "text-indigo-300",
  "text-cyan-400",
  "text-cyan-300",
  "text-purple-400",
  "text-fuchsia-400",
  "text-sky-400",
  "text-blue-400",
];

const ROTATIONS = [0, 0, 0, 0, -6, 6, -3, 3]; // Mostly horizontal, few tilted

export default function WordCloud({ phrases, maxItems = 20 }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!phrases || phrases.length === 0) return [];
    const sorted = [...phrases].sort((a, b) => b.count - a.count).slice(0, maxItems);
    const maxCount = sorted[0]?.count || 1;
    const minCount = sorted[sorted.length - 1]?.count || 0;
    const range = maxCount - minCount || 1;

    return sorted.map((p) => {
      const norm = (p.count - minCount) / range; // 0..1
      // Font size: 12px (smallest) to 32px (largest)
      const fontSize = Math.round(13 + norm * 22);
      // Font weight: 400 (smallest) to 800 (largest)
      const fontWeight = norm > 0.7 ? 800 : norm > 0.4 ? 700 : norm > 0.2 ? 600 : 500;
      const h = hashStr(p.phrase);
      const color = COLORS[h % COLORS.length];
      const rotation = ROTATIONS[h % ROTATIONS.length];
      const opacity = 0.55 + norm * 0.45; // 0.55..1

      return { ...p, fontSize, fontWeight, color, rotation, opacity, norm };
    });
  }, [phrases, maxItems]);

  if (items.length === 0) return null;

  // Shuffle for visual variety (deterministic)
  const shuffled = useMemo(() => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = hashStr(arr[i].phrase + "shuffle") % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [items]);

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-4">
        🔥 Trending Keyphrases
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 px-2 min-h-[120px]">
        {shuffled.map((item) => {
          const isHovered = hovered === item.phrase;
          return (
            <div
              key={item.phrase}
              className="relative group cursor-default"
              onMouseEnter={() => setHovered(item.phrase)}
              onMouseLeave={() => setHovered(null)}
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
            >
              <span
                className={`${item.color} transition-all duration-300 leading-tight whitespace-nowrap select-none ${
                  isHovered ? "scale-110 brightness-125" : hovered ? "opacity-40" : ""
                }`}
                style={{
                  fontSize: `${item.fontSize}px`,
                  fontWeight: item.fontWeight,
                  opacity: hovered && !isHovered ? 0.3 : item.opacity,
                  transition: "opacity 0.3s, transform 0.3s, filter 0.3s",
                  display: "inline-block",
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                }}
              >
                {item.phrase}
              </span>
              {/* Tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none transition-opacity duration-200 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
                  <span className="text-[10px] font-bold text-white">{item.phrase}</span>
                  <br />
                  <span className="text-[9px] text-neutral-400">
                    {item.count.toLocaleString()} mention{item.count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
