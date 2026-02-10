"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface LiveChartmetricData {
  spotifyMonthlyListeners: number;
  spotifyFollowers: number;
  spotifyPopularity: number;
  instagramFollowers: number | null;
  tiktokFollowers: number | null;
  tracks: { id: number; name: string; spotifyStreams: number }[];
  fetchedAt: string | null;
}

interface LiveDataContextType {
  chartmetric: LiveChartmetricData | null;
  isLive: boolean;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const LiveDataContext = createContext<LiveDataContextType>({
  chartmetric: null,
  isLive: false,
  loading: true,
  error: null,
  lastFetched: null,
});

export function useLiveData() {
  return useContext(LiveDataContext);
}

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveDataContextType>({
    chartmetric: null,
    isLive: false,
    loading: true,
    error: null,
    lastFetched: null,
  });

  useEffect(() => {
    fetch("/api/chartmetric")
      .then(r => r.json())
      .then(res => {
        setState({
          chartmetric: res.data,
          isLive: res.live === true,
          loading: false,
          error: res.error ?? null,
          lastFetched: res.data?.fetchedAt ?? null,
        });
      })
      .catch(err => {
        setState(prev => ({ ...prev, loading: false, error: err.message }));
      });
  }, []);

  return (
    <LiveDataContext.Provider value={state}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function LiveBadge() {
  const { isLive, loading, lastFetched } = useLiveData();

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-[10px] text-yellow-400 font-semibold">LOADING</span>
      </div>
    );
  }

  if (isLive) {
    const time = lastFetched ? new Date(lastFetched).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
    return (
      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5" title={`Last fetched: ${time}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
        <span className="text-[10px] text-emerald-400 font-semibold">LIVE API</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-neutral-500/10 border border-neutral-500/20 rounded-lg px-2.5 py-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
      <span className="text-[10px] text-neutral-400 font-semibold">CACHED</span>
    </div>
  );
}
