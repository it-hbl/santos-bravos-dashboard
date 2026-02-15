"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface KeyboardShortcutsProps {
  onRefresh?: () => void;
}

const SECTION_SHORTCUTS: { key: string; label: string; target: string }[] = [
  { key: "1", label: "Business Performance", target: "business" },
  { key: "2", label: "Social Media", target: "social" },
  { key: "3", label: "Audio Virality", target: "virality" },
  { key: "4", label: "Band Members", target: "members" },
  { key: "5", label: "Geo Signals", target: "geo" },
  { key: "6", label: "PR & Media", target: "pr" },
  { key: "7", label: "Fan Sentiment", target: "sentiment" },
];

/** Ordered list of all navigable section IDs for J/K cycling */
const ALL_SECTIONS = [
  { id: "hero", label: "Hero", emoji: "🏠" },
  { id: "highlights", label: "Key Highlights", emoji: "⭐" },
  { id: "growth-velocity", label: "Growth Velocity", emoji: "📈" },
  { id: "business", label: "Business Performance", emoji: "💼" },
  { id: "daily", label: "Daily Snapshot", emoji: "📊" },
  { id: "social", label: "Social Media", emoji: "📱" },
  { id: "charts", label: "Streaming Charts", emoji: "🎵" },
  { id: "virality", label: "Audio Virality", emoji: "🔥" },
  { id: "members", label: "Band Members", emoji: "👥" },
  { id: "geo", label: "Geo Signals", emoji: "🌍" },
  { id: "audience", label: "Audience Deep Dive", emoji: "🎧" },
  { id: "pr-media", label: "PR & Media", emoji: "📰" },
  { id: "fan-sentiment", label: "Fan Sentiment", emoji: "💚" },
  { id: "milestones", label: "Milestones", emoji: "🏆" },
  { id: "score", label: "Performance Score", emoji: "⚡" },
  { id: "track-radar", label: "Track Comparison", emoji: "🎯" },
  { id: "benchmark", label: "Debut Benchmark", emoji: "📐" },
  { id: "cultural-affinity", label: "Cultural Affinity", emoji: "🌎" },
];

const ACTION_SHORTCUTS: { key: string; label: string; action: string }[] = [
  { key: "j", label: "Next Section", action: "next-section" },
  { key: "k", label: "Previous Section", action: "prev-section" },
  { key: "h", label: "Go to Top", action: "home" },
  { key: "m", label: "Milestones", action: "milestones" },
  { key: "f", label: "Focus Current Section", action: "focus" },
  { key: "r", label: "Refresh Data", action: "refresh" },
  { key: "p", label: "Print / PDF", action: "print" },
  { key: "e", label: "Expand / Collapse All", action: "toggle-sections" },
  { key: "g", label: "Open Guide", action: "guide" },
  { key: "?", label: "Toggle Shortcuts", action: "help" },
];

/** Find the current section index based on scroll position */
function getCurrentSectionIndex(): number {
  const viewTop = window.scrollY + window.innerHeight * 0.3;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < ALL_SECTIONS.length; i++) {
    const el = document.getElementById(ALL_SECTIONS[i].id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const elTop = rect.top + window.scrollY;
    const dist = Math.abs(elTop - viewTop);
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  return bestIdx;
}

export default function KeyboardShortcuts({ onRefresh }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<{ emoji: string; label: string; index: number; total: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((sectionInfo: typeof ALL_SECTIONS[0], index: number) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ emoji: sectionInfo.emoji, label: sectionInfo.label, index, total: ALL_SECTIONS.length });
    toastTimer.current = setTimeout(() => setToast(null), 1500);
  }, []);

  const navigateSection = useCallback((direction: 1 | -1) => {
    const currentIdx = getCurrentSectionIndex();
    // Find next valid section (one that exists in the DOM)
    let nextIdx = currentIdx + direction;
    let attempts = 0;
    while (attempts < ALL_SECTIONS.length) {
      if (nextIdx < 0) nextIdx = ALL_SECTIONS.length - 1;
      if (nextIdx >= ALL_SECTIONS.length) nextIdx = 0;
      const el = document.getElementById(ALL_SECTIONS[nextIdx].id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { sectionId: ALL_SECTIONS[nextIdx].id } }));
        showToast(ALL_SECTIONS[nextIdx], nextIdx);
        return;
      }
      nextIdx += direction;
      attempts++;
    }
  }, [showToast]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key.toLowerCase();

      // Toggle help
      if (key === "?" || (key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Escape closes help
      if (key === "escape" && showHelp) {
        setShowHelp(false);
        return;
      }

      // J/K section navigation
      if (key === "j") {
        e.preventDefault();
        navigateSection(1);
        return;
      }
      if (key === "k") {
        e.preventDefault();
        navigateSection(-1);
        return;
      }

      // Section jumps 1-7 (auto-expand if collapsed)
      const section = SECTION_SHORTCUTS.find((s) => s.key === key);
      if (section) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { sectionId: section.target } }));
        document.getElementById(section.target)?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Action shortcuts
      if (key === "h") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (key === "m") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { sectionId: "milestones" } }));
        document.getElementById("milestones")?.scrollIntoView({ behavior: "smooth" });
      } else if (key === "f") {
        e.preventDefault();
        // Focus the currently-scrolled-to section
        const sectionIds = SECTION_SHORTCUTS.map(s => s.target);
        const extra = ["milestones", "score", "growth-velocity", "historical", "charts", "daily", "track-radar", "audience", "comparison", "benchmark", "revenue-estimate", "stream-projections", "release-pacing", "cultural-affinity"];
        const allIds = [...sectionIds, ...extra];
        let bestId: string | null = null;
        let bestDist = Infinity;
        const viewMid = window.innerHeight / 2;
        for (const id of allIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top + rect.height / 2 - viewMid);
          if (dist < bestDist) { bestDist = dist; bestId = id; }
        }
        if (bestId) {
          const { focusSection } = require("./FocusMode");
          const labelMap: Record<string, string> = {
            business: "Business Performance", social: "Social Media", virality: "Audio Virality",
            members: "Band Members", geo: "Geo Signals", pr: "PR & Media", sentiment: "Fan Sentiment",
            milestones: "Milestones", score: "Performance Score", "growth-velocity": "Growth Velocity",
            historical: "Historical Trends", charts: "Streaming Charts", daily: "Daily Snapshot",
            "track-radar": "Track Comparison", audience: "Audience Deep Dive", comparison: "All Metrics",
            benchmark: "Debut Benchmark", "revenue-estimate": "Revenue Estimate",
            "stream-projections": "Stream Projections", "release-pacing": "Release Pacing",
            "cultural-affinity": "Cultural Affinity",
          };
          focusSection(bestId, labelMap[bestId] || bestId);
        }
      } else if (key === "r") {
        e.preventDefault();
        onRefresh?.();
      } else if (key === "p") {
        e.preventDefault();
        window.print();
      } else if (key === "e") {
        e.preventDefault();
        // Toggle expand/collapse all sections
        const { toggleAllSections, areAllExpanded } = require("./CollapsibleSection");
        toggleAllSections(!areAllExpanded());
      } else if (key === "g") {
        e.preventDefault();
        window.open("/guide", "_blank");
      }
    },
    [showHelp, onRefresh, navigateSection]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Toast for J/K navigation
  const toastEl = toast ? (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] print:hidden pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-black/90 backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-2.5 shadow-2xl shadow-black/60 flex items-center gap-3">
        <span className="text-lg">{toast.emoji}</span>
        <div>
          <p className="text-xs font-bold text-white">{toast.label}</p>
          <p className="text-[9px] text-neutral-500 tabular-nums">{toast.index + 1} / {toast.total}</p>
        </div>
        <div className="flex gap-0.5 ml-2">
          {ALL_SECTIONS.map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === toast.index ? "bg-violet-400 scale-150" : "bg-white/10"}`} />
          ))}
        </div>
      </div>
    </div>
  ) : null;

  if (!showHelp) {
    return (
      <>
        {toastEl}
        <div className="fixed bottom-4 right-4 z-40 print:hidden">
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] text-neutral-500 hover:text-white hover:bg-white/[0.1] transition-all text-xs font-bold backdrop-blur-sm"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm print:hidden"
        onClick={() => setShowHelp(false)}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden pointer-events-none">
        <div
          className="pointer-events-auto bg-neutral-900/95 border border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white tracking-wide">⌨️ Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-neutral-500 hover:text-white transition-colors text-xs"
            >
              ESC
            </button>
          </div>

          {/* Section shortcuts */}
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-2">
            Jump to Section
          </p>
          <div className="space-y-1.5 mb-5">
            {SECTION_SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <kbd className="w-6 h-6 rounded bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-violet-400">
                  {s.key}
                </kbd>
                <span className="text-xs text-neutral-400">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Action shortcuts */}
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-2">
            Actions
          </p>
          <div className="space-y-1.5">
            {ACTION_SHORTCUTS.map((a) => (
              <div key={a.key} className="flex items-center gap-3">
                <kbd className="min-w-[24px] h-6 px-1.5 rounded bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-cyan-400">
                  {a.key === "?" ? "?" : a.key.toUpperCase()}
                </kbd>
                <span className="text-xs text-neutral-400">{a.label}</span>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-neutral-600 mt-4 text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-neutral-500">?</kbd> or <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-neutral-500">ESC</kbd> to close
          </p>
        </div>
      </div>
    </>
  );
}
