"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const SECTIONS = [
  { id: "hero", label: "Overview", emoji: "🏠", group: "summary" },
  { id: "highlights", label: "Highlights", emoji: "⭐", group: "summary" },
  { id: "comparison", label: "All Metrics", emoji: "📋", group: "summary" },
  { id: "score", label: "Score", emoji: "⚡", group: "summary" },
  { id: "milestones", label: "Milestones", emoji: "🎯", group: "summary" },
  { id: "velocity", label: "Growth", emoji: "📊", group: "performance" },
  { id: "historical", label: "Trends", emoji: "📈", group: "performance" },
  { id: "business", label: "§1 Business", emoji: "🟢", group: "performance" },
  { id: "daily", label: "Daily", emoji: "⚡", group: "performance" },
  { id: "charts", label: "Charts", emoji: "🎵", group: "performance" },
  { id: "social", label: "§2 Social", emoji: "📱", group: "community" },
  { id: "virality", label: "§3 Virality", emoji: "🔥", group: "community" },
  { id: "track-radar", label: "Track Radar", emoji: "🎯", group: "community" },
  { id: "members", label: "§4 Members", emoji: "👥", group: "community" },
  { id: "geo", label: "§5 Geo", emoji: "🌎", group: "community" },
  { id: "audience", label: "Audience", emoji: "👂", group: "community" },
  { id: "pr", label: "§6 PR", emoji: "📰", group: "media" },
  { id: "sentiment", label: "§7 Sentiment", emoji: "💬", group: "media" },
  { id: "section-cultural", label: "§8 Culture", emoji: "🎭", group: "media" },
  { id: "benchmark", label: "Benchmark", emoji: "📏", group: "media" },
];

const GROUP_COLORS: Record<string, string> = {
  summary: "#8B5CF6",
  performance: "#1DB954",
  community: "#06B6D4",
  media: "#EC4899",
};

export default function SectionMinimap() {
  const [active, setActive] = useState("hero");
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);

      let current = "hero";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 200) current = s.id;
        }
      }
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id } }));
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Track groups for gap indicators
  let lastGroup = "";

  return (
    <div
      className={`fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-0 print:hidden transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
      }`}
      role="navigation"
      aria-label="Section minimap"
    >
      {/* Vertical track line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/[0.04]" />

      {/* Active section indicator — sliding highlight */}
      {(() => {
        const idx = SECTIONS.findIndex(s => s.id === active);
        if (idx < 0) return null;
        // Count gaps for group dividers
        let gapsBefore = 0;
        let prevGroup = "";
        for (let i = 0; i <= idx; i++) {
          if (prevGroup && SECTIONS[i].group !== prevGroup) gapsBefore++;
          prevGroup = SECTIONS[i].group;
        }
        const top = idx * 18 + gapsBefore * 8;
        return (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-7 h-7 rounded-full transition-all duration-300 ease-out pointer-events-none"
            style={{
              top: `${top - 5}px`,
              background: `radial-gradient(circle, ${GROUP_COLORS[SECTIONS[idx].group]}20, transparent 70%)`,
              boxShadow: `0 0 12px ${GROUP_COLORS[SECTIONS[idx].group]}30`,
            }}
          />
        );
      })()}

      {SECTIONS.map((s, i) => {
        const isActive = active === s.id;
        const isHovered = hovered === s.id;
        const showGap = lastGroup && s.group !== lastGroup;
        lastGroup = s.group;
        const color = GROUP_COLORS[s.group];

        return (
          <div key={s.id}>
            {showGap && <div className="h-2" />}
            <div className="relative flex items-center justify-center" style={{ height: "18px" }}>
              <button
                onClick={() => scrollTo(s.id)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative z-10 group flex items-center justify-center transition-all duration-200"
                style={{
                  width: isActive ? "10px" : isHovered ? "8px" : "5px",
                  height: isActive ? "10px" : isHovered ? "8px" : "5px",
                }}
                title={s.label}
                aria-label={`Jump to ${s.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <div
                  className="w-full h-full rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? color : isHovered ? `${color}99` : "rgba(255,255,255,0.12)",
                    boxShadow: isActive ? `0 0 6px ${color}60` : "none",
                    transform: isActive ? "scale(1)" : isHovered ? "scale(1.2)" : "scale(1)",
                  }}
                />
              </button>

              {/* Tooltip */}
              {isHovered && (
                <div
                  ref={tooltipRef}
                  className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-neutral-900/95 border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl backdrop-blur-md pointer-events-none z-50"
                  style={{
                    animation: "minimap-tooltip-in 0.15s ease-out",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{s.emoji}</span>
                    <span className="text-[10px] font-bold text-white">{s.label}</span>
                  </div>
                  {/* Tooltip arrow */}
                  <div
                    className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-neutral-900/95 border-r border-t border-white/10"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
