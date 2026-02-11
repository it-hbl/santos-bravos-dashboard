"use client";

const releases = [
  {
    date: "Jan 24, 2026",
    title: "Santos Bravos Debut",
    subtitle: "Group Announcement",
    icon: "🌟",
    color: "from-violet-500 to-purple-600",
    dotColor: "bg-violet-500",
  },
  {
    date: "Jan 31, 2026",
    title: "0% — Official MV",
    subtitle: "Debut Single Release",
    icon: "🎵",
    color: "from-emerald-500 to-green-600",
    dotColor: "bg-emerald-500",
  },
  {
    date: "Feb 3, 2026",
    title: "0% — Portuguese Version",
    subtitle: "Lyric Video + Market Expansion",
    icon: "🇧🇷",
    color: "from-cyan-500 to-blue-600",
    dotColor: "bg-cyan-500",
  },
  {
    date: "Feb 7, 2026",
    title: "KAWASAKI",
    subtitle: "Performance Video",
    icon: "🏍️",
    color: "from-pink-500 to-rose-600",
    dotColor: "bg-pink-500",
  },
];

export default function ReleaseTimeline() {
  return (
    <div className="relative">
      {/* Horizontal connecting line */}
      <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden sm:block" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {releases.map((r, i) => (
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
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 group-hover:-translate-y-0.5">
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
        ))}
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
