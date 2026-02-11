"use client";

/**
 * WeekdayHeatmap – Shows which days of the week get the most media mentions.
 * Uses Meltwater time_series data to compute average mentions per weekday.
 * Helps PR teams identify optimal posting/announcement days.
 */

interface Props {
  timeSeries: { date: string; mentions: number }[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekdayHeatmap({ timeSeries }: Props) {
  if (!timeSeries || timeSeries.length < 3) return null;

  // Bucket mentions by day of week
  const buckets: Record<number, number[]> = {};
  for (let i = 0; i < 7; i++) buckets[i] = [];

  timeSeries.forEach((d) => {
    // Parse date like "Feb 3" or "Feb 10" — append current year
    const parsed = new Date(`${d.date}, 2026`);
    if (isNaN(parsed.getTime())) return;
    const dow = parsed.getDay(); // 0=Sun
    buckets[dow].push(d.mentions);
  });

  // Compute averages, map to Mon-Sun order
  const dowOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon=1 ... Sun=0
  const data = dowOrder.map((dow, i) => {
    const vals = buckets[dow];
    const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { day: DAYS[i], avg, count: vals.length };
  });

  const maxAvg = Math.max(...data.map((d) => d.avg), 1);
  const bestDay = data.reduce((a, b) => (a.avg > b.avg ? a : b));

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">
        📅 Best Day to Post
      </p>
      <div className="flex gap-1.5">
        {data.map((d) => {
          const intensity = d.avg / maxAvg;
          const isBest = d.day === bestDay.day && d.avg > 0;
          // Color scale: low=dark, high=bright violet
          const bg =
            d.avg === 0
              ? "bg-white/[0.02]"
              : intensity > 0.8
              ? "bg-violet-500"
              : intensity > 0.6
              ? "bg-violet-500/70"
              : intensity > 0.4
              ? "bg-violet-500/45"
              : intensity > 0.2
              ? "bg-violet-500/25"
              : "bg-violet-500/10";

          return (
            <div key={d.day} className="flex-1 text-center group relative">
              <div
                className={`${bg} rounded-lg py-3 transition-all duration-300 ${
                  isBest ? "ring-1 ring-violet-400/50" : ""
                }`}
              >
                <p className="text-[10px] font-bold tabular-nums text-white/80">
                  {d.avg > 0 ? d.avg.toLocaleString() : "—"}
                </p>
              </div>
              <p
                className={`text-[9px] mt-1 ${
                  isBest ? "text-violet-400 font-bold" : "text-neutral-600"
                }`}
              >
                {d.day}
              </p>
              {isBest && (
                <span className="text-[8px] text-violet-400 font-medium">⭐</span>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-300 whitespace-nowrap shadow-xl">
                  <span className="font-bold text-white">{d.day}</span>
                  <br />
                  Avg: {d.avg.toLocaleString()} mentions
                  {d.count > 0 && <><br />({d.count} data point{d.count > 1 ? "s" : ""})</>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-neutral-600 mt-2 text-center">
        Avg daily mentions by weekday · Best: <span className="text-violet-400 font-medium">{bestDay.day}</span> ({bestDay.avg.toLocaleString()}/day)
      </p>
    </div>
  );
}
