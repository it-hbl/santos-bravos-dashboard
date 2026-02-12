"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-md w-full mx-4 relative z-10">
        {/* Card */}
        <div className="relative group">
          {/* Card glow border on hover */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-violet-500/20 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative bg-neutral-950/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-violet-500/5">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <svg viewBox="0 0 100 24" className="h-5 text-white" fill="currentColor">
                  <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
                </svg>
                <div className="w-px h-5 bg-white/10" />
                <span className="text-xs font-bold tracking-[0.2em] text-violet-400 uppercase">Latin America</span>
              </div>

              {/* Santos Bravos title with gradient */}
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400">
                  SANTOS BRAVOS
                </span>
              </h1>
              <p className="text-neutral-400 text-sm font-medium tracking-wide">Artist Intelligence Dashboard</p>
            </div>

            {/* Divider with gradient */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            {/* Sign in button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            {/* Footer */}
            <p className="text-center text-neutral-600 text-xs mt-6 tracking-wide">
              Authorized HYBE personnel only
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-neutral-700 text-[10px] uppercase tracking-[0.3em] mt-8">
          HYBE Latin America · Artist Intelligence Platform
        </p>
      </div>
    </div>
  );
}
