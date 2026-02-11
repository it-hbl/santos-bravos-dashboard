"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Overview", icon: "🏠", short: "Top" },
  { id: "highlights", label: "Key Highlights", icon: "⚡", short: "Highlights" },
  { id: "score", label: "Performance Score", icon: "⚡", short: "Score" },
  { id: "milestones", label: "Milestones", icon: "🎯", short: "Goals" },
  { id: "velocity", label: "Growth Velocity", icon: "📊", short: "Growth" },
  { id: "business", label: "Business Performance", icon: "1", short: "Business" },
  { id: "daily", label: "Daily Snapshot", icon: "⚡", short: "Daily" },
  { id: "charts", label: "Charts", icon: "📈", short: "Charts" },
  { id: "social", label: "Social Media", icon: "2", short: "Social" },
  { id: "virality", label: "Audio Virality", icon: "3", short: "Virality" },
  { id: "track-radar", label: "Track Comparison", icon: "🎯", short: "Radar" },
  { id: "members", label: "Band Members", icon: "4", short: "Members" },
  { id: "geo", label: "Geo Signals", icon: "5", short: "Geo" },
  { id: "audience", label: "Audience Deep Dive", icon: "📊", short: "Audience" },
  { id: "pr", label: "PR & Media", icon: "6", short: "PR" },
  { id: "sentiment", label: "Fan Sentiment", icon: "7", short: "Sentiment" },
];

export default function SectionNav() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past hero
      setVisible(window.scrollY > 400);

      // Find active section
      const offsets = SECTIONS.map(s => {
        const el = document.getElementById(s.id);
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      // Pick section closest to top but still above center of viewport
      const threshold = window.innerHeight * 0.35;
      let current = "hero";
      for (const o of offsets) {
        if (o.top <= threshold) current = o.id;
      }
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <nav className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1 py-2 px-1.5 rounded-xl glass border border-white/[0.06] shadow-2xl shadow-black/40">
      {SECTIONS.map(s => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => {
              const el = document.getElementById(s.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`group relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-violet-500/20 text-violet-400"
                : "text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04]"
            }`}
            title={s.label}
          >
            <span className="text-[10px] font-bold leading-none">
              {/^\d$/.test(s.icon) ? s.icon : s.icon}
            </span>
            {/* Tooltip on hover */}
            <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-neutral-900 border border-white/[0.08] text-[10px] text-neutral-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {s.label}
            </span>
            {/* Active indicator */}
            {isActive && (
              <span className="absolute left-0 w-0.5 h-3 bg-violet-500 rounded-full -ml-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
