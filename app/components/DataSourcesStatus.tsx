"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SourceStatus {
  key: string;
  label: string;
  icon: string;
  desc: string;
  endpoint: string | null;
  status: "idle" | "checking" | "healthy" | "degraded" | "error";
  latencyMs: number | null;
  lastChecked: Date | null;
  errorMsg: string | null;
}

const initialSources: SourceStatus[] = [
  { key: "sb", label: "Supabase", icon: "🗄️", desc: "Primary database — all metrics stored here", endpoint: "/api/dashboard?date=2026-02-09&check=1", status: "idle", latencyMs: null, lastChecked: null, errorMsg: null },
  { key: "cm", label: "Chartmetric", icon: "📊", desc: "Spotify listeners, popularity, track streams", endpoint: "/api/chartmetric", status: "idle", latencyMs: null, lastChecked: null, errorMsg: null },
  { key: "yt", label: "YouTube", icon: "▶️", desc: "Video views, likes, comments, subscribers", endpoint: "/api/youtube", status: "idle", latencyMs: null, lastChecked: null, errorMsg: null },
  { key: "mw", label: "Meltwater", icon: "📰", desc: "PR mentions, sentiment, hashtags, entities", endpoint: "/api/meltwater?days=7", status: "idle", latencyMs: null, lastChecked: null, errorMsg: null },
];

function timeAgo(date: Date | null): string {
  if (!date) return "never";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 5000) return "just now";
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  return `${Math.floor(diffMs / 3600000)}h ago`;
}

function StatusDot({ status }: { status: SourceStatus["status"] }) {
  const base = "w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300";
  switch (status) {
    case "checking":
      return (
        <div className={`${base} bg-amber-400`}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </div>
      );
    case "healthy":
      return <div className={`${base} bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]`} />;
    case "degraded":
      return <div className={`${base} bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]`} />;
    case "error":
      return <div className={`${base} bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]`} />;
    default:
      return <div className={`${base} bg-neutral-600`} />;
  }
}

function LatencyBar({ ms, status }: { ms: number | null; status: SourceStatus["status"] }) {
  if (ms == null || status === "idle" || status === "checking") return null;
  // Map latency to bar width: 0-200ms=green, 200-1000ms=amber, >1000ms=red
  const maxMs = 2000;
  const pct = Math.min(100, (ms / maxMs) * 100);
  const color = ms < 300 ? "bg-emerald-500" : ms < 1000 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full h-0.5 bg-white/[0.04] rounded-full overflow-hidden mt-1.5">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function DataSourcesStatus() {
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<SourceStatus[]>(initialSources);
  const [autoCheck, setAutoCheck] = useState(false);
  const [timeAgoTick, setTimeAgoTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick to update "time ago" displays
  useEffect(() => {
    const iv = setInterval(() => setTimeAgoTick(t => t + 1), 10000);
    return () => clearInterval(iv);
  }, []);

  const checkSource = useCallback(async (key: string) => {
    setSources(prev => prev.map(s => s.key === key ? { ...s, status: "checking", errorMsg: null } : s));
    const source = initialSources.find(s => s.key === key);
    if (!source?.endpoint) return;

    const start = performance.now();
    try {
      const res = await fetch(source.endpoint, { cache: "no-store" });
      const latency = Math.round(performance.now() - start);
      const isOk = res.ok;
      // Check if response has data (not just a 200 with error body)
      let errorMsg: string | null = null;
      if (!isOk) {
        try {
          const body = await res.json();
          errorMsg = body.error || `HTTP ${res.status}`;
        } catch {
          errorMsg = `HTTP ${res.status}`;
        }
      }

      setSources(prev => prev.map(s => s.key === key ? {
        ...s,
        status: isOk ? (latency > 1000 ? "degraded" : "healthy") : "error",
        latencyMs: latency,
        lastChecked: new Date(),
        errorMsg,
      } : s));
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setSources(prev => prev.map(s => s.key === key ? {
        ...s,
        status: "error",
        latencyMs: latency,
        lastChecked: new Date(),
        errorMsg: err.message || "Network error",
      } : s));
    }
  }, []);

  const checkAll = useCallback(async () => {
    // Stagger checks by 200ms to avoid hammering
    for (const src of initialSources) {
      checkSource(src.key);
      await new Promise(r => setTimeout(r, 200));
    }
  }, [checkSource]);

  // Auto-check when opened for the first time
  useEffect(() => {
    if (open && sources.every(s => s.status === "idle")) {
      checkAll();
    }
  }, [open, sources, checkAll]);

  // Auto-refresh every 60s if enabled
  useEffect(() => {
    if (autoCheck && open) {
      intervalRef.current = setInterval(checkAll, 60000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [autoCheck, open, checkAll]);

  const healthySources = sources.filter(s => s.status === "healthy").length;
  const totalSources = sources.length;
  const allHealthy = healthySources === totalSources;
  const anyError = sources.some(s => s.status === "error");
  const anyChecking = sources.some(s => s.status === "checking");

  const summaryColor = anyError ? "text-red-400" : allHealthy ? "text-emerald-400" : anyChecking ? "text-amber-400" : "text-neutral-500";
  const summaryText = anyChecking ? "Checking…" : anyError ? `${healthySources}/${totalSources} healthy` : allHealthy ? "All systems go" : `${healthySources}/${totalSources}`;

  return (
    <div className="print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors mx-auto group"
      >
        {/* Mini status dots */}
        <div className="flex items-center gap-1">
          {sources.map(s => (
            <div
              key={s.key}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                s.status === "healthy" ? "bg-emerald-400" :
                s.status === "degraded" ? "bg-amber-400" :
                s.status === "error" ? "bg-red-400" :
                s.status === "checking" ? "bg-amber-400 animate-pulse" :
                "bg-neutral-600"
              }`}
            />
          ))}
        </div>
        <span className="uppercase tracking-[0.15em] font-medium">API Status</span>
        <span className={`tabular-nums font-bold ${summaryColor} transition-colors`}>
          {summaryText}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={checkAll}
              disabled={anyChecking}
              className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                anyChecking
                  ? "text-neutral-600 bg-white/[0.02] cursor-wait"
                  : "text-violet-400 bg-violet-500/10 hover:bg-violet-500/20"
              }`}
            >
              {anyChecking ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Checking…
                </span>
              ) : "⚡ Check All"}
            </button>
            <button
              onClick={() => setAutoCheck(prev => !prev)}
              className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                autoCheck
                  ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                  : "text-neutral-500 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              {autoCheck ? "🔄 Auto (60s)" : "⏸ Auto"}
            </button>
          </div>

          {/* Source cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sources.map((src) => (
              <button
                key={src.key}
                onClick={() => checkSource(src.key)}
                className={`rounded-xl p-3.5 border transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${
                  src.status === "healthy"
                    ? "bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/40"
                    : src.status === "degraded"
                    ? "bg-amber-500/[0.04] border-amber-500/20 hover:border-amber-500/40"
                    : src.status === "error"
                    ? "bg-red-500/[0.04] border-red-500/20 hover:border-red-500/40"
                    : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]"
                }`}
                title="Click to re-check"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{src.icon}</span>
                  <span className="text-xs font-bold text-white flex-1">{src.label}</span>
                  <StatusDot status={src.status} />
                </div>
                <p className="text-[9px] text-neutral-600 mb-2 leading-relaxed">{src.desc}</p>

                {/* Status + latency row */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                    src.status === "healthy" ? "text-emerald-400" :
                    src.status === "degraded" ? "text-amber-400" :
                    src.status === "error" ? "text-red-400" :
                    src.status === "checking" ? "text-amber-400" :
                    "text-neutral-600"
                  }`}>
                    {src.status === "checking" ? "Pinging…" :
                     src.status === "healthy" ? "Healthy" :
                     src.status === "degraded" ? "Slow" :
                     src.status === "error" ? "Error" :
                     "Not checked"}
                  </span>
                  {src.latencyMs != null && src.status !== "checking" && (
                    <span className={`text-[9px] font-bold tabular-nums ${
                      src.latencyMs < 300 ? "text-emerald-400" :
                      src.latencyMs < 1000 ? "text-amber-400" :
                      "text-red-400"
                    }`}>
                      {src.latencyMs}ms
                    </span>
                  )}
                </div>

                {/* Latency bar */}
                <LatencyBar ms={src.latencyMs} status={src.status} />

                {/* Error message */}
                {src.errorMsg && (
                  <p className="text-[8px] text-red-400/80 mt-1.5 truncate" title={src.errorMsg}>
                    {src.errorMsg}
                  </p>
                )}

                {/* Last checked */}
                {src.lastChecked && (
                  <p className="text-[8px] text-neutral-700 mt-1.5">
                    Checked {timeAgo(src.lastChecked)}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Aggregate stats */}
          {sources.some(s => s.latencyMs != null) && (
            <div className="flex items-center justify-center gap-6 text-[9px] text-neutral-600">
              <span>
                Avg latency:{" "}
                <span className="text-white font-bold tabular-nums">
                  {Math.round(
                    sources.filter(s => s.latencyMs != null).reduce((sum, s) => sum + (s.latencyMs || 0), 0) /
                    sources.filter(s => s.latencyMs != null).length
                  )}ms
                </span>
              </span>
              <span>
                Slowest:{" "}
                <span className="text-amber-400 font-bold">
                  {sources.filter(s => s.latencyMs != null).sort((a, b) => (b.latencyMs || 0) - (a.latencyMs || 0))[0]?.label}
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
