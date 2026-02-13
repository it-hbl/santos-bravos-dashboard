import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />

      <div className="text-center max-w-md relative z-10">
        {/* Big 404 with gradient */}
        <h1 className="text-[8rem] sm:text-[10rem] font-black leading-none bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent select-none">
          404
        </h1>

        {/* Subtitle */}
        <p className="text-white/70 text-lg mt-2 mb-1">Page not found</p>
        <p className="text-white/40 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Back to dashboard button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 font-medium hover:bg-violet-600/30 hover:border-violet-400/50 hover:text-violet-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>

        {/* Branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-white/20 text-xs">
          <span className="font-semibold tracking-wider">HYBE</span>
          <span>·</span>
          <span>Latin America</span>
        </div>
      </div>
    </div>
  );
}
