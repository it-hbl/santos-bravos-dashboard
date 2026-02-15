"use client";

interface Props {
  currentNss: number;
  priorSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    nss: number;
  } | null;
  currentPositive: number;
  currentNegative: number;
  currentNeutral: number;
}

export default function SentimentShift({ currentNss, priorSentiment, currentPositive, currentNegative, currentNeutral }: Props) {
  if (!priorSentiment) return null;

  const nssShift = currentNss - priorSentiment.nss;
  const posShift = currentPositive - priorSentiment.positive;
  const negShift = currentNegative - priorSentiment.negative;
  const neuShift = currentNeutral - priorSentiment.neutral;

  const isImproving = nssShift > 0;
  const isSignificant = Math.abs(nssShift) > 3;

  const fmtShift = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(1) + "pp";

  return (
    <div className={`rounded-xl p-4 border mb-6 transition-all ${
      isImproving
        ? "bg-emerald-500/[0.04] border-emerald-500/20"
        : Math.abs(nssShift) < 1
          ? "bg-white/[0.02] border-white/[0.06]"
          : "bg-red-500/[0.04] border-red-500/20"
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Main NSS shift */}
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-black tabular-nums ${
            isImproving ? "text-emerald-400" : nssShift === 0 ? "text-neutral-400" : "text-red-400"
          }`}>
            {isImproving ? "↗" : nssShift === 0 ? "→" : "↘"}
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">
              Sentiment Shift vs Prior Period
            </p>
            <p className={`text-lg font-extrabold tabular-nums ${
              isImproving ? "text-emerald-400" : nssShift === 0 ? "text-neutral-300" : "text-red-400"
            }`}>
              {fmtShift(nssShift)} NSS
              {isSignificant && (
                <span className="ml-2 text-xs font-semibold opacity-70">
                  {isImproving ? "📈 Improving" : "📉 Declining"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Breakdown chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Positive", shift: posShift, color: posShift >= 0 ? "text-emerald-400" : "text-red-400" },
            { label: "Neutral", shift: neuShift, color: "text-neutral-500" },
            { label: "Negative", shift: negShift, color: negShift <= 0 ? "text-emerald-400" : "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/[0.05]">
              <p className="text-[8px] text-neutral-600 uppercase tracking-wider">{s.label}</p>
              <p className={`text-xs font-bold tabular-nums ${s.color}`}>{fmtShift(s.shift)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison bars */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[8px] text-neutral-600 uppercase tracking-wider mb-1">Prior Period</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.03]">
            <div className="bg-emerald-500/60 transition-all duration-700" style={{ width: `${priorSentiment.positive}%` }} />
            <div className="bg-neutral-600/60 transition-all duration-700" style={{ width: `${priorSentiment.neutral}%` }} />
            <div className="bg-red-500/60 transition-all duration-700" style={{ width: `${priorSentiment.negative}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-emerald-500/60 tabular-nums">{priorSentiment.positive}%</span>
            <span className="text-[8px] text-neutral-600 tabular-nums">NSS: {priorSentiment.nss > 0 ? "+" : ""}{priorSentiment.nss}</span>
            <span className="text-[8px] text-red-500/60 tabular-nums">{priorSentiment.negative}%</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] text-neutral-600 uppercase tracking-wider mb-1">Current Period</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.03]">
            <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${currentPositive}%` }} />
            <div className="bg-neutral-600 transition-all duration-700" style={{ width: `${currentNeutral}%` }} />
            <div className="bg-red-500 transition-all duration-700" style={{ width: `${currentNegative}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-emerald-400 tabular-nums">{currentPositive}%</span>
            <span className="text-[8px] text-neutral-500 tabular-nums">NSS: {currentNss > 0 ? "+" : ""}{currentNss}</span>
            <span className="text-[8px] text-red-400 tabular-nums">{currentNegative}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
