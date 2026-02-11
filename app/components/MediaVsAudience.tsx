"use client";

interface CountryData {
  code: string;
  name: string;
  flag?: string;
  mentions?: number;
  listeners?: number;
}

interface Props {
  mediaCountries: { code: string; name: string; mentions: number; flag: string }[];
  listenerCountries: { country: string; listeners: number; flag: string }[];
}

export default function MediaVsAudience({ mediaCountries, listenerCountries }: Props) {
  // Merge countries by matching names/codes
  const countryMap = new Map<string, CountryData>();

  // Normalize country names for matching
  const nameMap: Record<string, string> = {
    "United States": "US", "Peru": "PE", "Mexico": "MX", "Brazil": "BR",
    "Japan": "JP", "Argentina": "AR", "Chile": "CL", "Colombia": "CO",
    "Spain": "ES", "Ecuador": "EC", "Guatemala": "GT",
  };

  for (const c of mediaCountries) {
    countryMap.set(c.code, { code: c.code, name: c.name, flag: c.flag, mentions: c.mentions });
  }

  for (const c of listenerCountries) {
    const code = nameMap[c.country] || c.country.substring(0, 2).toUpperCase();
    const existing = countryMap.get(code);
    if (existing) {
      existing.listeners = c.listeners;
    } else {
      countryMap.set(code, { code, name: c.country, flag: c.flag, listeners: c.listeners });
    }
  }

  // Get all countries, sort by total combined relevance
  const merged = Array.from(countryMap.values())
    .filter(c => c.mentions || c.listeners)
    .sort((a, b) => ((b.mentions || 0) + (b.listeners || 0)) - ((a.mentions || 0) + (a.listeners || 0)))
    .slice(0, 8);

  if (merged.length === 0) return null;

  const maxMentions = Math.max(...merged.map(c => c.mentions || 0), 1);
  const maxListeners = Math.max(...merged.map(c => c.listeners || 0), 1);

  // Compute index mismatch: where media share >> listener share or vice versa
  const totalMentions = merged.reduce((s, c) => s + (c.mentions || 0), 0) || 1;
  const totalListeners = merged.reduce((s, c) => s + (c.listeners || 0), 0) || 1;

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">
        Media vs Audience Geography
      </p>
      <p className="text-[9px] text-neutral-600 mb-4">Where conversation happens vs where listeners are</p>

      {/* Legend */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
          <span className="text-[9px] text-neutral-500">Media Mentions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[9px] text-neutral-500">Spotify Listeners</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {merged.map((c, i) => {
          const mentionPct = (c.mentions || 0) / maxMentions * 100;
          const listenerPct = (c.listeners || 0) / maxListeners * 100;
          const mentionShare = ((c.mentions || 0) / totalMentions * 100).toFixed(0);
          const listenerShare = ((c.listeners || 0) / totalListeners * 100).toFixed(0);

          // Detect mismatch
          const mShare = (c.mentions || 0) / totalMentions;
          const lShare = (c.listeners || 0) / totalListeners;
          const gap = mShare - lShare;
          let badge = "";
          if (Math.abs(gap) > 0.08) {
            badge = gap > 0 ? "📢 Media hot" : "🎧 Listener hub";
          }

          return (
            <div
              key={c.code}
              className="group bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{c.flag || "🌍"}</span>
                  <span className="text-xs text-neutral-300 font-medium">{c.name}</span>
                  {badge && (
                    <span className="text-[8px] bg-white/[0.06] rounded-full px-1.5 py-0.5 text-neutral-400">
                      {badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Dual bars */}
              <div className="space-y-1">
                {/* Media bar */}
                <div className="flex items-center gap-2">
                  <div className="w-full bg-white/[0.03] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-violet-400 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${mentionPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold tabular-nums text-violet-400 w-16 text-right shrink-0">
                    {(c.mentions || 0).toLocaleString()} <span className="text-neutral-600">({mentionShare}%)</span>
                  </span>
                </div>
                {/* Listener bar */}
                <div className="flex items-center gap-2">
                  <div className="w-full bg-white/[0.03] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${listenerPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold tabular-nums text-emerald-400 w-16 text-right shrink-0">
                    {(c.listeners || 0).toLocaleString()} <span className="text-neutral-600">({listenerShare}%)</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[8px] text-neutral-600 mt-3 italic">
        📢 = high media share vs listener share · 🎧 = high listener share vs media share
      </p>
    </div>
  );
}
