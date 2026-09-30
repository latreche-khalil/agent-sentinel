"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Bot,
  RotateCcw,
} from "lucide-react";
import { api, ForensicCase } from "../../lib/api";
import { Badge } from "../../components/Badge";

export default function CasesPage() {
  const [cases, setCases] = useState<ForensicCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getCases(100);
      setCases(data);
    } catch (err) {
      console.error("Failed to load cases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.case_id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.agent_id.toLowerCase().includes(search.toLowerCase()) ||
      c.session_id.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || c.severity.toUpperCase() === severityFilter;
    const matchesStatus = statusFilter === "ALL" || c.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              INCIDENTS
            </span>
            <span className="text-xs font-mono text-zinc-500">{cases.length} Total</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
            Security Incidents & Forensics
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
            Logged incident reports, tool execution traces, policy violations, and AI investigations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/simulator"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 font-mono text-xs border border-sky-500/30 transition-colors font-medium"
          >
            <span>Simulate New Attack</span>
          </Link>
          <button
            onClick={loadCases}
            disabled={loading}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID, title, agent, or session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONTAINED">Contained</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => (
                  <tr
                    key={c.case_id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                      <Link
                        href={`/cases/${c.case_id}`}
                        className="hover:underline"
                      >
                        {c.case_id}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {c.incident_type || "Security Incident"}
                        {c.affected_tools && c.affected_tools.length > 0 && ` · Tools: ${c.affected_tools.join(", ")}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{c.agent_id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="severity" value={c.severity} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="status" value={c.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={
                          c.risk_score >= 80
                            ? "text-rose-600 dark:text-rose-400"
                            : c.risk_score >= 40
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {c.risk_score}/100
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/cases/${c.case_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-sky-500 hover:text-zinc-950 dark:hover:bg-sky-500 dark:hover:text-zinc-950 font-mono text-xs text-zinc-800 dark:text-zinc-200 transition-all font-semibold"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    {loading ? "Loading cases..." : "No matching incident cases found."}
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
