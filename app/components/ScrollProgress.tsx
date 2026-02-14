"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const SECTIONS = [
  { id: "hero", label: "Overview", emoji: "🏠" },
  { id: "comparison", label: "Metrics", emoji: "📋" },
  { id: "highlights", label: "Highlights", emoji: "⭐" },
  { id: "score", label: "Score", emoji: "⚡" },
  { id: "milestones", label: "Milestones", emoji: "🎯" },
  { id: "velocity", label: "Velocity", emoji: "📊" },
  { id: "historical", label: "Trends", emoji: "📈" },
  { id: "business", label: "Business", emoji: "1" },
  { id: "stream-projections", label: "Projections", emoji: "🚀" },
  { id: "daily", label: "Daily", emoji: "⚡" },
  { id: "charts", label: "Charts", emoji: "🎵" },
  { id: "release-pacing", label: "Pacing", emoji: "🏁" },
  { id: "social", label: "Social", emoji: "2" },
  { id: "virality", label: "Virality", emoji: "3" },
  { id: "track-radar", label: "Tracks", emoji: "🎯" },
  { id: "members", label: "Members", emoji: "4" },
  { id: "geo", label: "Geo", emoji: "5" },
  { id: "audience", label: "Audience", emoji: "📊" },
  { id: "pr", label: "PR", emoji: "6" },
  { id: "sentiment", label: "Sentiment", emoji: "7" },
  { id: "section-cultural", label: "Culture", emoji: "8" },
  { id: "benchmark", label: "Benchmark", emoji: "📏" },
  { id: "revenue-estimate", label: "Revenue", emoji: "💰" },
];

interface SectionPosition {
  id: string;
  pct: number; // position as percentage of document
}

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [sectionPositions, setSectionPositions] = useState<SectionPosition[]>([]);
  const [hovered, setHovered] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate section positions as % of total scroll
  const updatePositions = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const positions: SectionPosition[] = [];
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        positions.push({ id: s.id, pct: Math.min(100, (top / docHeight) * 100) });
      }
    }
    setSectionPositions(positions);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) { setProgress(0); return; }
      setProgress(Math.min(100, (scrollTop / docHeight) * 100));

      // Determine active section
      let current = "hero";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 120) current = s.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    updatePositions();

    // Recalculate on resize
    window.addEventListener("resize", updatePositions);
    // Recalculate after a delay (sections may expand/collapse)
    const timer = setTimeout(updatePositions, 2000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updatePositions);
      clearTimeout(timer);
    };
  }, [updatePositions]);

  const jumpTo = (sectionId: string) => {
    window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id: sectionId } }));
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 z-[60] print:hidden group"
      onMouseEnter={() => { setHovered(true); updatePositions(); }}
      onMouseLeave={() => { setHovered(false); setHoveredSection(null); }}
      style={{ height: hovered ? "20px" : "3px", transition: "height 0.2s ease" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-colors duration-200"
        style={{ backgroundColor: hovered ? "rgba(0,0,0,0.6)" : "transparent" }}
      />

      {/* Progress fill */}
      <div
        className="absolute top-0 left-0 h-[3px] rounded-r-full transition-[width] duration-75 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #8B5CF6, #6366F1, #06B6D4, #1DB954)",
        }}
      />

      {/* Section tick marks — visible on hover */}
      {hovered && sectionPositions.map((sp) => {
        const section = SECTIONS.find(s => s.id === sp.id);
        if (!section) return null;
        const isActive = activeSection === sp.id;
        const isHovered = hoveredSection === sp.id;

        return (
          <button
            key={sp.id}
            className="absolute top-0 flex flex-col items-center cursor-pointer"
            style={{
              left: `${sp.pct}%`,
              transform: "translateX(-50%)",
              height: "100%",
            }}
            onClick={() => jumpTo(sp.id)}
            onMouseEnter={() => setHoveredSection(sp.id)}
            onMouseLeave={() => setHoveredSection(null)}
            title={section.label}
          >
            {/* Tick line */}
            <div
              className="transition-all duration-150"
              style={{
                width: isActive || isHovered ? "2px" : "1px",
                height: isActive || isHovered ? "100%" : "60%",
                backgroundColor: isActive
                  ? "#8B5CF6"
                  : isHovered
                  ? "#a78bfa"
                  : "rgba(255,255,255,0.2)",
                marginTop: isActive || isHovered ? "0" : "2px",
              }}
            />

            {/* Label tooltip */}
            {isHovered && (
              <div
                className="absolute top-full mt-1 whitespace-nowrap bg-neutral-900/95 border border-white/10 rounded-md px-2 py-1 shadow-lg backdrop-blur-sm pointer-events-none"
                style={{ zIndex: 100 }}
              >
                <span className="text-[10px] font-bold text-white">{section.label}</span>
              </div>
            )}
          </button>
        );
      })}

      {/* Active section indicator dot */}
      {hovered && (() => {
        const activePos = sectionPositions.find(s => s.id === activeSection);
        if (!activePos) return null;
        return (
          <div
            className="absolute top-[1px] w-[5px] h-[5px] rounded-full bg-violet-400 shadow-sm shadow-violet-500/50 transition-all duration-300 pointer-events-none"
            style={{ left: `${activePos.pct}%`, transform: "translateX(-50%) translateY(-1px)" }}
          />
        );
      })()}

      {/* Click-to-scroll hitbox (extends below the thin bar for easier hover) */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "12px", cursor: hovered ? "default" : "default" }}
      />
    </div>
  );
}
