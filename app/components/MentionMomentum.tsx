"use client";

interface Props {
  timeSeries: { date: string; mentions: number }[];
  totalMentions: number;
}

export default function MentionMomentum({ timeSeries, totalMentions }: Props) {
  if (!timeSeries || timeSeries.length < 3) return null;

  const days = timeSeries;
  const len = days.length;

  // Split into first half and second half
  const mid = Math.floor(len / 2);
  const firstHalf = days.slice(0, mid);
  const secondHalf = days.slice(mid);

  const avgFirst = firstHalf.reduce((s, d) => s + d.mentions, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, d) => s + d.mentions, 0) / secondHalf.length;

  // Momentum: % change from first half avg to second half avg
  const momentum = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
  const isUp = momentum > 5;
  const isDown = momentum < -5;

  // Peak day
  const peak = days.reduce((best, d) => (d.mentions > best.mentions ? d : best), days[0]);
  const avg = totalMentions / len;
  const peakAboveAvg = avg > 0 ? ((peak.mentions - avg) / avg) * 100 : 0;

  // Last 3 days trend (slope)
  const last3 = days.slice(-3);
  const slopePoints = last3.map((d, i) => ({ x: i, y: d.mentions }));
  const xMean = slopePoints.reduce((s, p) => s + p.x, 0) / slopePoints.length;
  const yMean = slopePoints.reduce((s, p) => s + p.y, 0) / slopePoints.length;
  const slope = slopePoints.reduce((s, p) => s + (p.x - xMean) * (p.y - yMean), 0) /
    (slopePoints.reduce((s, p) => s + (p.x - xMean) ** 2, 0) || 1);

  // Velocity label
  let velocityLabel: string;
  let velocityEmoji: string;
  let velocityColor: string;
  if (slope > 100) {
    velocityLabel = "Surging";
    velocityEmoji = "🚀";
    velocityColor = "text-emerald-400";
  } else if (slope > 20) {
    velocityLabel = "Accelerating";
    velocityEmoji = "📈";
    velocityColor = "text-emerald-400";
  } else if (slope > -20) {
    velocityLabel = "Steady";
    velocityEmoji = "➡️";
    velocityColor = "text-neutral-400";
  } else if (slope > -100) {
    velocityLabel = "Decelerating";
    velocityEmoji = "📉";
    velocityColor = "text-amber-400";
  } else {
    velocityLabel = "Declining";
    velocityEmoji = "⬇️";
    velocityColor = "text-red-400";
  }

  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">
        📊 Media Momentum
      </p>

      {/* Main momentum indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-3xl ${velocityColor}`} style={{ lineHeight: 1 }}>
          {velocityEmoji}
        </div>
        <div>
          <p className={`text-lg font-extrabold ${velocityColor}`}>
            {velocityLabel}
          </p>
          <p className="text-[10px] text-neutral-500">
            {isUp ? "+" : ""}{momentum.toFixed(1)}% half-over-half
          </p>
        </div>
      </div>

      {/* Mini stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Daily velocity */}
        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Daily Slope</p>
          <p className={`text-sm font-bold tabular-nums mt-0.5 ${slope >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {slope >= 0 ? "+" : ""}{slope.toFixed(0)} /day
          </p>
        </div>

        {/* Average per day */}
        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Avg / Day</p>
          <p className="text-sm font-bold tabular-nums mt-0.5 text-white">
            {Math.round(avg).toLocaleString()}
          </p>
        </div>

        {/* Peak day */}
        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Peak Day</p>
          <p className="text-sm font-bold tabular-nums mt-0.5 text-violet-400">
            {peak.date}
          </p>
          <p className="text-[9px] text-neutral-500 mt-0.5">
            {peak.mentions.toLocaleString()} mentions
          </p>
        </div>

        {/* Peak vs average */}
        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Peak vs Avg</p>
          <p className={`text-sm font-bold tabular-nums mt-0.5 ${peakAboveAvg > 0 ? "text-emerald-400" : "text-neutral-400"}`}>
            {peakAboveAvg > 0 ? "+" : ""}{peakAboveAvg.toFixed(0)}%
          </p>
          <p className="text-[9px] text-neutral-500 mt-0.5">above average</p>
        </div>
      </div>

      {/* Mini bar chart of daily mentions */}
      <div className="mt-3 pt-3 border-t border-white/[0.04]">
        <div className="flex items-end gap-1 h-12">
          {days.map((d, i) => {
            const maxMentions = Math.max(...days.map(x => x.mentions), 1);
            const heightPct = (d.mentions / maxMentions) * 100;
            const isPeak = d === peak;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.date}: ${d.mentions.toLocaleString()}`}>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${isPeak ? "bg-violet-400" : "bg-white/10"}`}
                  style={{
                    height: `${heightPct}%`,
                    minHeight: "2px",
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 mt-1">
          {days.map(d => (
            <div key={d.date} className="flex-1 text-center">
              <span className="text-[7px] text-neutral-600 tabular-nums">{d.date.replace(/\s\d+$/, "").slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
