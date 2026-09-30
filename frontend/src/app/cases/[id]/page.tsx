"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  Bot,
  Terminal,
  Sparkles,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Lock,
  Search,
} from "lucide-react";
import {
  api,
  ForensicCase,
  AIInvestigationReport,
} from "../../../lib/api";
import { Badge } from "../../../components/Badge";
import { RiskMeter } from "../../../components/RiskMeter";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = (params?.id as string) || "";

  const [forensicCase, setForensicCase] = useState<ForensicCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "evidence" | "investigation" | "report" | "triage"
  >("overview");

  const [aiReport, setAiReport] = useState<AIInvestigationReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [copied, setCopied] = useState(false);
  const [htmlReport, setHtmlReport] = useState<string>("");

  const loadCase = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const data = await api.getCase(caseId);
      setForensicCase(data);
    } catch (err) {
      console.error("Failed to load case", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const handleRunAiInvestigation = async () => {
    try {
      setAiLoading(true);
      setActiveTab("investigation");
      const report = await api.investigateCase(caseId);
      setAiReport(report);
    } catch (err) {
      console.error("Failed to run AI investigation", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setStatusUpdating(true);
      const feedback = feedbackText ? { analyst_note: feedbackText } : undefined;
      const updated = await api.updateCaseStatus(caseId, newStatus, feedback);
      setForensicCase(updated);
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCopyCaseId = () => {
    if (!caseId) return;
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = async () => {
    try {
      const md = await api.getIncidentReportMarkdown(caseId);
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incident-report-${caseId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-zinc-400 text-xs">
        <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-400" />
        Loading forensic case {caseId}...
      </div>
    );
  }

  if (!forensicCase) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="text-zinc-400 font-mono text-sm">
          Case <span className="text-white font-bold">{caseId}</span> not found in database.
        </div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center justify-between">
          <Link
            href="/cases"
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Cases</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAiInvestigation}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-mono font-medium transition-all shadow-sm"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : "text-sky-500"}`} />
              <span>{aiLoading ? "Analyzing..." : "AI Copilot"}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Case Title and Identification Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
                {forensicCase.case_id}
              </span>
              <button
                onClick={handleCopyCaseId}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                title="Copy Case ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <Badge variant="severity" value={forensicCase.severity} size="sm" />
              <Badge variant="status" value={forensicCase.status} size="sm" />
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white font-sans">
              {forensicCase.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-zinc-400" />
                <span>Agent:</span>
                <Link
                  href={`/agents/${forensicCase.agent_id}`}
                  className="text-zinc-800 dark:text-zinc-200 underline hover:text-sky-600"
                >
                  {forensicCase.agent_id}
                </Link>
              </div>

              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Session:</span>
                <span className="text-zinc-800 dark:text-zinc-200">{forensicCase.session_id}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Time:</span>
                <span className="text-zinc-800 dark:text-zinc-200">{forensicCase.created_at ? forensicCase.created_at.split("T")[0] : "Recent"}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shrink-0 min-w-40 text-right shadow-sm">
            <div className="text-[10px] font-mono uppercase text-zinc-500">Risk Score</div>
            <div className="text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {forensicCase.risk_score} <span className="text-xs text-zinc-400 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] font-mono text-rose-600 dark:text-rose-300 font-semibold">
              {forensicCase.risk_score >= 80 ? "CRITICAL THREAT" : forensicCase.risk_score >= 40 ? "HIGH RISK" : "LOW RISK"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-800 text-xs font-mono overflow-x-auto pb-1">
        {[
          { key: "overview", label: "Overview" },
          { key: "timeline", label: `Timeline (${forensicCase.timeline?.length || 0})` },
          { key: "evidence", label: `Evidence (${forensicCase.evidence?.length || 0})` },
          { key: "investigation", label: "AI Copilot" },
          { key: "report", label: "Report" },
          { key: "triage", label: "Triage" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 rounded-t-lg font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-sky-400 text-sky-300 bg-sky-500/10 font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Risk Breakdown Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <RiskMeter
              score={forensicCase.risk_score}
              evidence={forensicCase.evidence}
              showDecomposition={true}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Tools + Policy Violations */}
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-2">Affected Tools</div>
                <div className="flex flex-wrap gap-2">
                  {forensicCase.affected_tools && forensicCase.affected_tools.length > 0 ? (
                    forensicCase.affected_tools.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-xs text-zinc-200 border border-zinc-700">{t}</span>
                    ))
                  ) : (
                    <span className="text-zinc-500 text-xs">None tagged</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Policy Violations</span>
                </div>
                {forensicCase.policy_violations && forensicCase.policy_violations.length > 0 ? (
                  <ul className="space-y-1.5">
                    {forensicCase.policy_violations.map((pv, idx) => (
                      <li key={idx} className="text-xs font-mono text-rose-200 flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        <span>{pv}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-zinc-400">No violations detected.</div>
                )}
              </div>
            </div>

            {/* Right: Recommended Actions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-3">Containment Actions</div>
              <div className="space-y-2">
                {forensicCase.recommended_actions && forensicCase.recommended_actions.length > 0 ? (
                  forensicCase.recommended_actions.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-500">Revoke agent credentials immediately.</div>
                )}
              </div>
              <button
                onClick={() => setActiveTab("triage")}
                className="mt-4 text-xs font-mono text-sky-400 hover:text-sky-300"
              >
                Go to Triage &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTACK TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-zinc-500">Tool event log — chronological order</div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-zinc-800">
            {forensicCase.timeline && forensicCase.timeline.length > 0 ? (
              forensicCase.timeline.map((item, idx) => {
                const isBlocked = item.risk_level === "CRITICAL" || item.risk_level === "HIGH";

                return (
                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                    {/* Timeline Node dot */}
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                        isBlocked
                          ? "bg-rose-500/20 text-rose-400 border-rose-500"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {item.step || idx + 1}
                    </div>

                    {/* Timeline Event Card */}
                    <div
                      className={`flex-1 rounded-xl border p-4 transition-all ${
                        isBlocked
                          ? "border-rose-500/40 bg-zinc-900/90 shadow-sm"
                          : "border-zinc-800 bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-zinc-100">
                            {item.tool || item.event_type}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                              isBlocked
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {isBlocked ? "BLOCKED" : "ALLOWED"}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">
                          {item.timestamp ? item.timestamp.split("T")[1]?.slice(0, 8) : "00:00:00"}
                        </span>
                      </div>

                      {item.details && Object.keys(item.details).length > 0 && (
                        <div className="mt-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto">
                          <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap">
                            {JSON.stringify(item.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                No timeline events stored for this case.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE & SIGNALS */}
      {activeTab === "evidence" && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-zinc-500">
            {forensicCase.evidence?.length || 0} evidence signals contributing to risk score
          </div>

          {forensicCase.evidence && forensicCase.evidence.length > 0 ? (
            <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
              {forensicCase.evidence.map((sig, idx) => {
                const name = sig.signal_name || sig.description || sig.category || "Evidence Signal";
                const score = typeof sig.score_contribution === "number" ? sig.score_contribution : (typeof sig.score === "number" ? sig.score : 0);
                const category = sig.category || sig.type || "signal";
                const explanation = sig.explanation || sig.difference || "";

                return (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-100 truncate">{name}</div>
                        {explanation && <div className="text-[11px] text-zinc-500 truncate">{explanation}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-sky-400 border border-zinc-700">{category}</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">+{score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">No evidence signals attached.</div>
          )}
        </div>
      )}

      {/* TAB 4: AI FORENSIC COPILOT */}
      {activeTab === "investigation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-zinc-200">AI Forensic Copilot</span>
            </div>
            <button
              onClick={handleRunAiInvestigation}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-mono text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${aiLoading ? "animate-spin" : ""}`} />
              <span>{aiLoading ? "Analyzing..." : "Run"}</span>
            </button>
          </div>

          {aiReport ? (
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">Summary</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {Math.round(aiReport.confidence_score * 100)}% confidence · {aiReport.model_used}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">{aiReport.executive_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400 font-semibold mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmed Facts</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {aiReport.confirmed_facts?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400 font-semibold mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Hypotheses</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {aiReport.working_hypotheses?.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-950/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-sky-400 font-semibold mb-2">
                    <Search className="w-3.5 h-3.5" />
                    <span>Unknowns</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {aiReport.unknown_factors?.map((u, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-sky-400 shrink-0">•</span>
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/10 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase text-rose-400 font-semibold mb-1">Containment Action</div>
                  <div className="text-xs text-zinc-300">{aiReport.containment_action}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
              <Sparkles className="w-7 h-7 text-zinc-600 mx-auto" />
              <div className="text-xs text-zinc-500">Click Run to generate AI forensic analysis.</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: INCIDENT REPORT */}
      {activeTab === "report" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Incident Report</span>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-200 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {`# AGENT SENTINEL INCIDENT REPORT
Case ID: ${forensicCase.case_id}
Title: ${forensicCase.title}
Severity: ${forensicCase.severity} | Risk Score: ${forensicCase.risk_score}/100
Status: ${forensicCase.status}
Generated: ${new Date().toISOString()}

==================================================
1. INCIDENT OVERVIEW
Agent ID: ${forensicCase.agent_id}
Session ID: ${forensicCase.session_id}
Affected Tools: ${(forensicCase.affected_tools || []).join(", ")}
Affected Data: ${(forensicCase.affected_data || []).join(", ")}

2. DETERMINISTIC POLICY VIOLATIONS
${(forensicCase.policy_violations || []).map((pv) => `- ${pv}`).join("\n")}

3. RECOMMENDED CONTAINMENT MEASURES
${(forensicCase.recommended_actions || []).map((ra) => `- ${ra}`).join("\n")}
==================================================
`}
          </div>
        </div>
      )}

      {/* TAB 6: TRIAGE & CONTAINMENT */}
      {activeTab === "triage" && (
        <div className="max-w-lg space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Case Disposition</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  disabled={statusUpdating}
                  className={`py-2 px-1 rounded-lg border font-mono text-[11px] uppercase font-medium transition-all ${
                    forensicCase.status === st
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Analyst Notes</label>
              <textarea
                rows={3}
                placeholder="Add triage notes or root cause observations..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
