"use client";

import { useState, useMemo } from "react";

interface TableRow {
  metric: string;
  category: string;
  current: number;
  prior: number | null;
  change: number | null;
  changePct: number | null;
}

/** Tiny inline SVG sparkline (32×14px) showing prior→current trend */
function MiniTrend({ prior, current }: { prior: number | null; current: number }) {
  if (prior == null || isNaN(prior)) return null;
  const isUp = current >= prior;
  const color = isUp ? "#34d399" : "#f87171";
  // Generate 5 points with slight noise for visual interest
  const points: number[] = [];
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const eased = t * t * (3 - 2 * t); // smoothstep
    const base = prior + (current - prior) * eased;
    const range = Math.abs(current - prior) || 1;
    const noise = i > 0 && i < 4 ? (Math.sin(i * 2.7 + prior * 0.001) * range * 0.15) : 0;
    points.push(base + noise);
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 32, h = 14, pad = 1;
  const coords = points.map((v, i) => {
    const x = pad + (i / 4) * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="inline-block align-middle flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={coords[4].split(",")[0]} cy={coords[4].split(",")[1]} r={1.5} fill={color} />
    </svg>
  );
}

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

type SortKey = "metric" | "current" | "change" | "changePct";

const CATEGORY_COLORS: Record<string, string> = {
  spotify: "bg-emerald-500",
  youtube: "bg-red-500",
  social: "bg-cyan-500",
  virality: "bg-purple-500",
  media: "bg-violet-500",
  sentiment: "bg-rose-500",
  audience: "bg-amber-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  social: "Social",
  virality: "Virality",
  media: "PR & Media",
  sentiment: "Sentiment",
  audience: "Audience",
};

export default function ComparisonTable({ rows }: { rows: TableRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("changePct");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (rows.length === 0) return null;

  const categories = Array.from(new Set(rows.map(r => r.category)));

  const filtered = useMemo(() => {
    let result = filterCat ? rows.filter(r => r.category === filterCat) : rows;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(r => r.metric.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return result;
  }, [rows, filterCat, search]);

  const sorted = [...filtered].sort((a, b) => {
    let av: number | string, bv: number | string;
    switch (sortKey) {
      case "metric": av = a.metric; bv = b.metric; break;
      case "current": av = a.current; bv = b.current; break;
      case "change": av = a.change ?? 0; bv = b.change ?? 0; break;
      case "changePct": av = Math.abs(a.changePct ?? 0); bv = Math.abs(b.changePct ?? 0); break;
    }
    if (typeof av === "string" && typeof bv === "string") {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  // Find max absolute changePct for bar scaling
  const maxAbsPct = Math.max(...rows.map(r => Math.abs(r.changePct ?? 0)), 1);

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterCat(null)}
          className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
            !filterCat
              ? "bg-white/10 border-white/20 text-white font-bold"
              : "bg-white/[0.02] border-white/[0.06] text-neutral-500 hover:text-neutral-300"
          }`}
        >
          All ({rows.length})
        </button>
        {categories.map(cat => {
          const count = rows.filter(r => r.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5 ${
                filterCat === cat
                  ? "bg-white/10 border-white/20 text-white font-bold"
                  : "bg-white/[0.02] border-white/[0.06] text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[cat] || "bg-neutral-500"}`} />
              {CATEGORY_LABELS[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Search input */}
      <div className="mb-3 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search metrics…"
          className="w-full sm:w-64 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 pl-8 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-colors"
        />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] text-neutral-500 uppercase tracking-wider">
              <th className="text-left py-2 px-2 cursor-pointer hover:text-neutral-300 select-none" onClick={() => toggleSort("metric")}>
                Metric{arrow("metric")}
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-neutral-300 select-none w-24" onClick={() => toggleSort("current")}>
                Current{arrow("current")}
              </th>
              <th className="text-right py-2 px-2 w-20 hidden sm:table-cell">Prior</th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-neutral-300 select-none w-20 hidden sm:table-cell" onClick={() => toggleSort("change")}>
                Change{arrow("change")}
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-neutral-300 select-none w-28" onClick={() => toggleSort("changePct")}>
                % Change{arrow("changePct")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const pct = row.changePct;
              const isPositive = (pct ?? 0) >= 0;
              const barWidth = pct != null ? (Math.abs(pct) / maxAbsPct) * 100 : 0;
              return (
                <tr
                  key={`${row.metric}-${i}`}
                  className={`border-t border-white/[0.03] hover:bg-white/[0.04] transition-colors group ${i % 2 === 1 ? "bg-white/[0.015]" : ""}`}
                >
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[row.category] || "bg-neutral-500"}`} />
                      <span className="text-neutral-300 group-hover:text-white transition-colors truncate text-xs sm:text-sm">{row.metric}</span>
                      <MiniTrend prior={row.prior} current={row.current} />
                    </div>
                  </td>
                  <td className="text-right py-2.5 px-2 font-bold text-white tabular-nums text-xs sm:text-sm">{fmt(row.current)}</td>
                  <td className="text-right py-2.5 px-2 text-neutral-600 tabular-nums text-xs hidden sm:table-cell">{fmt(row.prior)}</td>
                  <td className="text-right py-2.5 px-2 tabular-nums text-xs hidden sm:table-cell">
                    {row.change != null ? (
                      <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
                        {isPositive ? "+" : ""}{fmt(row.change)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="text-right py-2.5 px-2 w-28">
                    {pct != null ? (
                      <div className="flex items-center justify-end gap-2">
                        {/* Mini bar */}
                        <div className="w-12 h-1.5 bg-white/[0.04] rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}{pct.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="py-8 text-center text-neutral-600 text-xs">
          No metrics match {search ? `"${search}"` : "this filter"}
        </div>
      )}

      {/* Summary row */}
      <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-neutral-500">
        <span>{sorted.length} metric{sorted.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""} · sorted by {sortKey === "changePct" ? "% change" : sortKey}{sortAsc ? " (asc)" : " (desc)"}</span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400">{sorted.filter(r => (r.changePct ?? 0) > 0).length} ↑</span>
          <span className="text-red-400">{sorted.filter(r => (r.changePct ?? 0) < 0).length} ↓</span>
          <span className="text-neutral-600">{sorted.filter(r => r.changePct == null).length} —</span>
        </div>
      </div>
    </div>
  );
}
