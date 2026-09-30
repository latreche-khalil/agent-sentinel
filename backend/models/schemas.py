"""Pydantic schemas for Agent Sentinel."""
from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class DataClassification(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    SENSITIVE = "SENSITIVE"
    PII = "PII"
    FINANCIAL = "FINANCIAL"
    CREDENTIAL = "CREDENTIAL"
    SECRET = "SECRET"

class TrustLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SYSTEM = "SYSTEM"

class Decision(str, Enum):
    ALLOW = "ALLOW"
    REVIEW = "REVIEW"
    BLOCK = "BLOCK"

class Severity(str, Enum):
    SAFE = "SAFE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class CaseStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    REVIEW = "REVIEW"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class ToolMetadata(BaseModel):
    name: str
    description: str = ""
    risk_level: str = "low"  # low, medium, high, critical
    data_access: List[str] = Field(default_factory=list)
    side_effect: bool = False
    requires_approval: bool = False
    read_only: bool = True
    server_source: str = "native"  # "native", "mcp:sales-server", etc.
    definition_hash: str = ""
    parameters_schema: Dict[str, Any] = Field(default_factory=dict)

class AgentBaseline(BaseModel):
    average_tool_calls: float = 5.0
    typical_tools: List[str] = Field(default_factory=list)
    typical_rows_max: int = 500
    normal_data_classes: List[str] = Field(default_factory=list)
    normal_destinations: List[str] = Field(default_factory=list)
    external_transfers_allowed: bool = False
    maximum_chain_depth: int = 15

class AgentModel(BaseModel):
    id: str
    name: str
    description: str
    trust_level: TrustLevel = TrustLevel.MEDIUM
    allowed_tools: List[str] = Field(default_factory=list)
    denied_tools: List[str] = Field(default_factory=list)
    allowed_data_classes: List[str] = Field(default_factory=list)
    maximum_rows: int = 5000
    maximum_tool_calls_per_session: int = 30
    maximum_chain_depth: int = 10
    approval_required_for: List[str] = Field(default_factory=list)
    baseline_behavior: AgentBaseline = Field(default_factory=AgentBaseline)
    policy_profile: str = "default_strict"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ActionProposal(BaseModel):
    agent_id: str
    session_id: str
    user_id: str = "analyst_1"
    original_task: str
    current_goal: Optional[str] = None
    tool: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    requested_data_scope: Optional[str] = None
    data_sensitivity: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    previous_actions: List[str] = Field(default_factory=list)
    untrusted_context: Optional[str] = None  # e.g., fetched web/document content

class RiskSignal(BaseModel):
    category: str  # intent, dlp, permission, sequence, anomaly, injection, mcp
    score_contribution: int
    severity: Severity
    description: str
    evidence_detail: Dict[str, Any] = Field(default_factory=dict)

class EvidenceItem(BaseModel):
    signal_name: str
    category: str
    current_value: Any
    baseline_value: Optional[Any] = None
    difference: Optional[str] = None
    threshold: Optional[Any] = None
    score_contribution: int = 0
    impact: str
    explanation: str

class InterceptResult(BaseModel):
    decision: Decision
    risk_score: int = Field(ge=0, le=100)
    severity: Severity
    reasons: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    signals: List[RiskSignal] = Field(default_factory=list)
    policy_violations: List[str] = Field(default_factory=list)
    required_approval: bool = False
    approval_id: Optional[str] = None
    safe_alternative: Optional[Dict[str, Any]] = None
    execution_allowed: bool = False
    latency_ms: float = 0.0
    action_hash: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class TimelineEvent(BaseModel):
    event_id: str
    timestamp: str
    event_type: str  # task_init, tool_proposal, sentinel_inspection, policy_violation, decision, execution, block
    actor: str       # user, agent, sentinel, tool
    summary: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    decision: Optional[str] = None
    risk_score: Optional[int] = None

class ForensicCase(BaseModel):
    case_id: str
    title: str
    severity: Severity
    status: CaseStatus = CaseStatus.OPEN
    created_at: str
    agent_id: str
    session_id: str
    user_id: str
    incident_type: str
    risk_score: int
    evidence: List[EvidenceItem] = Field(default_factory=list)
    timeline: List[TimelineEvent] = Field(default_factory=list)
    affected_tools: List[str] = Field(default_factory=list)
    affected_data: List[str] = Field(default_factory=list)
    policy_violations: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    false_positive_feedback: Optional[Dict[str, Any]] = None

class PolicyRule(BaseModel):
    id: str
    name: str
    description: str
    category: str  # exfiltration, dlp, permissions, mcp, anomaly
    when: Dict[str, Any]  # declarative condition
    decision: Decision
    enabled: bool = True
    priority: int = 100

class ApprovalRecord(BaseModel):
    approval_id: str
    action_hash: str
    session_id: str
    agent_id: str
    tool: str
    parameters: Dict[str, Any]
    reason: str
    requested_at: str
    expires_at: str
    status: str = "PENDING"  # PENDING, APPROVED, DENIED, EXPIRED
    approver: Optional[str] = None
    approved_at: Optional[str] = None
    modified_parameters: Optional[Dict[str, Any]] = None

class AIInvestigationResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    case_id: str
    what_we_know: List[str]
    possible_explanations: List[str]
    what_to_investigate: List[str]
    confidence: str  # LOW, MEDIUM, HIGH
    generated_at: str
    model_used: str

class SimulationScenario(BaseModel):
    id: str
    name: str
    description: str
    agent_id: str
    user_task: str
    actions: List[Dict[str, Any]]
    expected_decision: Decision
    expected_policy: str
    attack_category: str
