"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface AlertMetric {
  label: string;
  current: number;
  prior: number | null;
  category: "streaming" | "social" | "youtube" | "media" | "audience";
}

interface Alert {
  label: string;
  category: string;
  pctChange: number;
  absChange: number;
  current: number;
  severity: "spike" | "rise" | "dip" | "drop";
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const CATEGORY_ICONS: Record<string, string> = {
  streaming: "🎵",
  social: "📱",
  youtube: "▶️",
  media: "📰",
  audience: "👥",
};

const SEVERITY_CONFIG = {
  spike: { emoji: "🚀", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Spike" },
  rise: { emoji: "📈", color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", label: "Rise" },
  dip: { emoji: "📉", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", label: "Dip" },
  drop: { emoji: "🔻", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Drop" },
};

function getSeverity(pct: number): Alert["severity"] {
  if (pct >= 15) return "spike";
  if (pct >= 5) return "rise";
  if (pct <= -15) return "drop";
  return "dip";
}

export default function MetricAlerts({ metrics }: { metrics: AlertMetric[] }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const alerts = useMemo(() => {
    const result: Alert[] = [];
    for (const m of metrics) {
      if (m.prior == null || m.prior === 0) continue;
      const pctChange = ((m.current - m.prior) / m.prior) * 100;
      if (Math.abs(pctChange) < 5) continue; // Only show >=5% changes
      result.push({
        label: m.label,
        category: m.category,
        pctChange,
        absChange: m.current - m.prior,
        current: m.current,
        severity: getSeverity(pctChange),
      });
    }
    // Sort by absolute pct change, biggest first
    result.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));
    return result;
  }, [metrics]);

  const positiveCount = alerts.filter(a => a.pctChange > 0).length;
  const negativeCount = alerts.filter(a => a.pctChange < 0).length;
  const total = alerts.length;

  if (total === 0) return null;

  const badgeColor = negativeCount > positiveCount
    ? "bg-red-500"
    : negativeCount === 0
      ? "bg-emerald-500"
      : "bg-amber-500";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setDismissed(true); }}
        className="relative p-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
        aria-label={`${total} metric alerts`}
        title={`${total} notable metric changes`}
      >
        {/* Bell icon */}
        <svg
          className="w-4.5 h-4.5 text-neutral-400 group-hover:text-white transition-colors"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* Badge */}
        {total > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white px-1 ${badgeColor} ${!dismissed ? "animate-pulse" : ""}`}>
            {total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-black/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Metric Alerts</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {positiveCount > 0 && <span className="text-emerald-400">{positiveCount} rising</span>}
                  {positiveCount > 0 && negativeCount > 0 && <span> · </span>}
                  {negativeCount > 0 && <span className="text-red-400">{negativeCount} declining</span>}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white transition-colors text-lg">×</button>
            </div>

            {/* Alert list */}
            <div className="max-h-80 overflow-y-auto overscroll-contain">
              {alerts.map((alert, i) => {
                const cfg = SEVERITY_CONFIG[alert.severity];
                return (
                  <motion.div
                    key={alert.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm flex-shrink-0">{CATEGORY_ICONS[alert.category] || "📊"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-300 truncate">{alert.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold tabular-nums ${cfg.color}`}>
                            {alert.pctChange > 0 ? "+" : ""}{alert.pctChange.toFixed(1)}%
                          </span>
                          <span className="text-[9px] text-neutral-600">
                            ({alert.absChange > 0 ? "+" : ""}{fmt(alert.absChange)})
                          </span>
                          <span className="text-[9px] text-neutral-600">→ {fmt(alert.current)}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
              <p className="text-[9px] text-neutral-600 text-center">Showing changes ≥5% vs prior report</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
