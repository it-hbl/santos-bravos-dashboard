"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface KPI {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  emoji: string;
  color: string;
  sectionId?: string;
}

interface QuickPeekProps {
  kpis: KPI[];
}

/**
 * QuickPeek — Press "P" to toggle a floating overlay with key metrics.
 * Instant data at a glance without scrolling. Click a KPI to jump to its section.
 */
export default function QuickPeek({ kpis }: QuickPeekProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "p" || e.key === "P") {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const navigateToSection = useCallback((sectionId?: string) => {
    if (!sectionId) return;
    setOpen(false);
    window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id: sectionId } }));
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Close on backdrop click
  const handleBackdrop = useCallback(() => setOpen(false), []);

  // Current time for the header
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
    };
    update();
    if (!open) return;
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center print:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleBackdrop}
      />

      {/* Panel */}
      <div className="relative bg-neutral-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 w-[90vw] max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">⚡</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Quick Peek</h3>
              <p className="text-[9px] text-neutral-500">{now} · Press P to close</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-6 h-6 rounded-md bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-px bg-white/[0.04] p-px">
          {kpis.map((kpi, i) => (
            <button
              key={kpi.label}
              onClick={() => navigateToSection(kpi.sectionId)}
              className={`bg-neutral-900/95 p-4 text-left transition-all hover:bg-white/[0.03] ${
                kpi.sectionId ? "cursor-pointer" : "cursor-default"
              } ${i === 0 ? "rounded-tl-xl" : ""} ${i === 1 ? "rounded-tr-xl" : ""} ${
                i === kpis.length - 2 ? "rounded-bl-xl" : ""
              } ${i === kpis.length - 1 ? "rounded-br-xl" : ""}`}
              title={kpi.sectionId ? `Jump to ${kpi.label}` : undefined}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs">{kpi.emoji}</span>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-medium truncate">{kpi.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-lg font-extrabold tabular-nums ${kpi.color}`}>{kpi.value}</span>
                {kpi.change && (
                  <span className={`text-[10px] font-bold tabular-nums ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.positive ? "↑" : "↓"} {kpi.change}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-3 px-4 py-2.5 border-t border-white/[0.06]">
          <span className="text-[9px] text-neutral-600">Click a metric to jump to its section</span>
          <span className="text-neutral-800">·</span>
          <span className="flex items-center gap-1 text-[9px] text-neutral-600">
            <kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-500 font-mono text-[8px]">P</kbd>
            toggle
          </span>
        </div>
      </div>
    </div>
  );
}
