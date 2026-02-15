"use client";

/**
 * ReportCompleteness — A compact ring indicator showing how many data sources
 * have been populated for the current report date. Helps the team know at a glance
 * whether a report is fully populated or still has gaps.
 *
 * Data sources checked:
 * 1. Spotify (listeners, followers)
 * 2. Track Streams (at least 1 track with streams > 0)
 * 3. YouTube (subscribers, video views)
 * 4. Social Media (SNS footprint > 0)
 * 5. Audio Virality (Cobrand audio views)
 * 6. Band Members (member follower data)
 * 7. Geo Data (country/city listeners)
 * 8. Audience Stats (Spotify for Artists deep dive)
 * 9. Daily Streams (24h Spotify snapshot)
 */

interface Props {
  listeners: number;
  followers: number;
  trackCount: number;
  hasTrackStreams: boolean;
  ytSubscribers: number;
  ytVideoCount: number;
  snsFootprint: number;
  audioViews: number;
  memberCount: number;
  geoCountryCount: number;
  audienceListeners: number;
  dailyStreamCount: number;
}

interface SourceStatus {
  name: string;
  icon: string;
  filled: boolean;
}

export default function ReportCompleteness({
  listeners,
  followers,
  trackCount,
  hasTrackStreams,
  ytSubscribers,
  ytVideoCount,
  snsFootprint,
  audioViews,
  memberCount,
  geoCountryCount,
  audienceListeners,
  dailyStreamCount,
}: Props) {
  const sources: SourceStatus[] = [
    { name: "Spotify Core", icon: "🎧", filled: listeners > 0 || followers > 0 },
    { name: "Track Streams", icon: "🎵", filled: hasTrackStreams },
    { name: "YouTube", icon: "▶️", filled: ytSubscribers > 0 || ytVideoCount > 0 },
    { name: "Social Media", icon: "📱", filled: snsFootprint > 0 },
    { name: "Audio Virality", icon: "🔥", filled: audioViews > 0 },
    { name: "Band Members", icon: "👥", filled: memberCount > 0 },
    { name: "Geo Data", icon: "🌍", filled: geoCountryCount > 0 },
    { name: "Audience Stats", icon: "📊", filled: audienceListeners > 0 },
    { name: "Daily Streams", icon: "⚡", filled: dailyStreamCount > 0 },
  ];

  const filled = sources.filter((s) => s.filled).length;
  const total = sources.length;
  const pct = Math.round((filled / total) * 100);

  // Ring dimensions
  const size = 28;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  // Color based on completeness
  const color =
    pct === 100
      ? "#10b981" // emerald — complete
      : pct >= 70
      ? "#f59e0b" // amber — mostly complete
      : "#ef4444"; // red — significant gaps

  const label =
    pct === 100
      ? "Complete"
      : pct >= 70
      ? "Partial"
      : "Incomplete";

  return (
    <div className="relative group">
      {/* Compact ring */}
      <div
        className="flex items-center gap-1.5 cursor-default"
        title={`Report ${pct}% complete — ${filled}/${total} data sources`}
      >
        <svg
          width={size}
          height={size}
          className="flex-shrink-0 -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
          />
        </svg>
        <span
          className="text-[9px] font-bold tabular-nums hidden sm:inline"
          style={{ color }}
        >
          {filled}/{total}
        </span>
      </div>

      {/* Hover tooltip with detailed breakdown */}
      <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-[100]">
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 px-4 py-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Data Sources
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                color,
                backgroundColor: `${color}15`,
              }}
            >
              {label}
            </span>
          </div>

          <div className="space-y-1">
            {sources.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 py-0.5"
              >
                <span className="text-xs">{s.icon}</span>
                <span
                  className={`text-[10px] flex-1 ${
                    s.filled ? "text-neutral-300" : "text-neutral-600 line-through"
                  }`}
                >
                  {s.name}
                </span>
                <span className="text-[10px]">
                  {s.filled ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <span className="text-neutral-700">—</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-2 pt-2 border-t border-white/[0.06]">
            <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-[9px] text-neutral-600 mt-1 text-center">
              {pct}% populated · {total - filled === 0 ? "All sources present" : `${total - filled} source${total - filled > 1 ? "s" : ""} missing`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
