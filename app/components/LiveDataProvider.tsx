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
}

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
});

export function useLiveData() {
  return useContext(LiveDataContext);
}

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveDataContextType>({
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

  useEffect(() => {
    Promise.all([
      fetch("/api/chartmetric").then(r => r.json()).catch(() => null),
      fetch("/api/youtube").then(r => r.json()).catch(() => null),
      fetch("/api/meltwater").then(r => r.json()).catch(() => null),
    ]).then(([cmRes, ytRes, mwRes]) => {
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

  return (
    <LiveDataContext.Provider value={state}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function LiveBadge() {
  const { isLive, isYouTubeLive, isMeltwaterLive, loading, lastFetched } = useLiveData();

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-[10px] text-yellow-400 font-semibold">LOADING</span>
      </div>
    );
  }

  const anyLive = isLive || isYouTubeLive || isMeltwaterLive;

  if (anyLive) {
    const time = lastFetched ? new Date(lastFetched).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
    const sources = [isLive && "CM", isYouTubeLive && "YT", isMeltwaterLive && "MW"].filter(Boolean).join(" + ");
    return (
      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5" title={`Live: ${sources} | ${time}`}>
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
