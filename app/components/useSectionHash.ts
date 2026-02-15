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
    // Flash highlight effect when navigating to a section
    function handleSectionNav(e: Event) {
      const id = (e as CustomEvent).detail?.id;
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      // Find the nearest glass-hybe section container (or use the element itself)
      const target = el.closest(".glass-hybe") || el.querySelector(".glass-hybe") || el;
      target.classList.remove("section-highlight-flash", "section-highlight-flash-done");
      // Force reflow to restart animation
      void (target as HTMLElement).offsetWidth;
      target.classList.add("section-highlight-flash");
      setTimeout(() => {
        target.classList.remove("section-highlight-flash");
        target.classList.add("section-highlight-flash-done");
        setTimeout(() => target.classList.remove("section-highlight-flash-done"), 100);
      }, 1200);
    }
    window.addEventListener("sb-scroll-to-section", handleSectionNav);

    // On mount: scroll to hash if present
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        scrollingToHash.current = true;
        // Small delay to let dynamic components render
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
          // Trigger flash on the target section
          window.dispatchEvent(new CustomEvent("sb-scroll-to-section", { detail: { id: hash } }));
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
      window.removeEventListener("sb-scroll-to-section", handleSectionNav);
      cancelAnimationFrame(rafId.current);
    };
  }, []);
}
