"use client";

/**
 * SectionDivider — animated gradient line that separates major dashboard groups.
 * The gradient shimmer moves slowly left-to-right, creating a subtle "alive" feel.
 * Hidden in print.
 */
export default function SectionDivider({
  label,
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "violet" | "cyan" | "emerald";
}) {
  const gradients: Record<string, string> = {
    default:
      "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.3) 20%, rgba(6,182,212,0.3) 50%, rgba(236,72,153,0.3) 80%, transparent 100%)",
    violet:
      "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.35) 30%, rgba(139,92,246,0.2) 70%, transparent 100%)",
    cyan:
      "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.35) 30%, rgba(34,211,238,0.2) 70%, transparent 100%)",
    emerald:
      "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.35) 30%, rgba(52,211,153,0.2) 70%, transparent 100%)",
  };

  return (
    <div className="relative flex items-center gap-4 my-2 print:hidden select-none" aria-hidden="true">
      <div
        className="flex-1 h-px section-divider-shimmer"
        style={{ backgroundImage: gradients[variant], backgroundSize: "200% 100%" }}
      />
      {label && (
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600 whitespace-nowrap flex-shrink-0">
          {label}
        </span>
      )}
      <div
        className="flex-1 h-px section-divider-shimmer"
        style={{ backgroundImage: gradients[variant], backgroundSize: "200% 100%" }}
      />
    </div>
  );
}
