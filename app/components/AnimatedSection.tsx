"use client";

import { motion, useInView, useSpring, useTransform, MotionValue } from "framer-motion";
import { ReactNode, useRef, useEffect, useState, useSyncExternalStore } from "react";

/** Returns true when the user prefers reduced motion. SSR-safe. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // server snapshot
  );
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function fmtNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function CountUpValue({ value, formatFn }: { value: number; formatFn?: (n: number) => string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const spring = useSpring(0, { duration: reduced ? 0 : 1200, bounce: 0 });
  const display = useTransform(spring, (v) => (formatFn || fmtNumber)(Math.round(v)));
  const [text, setText] = useState((formatFn || fmtNumber)(reduced ? value : 0));

  useEffect(() => {
    if (reduced) {
      setText((formatFn || fmtNumber)(value));
    } else if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring, reduced, formatFn]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [display]);

  return <span ref={ref}>{text}</span>;
}

export function StaggerChildren({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      variants={reduced ? {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
      } : {
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
