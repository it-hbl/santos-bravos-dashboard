"use client";

import { useEffect, useState } from "react";

interface TickerMetric {
  label: string;
  value: string;
  color: string;
  change?: string;
  positive?: boolean;
  sectionId?: string;
}

export default function StickyTicker({ metrics }: { metrics: TickerMetric[] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (~500px)
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-[49px] left-0 right-0 z-40 transition-all duration-300 print:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto scrollbar-hide">
          {metrics.map((m, i) => {
            const Wrapper = m.sectionId ? "button" : "div";
            const wrapperProps = m.sectionId
              ? {
                  onClick: () => {
                    const el = document.getElementById(m.sectionId!);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  title: `Jump to ${m.label}`,
                }
              : {};
            return (
              <Wrapper
                key={m.label}
                className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
                  m.sectionId ? "cursor-pointer hover:bg-white/[0.04] rounded-md px-1.5 -mx-1.5 py-0.5 -my-0.5 transition-colors" : ""
                }`}
                {...wrapperProps}
              >
                {i > 0 && <div className="w-px h-3 bg-white/[0.08] hidden sm:block -ml-1 sm:-ml-2 mr-0 sm:mr-0" />}
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider hidden sm:inline">{m.label}</span>
                <span className={`text-xs sm:text-sm font-extrabold tabular-nums ${m.color}`}>{m.value}</span>
                {m.change && (
                  <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${
                    m.positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                  }`}>
                    {m.change}
                  </span>
                )}
              </Wrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}
