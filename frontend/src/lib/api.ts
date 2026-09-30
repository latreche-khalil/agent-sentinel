/**
 * Agent Sentinel Frontend API Client
 * Interacts with FastAPI backend at http://localhost:8000/api/v1
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface DashboardStats {
  total_evaluations: number;
  allowed_actions: number;
  reviewed_actions: number;
  blocked_actions: number;
  total_agents: number;
  open_cases: number;
  security_health_pct: number;
  average_latency_ms: number;
  recent_actions: {
    id: number;
    tool: string;
    agent_id: string;
    decision: "ALLOW" | "REVIEW" | "BLOCK";
    risk_score: number;
    latency_ms: number;
    timestamp: string;
  }[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  trust_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  allowed_tools: string[];
  denied_tools: string[];
  allowed_data_classes: string[];
  maximum_rows: number;
  blocked_actions_count: number;
  security_health: number;
  baseline?: {
    average_calls: number;
    median_rows: number;
    typical_tools: string[];
  };
}

export interface EvidenceSignal {
  signal_name?: string;
  category?: string;
  score_contribution?: number;
  explanation?: string;
  impact?: string;
  difference?: string;
  current_value?: any;
  baseline_value?: any;
  threshold?: any;
  // Compatibility fields
  type?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description?: string;
  score?: number;
  details?: Record<string, any>;
}

export interface InterceptResult {
  action_id: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  risk_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  evidence: EvidenceSignal[];
  policy_violations: string[];
  latency_ms: number;
  execution_allowed: boolean;
  approval_id?: string;
  sanitized_payload?: Record<string, any>;
  redacted_fields?: string[];
  case_id?: string;
}

export interface ForensicCase {
  case_id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED" | "FALSE_POSITIVE";
  created_at: string;
  agent_id: string;
  session_id: string;
  user_id?: string;
  incident_type: string;
  risk_score: number;
  evidence: EvidenceSignal[];
  timeline: {
    step: number;
    timestamp: string;
    event_type: string;
    tool?: string;
    details: Record<string, any>;
    risk_level: string;
  }[];
  affected_tools: string[];
  affected_data: string[];
  policy_violations: string[];
  recommended_actions: string[];
  false_positive_feedback?: Record<string, any>;
}

export interface AIInvestigationReport {
  case_id: string;
  generated_at: string;
  model_used: string;
  confidence_score: number;
  confirmed_facts: string[];
  working_hypotheses: string[];
  unknown_factors: string[];
  recommended_next_steps: string[];
  containment_action: string;
  executive_summary: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  attack_category: string;
  description: string;
  user_task: string;
  expected_decision: string;
  steps_count?: number;
}

export interface SimulationResult {
  scenario_id: string;
  scenario_name: string;
  attack_category: string;
  session_id: string;
  passed: boolean;
  final_decision: "ALLOW" | "REVIEW" | "BLOCK";
  final_risk_score: number;
  evidence_signals_count: number;
  steps: {
    step: number;
    tool: string;
    expected_decision: string;
    actual_decision: string;
    risk_score: number;
    severity: string;
    reasons: string[];
    evidence: EvidenceSignal[];
    policy_violations: string[];
    latency_ms: number;
    executed: boolean;
  }[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category: string;
  when: Record<string, any>;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  enabled: boolean;
  priority: number;
}

export interface PolicyTestSuiteResult {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  all_passed: boolean;
  details: {
    test_name: string;
    policy_id: string;
    passed: boolean;
    expected_decision: string;
    actual_decision: string;
    message: string;
  }[];
}

export interface ToolMetadata {
  name: string;
  description: string;
  risk_level: "low" | "medium" | "high" | "critical";
  data_access: string[];
  side_effect: boolean;
  requires_approval: boolean;
  read_only: boolean;
  server_source: string;
  definition_hash?: string;
}

export interface ActionLogItem {
  id: number;
  action_hash: string;
  agent_id: string;
  session_id: string;
  user_id?: string;
  tool: string;
  original_task: string;
  arguments: Record<string, any>;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  risk_score: number;
  severity: string;
  reasons: string[];
  evidence: EvidenceSignal[];
  policy_violations: string[];
  latency_ms: number;
  timestamp: string;
}

export interface SessionItem {
  session_id: string;
  agent_id: string;
  started_at: string;
  last_active: string;
  actions_count: number;
  blocked_count: number;
  highest_risk: number;
  original_task: string;
  tools_invoked: string[];
}

// Fetch helper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${errText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`Failed to fetch ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Stats & Dashboard
  getDashboardStats: () => fetchApi<DashboardStats>("/stats/dashboard"),
  getHealth: () => fetchApi<any>("/health"),

  // Agents
  getAgents: () => fetchApi<Agent[]>("/agents"),
  getAgent: (id: string) => fetchApi<Agent>(`/agents/${id}`),

  // Action Interception
  evaluateAction: (proposal: {
    agent_id: string;
    session_id?: string;
    original_task?: string;
    tool: string;
    arguments?: Record<string, any>;
    previous_actions?: string[];
    untrusted_context?: string;
  }) =>
    fetchApi<InterceptResult>("/actions/evaluate", {
      method: "POST",
      body: JSON.stringify(proposal),
    }),

  // Cases & Forensics
  getCases: (limit = 50) => fetchApi<ForensicCase[]>(`/cases?limit=${limit}`),
  getCase: (id: string) => fetchApi<ForensicCase>(`/cases/${id}`),
  updateCaseStatus: (id: string, status: string, feedback?: Record<string, any>) =>
    fetchApi<ForensicCase>(`/cases/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status, feedback }),
    }),
  investigateCase: (id: string) =>
    fetchApi<AIInvestigationReport>(`/investigate?case_id=${encodeURIComponent(id)}`, {
      method: "POST",
    }),
  getIncidentReportHtml: async (caseId: string) => {
    const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(caseId)}?format=html`, { cache: "no-store" });
    return res.text();
  },
  getIncidentReportMarkdown: async (caseId: string) => {
    const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(caseId)}?format=markdown`, { cache: "no-store" });
    return res.text();
  },

  // Attack Simulations
  getSimulationScenarios: () => fetchApi<SimulationScenario[]>("/simulations/scenarios"),
  runSimulation: (scenarioId: string) =>
    fetchApi<SimulationResult>(`/simulations/run?scenario_id=${encodeURIComponent(scenarioId)}`, {
      method: "POST",
    }),

  // Policies
  getPolicies: () => fetchApi<PolicyRule[]>("/policies"),
  testPolicies: () => fetchApi<PolicyTestSuiteResult>("/policies/test", { method: "POST" }),

  // Tools & Registry
  getTools: () => fetchApi<ToolMetadata[]>("/tools"),

  // Audit Logs & Sessions
  getLogs: (limit = 50, agentId?: string, decision?: string) => {
    let q = `?limit=${limit}`;
    if (agentId) q += `&agent_id=${encodeURIComponent(agentId)}`;
    if (decision) q += `&decision=${encodeURIComponent(decision)}`;
    return fetchApi<ActionLogItem[]>(`/logs${q}`);
  },
  getSessions: (limit = 20) => fetchApi<SessionItem[]>(`/sessions?limit=${limit}`),

  // Human-in-the-Loop Approvals
  approveAction: (approvalId: string, approver = "security_lead", modifiedParams?: any) =>
    fetchApi<any>(`/actions/${approvalId}/approve`, {
      method: "POST",
      body: JSON.stringify({ approver, modified_params: modifiedParams }),
    }),
  denyAction: (approvalId: string, reason = "Disallowed by operator") =>
    fetchApi<any>(`/actions/${approvalId}/deny`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
