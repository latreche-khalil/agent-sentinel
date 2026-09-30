"""Privilege Escalation Detector."""
from typing import Dict, Any, List, Tuple
from backend.models.schemas import AgentModel, EvidenceItem, RiskSignal, Severity, TrustLevel

ADMIN_CAPABILITIES = {
    "admin.users.read", "admin.users.write", "admin.config.modify", "admin.system.shutdown",
    "admin_database_query", "grant_role", "revoke_role", "modify_security_policies"
}

TOOL_TO_CAPABILITY = {
    "admin_database_query": "admin.database.execute",
    "manage_users": "admin.users.write",
    "modify_system_policy": "admin.config.modify",
    "export_customer_data": "customer.pii.export",
    "search_customer": "customer.pii.read",
    "search_sales": "sales.read",
    "aggregate_sales": "sales.read",
    "generate_report": "reports.generate"
}

class PrivilegeDetector:
    @staticmethod
    def inspect_privilege_escalation(
        agent: AgentModel,
        tool_name: str,
        arguments: Dict[str, Any]
    ) -> Tuple[int, List[EvidenceItem], List[RiskSignal]]:
        score = 0
        evidence: List[EvidenceItem] = []
        signals: List[RiskSignal] = []

        requested_cap = TOOL_TO_CAPABILITY.get(tool_name, f"tool.{tool_name}")
        is_admin_action = (
            "admin" in tool_name.lower() or 
            requested_cap in ADMIN_CAPABILITIES or 
            any("admin" in str(v).lower() for v in arguments.values())
        )

        if is_admin_action and agent.trust_level in [TrustLevel.LOW, TrustLevel.MEDIUM]:
            contrib = 35
            score += contrib
            ev = EvidenceItem(
                signal_name="Privilege Escalation Attempt",
                category="privilege",
                current_value=f"Requested capability: '{requested_cap}'",
                baseline_value=f"Agent trust level: {agent.trust_level.value}",
                difference=f"Unauthorized capability tier leap ({agent.trust_level.value} → ADMIN)",
                threshold="Security administrator approval required",
                score_contribution=contrib,
                impact="CRITICAL",
                explanation=f"Agent '{agent.id}' ({agent.trust_level.value} trust) attempted to execute administrative action requiring elevated security clearance."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="privilege",
                score_contribution=contrib,
                severity=Severity.CRITICAL,
                description=f"Privilege escalation attempt: {agent.trust_level.value} trust agent requested {requested_cap}",
                evidence_detail={"current_trust": agent.trust_level.value, "requested_capability": requested_cap}
            ))

        return score, evidence, signals
