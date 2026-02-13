"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-violet-500/8 blur-[100px] pointer-events-none" />

      <div className="text-center max-w-lg relative z-10">
        {/* Error icon */}
        <div className="text-7xl mb-4 select-none">⚡</div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-red-400 via-rose-400 to-violet-400 bg-clip-text text-transparent mb-3">
          Something went wrong
        </h1>

        {/* Subtitle */}
        <p className="text-white/50 text-sm mb-2">
          The dashboard encountered an unexpected error.
        </p>

        {/* Error details (collapsible) */}
        {error?.message && (
          <details className="mb-6 text-left">
            <summary className="text-[10px] text-white/30 uppercase tracking-widest cursor-pointer hover:text-white/50 transition-colors text-center">
              Error details
            </summary>
            <div className="mt-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 max-h-32 overflow-auto">
              <code className="text-[11px] text-red-400/80 break-all font-mono">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-[9px] text-white/20 mt-1 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 font-medium hover:bg-violet-600/30 hover:border-violet-400/50 hover:text-violet-200 transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>↻</span>
            <span>Try Again</span>
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium hover:bg-white/[0.08] hover:text-white/80 transition-all duration-200"
          >
            <span>←</span>
            <span>Reload</span>
          </a>
        </div>

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
