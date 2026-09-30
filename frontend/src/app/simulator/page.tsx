"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api, SimulationScenario, SimulationResult } from "../../lib/api";
import { Badge } from "../../components/Badge";
import { RiskMeter } from "../../components/RiskMeter";

export default function SimulatorPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scenario-exfiltration");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const scs = await api.getSimulationScenarios();
        setScenarios(scs);
        if (scs.length > 0 && !selectedScenarioId) {
          setSelectedScenarioId(scs[0].id);
        }
      } catch (err) {
        console.error("Failed to load scenarios", err);
      }
    }
    load();
  }, []);

  const handleRunSimulation = async (idToRun?: string) => {
    const scId = idToRun || selectedScenarioId;
    if (!scId) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await api.runSimulation(scId);
      setResult(res);
      if (res.steps && res.steps.length > 0) {
        setExpandedStep(res.steps.length);
      }
    } catch (err) {
      console.error("Simulation run error", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              ATTACK SIMULATOR
            </span>
            <span className="text-xs font-mono text-zinc-500">{scenarios.length} Scenarios</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
            Security Attack Simulator
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
            Test how the security gateway detects and blocks multi-step attacks, data leaks, and prompt injections in real time.
          </p>
        </div>

        <button
          onClick={() => handleRunSimulation()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-mono font-bold text-xs shadow-sm transition-all shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-zinc-950" />
              <span>TESTING PIPELINE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>RUN SELECTED ATTACK</span>
            </>
          )}
        </button>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                setResult(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-950/20 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-zinc-500 uppercase">{sc.attack_category}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                  )}
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1">
                  {sc.name}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">{sc.steps_count || 3} steps</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{sc.expected_decision}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Objective */}
      {selectedScenario && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">
                Objective:
              </span>
              <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-medium px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/20">
                &ldquo;{selectedScenario.user_task}&rdquo;
              </span>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {selectedScenario.description}
            </div>
          </div>

          <button
            onClick={() => handleRunSimulation(selectedScenario.id)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono border border-zinc-300 dark:border-zinc-700 transition-colors shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Re-run</span>
          </button>
        </div>
      )}

      {/* Simulation Result */}
      {result && (
        <div className="space-y-5">
          {/* Result Banner */}
          <div
            className={`rounded-xl border p-4 shadow-sm ${
              result.passed
                ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20"
                : "border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    result.passed
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40"
                      : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40"
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {result.passed ? "Attack Mitigated Successfully" : "Interception Alert"}
                    </span>
                    <Badge variant="decision" value={result.final_decision} size="sm" />
                  </div>
                  <div className="text-xs font-mono text-zinc-500 mt-0.5">
                    Session: {result.session_id} · Category: {result.attack_category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Risk Score</div>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {result.final_risk_score} / 100
                  </div>
                </div>
                <Link
                  href="/cases"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-mono font-medium transition-colors"
                >
                  <span>View Case</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Step Timeline */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
              <span>Tool Execution Sequence ({result.steps.length} Steps)</span>
              <span className="hidden sm:inline">Click any step to view details</span>
            </div>

            {result.steps.map((st) => {
              const isExpanded = expandedStep === st.step;
              const isBlocked = st.actual_decision === "BLOCK";

              return (
                <div
                  key={st.step}
                  className={`rounded-xl border transition-all ${
                    isBlocked
                      ? "border-rose-300 dark:border-rose-500/40 bg-white dark:bg-zinc-900/80 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40"
                  }`}
                >
                  {/* Step Header Toggle */}
                  <div
                    onClick={() => setExpandedStep(isExpanded ? null : st.step)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-800 dark:text-zinc-300">
                        {st.step}
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {st.tool}
                      </span>
                      <Badge variant="decision" value={st.actual_decision} size="sm" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-zinc-400">Risk:</span>
                        <span
                          className={`font-bold ${
                            st.risk_score >= 80
                              ? "text-rose-600 dark:text-rose-400"
                              : st.risk_score >= 40
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {st.risk_score}
                        </span>
                      </div>

                      <div className="hidden md:flex items-center gap-1 text-xs font-mono text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>{st.latency_ms}ms</span>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Step Body */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-xs">
                      <div className="mt-3">
                        <RiskMeter
                          score={st.risk_score}
                          evidence={st.evidence}
                          showDecomposition={true}
                        />
                      </div>

                      {st.reasons && st.reasons.length > 0 && (
                        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-800">
                          <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold mb-1.5">
                            Diagnostic Reasons
                          </div>
                          <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
                            {st.reasons.map((r, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-500 font-bold">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {st.policy_violations && st.policy_violations.length > 0 && (
                        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 p-3">
                          <div className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-300 font-bold mb-1">
                            Policy Violations
                          </div>
                          <div className="space-y-1 font-mono text-rose-800 dark:text-rose-200">
                            {st.policy_violations.map((pv, i) => (
                              <div key={i} className="text-xs">
                                • {pv}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
