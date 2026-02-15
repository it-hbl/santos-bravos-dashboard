"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HeroParallax — wraps the hero section and applies a scroll-linked
 * fade + scale + blur effect as the user scrolls down, creating a
 * cinematic transition into the data sections.
 *
 * Uses requestAnimationFrame for buttery-smooth 60fps updates.
 * Respects prefers-reduced-motion (disables all transforms).
 */
export default function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (!el) return;
        const scrollY = window.scrollY;
        const threshold = 600; // fully faded by this scroll distance

        if (scrollY <= 0) {
          el.style.opacity = "1";
          el.style.transform = "scale(1) translateY(0px)";
          el.style.filter = "blur(0px)";
          return;
        }

        if (scrollY >= threshold) {
          el.style.opacity = "0";
          el.style.transform = "scale(0.96) translateY(-24px)";
          el.style.filter = "blur(6px)";
          return;
        }

        const progress = scrollY / threshold;
        // Ease-out cubic for smoother feel
        const eased = 1 - Math.pow(1 - progress, 3);

        const opacity = 1 - eased * 0.85; // fades to 0.15
        const scale = 1 - eased * 0.04; // scales to 0.96
        const translateY = eased * -24; // lifts up 24px
        const blur = eased * 6; // blurs to 6px

        el.style.opacity = String(opacity);
        el.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        el.style.filter = `blur(${blur}px)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial state

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className="will-change-[transform,opacity,filter] origin-top"
      style={{ transition: "none" }}
    >
      {children}
    </div>
  );
}
