"use client";

/**
 * MarketPenetration — shows listeners as % of country population for top markets.
 * Reveals untapped potential: high-population countries with low penetration = growth opportunity.
 */

// Approximate populations (2025 estimates, millions)
const POPULATIONS: Record<string, number> = {
  Mexico: 130,
  Peru: 34,
  "United States": 335,
  Brazil: 216,
  Chile: 19.5,
  Colombia: 52,
  Argentina: 46,
  Ecuador: 18,
  Guatemala: 18,
  Spain: 47,
  Japan: 124,
};

interface Country {
  name: string;
  listeners: number;
  flag: string;
}

function penetrationRate(listeners: number, popMillions: number): number {
  return (listeners / (popMillions * 1_000_000)) * 100;
}

function formatPenetration(pct: number): string {
  if (pct >= 0.01) return pct.toFixed(2) + "%";
  return pct.toFixed(3) + "%";
}

function getRating(pct: number): { label: string; color: string; emoji: string } {
  if (pct >= 0.1) return { label: "Strong", color: "text-emerald-400", emoji: "🔥" };
  if (pct >= 0.05) return { label: "Growing", color: "text-green-400", emoji: "🚀" };
  if (pct >= 0.01) return { label: "Emerging", color: "text-yellow-400", emoji: "🌱" };
  return { label: "Untapped", color: "text-neutral-400", emoji: "🎯" };
}

export default function MarketPenetration({ countries }: { countries: Country[] }) {
  const withPenetration = countries
    .filter((c) => POPULATIONS[c.name])
    .map((c) => {
      const pop = POPULATIONS[c.name];
      const pct = penetrationRate(c.listeners, pop);
      const rating = getRating(pct);
      return { ...c, pop, pct, rating };
    })
    .sort((a, b) => b.pct - a.pct);

  if (withPenetration.length === 0) return null;

  const maxPct = withPenetration[0].pct;

  // Find the biggest "opportunity" — high population, low penetration
  const opportunity = [...withPenetration].sort((a, b) => {
    // Score = population × (1 - normalized penetration). Higher = more upside.
    const scoreA = a.pop * (1 - a.pct / maxPct);
    const scoreB = b.pop * (1 - b.pct / maxPct);
    return scoreB - scoreA;
  })[0];

  return (
    <div className="glass-hybe rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-[10px] font-black text-white">📊</div>
        <h3 className="text-sm font-bold tracking-tight text-white">Market Penetration Index</h3>
      </div>
      <p className="text-[10px] text-neutral-500 mb-4">Spotify listeners as % of country population — reveals growth headroom</p>

      <div className="space-y-2.5">
        {withPenetration.map((c, i) => (
          <div key={c.name} className="group">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{c.flag}</span>
                <span className="text-[11px] text-neutral-300 font-medium">{c.name}</span>
                {i === 0 && (
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                    #1 PENETRATION
                  </span>
                )}
                {c.name === opportunity?.name && i !== 0 && (
                  <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                    🎯 TOP OPPORTUNITY
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-medium ${c.rating.color}`}>
                  {c.rating.emoji} {c.rating.label}
                </span>
                <span className="text-[11px] font-bold text-white tabular-nums w-14 text-right">
                  {formatPenetration(c.pct)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-1000 ease-out"
                style={{ width: `${Math.max((c.pct / maxPct) * 100, 2)}%` }}
              />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-neutral-600">{c.listeners.toLocaleString()} listeners</span>
              <span className="text-[9px] text-neutral-600">{c.pop}M pop.</span>
            </div>
          </div>
        ))}
      </div>

      {opportunity && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/10">
          <p className="text-[10px] text-amber-300/80">
            <span className="font-bold">🎯 Biggest growth opportunity:</span>{" "}
            <span className="text-white font-semibold">{opportunity.flag} {opportunity.name}</span> —{" "}
            {opportunity.pop}M population at only {formatPenetration(opportunity.pct)} penetration.
            {opportunity.name === "Brazil" && " Portuguese-language content (0% PT) already targets this market."}
            {opportunity.name === "United States" && " Largest music market globally — huge upside with crossover content."}
          </p>
        </div>
      )}

      <p className="text-[8px] text-neutral-600 mt-3">
        Population estimates 2025. Penetration = Spotify monthly listeners ÷ total population. Higher % = stronger market hold.
      </p>
    </div>
  );
}
