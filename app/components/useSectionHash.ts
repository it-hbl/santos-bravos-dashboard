"use client";

import { useEffect, useRef } from "react";

/**
 * Syncs the URL hash with the currently visible dashboard section.
 * - On mount: if URL has a #hash, scroll to that section
 * - On scroll: update the hash to match the topmost visible section
 * - Enables shareable deep links like ?date=2026-02-09#pr
 */

const SECTION_IDS = [
  "hero",
  "release-timeline",
  "highlights",
  "comparison",
  "score",
  "milestones",
  "velocity",
  "historical",
  "business",
  "daily",
  "charts",
  "social",
  "virality",
  "track-radar",
  "members",
  "geo",
  "audience",
  "pr",
  "sentiment",
];

export default function useSectionHash() {
  const scrollingToHash = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    // On mount: scroll to hash if present
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        scrollingToHash.current = true;
        // Small delay to let dynamic components render
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => { scrollingToHash.current = false; }, 1200);
        }, 300);
      }
    }

    // On scroll: update hash to topmost visible section
    function onScroll() {
      if (scrollingToHash.current) return;
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY + 100; // offset for sticky nav
        let current = "";
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= scrollY) {
            current = id;
          }
        }
        // Only update if different from current hash (avoid history spam)
        const existing = window.location.hash.slice(1);
        if (current && current !== existing) {
          history.replaceState(null, "", current === "hero" ? window.location.pathname + window.location.search : `#${current}`);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);
}
