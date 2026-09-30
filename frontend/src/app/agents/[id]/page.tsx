"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Database,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  RotateCcw,
} from "lucide-react";
import { api, Agent, ActionLogItem } from "../../../lib/api";
import { Badge } from "../../../components/Badge";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = (params?.id as string) || "";

  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<ActionLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!agentId) return;
      try {
        setLoading(true);
        const [agData, logsData] = await Promise.all([
          api.getAgent(agentId).catch(() => null),
          api.getLogs(20, agentId).catch(() => []),
        ]);
        if (agData) setAgent(agData);
        setLogs(logsData);
      } catch (err) {
        console.error("Failed to load agent profile", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agentId]);

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-zinc-400 text-xs">
        <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-400" />
        Loading agent profile {agentId}...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="text-zinc-400 font-mono text-sm">
          Agent <span className="text-white font-bold">{agentId}</span> not found.
        </div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agents</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="space-y-4 border-b border-zinc-800 pb-5">
        <Link
          href="/agents"
          className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Fleet Agents</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-mono text-white">
                  {agent.id}
                </h1>
                <Badge variant="trust" value={agent.trust_level} size="sm" />
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">{agent.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Health Rating</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {agent.security_health}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Boundaries vs Statistical Baseline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Security Governance Boundaries */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
            <Lock className="w-4 h-4" />
            <span>Governance & Access Boundaries</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[11px] font-mono text-zinc-400 mb-1">Permitted Tools:</div>
              <div className="flex flex-wrap gap-1.5">
                {agent.allowed_tools.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-200 border border-zinc-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-rose-400 mb-1">Strictly Denied Tools:</div>
              <div className="flex flex-wrap gap-1.5">
                {agent.denied_tools.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-rose-950/20 font-mono text-rose-300 border border-rose-500/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-zinc-400 mb-1">Allowed Data Classes:</div>
              <div className="flex flex-wrap gap-1.5">
                {agent.allowed_data_classes.map((dc, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300 border border-zinc-700"
                  >
                    {dc}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2 text-zinc-400">
              <div>
                <span className="text-zinc-500">Max Result Rows: </span>
                <span className="text-zinc-200 font-mono">{agent.maximum_rows}</span>
              </div>
              <div>
                <span className="text-zinc-500">Blocked Exploits: </span>
                <span className="text-rose-400 font-mono">{agent.blocked_actions_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Statistical Behavioral Baseline */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            <Activity className="w-4 h-4" />
            <span>Learned Behavioral Baseline</span>
          </div>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Historical parameters trained on valid operational agent runs. Tool sequences deviating significantly from this profile trigger anomaly flags.
          </p>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">Avg Calls / Session</div>
              <div className="text-lg font-bold text-zinc-100">
                {agent.baseline?.average_calls || 5.7}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">Median Query Rows</div>
              <div className="text-lg font-bold text-zinc-100">
                {agent.baseline?.median_rows || 124}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-zinc-400 mb-2">
              Frequent Markov Chain Transitions:
            </div>
            <div className="space-y-1.5 font-mono text-xs text-zinc-300">
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                <span>search_sales &rarr; aggregate_sales</span>
                <span className="text-emerald-400 text-[11px]">88% Prob</span>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                <span>aggregate_sales &rarr; generate_report</span>
                <span className="text-emerald-400 text-[11px]">94% Prob</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Action Interceptions for this Agent */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Recent Interceptions for {agent.id}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="pb-2">Tool Call</th>
                <th className="pb-2">Task Scope</th>
                <th className="pb-2">Decision</th>
                <th className="pb-2">Risk</th>
                <th className="pb-2">Latency</th>
                <th className="pb-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2.5 font-semibold text-zinc-100">{l.tool}</td>
                    <td className="py-2.5 text-zinc-400 max-w-xs truncate">{l.original_task}</td>
                    <td className="py-2.5">
                      <Badge variant="decision" value={l.decision} size="sm" />
                    </td>
                    <td className="py-2.5 font-bold">
                      <span className={l.risk_score >= 80 ? "text-rose-400" : "text-emerald-400"}>
                        {l.risk_score}/100
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-400">{l.latency_ms}ms</td>
                    <td className="py-2.5 text-right text-zinc-500">
                      {l.timestamp ? l.timestamp.split("T")[1]?.slice(0, 8) : "recent"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-sans">
                    No intercepted actions recorded for this agent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
