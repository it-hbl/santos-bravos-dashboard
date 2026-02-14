"use client";

import { useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { focusSection } from "./FocusMode";

const STORAGE_KEY = "sb-collapsed-sections";

/** Dispatch a global expand-all or collapse-all event */
export function toggleAllSections(expand: boolean) {
  window.dispatchEvent(new CustomEvent("sb-toggle-all", { detail: { expand } }));
  // Also update localStorage
  if (expand) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Check if all sections are currently expanded (no collapsed keys in storage) */
export function areAllExpanded(): boolean {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.keys(state).length === 0;
  } catch {
    return true;
  }
}

function getCollapsed(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setCollapsed(id: string, collapsed: boolean) {
  const state = getCollapsed();
  if (collapsed) state[id] = true;
  else delete state[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function CollapsibleSection({
  id,
  number,
  title,
  subtitle,
  color,
  children,
  defaultOpen = true,
  trend,
  collapsedSummary,
}: {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  color: string;
  children: ReactNode;
  defaultOpen?: boolean;
  trend?: { value: string; positive: boolean } | null;
  collapsedSummary?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [linkCopied, setLinkCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = getCollapsed();
    if (id in saved) setOpen(!saved[id]);
  }, [id]);

  // Auto-expand when navigated to via URL hash or section nav click
  useEffect(() => {
    const expandIfTarget = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === id) {
        setOpen(true);
        setCollapsed(id, false);
      }
    };
    // Check on mount (URL hash on page load)
    expandIfTarget();
    // Listen for hash changes (section nav clicks use replaceState, so also listen for custom event)
    window.addEventListener("hashchange", expandIfTarget);
    const scrollHandler = (e: Event) => {
      const targetId = (e as CustomEvent).detail?.id;
      if (targetId === id) {
        setOpen(true);
        setCollapsed(id, false);
      }
    };
    window.addEventListener("sb-scroll-to-section", scrollHandler);
    return () => {
      window.removeEventListener("hashchange", expandIfTarget);
      window.removeEventListener("sb-scroll-to-section", scrollHandler);
    };
  }, [id]);

  // Listen for global expand/collapse all events
  useEffect(() => {
    const handler = (e: Event) => {
      const expand = (e as CustomEvent).detail?.expand;
      setOpen(expand);
      if (!expand) {
        setCollapsed(id, true);
      }
      // localStorage cleared by toggleAllSections for expand
    };
    window.addEventListener("sb-toggle-all", handler);
    return () => window.removeEventListener("sb-toggle-all", handler);
  }, [id]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      setCollapsed(id, prev); // prev=true means we're closing
      return !prev;
    });
  }, [id]);

  const copyLink = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.hash = id;
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setLinkCopied(false), 1500);
    });
  }, [id]);

  return (
    <div>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between mb-4 group cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-[11px] font-black text-white`}
          >
            {number}
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Copy section link button */}
          <button
            onClick={copyLink}
            className="w-6 h-6 rounded-md bg-white/[0.03] hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            title={linkCopied ? "Link copied!" : "Copy link to this section"}
            aria-label={`Copy link to ${title}`}
          >
            {linkCopied ? (
              <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-neutral-500 hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>
          {/* Focus mode button */}
          <button
            onClick={(e) => { e.stopPropagation(); focusSection(id, title); }}
            className="w-6 h-6 rounded-md bg-white/[0.03] hover:bg-violet-500/20 border border-transparent hover:border-violet-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Focus mode — isolate this section (presentation view)"
            aria-label={`Focus on ${title}`}
          >
            <svg className="w-3 h-3 text-neutral-500 hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          {/* Trend badge — visible when collapsed */}
          {trend && !open && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                trend.positive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest hidden sm:inline">
              {subtitle}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-all duration-300 ${
              open ? "rotate-0" : "-rotate-90"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {/* Collapsed summary line */}
      {!open && collapsedSummary && (
        <p className="text-[11px] text-neutral-500 -mt-2 mb-1 pl-11 truncate leading-relaxed">
          {collapsedSummary}
        </p>
      )}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
