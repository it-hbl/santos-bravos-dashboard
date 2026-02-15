"use client";

import { useState, useCallback } from "react";
import { toPng } from "html-to-image";

interface ScreenshotButtonProps {
  /** Optional target element ID — captures that section. If omitted, captures the full page. */
  targetId?: string;
  reportDate?: string;
}

export default function ScreenshotButton({ targetId, reportDate }: ScreenshotButtonProps) {
  const [capturing, setCapturing] = useState(false);
  const [done, setDone] = useState(false);

  const handleCapture = useCallback(async () => {
    setCapturing(true);
    try {
      const node = targetId
        ? document.getElementById(targetId)
        : document.getElementById("dashboard-root") || document.body;

      if (!node) {
        setCapturing(false);
        return;
      }

      // Hide elements that shouldn't be in the screenshot
      const hideSelectors = [
        "[data-no-screenshot]",
        ".print\\:hidden",
      ];
      const hidden: HTMLElement[] = [];
      hideSelectors.forEach((sel) => {
        node.querySelectorAll(sel).forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.display !== "none") {
            hidden.push(htmlEl);
          }
        });
      });

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2, // Retina quality
        backgroundColor: "#050507", // Match dashboard bg
        filter: (domNode) => {
          // Skip sticky nav, mobile nav, back-to-top, floating elements
          if (domNode instanceof HTMLElement) {
            if (domNode.getAttribute("data-no-screenshot") !== null) return false;
          }
          return true;
        },
      });

      // Create download
      const datePart = reportDate
        ? reportDate.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
        : new Date().toISOString().slice(0, 10);
      const sectionPart = targetId ? `-${targetId}` : "";
      const filename = `santos-bravos${sectionPart}-${datePart}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      console.error("Screenshot failed:", err);
    } finally {
      setCapturing(false);
    }
  }, [targetId, reportDate]);

  return (
    <button
      onClick={handleCapture}
      disabled={capturing}
      data-no-screenshot
      className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 rounded-lg px-2.5 py-1.5 transition-all group disabled:opacity-50 disabled:cursor-wait"
      title={targetId ? "Screenshot this section" : "Screenshot dashboard"}
    >
      {capturing ? (
        <>
          <svg className="w-3.5 h-3.5 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider hidden sm:inline">Capturing…</span>
        </>
      ) : done ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider hidden sm:inline">Saved!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-bold text-neutral-500 group-hover:text-violet-400 uppercase tracking-wider transition-colors hidden sm:inline">
            {targetId ? "Snap" : "Screenshot"}
          </span>
        </>
      )}
    </button>
  );
}
