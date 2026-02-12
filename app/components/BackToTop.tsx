"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-20 lg:bottom-6 right-4 z-50 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-violet-600/80 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 print:hidden ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-90 pointer-events-none"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12V4" />
        <path d="M4 7l4-4 4 4" />
      </svg>
    </button>
  );
}
