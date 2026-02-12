"use client";

import { useEffect, useState, useCallback } from "react";

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

const ACTION_SHORTCUTS: { key: string; label: string; action: string }[] = [
  { key: "h", label: "Go to Top", action: "home" },
  { key: "m", label: "Milestones", action: "milestones" },
  { key: "r", label: "Refresh Data", action: "refresh" },
  { key: "p", label: "Print / PDF", action: "print" },
  { key: "e", label: "Expand / Collapse All", action: "toggle-sections" },
  { key: "?", label: "Toggle Shortcuts", action: "help" },
];

export default function KeyboardShortcuts({ onRefresh }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

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

      // Section jumps 1-7
      const section = SECTION_SHORTCUTS.find((s) => s.key === key);
      if (section) {
        e.preventDefault();
        document.getElementById(section.target)?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Action shortcuts
      if (key === "h") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (key === "m") {
        e.preventDefault();
        document.getElementById("milestones")?.scrollIntoView({ behavior: "smooth" });
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
      }
    },
    [showHelp, onRefresh]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) {
    return (
      <div className="fixed bottom-4 right-4 z-40 print:hidden">
        <button
          onClick={() => setShowHelp(true)}
          className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] text-neutral-500 hover:text-white hover:bg-white/[0.1] transition-all text-xs font-bold backdrop-blur-sm"
          title="Keyboard shortcuts (?)"
        >
          ?
        </button>
      </div>
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
