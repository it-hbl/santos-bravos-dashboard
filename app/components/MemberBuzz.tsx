"use client";

import { motion } from "framer-motion";

interface MemberBuzzProps {
  members: { name: string; followers: number }[];
  mentions: { name: string; count: number }[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return (n == null || isNaN(n)) ? "—" : n.toLocaleString();
}

const BAR_COLORS = [
  { followers: "bg-pink-500", mentions: "bg-violet-500" },
  { followers: "bg-cyan-500", mentions: "bg-violet-500" },
  { followers: "bg-rose-500", mentions: "bg-violet-500" },
  { followers: "bg-amber-500", mentions: "bg-violet-500" },
  { followers: "bg-emerald-500", mentions: "bg-violet-500" },
];

export default function MemberBuzz({ members, mentions }: MemberBuzzProps) {
  const maxFollowers = Math.max(...members.map(m => m.followers), 1);
  const maxMentions = Math.max(...mentions.map(m => m.count), 1);

  // Match mentions to members by first name
  const data = members.map((m, i) => {
    const firstName = m.name.split(" ")[0];
    const mention = mentions.find(mt =>
      mt.name.toLowerCase().includes(firstName.toLowerCase())
    );
    const mentionCount = mention?.count ?? 0;
    // Buzz ratio: mentions per 1K followers — higher = punching above weight
    const buzzRatio = m.followers > 0 ? (mentionCount / m.followers) * 1000 : 0;
    return { ...m, mentionCount, buzzRatio, index: i };
  });

  const maxBuzz = Math.max(...data.map(d => d.buzzRatio), 0.001);

  return (
    <div className="mt-5 pt-5 border-t border-white/[0.05]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">
          📢 Media Buzz vs Followers
        </p>
        <p className="text-[9px] text-neutral-600">
          Buzz Ratio = mentions per 1K followers
        </p>
      </div>

      <div className="space-y-3">
        {data.map((d, i) => {
          const followerPct = (d.followers / maxFollowers) * 100;
          const mentionPct = (d.mentionCount / maxMentions) * 100;
          const buzzPct = (d.buzzRatio / maxBuzz) * 100;
          const isTopBuzz = d.buzzRatio === maxBuzz;

          return (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-sm font-semibold text-neutral-300 w-36 truncate group-hover:text-white transition-colors">
                  {d.name}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {/* Followers bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${BAR_COLORS[i]?.followers ?? "bg-pink-500"}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${followerPct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 tabular-nums w-12 text-right">{fmt(d.followers)}</span>
                  </div>
                  {/* Mentions bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-violet-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${mentionPct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 + 0.3, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-violet-400 tabular-nums w-12 text-right">{fmt(d.mentionCount)}</span>
                  </div>
                </div>
                {/* Buzz ratio badge */}
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                  isTopBuzz
                    ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20"
                    : d.buzzRatio > maxBuzz * 0.6
                      ? "bg-violet-500/10 text-violet-400"
                      : "bg-white/[0.04] text-neutral-500"
                }`}>
                  {d.buzzRatio.toFixed(1)}
                  {isTopBuzz && " 🔥"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <span className="text-[9px] text-neutral-500">IG Followers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-[9px] text-neutral-500">Media Mentions (Meltwater)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded bg-amber-500/15 ring-1 ring-amber-500/20" />
          <span className="text-[9px] text-neutral-500">Buzz Ratio (mentions/1K followers)</span>
        </div>
      </div>
    </div>
  );
}
