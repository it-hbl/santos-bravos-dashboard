"use client";

import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  { id: "hero", label: "Overview", emoji: "🏠", color: "#8B5CF6" },
  { id: "highlights", label: "Key Highlights", emoji: "⭐", color: "#FBBF24" },
  { id: "comparison", label: "All Metrics", emoji: "📋", color: "#6B7280" },
  { id: "score", label: "Performance Score", emoji: "⚡", color: "#F59E0B" },
  { id: "milestones", label: "Milestones", emoji: "🎯", color: "#10B981" },
  { id: "velocity", label: "Growth Velocity", emoji: "📊", color: "#06B6D4" },
  { id: "historical", label: "Historical Trends", emoji: "📈", color: "#10B981" },
  { id: "business", label: "§1 Business Performance", emoji: "🟢", color: "#1DB954" },
  { id: "daily", label: "Daily Snapshot", emoji: "⚡", color: "#1DB954" },
  { id: "charts", label: "Streaming Charts", emoji: "🎵", color: "#8B5CF6" },
  { id: "social", label: "§2 Social Media", emoji: "📱", color: "#00F2EA" },
  { id: "virality", label: "§3 Audio Virality", emoji: "🔥", color: "#A855F7" },
  { id: "track-radar", label: "Track Comparison", emoji: "🎯", color: "#10B981" },
  { id: "members", label: "§4 Band Members", emoji: "👥", color: "#EC4899" },
  { id: "geo", label: "§5 Geo Signals", emoji: "🌎", color: "#6366F1" },
  { id: "audience", label: "Audience", emoji: "👂", color: "#F59E0B" },
  { id: "pr", label: "§6 PR & Media", emoji: "📰", color: "#8B5CF6" },
  { id: "sentiment", label: "§7 Fan Sentiment", emoji: "💬", color: "#F43F5E" },
  { id: "section-cultural", label: "§8 Cultural Affinity", emoji: "🎭", color: "#D946EF" },
  { id: "benchmark", label: "Debut Benchmark", emoji: "📏", color: "#F59E0B" },
];

export default function NavBreadcrumb() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [visible, setVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSection = useRef("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show breadcrumb only after scrolling past hero
      setVisible(scrollY > 400);

      let current = "hero";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 140) current = s.id;
        }
      }

      if (current !== prevSection.current) {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveSection(current);
          prevSection.current = current;
          setTimeout(() => setIsTransitioning(false), 200);
        }, 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const section = SECTIONS.find(s => s.id === activeSection);
  if (!section) return null;

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Find prev/next sections
  const idx = SECTIONS.findIndex(s => s.id === activeSection);
  const prevSec = idx > 0 ? SECTIONS[idx - 1] : null;
  const nextSec = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;

  return (
    <div
      className="hidden lg:flex items-center gap-2 transition-all duration-300 ease-out print:hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Divider from nav logo */}
      <div className="w-px h-4 bg-white/10" />

      {/* Prev arrow */}
      {prevSec && (
        <button
          onClick={() => jumpTo(prevSec.id)}
          className="text-neutral-600 hover:text-neutral-400 transition-colors p-0.5"
          title={`← ${prevSec.label}`}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Current section badge */}
      <button
        onClick={() => jumpTo(section.id)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 hover:bg-white/[0.06] group"
        style={{
          backgroundColor: `${section.color}10`,
          borderLeft: `2px solid ${section.color}40`,
        }}
      >
        <span
          className="text-xs leading-none transition-all duration-200"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(-4px)" : "translateY(0)",
          }}
        >
          {section.emoji}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
          style={{
            color: section.color,
            opacity: isTransitioning ? 0 : 0.9,
            transform: isTransitioning ? "translateY(4px)" : "translateY(0)",
          }}
        >
          {section.label}
        </span>
      </button>

      {/* Next arrow */}
      {nextSec && (
        <button
          onClick={() => jumpTo(nextSec.id)}
          className="text-neutral-600 hover:text-neutral-400 transition-colors p-0.5"
          title={`${nextSec.label} →`}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
