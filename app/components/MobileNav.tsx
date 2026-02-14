"use client";

import { useState, useEffect, useRef } from "react";

const sections = [
  { id: "hero", icon: "🏠", label: "Top" },
  { id: "comparison", icon: "📋", label: "Table" },
  { id: "highlights", icon: "💡", label: "Highlights" },
  { id: "score", icon: "⚡", label: "Score" },
  { id: "milestones", icon: "🏆", label: "Goals" },
  { id: "velocity", icon: "📊", label: "Growth" },
  { id: "historical", icon: "📈", label: "History" },
  { id: "business", icon: "1️⃣", label: "Perf" },
  { id: "stream-projections", icon: "🚀", label: "Velocity" },
  { id: "daily", icon: "⚡", label: "Daily" },
  { id: "charts", icon: "🎵", label: "Charts" },
  { id: "release-pacing", icon: "🏁", label: "Pacing" },
  { id: "social", icon: "📱", label: "Social" },
  { id: "virality", icon: "🔥", label: "Virality" },
  { id: "track-radar", icon: "🎯", label: "Tracks" },
  { id: "members", icon: "👥", label: "Members" },
  { id: "geo", icon: "🌎", label: "Geo" },
  { id: "audience", icon: "👂", label: "Audience" },
  { id: "pr", icon: "📰", label: "PR" },
  { id: "sentiment", icon: "💬", label: "Sentiment" },
  { id: "section-cultural", icon: "🎭", label: "Culture" },
  { id: "benchmark", icon: "📏", label: "Bench" },
  { id: "revenue-estimate", icon: "💰", label: "Revenue" },
];

export default function MobileNav() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);

      const offsets = sections
        .map((s) => {
          const el = document.getElementById(s.id);
          if (!el) return null;
          return { id: s.id, top: el.getBoundingClientRect().top };
        })
        .filter(Boolean) as { id: string; top: number }[];

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

  // Auto-scroll the nav bar to keep active section visible
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const btn = activeRef.current;
      const container = scrollRef.current;
      const btnCenter = btn.offsetLeft + btn.offsetWidth / 2;
      const containerCenter = container.offsetWidth / 2;
      container.scrollTo({
        left: btnCenter - containerCenter,
        behavior: "smooth",
      });
    }
  }, [active]);

  const scrollTo = (id: string) => {
    window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id } }));
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 print:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-black/80 backdrop-blur-xl border-t border-white/[0.08] safe-area-bottom">
        <div
          ref={scrollRef}
          className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => scrollTo(s.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all flex-shrink-0 min-w-[44px] ${
                  isActive
                    ? "text-violet-400 bg-violet-500/10"
                    : "text-neutral-500 active:text-neutral-300"
                }`}
              >
                <span className="text-sm leading-none">{s.icon}</span>
                <span className="text-[8px] font-semibold tracking-wide truncate max-w-[44px]">
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
