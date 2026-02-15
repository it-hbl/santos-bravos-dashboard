"use client";

import { useEffect, useRef } from "react";

/**
 * DynamicFavicon — renders a live canvas-based favicon that reflects dashboard health.
 * Shows a mini radial gauge with the composite score (0-100) and color-coded ring:
 *   - Green (≥70): healthy growth
 *   - Amber (40-69): moderate / mixed signals
 *   - Red (<40): declining or at-risk
 * Updates whenever the score prop changes.
 */
export default function DynamicFavicon({ score }: { score: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    const SIZE = 64;

    // Create or reuse canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = SIZE;
      canvasRef.current.height = SIZE;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine color based on score
    const getColor = (s: number): { ring: string; glow: string; bg: string } => {
      if (s >= 70) return { ring: "#34d399", glow: "#10b981", bg: "#064e3b" }; // emerald
      if (s >= 40) return { ring: "#fbbf24", glow: "#f59e0b", bg: "#78350f" }; // amber
      return { ring: "#f87171", glow: "#ef4444", bg: "#7f1d1d" }; // red
    };

    const colors = getColor(score);
    const center = SIZE / 2;
    const radius = 26;
    const ringWidth = 6;
    const arcAngle = (Math.min(score, 100) / 100) * Math.PI * 2;

    // Clear
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Background circle (dark)
    ctx.beginPath();
    ctx.arc(center, center, radius + ringWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0f";
    ctx.fill();

    // Background ring track
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    // Score ring (animated arc)
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + arcAngle);
    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = ringWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + arcAngle);
    ctx.strokeStyle = colors.glow;
    ctx.lineWidth = ringWidth + 4;
    ctx.globalAlpha = 0.15;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Score text
    const scoreStr = String(Math.round(score));
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${score >= 100 ? 18 : 22}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(scoreStr, center, center + 1);

    // Convert to favicon
    const dataUrl = canvas.toDataURL("image/png");

    // Find or create favicon link element
    if (!linkRef.current) {
      // Remove existing favicons
      const existing = document.querySelectorAll('link[rel="icon"]');
      existing.forEach(el => el.remove());

      linkRef.current = document.createElement("link");
      linkRef.current.rel = "icon";
      linkRef.current.type = "image/png";
      document.head.appendChild(linkRef.current);
    }

    linkRef.current.href = dataUrl;
  }, [score]);

  return null; // No visible DOM — just manages the favicon
}
