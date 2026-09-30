"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Clock,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { api, SessionItem, ActionLogItem } from "../../lib/api";
import { Badge } from "../../components/Badge";

export default function SessionsPage() {
  const [viewMode, setViewMode] = useState<"sessions" | "logs">("sessions");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [logs, setLogs] = useState<ActionLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, logsData] = await Promise.all([
        api.getSessions(50).catch(() => []),
        api.getLogs(100).catch(() => []),
      ]);
      setSessions(sessionsData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to load telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
              AUDIT TRAIL
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {sessions.length} Sessions · {logs.length} Actions
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
            Audit Logs & Sessions
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
            Complete history of agent executions, tool proposals, and security enforcement decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setViewMode("sessions")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === "sessions"
                  ? "bg-sky-500 text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setViewMode("logs")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === "logs"
                  ? "bg-sky-500 text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Action Logs
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* SESSIONS VIEW */}
      {viewMode === "sessions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <div
                key={s.session_id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">
                      {s.session_id}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                        s.highest_risk >= 80
                          ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                          : s.highest_risk >= 40
                          ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                          : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                      }`}
                    >
                      Risk {s.highest_risk}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-3">
                    <Bot className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Agent: {s.agent_id}</span>
                  </div>

                  {s.original_task && (
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">
                      &ldquo;{s.original_task}&rdquo;
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>{s.actions_count} Actions ({s.blocked_count} blocked)</span>
                  <span>{s.started_at ? s.started_at.split("T")[0] : "Recent"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-zinc-500">
              No sessions found. Run an attack in the Simulator to generate sessions.
            </div>
          )}
        </div>
      )}

      {/* RAW ACTION LOGS VIEW */}
      {viewMode === "logs" && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-zinc-500 dark:text-zinc-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                            {log.tool}
                          </td>
                          <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">{log.agent_id}</td>
                          <td className="py-3 px-4 text-zinc-500 truncate max-w-xs">{log.session_id}</td>
                          <td className="py-3 px-4">
                            <Badge variant="decision" value={log.decision} size="sm" />
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            <span
                              className={
                                log.risk_score >= 80
                                  ? "text-rose-600 dark:text-rose-400"
                                  : log.risk_score >= 40
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }
                            >
                              {log.risk_score}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-500">{log.latency_ms}ms</td>
                          <td className="py-3 px-4 text-right text-zinc-400">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 ml-auto" />
                            ) : (
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800">
                              <div className="text-[10px] uppercase text-zinc-500 mb-1">Execution Arguments:</div>
                              <pre className="text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.arguments, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
