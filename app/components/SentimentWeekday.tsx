"use client";

/**
 * SentimentWeekday – Heatmap showing average positive sentiment % by day of week.
 * Helps content teams identify which days generate the best audience reception.
 * Uses sentimentTimeline data (daily positive/neutral/negative counts).
 */

interface TimelineEntry {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface Props {
  timeline: TimelineEntry[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SentimentWeekday({ timeline }: Props) {
  if (!timeline || timeline.length < 3) return null;

  // Bucket positive % by day of week
  const buckets: Record<number, number[]> = {};
  for (let i = 0; i < 7; i++) buckets[i] = [];

  timeline.forEach((d) => {
    const parsed = new Date(`${d.date}, 2026`);
    if (isNaN(parsed.getTime())) return;
    const dow = parsed.getDay(); // 0=Sun
    const posPct = d.total > 0 ? (d.positive / d.total) * 100 : 0;
    buckets[dow].push(posPct);
  });

  // Mon-Sun order
  const dowOrder = [1, 2, 3, 4, 5, 6, 0];
  const data = dowOrder.map((dow, i) => {
    const vals = buckets[dow];
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    // Also compute avg negative %
    const negVals = buckets[dow].length > 0 ? timeline.filter(t => {
      const p = new Date(`${t.date}, 2026`);
      return !isNaN(p.getTime()) && p.getDay() === dow;
    }).map(t => t.total > 0 ? (t.negative / t.total) * 100 : 0) : [];
    const avgNeg = negVals.length > 0 ? negVals.reduce((a, b) => a + b, 0) / negVals.length : 0;
    return { day: DAYS[i], avgPos: avg, avgNeg, count: vals.length };
  });

  const maxPos = Math.max(...data.map((d) => d.avgPos), 1);
  const bestDay = data.reduce((a, b) => (a.avgPos > b.avgPos ? a : b));
  const worstDay = data.filter(d => d.count > 0).reduce((a, b) => (a.avgPos < b.avgPos ? a : b), data[0]);

  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">
        💚 Best Days for Positive Sentiment
      </p>
      <div className="flex gap-1.5">
        {data.map((d) => {
          const intensity = d.count > 0 ? d.avgPos / maxPos : 0;
          const isBest = d.day === bestDay.day && d.avgPos > 0;
          const isWorst = d.day === worstDay.day && d.count > 0 && d.day !== bestDay.day;
          const bg =
            d.count === 0
              ? "bg-white/[0.02]"
              : intensity > 0.9
              ? "bg-emerald-500"
              : intensity > 0.75
              ? "bg-emerald-500/70"
              : intensity > 0.6
              ? "bg-emerald-500/45"
              : intensity > 0.45
              ? "bg-emerald-500/25"
              : "bg-emerald-500/10";

          return (
            <div key={d.day} className="flex-1 text-center group relative">
              <div
                className={`${bg} rounded-lg py-3 transition-all duration-300 ${
                  isBest ? "ring-1 ring-emerald-400/50" : isWorst ? "ring-1 ring-red-400/30" : ""
                }`}
              >
                <p className="text-[10px] font-bold tabular-nums text-white/80">
                  {d.count > 0 ? `${d.avgPos.toFixed(0)}%` : "—"}
                </p>
              </div>
              <p
                className={`text-[9px] mt-1 ${
                  isBest ? "text-emerald-400 font-bold" : isWorst ? "text-red-400 font-medium" : "text-neutral-600"
                }`}
              >
                {d.day}
              </p>
              {isBest && <span className="text-[8px] text-emerald-400 font-medium">💚</span>}
              {isWorst && <span className="text-[8px] text-red-400 font-medium">⚠️</span>}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-300 whitespace-nowrap shadow-xl">
                  <span className="font-bold text-white">{d.day}</span>
                  <br />
                  <span className="text-emerald-400">Positive: {d.avgPos.toFixed(1)}%</span>
                  <br />
                  <span className="text-red-400">Negative: {d.avgNeg.toFixed(1)}%</span>
                  <br />
                  Net: <span className={d.avgPos - d.avgNeg > 0 ? "text-emerald-400" : "text-red-400"}>{(d.avgPos - d.avgNeg) > 0 ? "+" : ""}{(d.avgPos - d.avgNeg).toFixed(1)}</span>
                  {d.count > 0 && <><br />({d.count} data point{d.count > 1 ? "s" : ""})</>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-neutral-600 mt-2 text-center">
        Avg positive sentiment % by weekday · Best: <span className="text-emerald-400 font-medium">{bestDay.day}</span> ({bestDay.avgPos.toFixed(0)}%)
        {worstDay.day !== bestDay.day && <> · Lowest: <span className="text-red-400 font-medium">{worstDay.day}</span> ({worstDay.avgPos.toFixed(0)}%)</>}
      </p>
    </div>
  );
}
