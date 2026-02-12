"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";

/**
 * FocusMode — presentation overlay that isolates a single dashboard section.
 * Activated via CustomEvent "sb-focus-section" with detail { sectionId, title }.
 * Press Escape or click the close button to exit.
 */

interface FocusState {
  active: boolean;
  sectionId: string | null;
  title: string | null;
}

export function useFocusMode() {
  const [focus, setFocus] = useState<FocusState>({ active: false, sectionId: null, title: null });

  useEffect(() => {
    const handleFocus = (e: Event) => {
      const { sectionId, title } = (e as CustomEvent).detail || {};
      if (sectionId) {
        setFocus({ active: true, sectionId, title: title || sectionId });
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focus.active) {
        setFocus({ active: false, sectionId: null, title: null });
      }
    };

    window.addEventListener("sb-focus-section", handleFocus);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("sb-focus-section", handleFocus);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [focus.active]);

  const exit = useCallback(() => {
    setFocus({ active: false, sectionId: null, title: null });
  }, []);

  return { ...focus, exit };
}

export function FocusOverlay({
  active,
  sectionId,
  title,
  onExit,
}: {
  active: boolean;
  sectionId: string | null;
  title: string | null;
  onExit: () => void;
}) {
  const [cloned, setCloned] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !sectionId) {
      setCloned(null);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active, sectionId]);

  if (!active || !sectionId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onExit(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Focus Mode</span>
          <span className="text-white/30">·</span>
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-600 text-xs hidden sm:block">ESC to exit</span>
          <button
            onClick={onExit}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center transition-colors"
            aria-label="Exit focus mode"
          >
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content — portal the actual section */}
      <FocusSectionPortal sectionId={sectionId} />
    </div>
  );
}

function FocusSectionPortal({ sectionId }: { sectionId: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      // Clone the section's visual content
      setHtml(el.innerHTML);
    }
  }, [sectionId]);

  if (!html) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
        Section not found
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-8">
      <div
        className="max-w-6xl mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** Trigger focus mode for a section */
export function focusSection(sectionId: string, title?: string) {
  window.dispatchEvent(
    new CustomEvent("sb-focus-section", { detail: { sectionId, title } })
  );
}
