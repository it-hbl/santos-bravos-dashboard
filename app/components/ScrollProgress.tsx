"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(100, (scrollTop / docHeight) * 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full rounded-r-full transition-[width] duration-75 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #8B5CF6, #6366F1, #06B6D4, #1DB954)",
        }}
      />
    </div>
  );
}
