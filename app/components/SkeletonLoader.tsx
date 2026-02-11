"use client";

/**
 * SkeletonLoader — Animated shimmer placeholders shown while data is loading.
 * Replaces stale content with pulse animations during date transitions.
 */

function Shimmer({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse rounded bg-white/[0.04] ${className}`} style={style} />
  );
}

function SkeletonMetricRow() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0 px-2 -mx-2">
      <Shimmer className="h-4 w-48" />
      <div className="flex items-center gap-4">
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-12 hidden sm:block" />
        <Shimmer className="h-5 w-14 rounded-md" />
      </div>
    </div>
  );
}

function SkeletonCard({ height = "h-32" }: { height?: string }) {
  return (
    <div className={`glass-hybe rounded-xl p-4 ${height}`}>
      <Shimmer className="h-3 w-20 mb-3" />
      <Shimmer className="h-6 w-28 mb-2" />
      <Shimmer className="h-3 w-16" />
    </div>
  );
}

function SkeletonChart({ height = "h-48" }: { height?: string }) {
  return (
    <div className={`bg-white/[0.02] rounded-xl border border-white/[0.04] p-4 ${height} flex flex-col justify-end`}>
      <div className="flex items-end gap-2 h-full">
        {[40, 65, 50, 80, 70, 55, 75, 60, 85, 45].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <Shimmer className="rounded-t" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonSection({ title, rows = 6 }: { title: string; rows?: number }) {
  return (
    <section className="glass-hybe rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shimmer className="w-8 h-8 rounded-lg" />
        <Shimmer className="h-5 w-56" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonMetricRow key={i} />
      ))}
    </section>
  );
}

export default function SkeletonLoader() {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero skeleton */}
      <section className="hero-bg rounded-3xl p-5 sm:p-8 md:p-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <Shimmer className="w-10 h-10 rounded-xl" />
            <div>
              <Shimmer className="h-4 w-48 mb-1" />
              <Shimmer className="h-3 w-32" />
            </div>
          </div>
          <Shimmer className="h-3 w-24" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Shimmer className="w-[120px] h-[120px] rounded-2xl flex-shrink-0" />
          <div className="space-y-3 flex-1 w-full">
            <Shimmer className="h-3 w-32 mx-auto md:mx-0" />
            <Shimmer className="h-10 w-72 mx-auto md:mx-0" />
            <Shimmer className="h-4 w-56 mx-auto md:mx-0" />
            <div className="flex gap-2 justify-center md:justify-start">
              {[1, 2, 3, 4].map(i => <Shimmer key={i} className="h-6 w-24 rounded-full" />)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-hybe rounded-xl p-3 text-center min-w-[120px]">
                <Shimmer className="h-2 w-12 mx-auto mb-2" />
                <Shimmer className="h-6 w-16 mx-auto mb-1" />
                <Shimmer className="h-4 w-10 mx-auto rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Highlights skeleton */}
      <section className="glass-hybe rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shimmer className="w-7 h-7 rounded-lg" />
          <Shimmer className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonCard key={i} />)}
        </div>
      </section>

      {/* Growth Velocity skeleton */}
      <SkeletonSection title="Growth Velocity" rows={8} />

      {/* Business Performance skeleton */}
      <SkeletonSection title="Business Performance Snapshot" rows={10} />

      {/* Daily Snapshot skeleton */}
      <section className="glass-hybe rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <Shimmer className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} height="h-40" />)}
        </div>
      </section>

      {/* Social Media skeleton */}
      <section className="glass-hybe rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <Shimmer className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <SkeletonChart height="h-56" />
      </section>

      {/* Charts skeleton */}
      <section className="glass-hybe rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <Shimmer className="h-5 w-44" />
        </div>
        <SkeletonChart height="h-64" />
      </section>
    </div>
  );
}

export { Shimmer, SkeletonMetricRow, SkeletonCard, SkeletonChart, SkeletonSection };
