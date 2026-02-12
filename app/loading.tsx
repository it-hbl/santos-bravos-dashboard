export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/[0.08] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>
      <div className="relative flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 100 24" className="h-6 text-white/80" fill="currentColor">
            <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
          </svg>
          <div className="w-px h-5 bg-white/10" />
          <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Latin America</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
          SANTOS BRAVOS
        </h1>
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 rounded-full animate-loading-bar" />
        </div>
        <p className="text-xs text-neutral-500 uppercase tracking-widest">Loading Intelligence Dashboard</p>
      </div>
    </div>
  );
}
