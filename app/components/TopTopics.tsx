"use client";

interface TopTopicsProps {
  topics: { topic: string; count: number }[];
}

export default function TopTopics({ topics }: TopTopicsProps) {
  if (!topics || topics.length === 0) return null;

  const maxCount = topics[0]?.count || 1;

  // Map topics to bubble sizes (min 0.7, max 1.0 scale)
  const sized = topics.map((t) => ({
    ...t,
    scale: 0.7 + 0.3 * (t.count / maxCount),
    pct: ((t.count / maxCount) * 100).toFixed(0),
  }));

  const colors = [
    "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-300",
    "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300",
    "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-300",
    "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300",
    "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300",
    "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-300",
    "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-300",
    "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
    "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300",
    "from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-300",
  ];

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">
        Conversation Topics
      </p>
      <div className="flex flex-wrap gap-2">
        {sized.map((t, i) => (
          <div
            key={t.topic}
            className={`
              bg-gradient-to-br ${colors[i % colors.length]}
              border rounded-full px-3 py-1.5
              transition-all duration-300 hover:scale-105 hover:shadow-lg
              cursor-default group
            `}
            style={{ fontSize: `${Math.max(10, 10 + (t.scale - 0.7) * 10)}px` }}
            title={`${t.topic}: ${t.count?.toLocaleString() ?? "—"} mentions`}
          >
            <span className="font-semibold">{t.topic}</span>
            <span className="ml-1.5 text-[9px] opacity-60 font-bold tabular-nums group-hover:opacity-100 transition-opacity">
              {t.count?.toLocaleString() ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
