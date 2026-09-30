import React from "react";
import clsx from "clsx";

interface BadgeProps {
  variant: "decision" | "severity" | "trust" | "status";
  value: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ variant, value, size = "md", className }: BadgeProps) {
  const v = (value || "").toUpperCase();

  let colorClasses = "bg-zinc-800/80 text-zinc-300 border-zinc-700";

  if (variant === "decision") {
    if (v === "ALLOW") {
      colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    } else if (v === "REVIEW") {
      colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    } else if (v === "BLOCK") {
      colorClasses = "bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold";
    }
  } else if (variant === "severity") {
    if (v === "CRITICAL") {
      colorClasses = "bg-rose-500/20 text-rose-400 border-rose-500/40 font-semibold";
    } else if (v === "HIGH") {
      colorClasses = "bg-orange-500/15 text-orange-400 border-orange-500/30";
    } else if (v === "MEDIUM") {
      colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    } else if (v === "LOW" || v === "INFO") {
      colorClasses = "bg-sky-500/15 text-sky-400 border-sky-500/30";
    } else {
      colorClasses = "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  } else if (variant === "trust") {
    if (v === "HIGH") {
      colorClasses = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    } else if (v === "MEDIUM") {
      colorClasses = "bg-blue-500/15 text-blue-400 border-blue-500/30";
    } else if (v === "LOW") {
      colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    } else {
      colorClasses = "bg-rose-500/15 text-rose-400 border-rose-500/30";
    }
  } else if (variant === "status") {
    if (v === "OPEN" || v === "INVESTIGATING") {
      colorClasses = "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse";
    } else if (v === "CONTAINED") {
      colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    } else if (v === "RESOLVED") {
      colorClasses = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    } else if (v === "FALSE_POSITIVE") {
      colorClasses = "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-mono tracking-wider",
    md: "px-2.5 py-1 text-xs font-mono tracking-wider",
    lg: "px-3 py-1.5 text-sm font-mono tracking-wider",
  }[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded border uppercase transition-colors",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {value}
    </span>
  );
}
