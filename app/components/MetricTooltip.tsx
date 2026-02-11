"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface MetricTooltipProps {
  term: string;
  children: ReactNode;
}

const GLOSSARY: Record<string, string> = {
  "SPL": "Spotify Popularity Level — Spotify's internal 0–100 score based on recent stream velocity relative to other artists.",
  "Spotify Popularity Index": "Spotify's internal 0–100 score based on recent stream velocity. Higher = more currently trending.",
  "DoD": "Day-over-Day — percentage change compared to the previous report period.",
  "Monthly Listeners": "Unique Spotify users who played at least one track in the last 28 days. Fluctuates with playlist placements.",
  "Cross-Platform Streams": "Total audio/video plays across Spotify, YouTube, and TikTok combined.",
  "TikTok Creates": "Number of TikTok videos that used this song as their audio. Key virality indicator.",
  "IG Creates": "Number of Instagram Reels/Stories that used this song. Measures cross-platform virality.",
  "Canvas Views": "Views of Spotify's 8-second looping video on the Now Playing screen.",
  "Saves": "Times users added the track to their Spotify library. High save rate signals strong listener retention.",
  "SNS Footprint": "Total followers across all social networks (Instagram, TikTok, YouTube, Spotify, Weverse).",
  "Net Sentiment Score": "Positive mentions % minus Negative mentions %. Ranges from -100 (all negative) to +100 (all positive).",
  "Engagement Rate": "Likes + Comments divided by Views. Above 5% is excellent for music content.",
  "Unique Authors": "Distinct people/accounts that mentioned Santos Bravos in the reporting period.",
  "Buzz Ratio": "Media mentions per 1,000 followers — shows who gets disproportionate media attention relative to audience size.",
};

export default function MetricTooltip({ term, children }: MetricTooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<"above" | "below">("above");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos(rect.top < 120 ? "below" : "above");
    }
  }, [show]);

  const definition = GLOSSARY[term];
  if (!definition) return <>{children}</>;

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-1 cursor-help group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <span className="text-[8px] text-violet-400/60 group-hover:text-violet-400 transition-colors select-none">ⓘ</span>
      {show && (
        <span
          className={`absolute z-[100] left-0 w-64 px-3 py-2.5 rounded-xl text-[11px] leading-relaxed text-neutral-300 bg-neutral-900/95 border border-white/10 shadow-xl backdrop-blur-md pointer-events-none animate-fade-in ${
            pos === "above" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <span className="font-semibold text-violet-400 block mb-0.5">{term}</span>
          {definition}
        </span>
      )}
    </span>
  );
}
