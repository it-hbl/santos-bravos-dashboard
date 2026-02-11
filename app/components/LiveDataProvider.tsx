"use client";

import { createContext, useContext, ReactNode } from "react";

interface LiveDataContextType {
  chartmetric: null;
  youtube: null;
  meltwater: null;
  isLive: boolean;
  isYouTubeLive: boolean;
  isMeltwaterLive: boolean;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  refresh: () => void;
  secondsUntilRefresh: number;
}

const LiveDataContext = createContext<LiveDataContextType>({
  chartmetric: null,
  youtube: null,
  meltwater: null,
  isLive: false,
  isYouTubeLive: false,
  isMeltwaterLive: false,
  loading: false,
  error: null,
  lastFetched: null,
  refresh: () => {},
  secondsUntilRefresh: 0,
});

export function useLiveData() {
  return useContext(LiveDataContext);
}

/**
 * LiveDataProvider — SIMPLIFIED
 * 
 * The dashboard now reads ALL data from Supabase via the date picker.
 * No more direct API calls from the frontend.
 * Data collection (Chartmetric, YouTube, Meltwater, etc.) is handled
 * by backend scripts that write to Supabase.
 */
export function LiveDataProvider({ children }: { children: ReactNode }) {
  const contextValue: LiveDataContextType = {
    chartmetric: null,
    youtube: null,
    meltwater: null,
    isLive: false,
    isYouTubeLive: false,
    isMeltwaterLive: false,
    loading: false,
    error: null,
    lastFetched: null,
    refresh: () => {},
    secondsUntilRefresh: 0,
  };

  return (
    <LiveDataContext.Provider value={contextValue}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
      <span className="text-[10px] text-emerald-400 font-semibold">SUPABASE</span>
    </div>
  );
}
