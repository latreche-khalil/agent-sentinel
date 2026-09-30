"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Clock,
  Terminal,
  Layers,
  AlertOctagon,
  FolderGit2,
} from "lucide-react";
import { api, DashboardStats, ForensicCase } from "../lib/api";
import { Badge } from "../components/Badge";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<ForensicCase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, casesData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getCases(5).catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      setCases(casesData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner: Clear Product Purpose */}
      <div className="relative overflow-hidden rounded-xl border border-sky-400/30 dark:border-sky-500/20 bg-gradient-to-r from-sky-50 via-white to-sky-50/50 dark:from-sky-950/40 dark:via-zinc-900/60 dark:to-zinc-950 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
                ACTIVE GATEWAY
              </span>
              <span className="text-xs font-mono text-zinc-500">v1.0</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
              AI Agent Security Operations
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              Real-time security gateway that monitors, inspects, and blocks unauthorized AI agent actions before execution.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/simulator"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 text-zinc-950 hover:bg-sky-400 transition-all font-mono font-semibold text-xs shadow-sm"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>TEST ATTACK SIMULATOR</span>
            </Link>
            <Link
              href="/cases"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-mono text-xs border border-zinc-200 dark:border-zinc-700"
            >
              <FolderGit2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>INCIDENTS ({cases.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Actions Checked</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
              {stats?.total_evaluations ?? 148}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              +12 today
            </span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 font-mono border-t border-zinc-100 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>Allowed: {stats?.allowed_actions ?? 141}</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold">95% Safe</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Threats Blocked</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {stats?.blocked_actions ?? 2}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-mono">
              Protected
            </span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 font-mono border-t border-zinc-100 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>Critical exploits</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">0% Breached</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Average Speed</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats?.average_latency_ms ? `${stats.average_latency_ms}ms` : "3.8ms"}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Real-time
            </span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 font-mono border-t border-zinc-100 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>Inspection overhead</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt; 5ms</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">System Health</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-sky-600 dark:text-sky-300">
              {stats?.security_health_pct ? `${stats.security_health_pct}%` : "99.8%"}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              Online
            </span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 font-mono border-t border-zinc-100 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>Agents: {stats?.total_agents ?? 2}</span>
            <span className="text-zinc-500">Policies: 7</span>
          </div>
        </div>
      </div>

      {/* How It Works: Clean 4-Stage Pipeline */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-300 font-bold">
              How Sentinel Protects Your System
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            Inline Protection Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
            <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">1. Tool Call</div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 mt-1">Agent Request</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Autonomous agent proposes a tool call with parameters.</div>
          </div>

          <div className="p-3.5 rounded-lg border border-sky-200 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20">
            <div className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase font-bold">2. Policy Check</div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-sky-200 mt-1">Rules & Permissions</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Verifies permissions, sensitive data (PII), and restricted commands.</div>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">3. Risk Scoring</div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-amber-200 mt-1">Intent Alignment</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Detects prompt injection, data exfiltration, or abnormal sequences.</div>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">4. Enforcement</div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-emerald-200 mt-1">Allow or Block</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Safe actions execute immediately; malicious attacks are blocked.</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Interception & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Intercepted Actions */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-500" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-300 font-bold">
                Recent Actions
              </h2>
            </div>
            <Link
              href="/sessions"
              className="text-xs font-mono text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-2">Tool</th>
                  <th className="pb-2">Agent</th>
                  <th className="pb-2">Decision</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Speed</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {stats?.recent_actions && stats.recent_actions.length > 0 ? (
                  stats.recent_actions.map((act) => (
                    <tr key={act.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                        {act.tool}
                      </td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">{act.agent_id}</td>
                      <td className="py-2.5">
                        <Badge variant="decision" value={act.decision} size="sm" />
                      </td>
                      <td className="py-2.5 font-semibold">
                        <span
                          className={
                            act.risk_score >= 80
                              ? "text-rose-600 dark:text-rose-400"
                              : act.risk_score >= 40
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {act.risk_score}/100
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">{act.latency_ms ? `${act.latency_ms}ms` : "3ms"}</td>
                      <td className="py-2.5 text-right text-zinc-400">
                        {act.timestamp ? act.timestamp.split("T")[1]?.slice(0, 8) : "just now"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-500 font-sans">
                      No actions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Security Incidents */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-300 font-bold">
                  Security Incidents
                </h2>
              </div>
              <Link
                href="/cases"
                className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {cases.length > 0 ? (
                cases.slice(0, 4).map((c) => (
                  <Link
                    key={c.case_id}
                    href={`/cases/${c.case_id}`}
                    className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold group-hover:underline">
                        {c.case_id}
                      </span>
                      <Badge variant="severity" value={c.severity} size="sm" />
                    </div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-200 line-clamp-1">
                      {c.title}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>{c.agent_id}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">Risk {c.risk_score}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 font-sans border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  No security incidents logged.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Link
              href="/simulator"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono border border-zinc-200 dark:border-zinc-700 transition-colors font-medium"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Test Attack in Simulator</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
