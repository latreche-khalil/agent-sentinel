"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { api, Agent } from "../../lib/api";
import { Badge } from "../../components/Badge";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await api.getAgents();
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
              AGENT FLEET
            </span>
            <span className="text-xs font-mono text-zinc-500">{agents.length} Supervised Agents</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
            Supervised AI Agents
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
            Active autonomous agents monitored by Sentinel with role-based tool restrictions and safety baselines.
          </p>
        </div>

        <button
          onClick={loadAgents}
          disabled={loading}
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {agents.map((ag) => (
          <div
            key={ag.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm group"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                      {ag.id}
                    </h3>
                    <div className="text-[11px] text-zinc-500">{ag.name}</div>
                  </div>
                </div>

                <Badge variant="trust" value={ag.trust_level} size="sm" />
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed mb-4">
                {ag.description}
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 mb-4 text-center">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Health</div>
                  <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {ag.security_health}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Blocked Threats</div>
                  <div className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                    {ag.blocked_actions_count}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Max Rows</div>
                  <div className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {ag.maximum_rows.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Permitted Tools */}
              <div className="space-y-1.5 mb-3">
                <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                  <span>Permitted Tools:</span>
                  <span>{ag.allowed_tools.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ag.allowed_tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Denied Tools */}
              {ag.denied_tools && ag.denied_tools.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400 flex items-center justify-between">
                    <span>Restricted Tools:</span>
                    <span>{ag.denied_tools.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ag.denied_tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-[11px] font-mono text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                Data: {ag.allowed_data_classes.join(", ")}
              </span>
              <Link
                href={`/agents/${ag.id}`}
                className="inline-flex items-center gap-1 text-xs font-mono text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
