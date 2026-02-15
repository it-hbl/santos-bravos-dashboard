"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface TickerMetric {
  label: string;
  value: string;
  color: string;
  change?: string;
  positive?: boolean;
  sectionId?: string;
  sparkData?: number[];
}

const TICKER_SECTIONS = [
  { id: "hero", label: "Overview", icon: "🏠" },
  { id: "comparison", label: "All Metrics", icon: "📋" },
  { id: "highlights", label: "Highlights", icon: "⚡" },
  { id: "score", label: "Score", icon: "⚡" },
  { id: "milestones", label: "Goals", icon: "🎯" },
  { id: "velocity", label: "Growth", icon: "📊" },
  { id: "historical", label: "History", icon: "📈" },
  { id: "business", label: "§1 Business", icon: "1" },
  { id: "daily", label: "Daily", icon: "⚡" },
  { id: "charts", label: "Charts", icon: "📈" },
  { id: "social", label: "§2 Social", icon: "2" },
  { id: "virality", label: "§3 Virality", icon: "3" },
  { id: "track-radar", label: "Tracks", icon: "🎯" },
  { id: "members", label: "§4 Members", icon: "4" },
  { id: "geo", label: "§5 Geo", icon: "5" },
  { id: "audience", label: "Audience", icon: "📊" },
  { id: "pr", label: "§6 PR", icon: "6" },
  { id: "sentiment", label: "§7 Sentiment", icon: "7" },
  { id: "section-cultural", label: "§8 Culture", icon: "8" },
];

/** Tiny inline SVG sparkline for the ticker bar */
function MicroSparkline({ data, color, positive }: { data: number[]; color: string; positive?: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 28;
  const h = 12;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(" ");
  const strokeColor = positive === false ? "#f87171" : positive === true ? "#34d399" : "#a78bfa";
  return (
    <svg width={w} height={h} className="flex-shrink-0 opacity-70" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Single metric chip — used in both copies of the marquee */
function MetricChip({ m, index }: { m: TickerMetric; index: number }) {
  const handleClick = m.sectionId
    ? () => {
        window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id: m.sectionId } }));
        const el = document.getElementById(m.sectionId!);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    : undefined;

  const Wrapper = m.sectionId ? "button" : "div";
  return (
    <Wrapper
      className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
        m.sectionId ? "cursor-pointer hover:bg-white/[0.06] rounded-md px-1.5 py-0.5 transition-colors" : "px-1.5 py-0.5"
      }`}
      onClick={handleClick}
      title={m.sectionId ? `Jump to ${m.label}` : undefined}
    >
      {index > 0 && <div className="w-px h-3 bg-white/[0.08] -ml-1" />}
      <span className="text-[9px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">{m.label}</span>
      <span className={`text-xs sm:text-sm font-extrabold tabular-nums whitespace-nowrap ${m.color}`}>{m.value}</span>
      {m.sparkData && m.sparkData.length >= 2 && (
        <MicroSparkline data={m.sparkData} color={m.color} positive={m.positive} />
      )}
      {m.change && (
        <span className={`text-[9px] font-semibold px-1 py-0.5 rounded whitespace-nowrap ${
          m.positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
        }`}>
          {m.change}
        </span>
      )}
    </Wrapper>
  );
}

export default function StickyTicker({ metrics }: { metrics: TickerMetric[] }) {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const prevSectionRef = useRef<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);

      const threshold = window.innerHeight * 0.35;
      let current = "hero";
      for (const s of TICKER_SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= threshold) current = s.id;
      }
      const section = TICKER_SECTIONS.find(s => s.id === current);
      if (section && current !== "hero") {
        if (prevSectionRef.current !== current) {
          prevSectionRef.current = current;
          setAnimating(true);
          setTimeout(() => setAnimating(false), 300);
        }
        setActiveSection(section.label);
      } else {
        setActiveSection(null);
        prevSectionRef.current = null;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if content overflows (needs marquee) vs fits (static)
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      if (containerRef.current && trackRef.current) {
        // The track has 2 copies; use half width
        const trackW = trackRef.current.scrollWidth / 2;
        const containerW = containerRef.current.clientWidth;
        setNeedsMarquee(trackW > containerW);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [metrics]);

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const shouldAnimate = needsMarquee && !reducedMotion && !paused;

  return (
    <div
      className={`fixed top-[49px] left-0 right-0 z-40 transition-all duration-300 print:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-3 overflow-hidden">
          {/* Active section breadcrumb */}
          {activeSection && (
            <div className={`flex items-center gap-1.5 flex-shrink-0 transition-all duration-300 ${animating ? "opacity-0 translate-x-1" : "opacity-100 translate-x-0"}`}>
              <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider whitespace-nowrap">
                📍 {activeSection}
              </span>
              <div className="w-px h-3 bg-violet-500/30" />
            </div>
          )}

          {/* Marquee container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {/* Fade masks on edges when marquee is active */}
            {needsMarquee && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />
              </>
            )}

            <div
              ref={trackRef}
              className={`flex items-center ${needsMarquee ? "" : "justify-center"}`}
              style={shouldAnimate ? {
                animation: `ticker-scroll ${Math.max(20, metrics.length * 4)}s linear infinite`,
                width: "max-content",
              } : needsMarquee && reducedMotion ? {
                overflowX: "auto",
                width: "max-content",
              } : {}}
            >
              {/* First copy */}
              <div className="flex items-center gap-1 sm:gap-3">
                {metrics.map((m, i) => (
                  <MetricChip key={`a-${m.label}`} m={m} index={i} />
                ))}
              </div>
              {/* Second copy for seamless loop (only rendered when marquee active) */}
              {needsMarquee && (
                <div className="flex items-center gap-1 sm:gap-3 ml-6 sm:ml-10">
                  {metrics.map((m, i) => (
                    <MetricChip key={`b-${m.label}`} m={m} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Play/pause indicator — subtle, only when marquee is active */}
          {needsMarquee && (
            <button
              onClick={() => setPaused(p => !p)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-white/[0.03] hover:bg-white/[0.08] transition-colors ml-1"
              title={paused ? "Resume ticker" : "Pause ticker"}
            >
              {paused ? (
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-neutral-500" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-neutral-500" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
