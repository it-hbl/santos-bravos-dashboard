"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "hero", icon: "🏠", label: "Top" },
  { id: "business", icon: "📊", label: "Perf" },
  { id: "daily", icon: "⚡", label: "Daily" },
  { id: "social", icon: "📱", label: "Social" },
  { id: "members", icon: "👥", label: "Members" },
  { id: "geo", icon: "🌎", label: "Geo" },
  { id: "pr", icon: "📰", label: "PR" },
  { id: "sentiment", icon: "💬", label: "Sentiment" },
];

export default function MobileNav() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 300px
      setVisible(window.scrollY > 300);

      // Find active section
      const offsets = sections
        .map((s) => {
          const el = document.getElementById(s.id);
          if (!el) return null;
          return { id: s.id, top: el.getBoundingClientRect().top };
        })
        .filter(Boolean) as { id: string; top: number }[];

      // Pick the section closest to top but above center
      const threshold = window.innerHeight * 0.4;
      let current = "hero";
      for (const o of offsets) {
        if (o.top <= threshold) current = o.id;
      }
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 print:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Backdrop blur bar */}
      <div className="bg-black/80 backdrop-blur-xl border-t border-white/[0.08] px-1 py-1.5 safe-area-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all min-w-0 ${
                  isActive
                    ? "text-violet-400 bg-violet-500/10"
                    : "text-neutral-500 active:text-neutral-300"
                }`}
              >
                <span className="text-sm leading-none">{s.icon}</span>
                <span className="text-[8px] font-semibold tracking-wide truncate max-w-[40px]">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
