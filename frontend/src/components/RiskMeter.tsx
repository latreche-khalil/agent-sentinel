import React from "react";
import clsx from "clsx";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { EvidenceSignal } from "../lib/api";

interface RiskMeterProps {
  score: number;
  evidence?: EvidenceSignal[];
  showDecomposition?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskMeter({ score, evidence = [], showDecomposition = false, size = "md" }: RiskMeterProps) {
  let color = "text-emerald-400";
  let bgBar = "bg-emerald-500";
  let badgeText = "SAFE";

  if (score >= 80) {
    color = "text-rose-400";
    bgBar = "bg-rose-500";
    badgeText = "CRITICAL RISK";
  } else if (score >= 60) {
    color = "text-orange-400";
    bgBar = "bg-orange-500";
    badgeText = "HIGH RISK";
  } else if (score >= 30) {
    color = "text-amber-400";
    bgBar = "bg-amber-500";
    badgeText = "ELEVATED RISK";
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {score >= 80 ? (
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          ) : score >= 30 ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-xs font-mono tracking-wider uppercase text-zinc-400">Risk Assessment</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={clsx("font-mono font-bold tracking-tight", color, size === "lg" ? "text-3xl" : "text-xl")}>
            {score}
          </span>
          <span className="text-xs text-zinc-500 font-mono">/ 100</span>
          <span className={clsx("ml-2 text-xs font-mono font-semibold px-2 py-0.5 rounded border border-current/20", color)}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden border border-zinc-700/50">
        <div
          className={clsx("h-full transition-all duration-700 ease-out", bgBar)}
          style={{ width: `${Math.min(Math.max(score, 2), 100)}%` }}
        />
      </div>

      {/* Signal Decomposition breakdown if enabled */}
      {showDecomposition && evidence && evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
            Risk Factors ({evidence.length})
          </div>
          {evidence.map((sig, idx) => {
            const name = sig.signal_name || sig.description || sig.category || "Evidence Signal";
            const score = typeof sig.score_contribution === "number" ? sig.score_contribution : (typeof sig.score === "number" ? sig.score : 0);
            const category = sig.category || sig.type || "signal";

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-zinc-700 dark:text-zinc-300 truncate">{name}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">{category}</span>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">+{score}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
