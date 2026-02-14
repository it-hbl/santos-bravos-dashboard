"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaletteItem {
  id: string;
  label: string;
  category: string;
  icon: string;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette({ onRefresh }: { onRefresh?: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<PaletteItem[]>(() => [
    // Sections
    { id: "hero", label: "Top / Hero", category: "Sections", icon: "🏠", action: () => scrollTo("hero"), keywords: ["home", "top", "start"] },
    { id: "highlights", label: "Key Highlights", category: "Sections", icon: "⭐", action: () => scrollTo("highlights"), keywords: ["summary", "executive", "overview"] },
    { id: "score", label: "Performance Score", category: "Sections", icon: "⚡", action: () => scrollTo("score"), keywords: ["composite", "gauge", "grade"] },
    { id: "milestones", label: "Milestones & Targets", category: "Sections", icon: "🎯", action: () => scrollTo("milestones"), keywords: ["goals", "targets", "progress"] },
    { id: "velocity", label: "Growth Velocity", category: "Sections", icon: "📊", action: () => scrollTo("velocity"), keywords: ["growth", "change", "percentage"] },
    { id: "business", label: "Business Performance", category: "Sections", icon: "💼", action: () => scrollTo("business"), keywords: ["spotify", "youtube", "streams", "listeners"] },
    { id: "daily", label: "Daily Snapshot", category: "Sections", icon: "⚡", action: () => scrollTo("daily"), keywords: ["sfa", "daily", "streams", "saves"] },
    { id: "charts", label: "Streaming Charts", category: "Sections", icon: "📈", action: () => scrollTo("charts"), keywords: ["charts", "bars", "distribution"] },
    { id: "social", label: "Social Media", category: "Sections", icon: "📱", action: () => scrollTo("social"), keywords: ["sns", "tiktok", "instagram", "twitter", "weverse"] },
    { id: "virality", label: "Audio Virality", category: "Sections", icon: "🔥", action: () => scrollTo("virality"), keywords: ["cobrand", "tiktok", "creates", "audio"] },
    { id: "track-radar", label: "Track Comparison", category: "Sections", icon: "🎯", action: () => scrollTo("track-radar"), keywords: ["radar", "compare", "tracks"] },
    { id: "members", label: "Band Members", category: "Sections", icon: "👥", action: () => scrollTo("members"), keywords: ["kenneth", "kaue", "alejandro", "drew", "gabi", "instagram", "followers"] },
    { id: "geo", label: "Geo Signals", category: "Sections", icon: "🌎", action: () => scrollTo("geo"), keywords: ["countries", "cities", "mexico", "regional", "map"] },
    { id: "audience", label: "Audience Deep Dive", category: "Sections", icon: "🎧", action: () => scrollTo("audience"), keywords: ["funnel", "listeners", "saves", "playlist"] },
    { id: "pr", label: "PR & Media", category: "Sections", icon: "📰", action: () => scrollTo("pr"), keywords: ["meltwater", "mentions", "press", "media", "news"] },
    { id: "sentiment", label: "Fan Sentiment", category: "Sections", icon: "💬", action: () => scrollTo("sentiment"), keywords: ["sentiment", "positive", "negative", "hashtags", "entities"] },
    { id: "cultural", label: "Cultural Affinity", category: "Sections", icon: "🎭", action: () => scrollTo("section-cultural"), keywords: ["culture", "affinity", "themes", "cultural"] },
    { id: "benchmark", label: "Debut Benchmark", category: "Sections", icon: "📏", action: () => scrollTo("benchmark"), keywords: ["benchmark", "debut", "compare", "industry", "cnco", "latam"] },
    { id: "revenue", label: "Estimated Revenue", category: "Sections", icon: "💰", action: () => scrollTo("revenue-estimate"), keywords: ["revenue", "money", "earnings", "income", "estimate"] },
    { id: "comparison", label: "All Metrics Table", category: "Sections", icon: "📋", action: () => scrollTo("comparison"), keywords: ["table", "sort", "filter", "all metrics", "comparison"] },
    { id: "stream-proj", label: "Stream Projections", category: "Sections", icon: "🚀", action: () => scrollTo("stream-projections"), keywords: ["projections", "velocity", "eta", "milestone"] },
    { id: "historical", label: "Historical Trends", category: "Sections", icon: "📈", action: () => scrollTo("historical"), keywords: ["historical", "trends", "multi-date", "over time"] },
    { id: "release-pacing", label: "Release Pacing", category: "Sections", icon: "🏁", action: () => scrollTo("release-pacing"), keywords: ["pacing", "day zero", "release", "comparison"] },
    // Actions
    { id: "refresh", label: "Refresh Live Data", category: "Actions", icon: "🔄", action: () => onRefresh?.(), keywords: ["reload", "update", "fetch"] },
    { id: "print", label: "Print / Export PDF", category: "Actions", icon: "🖨️", action: () => window.print(), keywords: ["pdf", "export", "save"] },
    { id: "copy", label: "Copy Summary to Clipboard", category: "Actions", icon: "📋", action: () => document.querySelector<HTMLButtonElement>('[title*="Copy"]')?.click(), keywords: ["clipboard", "text", "share"] },
    { id: "guide", label: "Open Dashboard Guide", category: "Actions", icon: "📖", action: () => window.open("/guide", "_blank"), keywords: ["help", "documentation", "manual", "how", "tutorial"] },
    // Metrics (jump to their section)
    { id: "m-listeners", label: "Spotify Monthly Listeners", category: "Metrics", icon: "🎧", action: () => scrollTo("business"), keywords: ["spotify", "listeners", "monthly"] },
    { id: "m-streams", label: "Cross-Platform Streams", category: "Metrics", icon: "🎵", action: () => scrollTo("business"), keywords: ["streams", "total", "cross"] },
    { id: "m-sns", label: "SNS Footprint", category: "Metrics", icon: "📱", action: () => scrollTo("social"), keywords: ["social", "footprint", "followers"] },
    { id: "m-mentions", label: "Media Mentions", category: "Metrics", icon: "📰", action: () => scrollTo("pr"), keywords: ["meltwater", "mentions", "volume"] },
    { id: "m-nss", label: "Net Sentiment Score", category: "Metrics", icon: "😊", action: () => scrollTo("sentiment"), keywords: ["sentiment", "nss", "positive", "negative"] },
    { id: "m-yt", label: "YouTube Subscribers", category: "Metrics", icon: "▶️", action: () => scrollTo("business"), keywords: ["youtube", "subscribers", "subs"] },
  ], [onRefresh]);

  function scrollTo(id: string) {
    window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id } }));
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords?.some(k => k.includes(q))
    );
  }, [query, items]);

  const grouped = useMemo(() => {
    const groups: Record<string, PaletteItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  const execute = useCallback((item: PaletteItem) => {
    setOpen(false);
    setQuery("");
    setTimeout(() => item.action(), 100);
  }, []);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Arrow key navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        execute(filtered[activeIndex]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIndex, execute]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Reset active index on query change
  useEffect(() => { setActiveIndex(0); }, [query]);

  let flatIndex = -1;

  return (
    <>
      {/* Trigger button — small ⌘K badge, bottom-left, above keyboard shortcuts */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 print:hidden lg:bottom-4 lg:right-auto lg:left-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition-colors group"
        title="Search dashboard (⌘K)"
      >
        <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <kbd className="text-[9px] font-mono text-neutral-600 bg-white/[0.04] rounded px-1 py-0.5">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => { setOpen(false); setQuery(""); }}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed z-[101] top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-lg"
            >
              <div className="bg-neutral-900/95 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                  <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search sections, metrics, actions..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 outline-none"
                  />
                  <kbd className="text-[9px] font-mono text-neutral-600 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">ESC</kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
                  {filtered.length === 0 && (
                    <p className="text-sm text-neutral-600 text-center py-8">No results for &ldquo;{query}&rdquo;</p>
                  )}
                  {Object.entries(grouped).map(([category, categoryItems]) => (
                    <div key={category}>
                      <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-semibold px-4 pt-3 pb-1">{category}</p>
                      {categoryItems.map(item => {
                        flatIndex++;
                        const idx = flatIndex;
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={item.id}
                            data-index={idx}
                            onClick={() => execute(item)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive
                                ? "bg-violet-500/10 text-white"
                                : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                            }`}
                          >
                            <span className="text-sm w-6 text-center flex-shrink-0">{item.icon}</span>
                            <span className="text-sm flex-1 truncate">{item.label}</span>
                            {isActive && (
                              <kbd className="text-[9px] font-mono text-neutral-600 bg-white/[0.04] rounded px-1 py-0.5">↵</kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] font-mono text-neutral-600 bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5">↑↓</kbd>
                    <span className="text-[9px] text-neutral-600">navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] font-mono text-neutral-600 bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5">↵</kbd>
                    <span className="text-[9px] text-neutral-600">select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] font-mono text-neutral-600 bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5">esc</kbd>
                    <span className="text-[9px] text-neutral-600">close</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
