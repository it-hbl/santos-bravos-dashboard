"use client";

import { useEffect, useState, useCallback } from "react";
import { toggleAllSections, areAllExpanded } from "./CollapsibleSection";

export interface SectionTrendData {
  [sectionId: string]: { positive: boolean; value: string } | null;
}

const SECTIONS = [
  { id: "hero", label: "Overview", icon: "🏠", short: "Top" },
  { id: "highlights", label: "Key Highlights", icon: "⚡", short: "Highlights" },
  { id: "score", label: "Performance Score", icon: "⚡", short: "Score" },
  { id: "milestones", label: "Milestones", icon: "🎯", short: "Goals" },
  { id: "velocity", label: "Growth Velocity", icon: "📊", short: "Growth" },
  { id: "historical", label: "Historical Trends", icon: "📈", short: "History" },
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

export default function SectionNav({ trends }: { trends?: SectionTrendData }) {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);
  const [allExpanded, setAllExpanded] = useState(true);

  const handleToggleAll = useCallback(() => {
    const newState = !allExpanded;
    toggleAllSections(newState);
    setAllExpanded(newState);
  }, [allExpanded]);

  // Sync state on mount and when localStorage changes
  useEffect(() => {
    setAllExpanded(areAllExpanded());
    const handler = () => setAllExpanded(areAllExpanded());
    window.addEventListener("sb-toggle-all", handler);
    return () => window.removeEventListener("sb-toggle-all", handler);
  }, []);

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
        const trend = trends?.[s.id] ?? null;
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
              {s.icon}
            </span>
            {/* Trend indicator dot */}
            {trend && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-neutral-900 ${
                  trend.positive ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            )}
            {/* Tooltip on hover — includes trend value */}
            <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-neutral-900 border border-white/[0.08] text-[10px] text-neutral-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
              {s.label}
              {trend && (
                <span className={`text-[9px] font-bold ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
                  {trend.positive ? "↑" : "↓"}{trend.value}
                </span>
              )}
            </span>
            {/* Active indicator */}
            {isActive && (
              <span className="absolute left-0 w-0.5 h-3 bg-violet-500 rounded-full -ml-1" />
            )}
          </button>
        );
      })}
      {/* Divider */}
      <div className="w-5 h-px bg-white/[0.06] mx-auto my-1" />
      {/* Expand/Collapse All toggle */}
      <button
        onClick={handleToggleAll}
        className="group relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04]"
        title={allExpanded ? "Collapse All Sections (E)" : "Expand All Sections (E)"}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ${allExpanded ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {allExpanded ? (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l3-3 3 3M9 19l3 3 3-3" />
            </>
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3l3 3 3-3M9 21l3-3 3 3" />
            </>
          )}
        </svg>
        <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-neutral-900 border border-white/[0.08] text-[10px] text-neutral-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {allExpanded ? "Collapse All" : "Expand All"} (E)
        </span>
      </button>
    </nav>
  );
}
