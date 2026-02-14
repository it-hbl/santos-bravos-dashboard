"use client";

import { useRef, useEffect, useState } from "react";

/**
 * SectionDivider — animated gradient line that separates major dashboard groups.
 * The gradient shimmer moves slowly left-to-right, creating a subtle "alive" feel.
 * When scrolling into view, lines wipe outward from center and label fades up.
 * Hidden in print.
 */
export default function SectionDivider({
  label,
  variant = "default",
  subtitle,
}: {
  label?: string;
  variant?: "default" | "violet" | "cyan" | "emerald";
  subtitle?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3, rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const gradients: Record<string, string> = {
    default:
      "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.3) 20%, rgba(6,182,212,0.3) 50%, rgba(236,72,153,0.3) 80%, transparent 100%)",
    violet:
      "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.35) 30%, rgba(139,92,246,0.2) 70%, transparent 100%)",
    cyan:
      "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.35) 30%, rgba(34,211,238,0.2) 70%, transparent 100%)",
    emerald:
      "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.35) 30%, rgba(52,211,153,0.2) 70%, transparent 100%)",
  };

  const dotColors: Record<string, string> = {
    default: "bg-violet-500/40",
    violet: "bg-violet-500/50",
    cyan: "bg-cyan-500/50",
    emerald: "bg-emerald-500/50",
  };

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-1 my-4 print:hidden select-none" aria-hidden="true">
      <div className="flex items-center gap-4 w-full">
        <div
          className="flex-1 h-px section-divider-shimmer transition-all duration-700 ease-out origin-right"
          style={{
            backgroundImage: gradients[variant],
            backgroundSize: "200% 100%",
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            opacity: visible ? 1 : 0,
          }}
        />
        {label && (
          <div
            className="flex flex-col items-center gap-0.5 flex-shrink-0 transition-all duration-500 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(6px)",
              transitionDelay: visible ? "300ms" : "0ms",
            }}
          >
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${dotColors[variant]}`} />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600 whitespace-nowrap">
                {label}
              </span>
              <div className={`w-1 h-1 rounded-full ${dotColors[variant]}`} />
            </div>
            {subtitle && (
              <span className="text-[8px] text-neutral-700 tracking-wider">{subtitle}</span>
            )}
          </div>
        )}
        <div
          className="flex-1 h-px section-divider-shimmer transition-all duration-700 ease-out origin-left"
          style={{
            backgroundImage: gradients[variant],
            backgroundSize: "200% 100%",
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            opacity: visible ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}
