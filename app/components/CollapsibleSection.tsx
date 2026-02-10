"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";

const STORAGE_KEY = "sb-collapsed-sections";

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
}: {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  color: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const saved = getCollapsed();
    if (id in saved) setOpen(!saved[id]);
  }, [id]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      setCollapsed(id, prev); // prev=true means we're closing
      return !prev;
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
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
