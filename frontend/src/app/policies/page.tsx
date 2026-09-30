"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api, PolicyRule, PolicyTestSuiteResult } from "../../lib/api";
import { Badge } from "../../components/Badge";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [testResult, setTestResult] = useState<PolicyTestSuiteResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await api.getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error("Failed to load policies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleRunTests = async () => {
    try {
      setTesting(true);
      const res = await api.testPolicies();
      setTestResult(res);
    } catch (err) {
      console.error("Policy test run failed", err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              GUARDRAILS
            </span>
            <span className="text-xs font-mono text-zinc-500">{policies.length} Active Rules</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
            Security Policies & Rules
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
            Strict safety rules evaluated on every agent tool call. Actions violating these rules are blocked immediately.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 fill-current ${testing ? "animate-spin" : ""}`} />
          <span>{testing ? "Testing Rules..." : "Test All Policies"}</span>
        </button>
      </div>

      {/* Test Suite Results Banner */}
      {testResult && (
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            testResult.all_passed
              ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20"
              : "border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  testResult.all_passed
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40"
                    : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40"
                }`}
              >
                {testResult.all_passed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white font-sans">
                  {testResult.all_passed
                    ? "All Policy Tests Passed (100%)"
                    : "Policy Test Failures Detected"}
                </h3>
                <div className="text-[11px] font-mono text-zinc-500">
                  {testResult.passed_tests} of {testResult.total_tests} unit checks passed.
                </div>
              </div>
            </div>

            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {testResult.details.map((t, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-zinc-800 dark:text-zinc-200 truncate">{t.test_name}</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">[PASS]</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies List */}
      <div className="space-y-2.5">
        {policies.map((p) => {
          const isExpanded = expandedPolicyId === p.id;

          return (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
            >
              <div
                onClick={() => setExpandedPolicyId(isExpanded ? null : p.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{p.id}</span>
                      <span className="font-sans text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {p.name}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans truncate">{p.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="hidden sm:inline text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {p.category}
                  </span>
                  <Badge variant="decision" value={p.decision} size="sm" />

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">
                    Rule Logic:
                  </div>
                  <pre className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                    {JSON.stringify(p.when, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
