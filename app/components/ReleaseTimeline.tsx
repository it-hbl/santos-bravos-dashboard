"use client";

import { useLiveData } from "./LiveDataProvider";
import { businessPerformance } from "../lib/data";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

const releases = [
  {
    date: "Jan 24, 2026",
    title: "Santos Bravos Debut",
    subtitle: "Group Announcement",
    icon: "🌟",
    color: "from-violet-500 to-purple-600",
    dotColor: "bg-violet-500",
    borderColor: "hover:border-violet-500/30",
    glowColor: "group-hover:shadow-violet-500/10",
    ytId: null as string | null,
    videoName: null as string | null,
  },
  {
    date: "Jan 31, 2026",
    title: "0% — Official MV",
    subtitle: "Debut Single Release",
    icon: "🎵",
    color: "from-emerald-500 to-green-600",
    dotColor: "bg-emerald-500",
    borderColor: "hover:border-emerald-500/30",
    glowColor: "group-hover:shadow-emerald-500/10",
    ytId: "ogmUm0xh8-w",
    videoName: "0% Official MV",
  },
  {
    date: "Feb 3, 2026",
    title: "0% — Portuguese Version",
    subtitle: "Lyric Video + Market Expansion",
    icon: "🇧🇷",
    color: "from-cyan-500 to-blue-600",
    dotColor: "bg-cyan-500",
    borderColor: "hover:border-cyan-500/30",
    glowColor: "group-hover:shadow-cyan-500/10",
    ytId: "_9tvZ5qoH_I",
    videoName: "0% Portuguese Lyric",
  },
  {
    date: "Feb 7, 2026",
    title: "KAWASAKI",
    subtitle: "Performance Video",
    icon: "🏍️",
    color: "from-pink-500 to-rose-600",
    dotColor: "bg-pink-500",
    borderColor: "hover:border-pink-500/30",
    glowColor: "group-hover:shadow-pink-500/10",
    ytId: "Cmy8CsYIUL0",
    videoName: "KAWASAKI Performance",
  },
];

export default function ReleaseTimeline() {
  const { youtube } = useLiveData();

  // Get view counts from live data or fallback
  const getViews = (videoName: string | null): number | null => {
    if (!videoName) return null;
    const liveMatch = youtube?.videos?.find((v) => v.name === videoName);
    if (liveMatch) return liveMatch.views;
    const fallbackMatch = businessPerformance.youtubeVideos.find((v) => v.name === videoName);
    if (fallbackMatch) return fallbackMatch.views.current;
    return null;
  };

  return (
    <div className="relative">
      {/* Horizontal connecting line */}
      <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden sm:block" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {releases.map((r, i) => {
          const views = getViews(r.videoName);
          return (
            <div
              key={r.title}
              className="relative group"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Timeline dot */}
              <div className="hidden sm:flex justify-center mb-4">
                <div className={`w-3 h-3 rounded-full ${r.dotColor} ring-4 ring-black/60 z-10 group-hover:scale-150 transition-transform duration-300`} />
              </div>

              {/* Card */}
              <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden ${r.borderColor} hover:bg-white/[0.05] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg ${r.glowColor}`}>
                {/* YouTube Thumbnail */}
                {r.ytId && (
                  <a
                    href={`https://youtube.com/watch?v=${r.ytId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-video overflow-hidden"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${r.ytId}/mqdefault.jpg`}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
                      <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* View count badge */}
                    {views && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-0.5 rounded-md tabular-nums">
                        ▶ {fmt(views)}
                      </div>
                    )}
                  </a>
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{r.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                        {r.date}
                      </p>
                      <p className="text-sm font-bold text-white mt-0.5 truncate">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {r.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Days since release */}
                  <div className="mt-3 pt-2 border-t border-white/[0.04]">
                    <DaysSince dateStr={r.date} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DaysSince({ dateStr }: { dateStr: string }) {
  const releaseDate = new Date(dateStr + ", 12:00:00");
  const now = new Date();
  const days = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return (
      <span className="text-[10px] text-amber-400 font-medium">
        📅 In {Math.abs(days)} days
      </span>
    );
  }

  return (
    <span className="text-[10px] text-neutral-500">
      <span className="text-neutral-300 font-semibold">{days}</span> days since release
    </span>
  );
}
