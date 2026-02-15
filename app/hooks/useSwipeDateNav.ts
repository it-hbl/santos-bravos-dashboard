"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook that detects horizontal swipe gestures on the dashboard
 * and navigates to the next/previous report date.
 * 
 * Swipe left → next (newer) date
 * Swipe right → previous (older) date
 * 
 * Minimum 80px horizontal movement, max 60px vertical drift.
 * Ignores swipes on scrollable/interactive elements.
 */
export default function useSwipeDateNav(
  selectedDate: string,
  availableDates: string[],
  onDateChange: (date: string) => void,
  enabled = true,
) {
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((direction: "newer" | "older" | "none", dateName?: string) => {
    // Remove existing toast
    if (toastRef.current) {
      toastRef.current.remove();
      toastRef.current = null;
    }

    if (direction === "none") {
      const el = document.createElement("div");
      el.className = "swipe-toast swipe-toast-edge";
      el.textContent = "No more dates";
      document.body.appendChild(el);
      toastRef.current = el;
      setTimeout(() => el.classList.add("swipe-toast-visible"), 10);
      setTimeout(() => {
        el.classList.remove("swipe-toast-visible");
        setTimeout(() => el.remove(), 300);
      }, 1200);
      return;
    }

    const el = document.createElement("div");
    el.className = "swipe-toast";
    el.innerHTML = `<span class="swipe-toast-arrow">${direction === "newer" ? "→" : "←"}</span> <span>${dateName || ""}</span>`;
    document.body.appendChild(el);
    toastRef.current = el;
    setTimeout(() => el.classList.add("swipe-toast-visible"), 10);
    setTimeout(() => {
      el.classList.remove("swipe-toast-visible");
      setTimeout(() => el.remove(), 300);
    }, 1500);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const MIN_SWIPE_X = 80;
    const MAX_DRIFT_Y = 60;

    function onTouchStart(e: TouchEvent) {
      // Skip if touching interactive elements
      const target = e.target as HTMLElement;
      if (
        target.closest("input, textarea, select, button, a, iframe, [data-no-swipe]") ||
        target.closest(".recharts-wrapper") // don't interfere with chart interactions
      ) return;

      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    }

    function onTouchEnd(e: TouchEvent) {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.t;
      touchStart.current = null;

      // Must be primarily horizontal, within 500ms
      if (Math.abs(dx) < MIN_SWIPE_X || Math.abs(dy) > MAX_DRIFT_Y || dt > 500) return;

      const currentIdx = availableDates.indexOf(selectedDate);
      if (currentIdx === -1) return;

      if (dx < 0) {
        // Swipe left → newer date (lower index since dates are sorted descending)
        if (currentIdx > 0) {
          const newDate = availableDates[currentIdx - 1];
          showToast("newer", formatDateShort(newDate));
          onDateChange(newDate);
        } else {
          showToast("none");
        }
      } else {
        // Swipe right → older date (higher index)
        if (currentIdx < availableDates.length - 1) {
          const newDate = availableDates[currentIdx + 1];
          showToast("older", formatDateShort(newDate));
          onDateChange(newDate);
        } else {
          showToast("none");
        }
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, selectedDate, availableDates, onDateChange, showToast]);
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
