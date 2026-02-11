"use client";

interface Mention {
  handle: string;
  count: number;
}

export default function TopInfluencers({ mentions }: { mentions: Mention[] }) {
  if (!mentions || mentions.length === 0) return null;

  const max = mentions[0]?.count || 1;
  const total = mentions.reduce((s, m) => s + m.count, 0);

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">
        Top Mentions <span className="text-neutral-700">(X / Twitter)</span>
      </p>
      <div className="space-y-1.5">
        {mentions.slice(0, 8).map((m, i) => {
          const pct = ((m.count / total) * 100).toFixed(1);
          const isOfficial = m.handle.toLowerCase().includes("santos") || m.handle.toLowerCase().includes("hybe");
          return (
            <a
              key={m.handle}
              href={`https://x.com/${m.handle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group hover:bg-white/[0.02] rounded-lg px-1.5 py-1 -mx-1.5 transition-colors"
            >
              <span className="text-[9px] text-neutral-700 w-4 text-right tabular-nums font-medium">{i + 1}</span>
              <span className={`text-sm flex-1 truncate transition-colors ${isOfficial ? "text-violet-400 group-hover:text-violet-300" : "text-cyan-400 group-hover:text-cyan-300"}`}>
                {m.handle.startsWith("@") ? m.handle : `@${m.handle}`}
              </span>
              <div className="w-14 bg-white/[0.04] rounded-full h-1.5 overflow-hidden flex-shrink-0">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isOfficial ? "bg-violet-500" : "bg-cyan-500"}`}
                  style={{ width: `${(m.count / max) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums text-neutral-400 w-12 text-right">{m.count.toLocaleString()}</span>
              <span className="text-[9px] text-neutral-600 w-10 text-right tabular-nums">{pct}%</span>
            </a>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-white/[0.03] flex items-center justify-between px-1.5">
        <span className="text-[9px] text-neutral-600">Total mentions of handles</span>
        <span className="text-[10px] font-bold text-neutral-500 tabular-nums">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
