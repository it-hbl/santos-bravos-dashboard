"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

interface LiveChartmetricData {
  spotifyMonthlyListeners: number;
  spotifyFollowers: number;
  spotifyPopularity: number;
  instagramFollowers: number | null;
  tiktokFollowers: number | null;
  tracks: { id: number; name: string; spotifyStreams: number }[];
  fetchedAt: string | null;
}

interface LiveYouTubeData {
  videos: { name: string; views: number; likes: number; comments: number }[];
  subscribers: number | null;
  totalChannelViews: number | null;
  fetchedAt: string | null;
}

interface LiveMeltwaterData {
  prMedia: {
    period: string;
    totalMentions: number;
    perDay: number;
    uniqueAuthors: number;
    timeSeries: { date: string; mentions: number }[];
    topCountries: { code: string; name: string; mentions: number; flag: string }[];
    topKeyphrases: { phrase: string; count: number }[];
    topSources: { name: string; count: number; type: string }[];
  };
  fanSentiment: {
    period: string;
    positive: { count: number; pct: number };
    negative: { count: number; pct: number };
    neutral: { count: number; pct: number };
    topHashtags: { tag: string; count: number; pct: number }[];
    topEntities?: { name: string; count: number; type: string }[];
    topSharedLinks?: { url: string; title: string; count: number }[];
  };
  fetchedAt: string | null;
}

interface LiveDataContextType {
  chartmetric: LiveChartmetricData | null;
  youtube: LiveYouTubeData | null;
  meltwater: LiveMeltwaterData | null;
  isLive: boolean;
  isYouTubeLive: boolean;
  isMeltwaterLive: boolean;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  refresh: () => void;
  secondsUntilRefresh: number;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const LiveDataContext = createContext<LiveDataContextType>({
  chartmetric: null,
  youtube: null,
  meltwater: null,
  isLive: false,
  isYouTubeLive: false,
  isMeltwaterLive: false,
  loading: true,
  error: null,
  lastFetched: null,
  refresh: () => {},
  secondsUntilRefresh: 0,
});

export function useLiveData() {
  return useContext(LiveDataContext);
}

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<LiveDataContextType, 'refresh' | 'secondsUntilRefresh'>>({
    chartmetric: null,
    youtube: null,
    meltwater: null,
    isLive: false,
    isYouTubeLive: false,
    isMeltwaterLive: false,
    loading: true,
    error: null,
    lastFetched: null,
  });
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(REFRESH_INTERVAL_MS / 1000);
  const lastFetchTime = useRef<number>(0);

  const fetchData = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    Promise.all([
      fetch("/api/chartmetric").then(r => r.json()).catch(() => null),
      fetch("/api/youtube").then(r => r.json()).catch(() => null),
      fetch("/api/meltwater").then(r => r.json()).catch(() => null),
    ]).then(([cmRes, ytRes, mwRes]) => {
      lastFetchTime.current = Date.now();
      setSecondsUntilRefresh(REFRESH_INTERVAL_MS / 1000);
      setState({
        chartmetric: cmRes?.data ?? null,
        youtube: ytRes?.data ?? null,
        meltwater: mwRes?.data ?? null,
        isLive: cmRes?.live === true,
        isYouTubeLive: ytRes?.live === true,
        isMeltwaterLive: mwRes?.live === true,
        loading: false,
        error: cmRes?.error ?? ytRes?.error ?? mwRes?.error ?? null,
        lastFetched: cmRes?.data?.fetchedAt ?? ytRes?.data?.fetchedAt ?? mwRes?.data?.fetchedAt ?? null,
      });
    });
  }, []);

  // Initial fetch + auto-refresh interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer (ticks every second)
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - lastFetchTime.current;
      const remaining = Math.max(0, Math.ceil((REFRESH_INTERVAL_MS - elapsed) / 1000));
      setSecondsUntilRefresh(remaining);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const contextValue: LiveDataContextType = {
    ...state,
    refresh: fetchData,
    secondsUntilRefresh,
  };

  return (
    <LiveDataContext.Provider value={contextValue}>
      {children}
    </LiveDataContext.Provider>
  );
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveBadge() {
  const { isLive, isYouTubeLive, isMeltwaterLive, loading, lastFetched, refresh, secondsUntilRefresh } = useLiveData();

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-[10px] text-yellow-400 font-semibold">LOADING</span>
      </div>
    );
  }

  const anyLive = isLive || isYouTubeLive || isMeltwaterLive;
  const sources = [isLive && "CM", isYouTubeLive && "YT", isMeltwaterLive && "MW"].filter(Boolean).join(" + ");
  const time = lastFetched ? new Date(lastFetched).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  if (anyLive) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5" title={`Live: ${sources} | Updated ${time}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
          <span className="text-[10px] text-emerald-400 font-semibold">LIVE</span>
          <span className="text-[9px] text-emerald-600 tabular-nums">{formatCountdown(secondsUntilRefresh)}</span>
        </div>
        <button
          onClick={refresh}
          className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-1.5 transition-all group"
          title={`Refresh now (${sources})`}
        >
          <svg className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1.5 bg-neutral-500/10 border border-neutral-500/20 rounded-lg px-2.5 py-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
        <span className="text-[10px] text-neutral-400 font-semibold">CACHED</span>
        <span className="text-[9px] text-neutral-600 tabular-nums">{formatCountdown(secondsUntilRefresh)}</span>
      </div>
      <button
        onClick={refresh}
        className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-1.5 transition-all group"
        title="Retry connection"
      >
        <svg className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 21h5v-5" />
        </svg>
      </button>
    </div>
  );
}
