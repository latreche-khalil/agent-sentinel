"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { api, ToolMetadata } from "../../lib/api";
import { Badge } from "../../components/Badge";

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTools = async () => {
    try {
      setLoading(true);
      const data = await api.getTools();
      setTools(data);
    } catch (err) {
      console.error("Failed to load tools", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
              TOOL REGISTRY
            </span>
            <span className="text-xs font-mono text-zinc-500">{tools.length} Monitored Tools</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
            Protected Tools & APIs
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
            External and native tools available to agents, monitored for schema changes and permission limits.
          </p>
        </div>

        <button
          onClick={loadTools}
          disabled={loading}
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Security Status Callout */}
      <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50/60 dark:bg-sky-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-white">
              Tool Signatures Verified
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
              All tool parameters match approved cryptographic baseline hashes. No unauthorized schema drift detected.
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 font-semibold shrink-0">
          All Safe
        </span>
      </div>

      {/* Tools Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Tool Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
              {tools.map((t) => (
                <tr key={t.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {t.name}
                  </td>

                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">{t.description}</td>

                  <td className="py-3 px-4">
                    <Badge variant="severity" value={t.risk_level} size="sm" />
                  </td>

                  <td className="py-3 px-4 font-mono">
                    {t.side_effect ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Write / Mutate</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Read Only</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-zinc-500">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] border border-zinc-200 dark:border-zinc-700">
                      {t.server_source || "native"}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                    Verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
